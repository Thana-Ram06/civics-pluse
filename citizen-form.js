// Citizen form specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    setupImageUpload();
    setupLocationDetection();
    setupFormSubmission();
});

function setupImageUpload() {
    setupDragAndDrop('image-upload-area', 'image-input', 'image-preview');
    
    const input = document.getElementById('image-input');
    input.addEventListener('change', function() {
        handleImageUpload(input, 'image-preview');
    });
}

function setupLocationDetection() {
    const getLocationBtn = document.getElementById('get-location-btn');
    const locationDisplay = document.getElementById('location-display');
    const locationText = document.getElementById('location-text');
    const manualLocation = document.getElementById('manual-location');

    getLocationBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Getting Location...';
            getLocationBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Use reverse geocoding to get address
                    reverseGeocode(lat, lng)
                        .then(address => {
                            locationText.textContent = address;
                            locationDisplay.classList.remove('hidden');
                            getLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt mr-2"></i>Use Current Location';
                            getLocationBtn.disabled = false;
                            
                            // Store location data
                            window.selectedLocation = {
                                lat: lat,
                                lng: lng,
                                address: address
                            };
                        })
                        .catch(error => {
                            console.error('Reverse geocoding failed:', error);
                            locationText.textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
                            locationDisplay.classList.remove('hidden');
                            getLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt mr-2"></i>Use Current Location';
                            getLocationBtn.disabled = false;
                        });
                },
                function(error) {
                    console.error('Location access denied:', error);
                    showNotification('Unable to get your location. Please enter address manually.', 'warning');
                    getLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt mr-2"></i>Use Current Location';
                    getLocationBtn.disabled = false;
                }
            );
        } else {
            showNotification('Geolocation is not supported by this browser.', 'warning');
        }
    });

    // Manual location input
    manualLocation.addEventListener('input', function() {
        if (this.value.trim()) {
            locationText.textContent = this.value.trim();
            locationDisplay.classList.remove('hidden');
            
            window.selectedLocation = {
                address: this.value.trim()
            };
        } else {
            locationDisplay.classList.add('hidden');
            window.selectedLocation = null;
        }
    });
}

function reverseGeocode(lat, lng) {
    // Simulate reverse geocoding API call
    return new Promise((resolve, reject) => {
        // In a real application, you would use Google Maps Geocoding API or similar
        setTimeout(() => {
            const mockAddresses = [
                "123 Main Street, Downtown",
                "456 Oak Avenue, Residential Area",
                "789 Pine Street, Commercial District",
                "321 Elm Street, Industrial Zone",
                "654 Maple Drive, Suburb"
            ];
            
            const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
            resolve(randomAddress);
        }, 1000);
    });
}

function setupFormSubmission() {
    const form = document.getElementById('issue-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm('issue-form')) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        if (!document.getElementById('image-input').files[0]) {
            showNotification('Please upload a photo of the issue.', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData();
            const imageFile = document.getElementById('image-input').files[0];
            
            // Create issue data
            const issueData = {
                title: document.getElementById('issue-type').value,
                description: document.getElementById('description').value,
                issueType: document.getElementById('issue-type').value,
                location: window.selectedLocation || { address: document.getElementById('manual-location').value },
                reporterName: document.getElementById('reporter-name').value,
                reporterEmail: document.getElementById('reporter-email').value,
                priority: document.querySelector('input[name="priority"]:checked').value,
                imageUrl: await uploadImage(imageFile),
                reportedBy: 'anonymous'
            };

            const newIssue = await submitIssue(issueData);
            
            showNotification('Issue reported successfully! You will be notified when it\'s resolved.', 'success');
            
            // Reset form
            form.reset();
            document.getElementById('image-preview').style.display = 'none';
            document.getElementById('location-display').classList.add('hidden');
            window.selectedLocation = null;
            
            // Redirect to confirmation page or show success message
            setTimeout(() => {
                window.location.href = 'issue-confirmation.html?id=' + newIssue.id;
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting issue:', error);
            showNotification('Failed to submit issue. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function uploadImage(file) {
    return new Promise((resolve) => {
        // Simulate image upload
        setTimeout(() => {
            // In a real application, you would upload to a cloud storage service
            // For demo purposes, we'll use a placeholder URL
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result); // Using base64 for demo
            };
            reader.readAsDataURL(file);
        }, 1000);
    });
}

// Form validation enhancements
function validateForm(formId) {
    const form = document.getElementById(formId);
    let isValid = true;

    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    // Check image upload
    const imageInput = document.getElementById('image-input');
    if (!imageInput.files[0]) {
        document.getElementById('image-upload-area').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('image-upload-area').classList.remove('error');
    }

    // Check location
    if (!window.selectedLocation && !document.getElementById('manual-location').value.trim()) {
        document.getElementById('manual-location').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('manual-location').classList.remove('error');
    }

    return isValid;
}

// Add real-time validation feedback
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('#issue-form input, #issue-form select, #issue-form textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error') && this.value.trim()) {
                this.classList.remove('error');
            }
        });
    });
});
