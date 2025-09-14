// Leaderboard functionality
let currentLeaderboardType = 'wards';

document.addEventListener('DOMContentLoaded', function() {
    initializeLeaderboard();
    setupEventListeners();
    loadWardsLeaderboard();
});

function initializeLeaderboard() {
    // Sample data for demonstration
    window.leaderboardData = {
        wards: [
            {
                id: 1,
                name: "Ward 1 - Downtown",
                officer: "Jane Smith",
                rating: 4.8,
                responseTime: 1.2,
                issuesResolved: 156,
                status: "Excellent",
                trend: "up"
            },
            {
                id: 2,
                name: "Ward 2 - Residential North",
                officer: "John Johnson",
                rating: 4.6,
                responseTime: 1.8,
                issuesResolved: 134,
                status: "Very Good",
                trend: "up"
            },
            {
                id: 3,
                name: "Ward 3 - Commercial District",
                officer: "Sarah Davis",
                rating: 4.4,
                responseTime: 2.1,
                issuesResolved: 98,
                status: "Good",
                trend: "stable"
            },
            {
                id: 4,
                name: "Ward 4 - Industrial Zone",
                officer: "Mike Wilson",
                rating: 4.2,
                responseTime: 2.5,
                issuesResolved: 87,
                status: "Good",
                trend: "down"
            },
            {
                id: 5,
                name: "Ward 5 - Suburb East",
                officer: "Lisa Brown",
                rating: 3.9,
                responseTime: 3.2,
                issuesResolved: 76,
                status: "Needs Improvement",
                trend: "down"
            }
        ],
        officials: [
            {
                id: 1,
                name: "Jane Smith",
                department: "Public Works",
                rating: 4.9,
                responseTime: 0.8,
                issuesHandled: 89,
                badge: "Rapid Responder"
            },
            {
                id: 2,
                name: "John Johnson",
                department: "Traffic Management",
                rating: 4.7,
                responseTime: 1.2,
                issuesHandled: 67,
                badge: "Citizen Favorite"
            },
            {
                id: 3,
                name: "Sarah Davis",
                department: "Environmental Services",
                rating: 4.6,
                responseTime: 1.5,
                issuesHandled: 54,
                badge: "Community Champion"
            },
            {
                id: 4,
                name: "Mike Wilson",
                department: "Utilities",
                rating: 4.4,
                responseTime: 2.0,
                issuesHandled: 43,
                badge: "Reliable Worker"
            },
            {
                id: 5,
                name: "Lisa Brown",
                department: "Parks & Recreation",
                rating: 4.1,
                responseTime: 2.8,
                issuesHandled: 38,
                badge: "Team Player"
            }
        ],
        departments: [
            {
                id: 1,
                name: "Public Works",
                rating: 4.7,
                responseTime: 1.4,
                issuesResolved: 234,
                successRate: 96,
                trend: "up"
            },
            {
                id: 2,
                name: "Traffic Management",
                rating: 4.5,
                responseTime: 1.6,
                issuesResolved: 189,
                successRate: 94,
                trend: "up"
            },
            {
                id: 3,
                name: "Environmental Services",
                rating: 4.3,
                responseTime: 2.1,
                issuesResolved: 156,
                successRate: 91,
                trend: "stable"
            },
            {
                id: 4,
                name: "Utilities",
                rating: 4.1,
                responseTime: 2.5,
                issuesResolved: 143,
                successRate: 88,
                trend: "down"
            },
            {
                id: 5,
                name: "Parks & Recreation",
                rating: 3.9,
                responseTime: 3.2,
                issuesResolved: 98,
                successRate: 85,
                trend: "down"
            }
        ],
        achievements: [
            {
                id: 1,
                type: "badge",
                recipient: "Jane Smith",
                title: "Earned Rapid Responder Badge",
                description: "Resolved 10 issues within 24 hours",
                timestamp: "2024-01-18T10:30:00Z"
            },
            {
                id: 2,
                type: "milestone",
                recipient: "Ward 1 - Downtown",
                title: "Reached 150 Issues Resolved",
                description: "First ward to reach this milestone",
                timestamp: "2024-01-17T15:45:00Z"
            },
            {
                id: 3,
                type: "rating",
                recipient: "Public Works Department",
                title: "Achieved 4.7 Average Rating",
                description: "Highest department rating this month",
                timestamp: "2024-01-16T09:20:00Z"
            }
        ]
    };

    updateOverallStats();
}

function setupEventListeners() {
    // Leaderboard type tabs
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            currentLeaderboardType = this.dataset.type;
            showLeaderboard(currentLeaderboardType);
        });
    });
}

