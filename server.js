const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files from root directory
app.use(express.static(__dirname));

// In-memory storage for demo (in production, use a database)
let issues = [];
let users = [];
let statistics = {
    total: 0,
    pending: 0,
    resolved: 0,
    delayed: 0,
    averageRating: 0,
    totalVotes: 0,
    responseRate: 0
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Seed initial data
function seedData() {
    if (issues.length === 0) {
        issues = [
            {
                id: 1,
                title: "Large Pothole on Main Street",
                description: "A large pothole causing traffic congestion and vehicle damage",
                issueType: "pothole",
                location: { address: "Main Street, Downtown", lat: 40.7128, lng: -74.0060 },
                priority: "high",
                status: "pending",
                reportedDate: new Date().toISOString().split('T')[0],
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
    }

    if (users.length === 0) {
        users = [
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
        ];
    }
}

// Routes

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    
    const user = users.find(u => 
        u.email === email && 
        u.password === password && 
        u.role === role
    );
    
    if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const userData = req.body;
    
    if (users.find(u => u.email === userData.email)) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const newUser = {
        ...userData,
        id: Date.now(),
        registeredDate: new Date().toISOString()
    };
    
    users.push(newUser);
    
    const { password, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });
});

// Issues
app.get('/api/issues', (req, res) => {
    const { status, issueType, priority, search, reportedBy } = req.query;
    let filteredIssues = [...issues];
    
    if (status && status !== 'all') {
        filteredIssues = filteredIssues.filter(issue => issue.status === status);
    }
    
    if (issueType) {
        filteredIssues = filteredIssues.filter(issue => issue.issueType === issueType);
    }
    
    if (priority) {
        filteredIssues = filteredIssues.filter(issue => issue.priority === priority);
    }
    
    if (search) {
        const searchTerm = search.toLowerCase();
        filteredIssues = filteredIssues.filter(issue => 
            issue.title.toLowerCase().includes(searchTerm) ||
            issue.description.toLowerCase().includes(searchTerm) ||
            issue.location.address.toLowerCase().includes(searchTerm)
        );
    }
    
    if (reportedBy) {
        filteredIssues = filteredIssues.filter(issue => issue.reportedBy === reportedBy);
    }
    
    // Calculate days open for each issue
    filteredIssues.forEach(issue => {
        const date = new Date(issue.reportedDate);
        const now = new Date();
        issue.daysOpen = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
    });
    
    res.json(filteredIssues);
});

app.post('/api/issues', upload.single('image'), (req, res) => {
    const issueData = req.body;
    
    // Handle image upload
    let imageUrl = issueData.imageUrl || "https://via.placeholder.com/400x300?text=Issue+Report";
    
    if (req.file) {
        // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
        // For demo, we'll use a placeholder
        imageUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(issueData.title)}`;
    }
    
    const newIssue = {
        id: Date.now(),
        ...issueData,
        imageUrl,
        status: 'pending',
        reportedDate: new Date().toISOString().split('T')[0],
        rating: null,
        daysOpen: 0
    };
    
    issues.push(newIssue);
    updateStatistics();
    
    res.json({ success: true, issue: newIssue });
});

app.put('/api/issues/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    const issueIndex = issues.findIndex(issue => issue.id === parseInt(id));
    
    if (issueIndex === -1) {
        return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    
    issues[issueIndex].status = status;
    issues[issueIndex].adminNotes = adminNotes || '';
    
    // If status changed to resolved, reset rating
    if (status === 'resolved' && issues[issueIndex].status !== 'resolved') {
        issues[issueIndex].rating = null;
    }
    
    updateStatistics();
    res.json({ success: true, issue: issues[issueIndex] });
});

app.post('/api/issues/:id/rate', (req, res) => {
    const { id } = req.params;
    const { rating, comments } = req.body;
    
    const issueIndex = issues.findIndex(issue => issue.id === parseInt(id));
    
    if (issueIndex === -1) {
        return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    
    issues[issueIndex].rating = rating;
    issues[issueIndex].ratingComments = comments || '';
    issues[issueIndex].ratingDate = new Date().toISOString();
    
    updateStatistics();
    res.json({ success: true, issue: issues[issueIndex] });
});

app.post('/api/issues/:id/vote', (req, res) => {
    const { id } = req.params;
    const { voteValue, comments } = req.body;
    
    const issueIndex = issues.findIndex(issue => issue.id === parseInt(id));
    
    if (issueIndex === -1) {
        return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    
    // Initialize vote data if not exists
    if (!issues[issueIndex].votes) {
        issues[issueIndex].votes = 0;
        issues[issueIndex].voteScore = 0;
    }
    
    issues[issueIndex].votes++;
    issues[issueIndex].voteScore += voteValue;
    issues[issueIndex].voteComments = comments || '';
    
    updateStatistics();
    res.json({ success: true, issue: issues[issueIndex] });
});

// Statistics
app.get('/api/statistics', (req, res) => {
    updateStatistics();
    res.json(statistics);
});

// Leaderboard
app.get('/api/leaderboard/:type', (req, res) => {
    const { type } = req.params;
    
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
    
    res.json(mockData[type] || []);
});

// Utility functions
function updateStatistics() {
    statistics.total = issues.length;
    statistics.pending = issues.filter(i => i.status === 'pending').length;
    statistics.resolved = issues.filter(i => i.status === 'resolved').length;
    statistics.delayed = issues.filter(i => i.status === 'delayed').length;
    
    const ratedIssues = issues.filter(i => i.rating);
    statistics.averageRating = ratedIssues.length > 0 ? 
        (ratedIssues.reduce((sum, issue) => sum + issue.rating, 0) / ratedIssues.length).toFixed(1) : 0;
    
    statistics.totalVotes = issues.reduce((sum, issue) => sum + (issue.votes || 0), 0);
    statistics.responseRate = issues.length > 0 ? 
        Math.round((statistics.resolved / issues.length) * 100) : 0;
}

// Auto-escalate delayed issues
function checkDelayedIssues() {
    issues.forEach(issue => {
        const date = new Date(issue.reportedDate);
        const now = new Date();
        const daysOpen = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
        
        // Auto-escalate issues that are pending for more than 3 days
        if (issue.status === 'pending' && daysOpen > 3) {
            issue.status = 'delayed';
        }
    });
}

// Initialize data and start server
seedData();
setInterval(checkDelayedIssues, 5 * 60 * 1000); // Check every 5 minutes

app.listen(PORT, () => {
    console.log(`🚀 Civic Plus server running on port ${PORT}`);
    console.log(`🌐 Access your app at: http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at: http://localhost:${PORT}/api/`);
});

module.exports = app;
