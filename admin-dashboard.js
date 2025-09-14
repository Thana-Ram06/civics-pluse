// Admin Dashboard functionality
let currentIssues = [];
let filteredIssues = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in as admin
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'admin-login.html';
        return;
    }

    const user = JSON.parse(currentUser);
    if (user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // Update admin name in navigation
    document.getElementById('admin-name').textContent = `Welcome, ${user.name}`;

    // Initialize dashboard
    initializeDashboard();
    setupEventListeners();
    loadIssues();
});

function initializeDashboard() {
    // Load sample issues for demo
    currentIssues = [
        {
            id: 1,
            title: "Large Pothole on Main Street",
            description: "A large pothole causing traffic congestion and vehicle damage",
            issueType: "pothole",
            location: "Main Street, Downtown",
            priority: "high",
            status: "pending",
            reportedDate: "2024-01-15",
            reporterName: "John Citizen",
            reporterEmail: "john@example.com",
            imageUrl: "https://via.placeholder.com/400x300?text=Pothole+Issue",
            adminNotes: "",
            daysOpen: 3,
            rating: null
        },
        {
            id: 2,
            title: "Broken Streetlight",
            description: "Streetlight not working for over 2 weeks, making area unsafe at night",
            issueType: "streetlight",
            location: "Oak Avenue, Residential Area",
            priority: "medium",
            status: "resolved",
            reportedDate: "2024-01-10",
            reporterName: "Jane Smith",
            reporterEmail: "jane@example.com",
            imageUrl: "https://via.placeholder.com/400x300?text=Broken+Streetlight",
            adminNotes: "Fixed by replacing the faulty bulb and checking electrical connections",
            daysOpen: 0,
            rating: 4.2
        },
        {
            id: 3,
            title: "Garbage Collection Missed",
            description: "Garbage collection was missed for the second week in a row",
            issueType: "garbage",
            location: "Pine Street, Commercial District",
            priority: "medium",
            status: "delayed",
            reportedDate: "2024-01-08",
            reporterName: "Bob Wilson",
            reporterEmail: "bob@example.com",
            imageUrl: "https://via.placeholder.com/400x300?text=Garbage+Issue",
            adminNotes: "Working with waste management company to resolve collection schedule",
            daysOpen: 10,
            rating: 2.1
        },
        {
            id: 4,
            title: "Water Leak on Sidewalk",
            description: "Water leaking from underground pipe creating slippery conditions",
            issueType: "water-leak",
            location: "Elm Street, Industrial Zone",
            priority: "high",
            status: "pending",
            reportedDate: "2024-01-18",
            reporterName: "Alice Johnson",
            reporterEmail: "alice@example.com",
            imageUrl: "https://via.placeholder.com/400x300?text=Water+Leak",
            adminNotes: "",
            daysOpen: 0,
            rating: null
        },
        {
            id: 5,
            title: "Damaged Sidewalk",
            description: "Cracked and uneven sidewalk causing accessibility issues",
            issueType: "sidewalk",
            location: "Maple Drive, Suburb",
            priority: "low",
            status: "pending",
            reportedDate: "2024-01-17",
            reporterName: "Charlie Brown",
            reporterEmail: "charlie@example.com",
            imageUrl: "https://via.placeholder.com/400x300?text=Sidewalk+Damage",
            adminNotes: "",
            daysOpen: 1,
            rating: null
        }
    ];

    // Calculate days open for each issue
    currentIssues.forEach(issue => {
        issue.daysOpen = getDaysSince(issue.reportedDate);
    });

    filteredIssues = [...currentIssues];
    updateStats();
}

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.status;
            filterIssues();
        });
    });

    // Issue type filter
    document.getElementById('issue-type-filter').addEventListener('change', filterIssues);

    // Priority filter
    document.getElementById('priority-filter').addEventListener('change', filterIssues);

    // Search input
    document.getElementById('search-input').addEventListener('input', debounce(filterIssues, 300));

    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayIssues();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayIssues();
        }
    });

    // Status form
    document.getElementById('status-form').addEventListener('submit', updateIssueStatus);
}

function filterIssues() {
    const statusFilter = currentFilter;
    const typeFilter = document.getElementById('issue-type-filter').value;
    const priorityFilter = document.getElementById('priority-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    filteredIssues = currentIssues.filter(issue => {
        const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
        const matchesType = !typeFilter || issue.issueType === typeFilter;
        const matchesPriority = !priorityFilter || issue.priority === priorityFilter;
        const matchesSearch = !searchTerm || 
            issue.title.toLowerCase().includes(searchTerm) ||
            issue.description.toLowerCase().includes(searchTerm) ||
            issue.location.toLowerCase().includes(searchTerm) ||
            issue.reporterName.toLowerCase().includes(searchTerm);

        return matchesStatus && matchesType && matchesPriority && matchesSearch;
    });

    currentPage = 1;
    displayIssues();
    updateStats();
}

