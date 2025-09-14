// Backend API simulation for Civic Plus
// This simulates a real backend API using localStorage for demo purposes

class CivicPlusAPI {
    constructor() {
        this.baseURL = '/api/v1';
        this.init();
    }

    init() {
        // Initialize default data if not exists
        if (!localStorage.getItem('civicPlusIssues')) {
            this.seedData();
        }
    }

    seedData() {
        const sampleIssues = [
            {
                id: 1,
                title: "Large Pothole on Main Street",
                description: "A large pothole causing traffic congestion and vehicle damage",
                issueType: "pothole",
                location: { address: "Main Street, Downtown", lat: 40.7128, lng: -74.0060 },
                priority: "high",
                status: "pending",
                reportedDate: "2024-01-15",
                reporterName: "John Citizen",
                reporterEmail: "john@example.com",
                imageUrl: "https://via.placeholder.com/400x300?text=Pothole+Issue",
                adminNotes: "",
                daysOpen: 3,
                rating: null,
                reportedBy: "citizen@example.com",
                ward: "ward1"
            },
            {
                id: 2,
                title: "Broken Streetlight",
                description: "Streetlight not working for over 2 weeks, making area unsafe at night",
                issueType: "streetlight",
                location: { address: "Oak Avenue, Residential Area", lat: 40.7589, lng: -73.9851 },
                priority: "medium",
                status: "resolved",
                reportedDate: "2024-01-10",
                reporterName: "Jane Smith",
                reporterEmail: "jane@example.com",
                imageUrl: "https://via.placeholder.com/400x300?text=Broken+Streetlight",
                adminNotes: "Fixed by replacing the faulty bulb and checking electrical connections",
                daysOpen: 0,
                rating: 4.2,
                reportedBy: "jane@example.com",
                ward: "ward2"
            }
        ];

        localStorage.setItem('civicPlusIssues', JSON.stringify(sampleIssues));
        localStorage.setItem('civicPlusUsers', JSON.stringify([
            {
                email: "citizen@example.com",
                name: "John Citizen",
                role: "citizen",
                ward: "ward1",
                password: "password123"
            },
            {
                email: "admin@example.com",
                name: "Jane Admin",
                role: "admin",
                ward: "ward1",
                password: "admin123"
            }
        ]));
    }

