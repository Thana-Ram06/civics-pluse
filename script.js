// Global application state
let currentUser = null;
let issues = [];
let currentLocation = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadRecentIssues();
});

function initializeApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateNavigation();
    }

    // Get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('Location detected:', currentLocation);
            },
            function(error) {
                console.log('Location access denied:', error);
                showNotification('Location access denied. You can still report issues manually.', 'warning');
            }
        );
    }
}

function updateNavigation() {
    const nav = document.querySelector('nav .flex.items-center.space-x-4');
    if (currentUser) {
        nav.innerHTML = `
            <span class="text-blue-200">Welcome, ${currentUser.name}</span>
            ${currentUser.role === 'admin' ? 
                '<a href="admin-dashboard.html" class="hover:text-blue-200 transition-colors"><i class="fas fa-tachometer-alt mr-2"></i>Dashboard</a>' :
                '<a href="citizen-dashboard.html" class="hover:text-blue-200 transition-colors"><i class="fas fa-user mr-2"></i>My Issues</a>'
            }
            <button onclick="logout()" class="hover:text-blue-200 transition-colors">
                <i class="fas fa-sign-out-alt mr-2"></i>Logout
            </button>
        `;
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

function loadRecentIssues() {
    // Load recent issues from backend API
    const container = document.getElementById('recent-issues');
    if (!container) return;

    const fetchIssues = window.StaticAPI ? window.StaticAPI.listIssues : () => fetch('/api/issues').then(res => res.json());
    fetchIssues()
        .then(issues => {
            container.innerHTML = issues.slice(0,6).map(issue => `
                <div class="issue-card bg-white rounded-lg shadow-md overflow-hidden">
                    <img src="${issue.imageUrl || 'https://via.placeholder.com/300x200?text=Issue'}" alt="${issue.title}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="font-semibold text-lg mb-2">${issue.title}</h3>
                        <p class="text-gray-600 text-sm mb-2">${issue.description}</p>
                        <p class="text-gray-500 text-xs mb-3">
                            <i class="fas fa-map-marker-alt mr-1"></i>${issue.location && issue.location.address ? issue.location.address : ''}
                        </p>
                        <div class="flex justify-between items-center">
                            <span class="status-badge status-${issue.status}">
                                ${issue.status ? (issue.status.charAt(0).toUpperCase() + issue.status.slice(1)) : ''}
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
                </div>
            `).join('');
        })
        .catch(err => {
            console.error('Failed to load issues', err);
            container.innerHTML = '<p class="text-gray-600">Unable to load recent issues.</p>';
        });
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Image upload functionality
function handleImageUpload(input, previewId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

// Drag and drop functionality
function setupDragAndDrop(uploadAreaId, inputId, previewId) {
    const uploadArea = document.getElementById(uploadAreaId);
    const input = document.getElementById(inputId);

    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            input.files = files;
            handleImageUpload(input, previewId);
        }
    });

    uploadArea.addEventListener('click', function() {
        input.click();
    });
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// API simulation functions
function submitIssue(issueData) {
    // Prefer in-browser StaticAPI if available (localStorage) so the app can run
    // without a backend. Otherwise POST to /api/issues.
    if (window.StaticAPI) {
        return window.StaticAPI.createIssue(issueData);
    }
    return fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData)
    }).then(res => {
        if (!res.ok) throw new Error('Failed to submit issue');
        return res.json();
    }).then(payload => payload.issue);
}

function loginUser(email, password, role) {
    // Call backend login endpoint
    return fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
    }).then(async res => {
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err && err.message ? err.message : 'Login failed');
        }
        return res.json();
    }).then(payload => {
        const user = payload.user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUser = user;
        return user;
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function getDaysSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getStatusColor(status) {
    const colors = {
        pending: 'yellow',
        resolved: 'green',
        delayed: 'red'
    };
    return colors[status] || 'gray';
}