function displayIssues() {
    const tbody = document.getElementById('issues-table-body');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageIssues = filteredIssues.slice(startIndex, endIndex);

    tbody.innerHTML = pageIssues.map(issue => `
        <tr class="hover:bg-gray-50 ${getPriorityClass(issue.priority)}">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                        <img class="h-12 w-12 rounded-lg object-cover" src="${issue.imageUrl}" alt="${issue.title}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${issue.title}</div>
                        <div class="text-sm text-gray-500">${issue.issueType}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${issue.location}</div>
                <div class="text-sm text-gray-500">${issue.reporterName}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeClass(issue.priority)}">
                    ${issue.priority.toUpperCase()}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="status-badge status-${issue.status}">
                    ${issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${issue.daysOpen} days
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="viewIssue(${issue.id})" class="text-blue-600 hover:text-blue-900">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="updateStatus(${issue.id})" class="text-green-600 hover:text-green-900">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredIssues.length);

    document.getElementById('showing-start').textContent = filteredIssues.length > 0 ? startIndex : 0;
    document.getElementById('showing-end').textContent = endIndex;
    document.getElementById('total-count').textContent = filteredIssues.length;
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

function updateStats() {
    const stats = {
        total: currentIssues.length,
        pending: currentIssues.filter(i => i.status === 'pending').length,
        resolved: currentIssues.filter(i => i.status === 'resolved').length,
        delayed: currentIssues.filter(i => i.status === 'delayed').length
    };

    document.getElementById('total-issues').textContent = stats.total;
    document.getElementById('pending-issues').textContent = stats.pending;
    document.getElementById('resolved-issues').textContent = stats.resolved;
    document.getElementById('delayed-issues').textContent = stats.delayed;
}

function viewIssue(issueId) {
    const issue = currentIssues.find(i => i.id === issueId);
    if (!issue) return;

    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            <div>
                <img src="${issue.imageUrl}" alt="${issue.title}" class="w-full h-64 object-cover rounded-lg mb-4">
                <h4 class="text-lg font-semibold mb-2">Issue Details</h4>
                <div class="space-y-2 text-sm">
                    <p><strong>Type:</strong> ${issue.issueType}</p>
                    <p><strong>Priority:</strong> <span class="px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeClass(issue.priority)}">${issue.priority.toUpperCase()}</span></p>
                    <p><strong>Status:</strong> <span class="status-badge status-${issue.status}">${issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}</span></p>
                    <p><strong>Reported:</strong> ${formatDate(issue.reportedDate)}</p>
                    <p><strong>Days Open:</strong> ${issue.daysOpen}</p>
                    ${issue.rating ? `<p><strong>Rating:</strong> ${issue.rating}/5</p>` : ''}
                </div>
            </div>
            <div>
                <h4 class="text-lg font-semibold mb-2">Description</h4>
                <p class="text-gray-700 mb-4">${issue.description}</p>
                
                <h4 class="text-lg font-semibold mb-2">Location</h4>
                <p class="text-gray-700 mb-4">${issue.location}</p>
                
                <h4 class="text-lg font-semibold mb-2">Reporter Information</h4>
                <div class="bg-gray-50 p-3 rounded-lg mb-4">
                    <p><strong>Name:</strong> ${issue.reporterName}</p>
                    <p><strong>Email:</strong> ${issue.reporterEmail}</p>
                </div>
                
                ${issue.adminNotes ? `
                    <h4 class="text-lg font-semibold mb-2">Admin Notes</h4>
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <p class="text-gray-700">${issue.adminNotes}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('issue-modal').classList.remove('hidden');
}

function updateStatus(issueId) {
    const issue = currentIssues.find(i => i.id === issueId);
    if (!issue) return;

    document.getElementById('status-issue-id').value = issueId;
    document.getElementById('new-status').value = issue.status;
    document.getElementById('admin-notes').value = issue.adminNotes || '';
    
    document.getElementById('status-modal').classList.remove('hidden');
}

function updateIssueStatus(e) {
    e.preventDefault();
    
    const issueId = parseInt(document.getElementById('status-issue-id').value);
    const newStatus = document.getElementById('new-status').value;
    const adminNotes = document.getElementById('admin-notes').value;

    const issue = currentIssues.find(i => i.id === issueId);
    if (issue) {
        issue.status = newStatus;
        issue.adminNotes = adminNotes;
        
        // If status changed to resolved, set rating to null (will be set by citizen later)
        if (newStatus === 'resolved' && issue.status !== 'resolved') {
            issue.rating = null;
        }
        
        // Save to localStorage
        localStorage.setItem('adminIssues', JSON.stringify(currentIssues));
        
        showNotification('Issue status updated successfully!', 'success');
        closeStatusModal();
        displayIssues();
        updateStats();
    }
}

function closeModal() {
    document.getElementById('issue-modal').classList.add('hidden');
}

function closeStatusModal() {
    document.getElementById('status-modal').classList.add('hidden');
}

// Utility functions
function getPriorityClass(priority) {
    const classes = {
        high: 'priority-high',
        medium: 'priority-medium',
        low: 'priority-low'
    };
    return classes[priority] || '';
}

function getPriorityBadgeClass(priority) {
    const classes = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function loadIssues() {
    // Load issues from localStorage if available
    const savedIssues = localStorage.getItem('adminIssues');
    if (savedIssues) {
        currentIssues = JSON.parse(savedIssues);
        // Recalculate days open
        currentIssues.forEach(issue => {
            issue.daysOpen = getDaysSince(issue.reportedDate);
        });
    }
    
    filteredIssues = [...currentIssues];
    updateStats();
    displayIssues();
}