function showLeaderboard(type) {
    // Hide all sections
    document.querySelectorAll('.leaderboard-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    const section = document.getElementById(`${type}-leaderboard`);
    if (section) {
        section.classList.remove('hidden');
    }

    // Load appropriate data
    switch(type) {
        case 'wards':
            loadWardsLeaderboard();
            break;
        case 'officials':
            loadOfficialsLeaderboard();
            break;
        case 'departments':
            loadDepartmentsLeaderboard();
            break;
    }
}

function loadWardsLeaderboard() {
    const tbody = document.getElementById('wards-table-body');
    const wards = window.leaderboardData.wards;

    tbody.innerHTML = wards.map((ward, index) => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    ${index < 3 ? `
                        <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(index)}">
                            <i class="fas fa-medal text-white"></i>
                        </div>
                    ` : `
                        <span class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                            ${index + 1}
                        </span>
                    `}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${ward.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${ward.officer}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="rating-stars mr-2">
                        ${generateStars(ward.rating)}
                    </div>
                    <span class="text-sm text-gray-600">${ward.rating}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${ward.responseTime} days
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${ward.issuesResolved}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(ward.status)}">
                    ${ward.status}
                </span>
            </td>
        </tr>
    `).join('');
}

function loadOfficialsLeaderboard() {
    const tbody = document.getElementById('officials-table-body');
    const officials = window.leaderboardData.officials;

    tbody.innerHTML = officials.map((official, index) => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    ${index < 3 ? `
                        <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(index)}">
                            <i class="fas fa-medal text-white"></i>
                        </div>
                    ` : `
                        <span class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                            ${index + 1}
                        </span>
                    `}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${official.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${official.department}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="rating-stars mr-2">
                        ${generateStars(official.rating)}
                    </div>
                    <span class="text-sm text-gray-600">${official.rating}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${official.responseTime} days
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${official.issuesHandled}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${getBadgeClass(official.badge)}">
                    ${official.badge}
                </span>
            </td>
        </tr>
    `).join('');
}

function loadDepartmentsLeaderboard() {
    const tbody = document.getElementById('departments-table-body');
    const departments = window.leaderboardData.departments;

    tbody.innerHTML = departments.map((dept, index) => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    ${index < 3 ? `
                        <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(index)}">
                            <i class="fas fa-medal text-white"></i>
                        </div>
                    ` : `
                        <span class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                            ${index + 1}
                        </span>
                    `}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${dept.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="rating-stars mr-2">
                        ${generateStars(dept.rating)}
                    </div>
                    <span class="text-sm text-gray-600">${dept.rating}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${dept.responseTime} days
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${dept.issuesResolved}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${dept.successRate}%
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <i class="fas fa-arrow-${dept.trend === 'up' ? 'up text-green-500' : dept.trend === 'down' ? 'down text-red-500' : 'right text-gray-500'} mr-1"></i>
                    <span class="text-sm text-gray-600 capitalize">${dept.trend}</span>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateOverallStats() {
    const wards = window.leaderboardData.wards;
    const departments = window.leaderboardData.departments;
    
    const totalWards = wards.length;
    const avgResponseTime = (wards.reduce((sum, ward) => sum + ward.responseTime, 0) / wards.length).toFixed(1);
    const avgRating = (wards.reduce((sum, ward) => sum + ward.rating, 0) / wards.length).toFixed(1);
    const totalResolved = wards.reduce((sum, ward) => sum + ward.issuesResolved, 0);

    document.getElementById('total-wards').textContent = totalWards;
    document.getElementById('avg-response-time').textContent = avgResponseTime;
    document.getElementById('avg-rating').textContent = avgRating;
    document.getElementById('total-resolved').textContent = totalResolved.toLocaleString();

    loadRecentAchievements();
}

function loadRecentAchievements() {
    const container = document.getElementById('recent-achievements');
    const achievements = window.leaderboardData.achievements;

    container.innerHTML = achievements.map(achievement => `
        <div class="flex items-center p-4 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <i class="fas fa-${achievement.type === 'badge' ? 'medal' : achievement.type === 'milestone' ? 'flag' : 'star'} text-blue-600"></i>
            </div>
            <div class="flex-1">
                <h4 class="text-sm font-semibold text-gray-800">${achievement.title}</h4>
                <p class="text-sm text-gray-600">${achievement.recipient} - ${achievement.description}</p>
            </div>
            <div class="text-sm text-gray-500">
                ${formatAchievementTime(achievement.timestamp)}
            </div>
        </div>
    `).join('');
}

function getRankColor(rank) {
    const colors = [
        'bg-yellow-500', // Gold
        'bg-gray-400',   // Silver
        'bg-orange-500'  // Bronze
    ];
    return colors[rank] || 'bg-gray-200';
}

function getStatusBadgeClass(status) {
    const classes = {
        'Excellent': 'bg-green-100 text-green-800',
        'Very Good': 'bg-blue-100 text-blue-800',
        'Good': 'bg-yellow-100 text-yellow-800',
        'Needs Improvement': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

function getBadgeClass(badge) {
    const classes = {
        'Rapid Responder': 'bg-yellow-100 text-yellow-800',
        'Citizen Favorite': 'bg-green-100 text-green-800',
        'Community Champion': 'bg-blue-100 text-blue-800',
        'Reliable Worker': 'bg-purple-100 text-purple-800',
        'Team Player': 'bg-pink-100 text-pink-800'
    };
    return classes[badge] || 'bg-gray-100 text-gray-800';
}

function formatAchievementTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
        return 'Just now';
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }
}
