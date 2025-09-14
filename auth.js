// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    setupAuthForms();
    setupPasswordToggle();
});

function setupAuthForms() {
    const citizenForm = document.getElementById('citizen-login-form');
    const adminForm = document.getElementById('admin-login-form');

    if (citizenForm) {
        citizenForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin('citizen');
        });
    }

    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin('admin');
        });
    }
}

function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('#toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.parentElement.querySelector('input[type="password"], input[type="text"]');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

async function handleLogin(role) {
    const form = role === 'citizen' ? 
        document.getElementById('citizen-login-form') : 
        document.getElementById('admin-login-form');
    
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Signing In...';
    submitBtn.disabled = true;

    try {
        const user = await loginUser(email, password, role);
        
        showNotification(`Welcome back, ${user.name}!`, 'success');
        
        // Redirect based on role
        setTimeout(() => {
            if (role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'citizen-dashboard.html';
            }
        }, 1000);
        
    } catch (error) {
        showNotification(error, 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Enhanced login function with better validation
async function loginUser(email, password, role) {
    return new Promise((resolve, reject) => {
        // Simulate API call delay
        setTimeout(() => {
            // Demo credentials
            const validCredentials = {
                'citizen@example.com': { 
                    password: 'password123', 
                    name: 'John Citizen', 
                    role: 'citizen', 
                    ward: 'Ward 1' 
                },
                'admin@example.com': { 
                    password: 'admin123', 
                    name: 'Jane Admin', 
                    role: 'admin', 
                    ward: 'Ward 1' 
                }
            };

            const userCreds = validCredentials[email.toLowerCase()];
            
            if (!userCreds) {
                reject('User not found. Please check your email address.');
                return;
            }

            if (userCreds.password !== password) {
                reject('Incorrect password. Please try again.');
                return;
            }

            if (userCreds.role !== role) {
                reject(`This account is not authorized for ${role} access.`);
                return;
            }

            // Create user object
            const user = {
                email: email.toLowerCase(),
                name: userCreds.name,
                role: userCreds.role,
                ward: userCreds.ward,
                loginTime: new Date().toISOString()
            };

            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            resolve(user);
        }, 1000);
    });
}

// Logout functionality
function logout() {
    // Clear user data
    localStorage.removeItem('currentUser');
    
    // Show logout message
    showNotification('You have been logged out successfully.', 'success');
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Check if user is already logged in
function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        
        // Redirect based on current page and user role
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('login') || currentPage.includes('register')) {
            // User is already logged in, redirect to appropriate dashboard
            if (user.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'citizen-dashboard.html';
            }
        }
        
        return user;
    }
    return null;
}

// Auto-check auth status on page load
document.addEventListener('DOMContentLoaded', function() {
    // Only check auth status on non-login pages
    if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
        checkAuthStatus();
    }
});

// Session timeout handling
function setupSessionTimeout() {
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    let lastActivity = Date.now();
    
    // Update last activity on user interaction
    document.addEventListener('click', updateLastActivity);
    document.addEventListener('keypress', updateLastActivity);
    document.addEventListener('scroll', updateLastActivity);
    
    function updateLastActivity() {
        lastActivity = Date.now();
    }
    
    // Check for session timeout every minute
    setInterval(() => {
        if (Date.now() - lastActivity > SESSION_TIMEOUT) {
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                showNotification('Your session has expired. Please log in again.', 'warning');
                logout();
            }
        }
    }, 60000);
}

// Initialize session timeout on pages that require authentication
if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('admin')) {
    setupSessionTimeout();
}
