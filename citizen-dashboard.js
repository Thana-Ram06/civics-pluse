// Citizen Dashboard functionality
let userIssues = [];
let filteredIssues = [];
let currentFilter = 'all';
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in as citizen
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'public-login.html';
        return;
    }

    const user = JSON.parse(currentUser);
    if (user.role !== 'citizen') {
        window.location.href = 'index.html';
        return;
    }

    // Update citizen name in navigation
    document.getElementById('citizen-name').textContent = `Welcome, ${user.name}`;

    // Initialize dashboard
    initializeDashboard();
    setupEventListeners();
    loadUserIssues();
});

function initializeDashboard() {
    // Load sample issues for demo (filtered by current user)
    const allIssues = [
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
            rating: null,
            reportedBy: "citizen@example.com"
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
            rating: 4.2,
            reportedBy: "jane@example.com"
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
            rating: 2.1,
            reportedBy: "bob@example.com"
        }
    ];

    // Filter issues by current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    userIssues = allIssues.filter(issue => issue.reportedBy === currentUser.email);

    // Calculate days open for each issue
    userIssues.forEach(issue => {
        issue.daysOpen = getDaysSince(issue.reportedDate);
    });

    filteredIssues = [...userIssues];
    updateStats();
}

function setupEventListeners() {
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.status;
            filterIssues();
        });
    });

    // Rating form
    document.getElementById('rating-form').addEventListener('submit', submitRating);

    // Star rating interaction
    document.querySelectorAll('#star-rating i').forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            updateStarDisplay();
        });

        star.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.dataset.rating);
            highlightStars(hoverRating);
        });
    });

    document.getElementById('star-rating').addEventListener('mouseleave', function() {
        updateStarDisplay();
    });
}

function filterIssues() {
    if (currentFilter === 'all') {
        filteredIssues = [...userIssues];
    } else {
        filteredIssues = userIssues.filter(issue => issue.status === currentFilter);
    }
    
    displayIssues();
}

