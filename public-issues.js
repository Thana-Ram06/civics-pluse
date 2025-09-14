// Public Issues functionality
let publicIssues = [];
let filteredIssues = [];
let currentFilter = 'all';
let currentPage = 1;
const itemsPerPage = 9;

document.addEventListener('DOMContentLoaded', function() {
    initializePublicIssues();
    setupEventListeners();
    loadPublicIssues();
});

function initializePublicIssues() {
    // Load sample public issues for demo
    publicIssues = [
        {
            id: 1,
            title: "Large Pothole on Main Street",
            description: "A large pothole causing traffic congestion and vehicle damage. This issue has been reported multiple times but remains unresolved.",
            issueType: "pothole",
            location: "Main Street, Downtown",
            priority: "high",
            status: "delayed",
            reportedDate: "2024-01-15",
            reporterName: "John Citizen",
            imageUrl: "https://via.placeholder.com/400x300?text=Pothole+Issue",
            daysOpen: 3,
            rating: 2.5,
            votes: 12,
            voteScore: 28,
            adminNotes: "Working with public works department to schedule repair",
            area: "downtown"
        },
        {
            id: 2,
            title: "Broken Streetlight",
            description: "Streetlight not working for over 2 weeks, making area unsafe at night. Multiple residents have reported this issue.",
            issueType: "streetlight",
            location: "Oak Avenue, Residential Area",
            priority: "medium",
            status: "resolved",
            reportedDate: "2024-01-10",
            reporterName: "Jane Smith",
            imageUrl: "https://via.placeholder.com/400x300?text=Broken+Streetlight",
            daysOpen: 0,
            rating: 4.2,
            votes: 8,
            voteScore: 20,
            adminNotes: "Fixed by replacing the faulty bulb and checking electrical connections",
            area: "residential"
        },
        {
            id: 3,
            title: "Garbage Collection Missed",
            description: "Garbage collection was missed for the second week in a row, causing health and hygiene concerns in the neighborhood.",
            issueType: "garbage",
            location: "Pine Street, Commercial District",
            priority: "medium",
            status: "delayed",
            reportedDate: "2024-01-08",
            reporterName: "Bob Wilson",
            imageUrl: "https://via.placeholder.com/400x300?text=Garbage+Issue",
            daysOpen: 10,
            rating: 2.1,
            votes: 15,
            voteScore: 35,
            adminNotes: "Working with waste management company to resolve collection schedule",
            area: "commercial"
        },
        {
            id: 4,
            title: "Water Leak on Sidewalk",
            description: "Water leaking from underground pipe creating slippery conditions and potential safety hazard for pedestrians.",
            issueType: "water-leak",
            location: "Elm Street, Industrial Zone",
            priority: "high",
            status: "pending",
            reportedDate: "2024-01-18",
            reporterName: "Alice Johnson",
            imageUrl: "https://via.placeholder.com/400x300?text=Water+Leak",
            daysOpen: 0,
            rating: null,
            votes: 5,
            voteScore: 12,
            adminNotes: "",
            area: "industrial"
        },
        {
            id: 5,
            title: "Damaged Sidewalk",
            description: "Cracked and uneven sidewalk causing accessibility issues for people with disabilities and mobility challenges.",
            issueType: "sidewalk",
            location: "Maple Drive, Suburb",
            priority: "low",
            status: "delayed",
            reportedDate: "2024-01-17",
            reporterName: "Charlie Brown",
            imageUrl: "https://via.placeholder.com/400x300?text=Sidewalk+Damage",
            daysOpen: 1,
            rating: 1.8,
            votes: 7,
            voteScore: 14,
            adminNotes: "Scheduled for repair in next maintenance cycle",
            area: "residential"
        },
        {
            id: 6,
            title: "Traffic Signal Malfunction",
            description: "Traffic signal not working properly, causing confusion and potential accidents at busy intersection.",
            issueType: "traffic-signal",
            location: "Broadway & 5th Street",
            priority: "high",
            status: "resolved",
            reportedDate: "2024-01-12",
            reporterName: "David Lee",
            imageUrl: "https://via.placeholder.com/400x300?text=Traffic+Signal",
            daysOpen: 0,
            rating: 4.5,
            votes: 20,
            voteScore: 60,
            adminNotes: "Repaired by traffic department within 24 hours of report",
            area: "downtown"
        }
    ];

    // Calculate days open for each issue
    publicIssues.forEach(issue => {
        issue.daysOpen = getDaysSince(issue.reportedDate);
    });

    filteredIssues = [...publicIssues];
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

    // Location filter
    document.getElementById('location-filter').addEventListener('change', filterIssues);

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

    // Vote form
    document.getElementById('vote-form').addEventListener('submit', submitVote);
}

