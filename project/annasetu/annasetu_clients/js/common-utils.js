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

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

/**
 * Get formatted distance text for UI display
 * @param {number} distanceInKm - Distance in kilometers
 * @returns {string} Formatted distance string (e.g., "12.5 km")
 */
function getFormattedDistance(distanceInKm) {
    if (isNaN(distanceInKm) || distanceInKm < 0) {
        return 'Distance N/A';
    }

    if (distanceInKm < 0.1) {
        return '< 0.1 km';
    }

    return `${distanceInKm.toFixed(1)} km`;
}