function displayIssues() {
    const container = document.getElementById('issues-container');
    const emptyState = document.getElementById('empty-state');

    if (filteredIssues.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    emptyState.classList.add('hidden');

    container.innerHTML = filteredIssues.map(issue => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="p-6">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-4">
                        <img src="${issue.imageUrl}" alt="${issue.title}" class="w-20 h-20 object-cover rounded-lg">
                        <div class="flex-1">
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">${issue.title}</h3>
                            <p class="text-gray-600 mb-3">${issue.description}</p>
                            <div class="flex items-center space-x-4 text-sm text-gray-500">
                                <span><i class="fas fa-map-marker-alt mr-1"></i>${issue.location}</span>
                                <span><i class="fas fa-calendar mr-1"></i>${formatDate(issue.reportedDate)}</span>
                                <span><i class="fas fa-clock mr-1"></i>${issue.daysOpen} days ago</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-end space-y-2">
                        <span class="status-badge status-${issue.status}">
                            ${issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                        </span>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeClass(issue.priority)}">
                            ${issue.priority.toUpperCase()}
                        </span>
                        ${issue.rating ? `
                            <div class="flex items-center">
                                <div class="rating-stars mr-1">
                                    ${generateStars(issue.rating)}
                                </div>
                                <span class="text-sm text-gray-600">${issue.rating}/5</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${issue.adminNotes ? `
                    <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 class="font-semibold text-blue-800 mb-2">Admin Response:</h4>
                        <p class="text-blue-700">${issue.adminNotes}</p>
                    </div>
                ` : ''}
                
                <div class="mt-4 flex justify-end space-x-3">
                    <button onclick="viewIssue(${issue.id})" class="text-blue-600 hover:text-blue-800 font-semibold">
                        <i class="fas fa-eye mr-1"></i>View Details
                    </button>
                    ${issue.status === 'resolved' && !issue.rating ? `
                        <button onclick="rateIssue(${issue.id})" class="text-green-600 hover:text-green-800 font-semibold">
                            <i class="fas fa-star mr-1"></i>Rate Resolution
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function viewIssue(issueId) {
    const issue = userIssues.find(i => i.id === issueId);
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
                    ${issue.rating ? `<p><strong>Your Rating:</strong> ${issue.rating}/5</p>` : ''}
                </div>
            </div>
            <div>
                <h4 class="text-lg font-semibold mb-2">Description</h4>
                <p class="text-gray-700 mb-4">${issue.description}</p>
                
                <h4 class="text-lg font-semibold mb-2">Location</h4>
                <p class="text-gray-700 mb-4">${issue.location}</p>
                
                ${issue.adminNotes ? `
                    <h4 class="text-lg font-semibold mb-2">Admin Response</h4>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-blue-700">${issue.adminNotes}</p>
                    </div>
                ` : ''}
                
                ${issue.status === 'resolved' && !issue.rating ? `
                    <div class="mt-6">
                        <button onclick="rateIssue(${issue.id})" class="btn-primary text-white px-6 py-3 rounded-lg font-semibold">
                            <i class="fas fa-star mr-2"></i>Rate This Resolution
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('issue-modal').classList.remove('hidden');
}

function rateIssue(issueId) {
    const issue = userIssues.find(i => i.id === issueId);
    if (!issue) return;

    document.getElementById('rating-issue-id').value = issueId;
    selectedRating = 0;
    updateStarDisplay();
    
    document.getElementById('issue-modal').classList.add('hidden');
    document.getElementById('rating-modal').classList.remove('hidden');
}

function updateStarDisplay() {
    const stars = document.querySelectorAll('#star-rating i');
    const ratingText = document.getElementById('rating-text');
    
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.remove('text-gray-300');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        }
    });

    const ratingTexts = [
        'Click on a star to rate',
        'Poor - Very dissatisfied',
        'Fair - Somewhat dissatisfied',
        'Good - Satisfied',
        'Very Good - Very satisfied',
        'Excellent - Extremely satisfied'
    ];
    
    ratingText.textContent = ratingTexts[selectedRating] || 'Click on a star to rate';
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('#star-rating i');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('text-gray-300');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        }
    });
}

function submitRating(e) {
    e.preventDefault();
    
    if (selectedRating === 0) {
        showNotification('Please select a rating before submitting.', 'warning');
        return;
    }

    const issueId = parseInt(document.getElementById('rating-issue-id').value);
    const comments = document.getElementById('rating-comments').value;

    const issue = userIssues.find(i => i.id === issueId);
    if (issue) {
        issue.rating = selectedRating;
        issue.ratingComments = comments;
        
        // Save to localStorage
        localStorage.setItem('userIssues', JSON.stringify(userIssues));
        
        showNotification('Thank you for your rating! Your feedback helps improve our services.', 'success');
        closeRatingModal();
        displayIssues();
    }
}

function closeModal() {
    document.getElementById('issue-modal').classList.add('hidden');
}

function closeRatingModal() {
    document.getElementById('rating-modal').classList.add('hidden');
}

function updateStats() {
    const stats = {
        total: userIssues.length,
        pending: userIssues.filter(i => i.status === 'pending').length,
        resolved: userIssues.filter(i => i.status === 'resolved').length,
        delayed: userIssues.filter(i => i.status === 'delayed').length
    };

    document.getElementById('total-reported').textContent = stats.total;
    document.getElementById('pending-reported').textContent = stats.pending;
    document.getElementById('resolved-reported').textContent = stats.resolved;
    document.getElementById('delayed-reported').textContent = stats.delayed;

    // Update tab counts
    document.getElementById('count-all').textContent = stats.total;
    document.getElementById('count-pending').textContent = stats.pending;
    document.getElementById('count-resolved').textContent = stats.resolved;
    document.getElementById('count-delayed').textContent = stats.delayed;
}

function getPriorityBadgeClass(priority) {
    const classes = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
}

function loadUserIssues() {
    // Load issues from localStorage if available
    const savedIssues = localStorage.getItem('userIssues');
    if (savedIssues) {
        userIssues = JSON.parse(savedIssues);
        // Recalculate days open
        userIssues.forEach(issue => {
            issue.daysOpen = getDaysSince(issue.reportedDate);
        });
    }
    
    filteredIssues = [...userIssues];
    updateStats();
    displayIssues();
}