function filterIssues() {
    const statusFilter = currentFilter;
    const typeFilter = document.getElementById('issue-type-filter').value;
    const locationFilter = document.getElementById('location-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    filteredIssues = publicIssues.filter(issue => {
        const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
        const matchesType = !typeFilter || issue.issueType === typeFilter;
        const matchesLocation = !locationFilter || issue.area === locationFilter;
        const matchesSearch = !searchTerm || 
            issue.title.toLowerCase().includes(searchTerm) ||
            issue.description.toLowerCase().includes(searchTerm) ||
            issue.location.toLowerCase().includes(searchTerm) ||
            issue.reporterName.toLowerCase().includes(searchTerm);

        return matchesStatus && matchesType && matchesLocation && matchesSearch;
    });

    currentPage = 1;
    displayIssues();
    updateStats();
}

function displayIssues() {
    const grid = document.getElementById('issues-grid');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageIssues = filteredIssues.slice(startIndex, endIndex);

    grid.innerHTML = pageIssues.map(issue => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden issue-card">
            <img src="${issue.imageUrl}" alt="${issue.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-lg font-semibold text-gray-800 line-clamp-2">${issue.title}</h3>
                    <span class="status-badge status-${issue.status} ml-2">
                        ${issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                    </span>
                </div>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${issue.description}</p>
                <div class="flex items-center text-sm text-gray-500 mb-3">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    <span>${issue.location}</span>
                </div>
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span><i class="fas fa-calendar mr-1"></i>${formatDate(issue.reportedDate)}</span>
                    <span><i class="fas fa-clock mr-1"></i>${issue.daysOpen} days</span>
                </div>
                
                ${issue.rating ? `
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <div class="rating-stars mr-2">
                                ${generateStars(issue.rating)}
                            </div>
                            <span class="text-sm text-gray-600">${issue.rating}/5</span>
                        </div>
                        <span class="text-sm text-gray-500">${issue.votes} votes</span>
                    </div>
                ` : `
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-sm text-gray-500">${issue.votes} votes</span>
                        <span class="text-xs text-gray-400">No rating yet</span>
                    </div>
                `}
                
                <div class="flex justify-between items-center">
                    <button onclick="viewIssue(${issue.id})" class="text-blue-600 hover:text-blue-800 font-semibold">
                        <i class="fas fa-eye mr-1"></i>View Details
                    </button>
                    <button onclick="voteOnIssue(${issue.id})" class="text-green-600 hover:text-green-800 font-semibold">
                        <i class="fas fa-vote-yea mr-1"></i>Vote
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredIssues.length);

    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
}

function updateStats() {
    const delayedIssues = publicIssues.filter(i => i.status === 'delayed');
    const resolvedIssues = publicIssues.filter(i => i.status === 'resolved');
    const totalVotes = publicIssues.reduce((sum, issue) => sum + issue.votes, 0);
    const totalRatings = publicIssues.filter(i => i.rating).length;
    const avgRating = totalRatings > 0 ? 
        (publicIssues.filter(i => i.rating).reduce((sum, issue) => sum + issue.rating, 0) / totalRatings).toFixed(1) : 0;
    
    const responseRate = publicIssues.length > 0 ? 
        Math.round((resolvedIssues.length / publicIssues.length) * 100) : 0;

    document.getElementById('total-public-issues').textContent = delayedIssues.length;
    document.getElementById('avg-rating').textContent = avgRating;
    document.getElementById('total-votes').textContent = totalVotes;
    document.getElementById('response-rate').textContent = responseRate + '%';
}

function viewIssue(issueId) {
    const issue = publicIssues.find(i => i.id === issueId);
    if (!issue) return;

    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            <div>
                <img src="${issue.imageUrl}" alt="${issue.title}" class="w-full h-64 object-cover rounded-lg mb-4">
                <div class="flex items-center justify-between mb-4">
                    <span class="status-badge status-${issue.status}">
                        ${issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                    </span>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeClass(issue.priority)}">
                        ${issue.priority.toUpperCase()}
                    </span>
                </div>
                <div class="space-y-2 text-sm text-gray-600">
                    <p><strong>Reported by:</strong> ${issue.reporterName}</p>
                    <p><strong>Date:</strong> ${formatDate(issue.reportedDate)}</p>
                    <p><strong>Days Open:</strong> ${issue.daysOpen}</p>
                    <p><strong>Votes:</strong> ${issue.votes}</p>
                    ${issue.rating ? `<p><strong>Rating:</strong> ${issue.rating}/5</p>` : ''}
                </div>
            </div>
            <div>
                <h4 class="text-lg font-semibold mb-2">Description</h4>
                <p class="text-gray-700 mb-4">${issue.description}</p>
                
                <h4 class="text-lg font-semibold mb-2">Location</h4>
                <p class="text-gray-700 mb-4">${issue.location}</p>
                
                ${issue.adminNotes ? `
                    <h4 class="text-lg font-semibold mb-2">Official Response</h4>
                    <div class="bg-blue-50 p-4 rounded-lg mb-4">
                        <p class="text-blue-700">${issue.adminNotes}</p>
                    </div>
                ` : ''}
                
                <div class="flex justify-between items-center">
                    <button onclick="voteOnIssue(${issue.id})" class="btn-primary text-white px-6 py-3 rounded-lg font-semibold">
                        <i class="fas fa-vote-yea mr-2"></i>Vote on This Issue
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('issue-modal').classList.remove('hidden');
}

function voteOnIssue(issueId) {
    const issue = publicIssues.find(i => i.id === issueId);
    if (!issue) return;

    document.getElementById('vote-issue-id').value = issueId;
    
    document.getElementById('issue-modal').classList.add('hidden');
    document.getElementById('vote-modal').classList.remove('hidden');
}

function submitVote(e) {
    e.preventDefault();
    
    const issueId = parseInt(document.getElementById('vote-issue-id').value);
    const voteValue = parseInt(document.querySelector('input[name="vote"]:checked')?.value);
    const comments = document.getElementById('vote-comments').value;

    if (!voteValue) {
        showNotification('Please select a priority level before submitting.', 'warning');
        return;
    }

    const issue = publicIssues.find(i => i.id === issueId);
    if (issue) {
        // Simulate voting (in real app, this would be saved to database)
        issue.votes++;
        issue.voteScore += voteValue;
        
        showNotification('Thank you for your vote! Your input helps prioritize community issues.', 'success');
        closeVoteModal();
        displayIssues();
        updateStats();
    }
}

function closeModal() {
    document.getElementById('issue-modal').classList.add('hidden');
}

function closeVoteModal() {
    document.getElementById('vote-modal').classList.add('hidden');
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

function loadPublicIssues() {
    // Load issues from localStorage if available
    const savedIssues = localStorage.getItem('publicIssues');
    if (savedIssues) {
        publicIssues = JSON.parse(savedIssues);
        // Recalculate days open
        publicIssues.forEach(issue => {
            issue.daysOpen = getDaysSince(issue.reportedDate);
        });
    }
    
    filteredIssues = [...publicIssues];
    updateStats();
    displayIssues();
}