    // Authentication endpoints
    async login(email, password, role) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('civicPlusUsers') || '[]');
                const user = users.find(u => u.email === email && u.password === password && u.role === role);
                
                if (user) {
                    const { password, ...userWithoutPassword } = user;
                    resolve(userWithoutPassword);
                } else {
                    reject('Invalid credentials');
                }
            }, 500);
        });
    }

    async register(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('civicPlusUsers') || '[]');
                
                if (users.find(u => u.email === userData.email)) {
                    reject('User already exists');
                    return;
                }

                const newUser = {
                    ...userData,
                    id: Date.now(),
                    registeredDate: new Date().toISOString()
                };

                users.push(newUser);
                localStorage.setItem('civicPlusUsers', JSON.stringify(users));

                const { password, ...userWithoutPassword } = newUser;
                resolve(userWithoutPassword);
            }, 1000);
        });
    }

    // Issue management endpoints
    async createIssue(issueData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const issues = JSON.parse(localStorage.getItem('civicPlusIssues') || '[]');
                    const newIssue = {
                        id: Date.now(),
                        ...issueData,
                        status: 'pending',
                        reportedDate: new Date().toISOString().split('T')[0],
                        rating: null,
                        daysOpen: 0
                    };

                    issues.push(newIssue);
                    localStorage.setItem('civicPlusIssues', JSON.stringify(issues));
                    resolve(newIssue);
                } catch (error) {
                    reject('Failed to create issue');
                }
            }, 1000);
        });
    }

    async getIssues(filters = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let issues = JSON.parse(localStorage.getItem('civicPlusIssues') || '[]');
                
                // Apply filters
                if (filters.status && filters.status !== 'all') {
                    issues = issues.filter(issue => issue.status === filters.status);
                }
                
                if (filters.issueType) {
                    issues = issues.filter(issue => issue.issueType === filters.issueType);
                }
                
                if (filters.priority) {
                    issues = issues.filter(issue => issue.priority === filters.priority);
                }
                
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    issues = issues.filter(issue => 
                        issue.title.toLowerCase().includes(searchTerm) ||
                        issue.description.toLowerCase().includes(searchTerm) ||
                        issue.location.address.toLowerCase().includes(searchTerm)
                    );
                }
                
                if (filters.reportedBy) {
                    issues = issues.filter(issue => issue.reportedBy === filters.reportedBy);
                }

                // Calculate days open for each issue
                issues.forEach(issue => {
                    issue.daysOpen = this.getDaysSince(issue.reportedDate);
                });

                resolve(issues);
            }, 300);
        });
    }

    async updateIssueStatus(issueId, status, adminNotes = '') {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const issues = JSON.parse(localStorage.getItem('civicPlusIssues') || '[]');
                    const issueIndex = issues.findIndex(issue => issue.id === issueId);
                    
                    if (issueIndex === -1) {
                        reject('Issue not found');
                        return;
                    }

                    issues[issueIndex].status = status;
                    issues[issueIndex].adminNotes = adminNotes;
                    
                    // If status changed to resolved, reset rating
                    if (status === 'resolved' && issues[issueIndex].status !== 'resolved') {
                        issues[issueIndex].rating = null;
                    }

                    localStorage.setItem('civicPlusIssues', JSON.stringify(issues));
                    resolve(issues[issueIndex]);
                } catch (error) {
                    reject('Failed to update issue');
                }
            }, 500);
        });
    }

    async rateIssue(issueId, rating, comments = '') {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const issues = JSON.parse(localStorage.getItem('civicPlusIssues') || '[]');
                    const issueIndex = issues.findIndex(issue => issue.id === issueId);
                    
                    if (issueIndex === -1) {
                        reject('Issue not found');
                        return;
                    }

                    issues[issueIndex].rating = rating;
                    issues[issueIndex].ratingComments = comments;
                    issues[issueIndex].ratingDate = new Date().toISOString();

                    localStorage.setItem('civicPlusIssues', JSON.stringify(issues));
                    resolve(issues[issueIndex]);
                } catch (error) {
                    reject('Failed to rate issue');
                }
            }, 500);
        });
    }

    async voteOnIssue(issueId, voteValue, comments = '') {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const issues = JSON.parse(localStorage.getItem('civicPlusIssues') || '[]');
                    const issueIndex = issues.findIndex(issue => issue.id === issueId);
                    
                    if (issueIndex === -1) {
                        reject('Issue not found');
                        return;
                    }

                    // Initialize vote data if not exists
                    if (!issues[issueIndex].votes) {
                        issues[issueIndex].votes = 0;
                        issues[issueIndex].voteScore = 0;
                    }

                    issues[issueIndex].votes++;
                    issues[issueIndex].voteScore += voteValue;
                    issues[issueIndex].voteComments = comments;

                    localStorage.setItem('civicPlusIssues', JSON.stringify(issues));
                    resolve(issues[issueIndex]);
                } catch (error) {
                    reject('Failed to vote on issue');
                }
            }, 500);
        });
    }

    // Statistics endpoints
    async getStatistics() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const issues = JSON.parse(localStorage.getItem('civicPlusIssues') || '[]');
                
                const stats = {
                    total: issues.length,
                    pending: issues.filter(i => i.status === 'pending').length,
                    resolved: issues.filter(i => i.status === 'resolved').length,
                    delayed: issues.filter(i => i.status === 'delayed').length,
                    averageRating: this.calculateAverageRating(issues),
                    totalVotes: issues.reduce((sum, issue) => sum + (issue.votes || 0), 0),
                    responseRate: this.calculateResponseRate(issues)
                };

                resolve(stats);
            }, 300);
        });
    }

    async getLeaderboardData(type = 'wards') {
        return new Promise((resolve) => {
            setTimeout(() => {
                // This would typically come from a database
                // For demo purposes, we'll return mock data
                const mockData = {
                    wards: [
                        { id: 1, name: "Ward 1 - Downtown", officer: "Jane Smith", rating: 4.8, responseTime: 1.2, issuesResolved: 156, status: "Excellent" },
                        { id: 2, name: "Ward 2 - Residential North", officer: "John Johnson", rating: 4.6, responseTime: 1.8, issuesResolved: 134, status: "Very Good" },
                        { id: 3, name: "Ward 3 - Commercial District", officer: "Sarah Davis", rating: 4.4, responseTime: 2.1, issuesResolved: 98, status: "Good" }
                    ],
                    officials: [
                        { id: 1, name: "Jane Smith", department: "Public Works", rating: 4.9, responseTime: 0.8, issuesHandled: 89, badge: "Rapid Responder" },
                        { id: 2, name: "John Johnson", department: "Traffic Management", rating: 4.7, responseTime: 1.2, issuesHandled: 67, badge: "Citizen Favorite" }
                    ],
                    departments: [
                        { id: 1, name: "Public Works", rating: 4.7, responseTime: 1.4, issuesResolved: 234, successRate: 96, trend: "up" },
                        { id: 2, name: "Traffic Management", rating: 4.5, responseTime: 1.6, issuesResolved: 189, successRate: 94, trend: "up" }
                    ]
                };

                resolve(mockData[type] || []);
            }, 300);
        });
    }

    // Utility methods
    getDaysSince(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    calculateAverageRating(issues) {
        const ratedIssues = issues.filter(i => i.rating);
        if (ratedIssues.length === 0) return 0;
        
        const totalRating = ratedIssues.reduce((sum, issue) => sum + issue.rating, 0);
        return (totalRating / ratedIssues.length).toFixed(1);
    }

    calculateResponseRate(issues) {
        if (issues.length === 0) return 0;
        const resolvedIssues = issues.filter(i => i.status === 'resolved');
        return Math.round((resolvedIssues.length / issues.length) * 100);
    }

    // File upload simulation
    async uploadImage(file) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // In a real application, this would upload to a cloud storage service
                // For demo purposes, we'll return a placeholder URL
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve(e.target.result); // Using base64 for demo
                };
                reader.readAsDataURL(file);
            }, 1000);
        });
    }

    // Notification system
    async sendNotification(userId, message, type = 'info') {
        return new Promise((resolve) => {
            setTimeout(() => {
                // In a real application, this would send push notifications, emails, etc.
                console.log(`Notification sent to user ${userId}: ${message}`);
                resolve({ success: true, message: 'Notification sent' });
            }, 500);
        });
    }

    // Auto-escalation for delayed issues
    async checkDelayedIssues() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const issues = JSON.parse(localStorage.getItem('civicPlusIssues') || '[]');
                let updatedCount = 0;

                issues.forEach(issue => {
                    const daysOpen = this.getDaysSince(issue.reportedDate);
                    
                    // Auto-escalate issues that are pending for more than 3 days
                    if (issue.status === 'pending' && daysOpen > 3) {
                        issue.status = 'delayed';
                        updatedCount++;
                    }
                });

                if (updatedCount > 0) {
                    localStorage.setItem('civicPlusIssues', JSON.stringify(issues));
                }

                resolve({ updatedCount });
            }, 300);
        });
    }
}

// Create global API instance
window.civicPlusAPI = new CivicPlusAPI();

// Auto-check for delayed issues every 5 minutes
setInterval(() => {
    window.civicPlusAPI.checkDelayedIssues();
}, 5 * 60 * 1000);
