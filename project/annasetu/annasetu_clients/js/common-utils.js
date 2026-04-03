/**
 * COMMON UTILITIES FOR ALL PAGES
 * Handles logout functionality and other shared operations
 */

// Initialize logout handlers on all pages
document.addEventListener('DOMContentLoaded', function () {
    initializeLogoutHandlers();
});

/**
 * Setup logout event listeners
 * This should be called on every page that has a logout button
 */
function initializeLogoutHandlers() {
    const logoutBtns = document.querySelectorAll('.logout');

    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            performLogout();
        });
    });
}

/**
 * Perform logout operation
 */
function performLogout() {
    console.log('🔓 Performing logout...');

    // Clear all user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('donations');
    localStorage.removeItem('requests');

    // Can add confirmation if desired
    console.log('✓ User logged out successfully');

    // Redirect to login/home page
    window.location.href = 'index.html';
}
