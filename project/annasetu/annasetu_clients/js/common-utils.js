/**
 * COMMON UTILITIES FOR ALL PAGES
 * Handles logout functionality and other shared operations
 */

// Initialize logout handlers on all pages
document.addEventListener('DOMContentLoaded', function () {
    initializeLogoutHandlers();
    initGlobalNotifications();
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

/* -------------------- Global Notifications -------------------- */
// Initialize global notification system: request permission and connect socket
function initGlobalNotifications() {
    try {
        // Request browser notification permission (non-blocking)
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(p => console.log('Notification permission:', p));
        }
    } catch (e) {
        console.warn('Notification API not available', e);
    }

    // Load Socket.io client script dynamically if needed and then setup socket
    if (typeof io === 'undefined') {
        const existing = document.querySelector('script[data-socketio-loader]');
        if (!existing) {
            const s = document.createElement('script');
            s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
            s.setAttribute('data-socketio-loader', '1');
            s.onload = () => setupGlobalSocket();
            s.onerror = (err) => console.error('Failed to load socket.io client', err);
            document.head.appendChild(s);
        }
    } else {
        setupGlobalSocket();
    }
}

function setupGlobalSocket() {
    // Avoid creating multiple sockets
    if (window.__annasetuSocket) return;

    try {
        const token = localStorage.getItem('token');
        // Use explicit origin (adjust if your server runs on different host/port)
        const socket = io('http://localhost:5000', { auth: { token } });
        window.__annasetuSocket = socket;

        socket.on('connect', () => {
            console.log('Global socket connected:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('Global socket disconnected:', reason);
        });

        socket.on('new_notification', (notif) => {
            try {
                console.log('Global new_notification received:', notif);
                // Store pending notifications locally (simple queue)
                const pending = JSON.parse(localStorage.getItem('pendingNotifications') || '[]');
                pending.unshift(notif);
                localStorage.setItem('pendingNotifications', JSON.stringify(pending));

                // Increment unseen counter
                const unseen = parseInt(localStorage.getItem('unseenNotifications') || '0', 10) || 0;
                localStorage.setItem('unseenNotifications', unseen + 1);

                // Dispatch custom event so pages can update UI
                window.dispatchEvent(new CustomEvent('annasetu:new_notification', { detail: notif }));

                // Show native browser notification if permission granted
                if ('Notification' in window && Notification.permission === 'granted') {
                    try {
                        new Notification('New Notification', { body: notif.message, icon: '/favicon.ico' });
                    } catch (e) {
                        console.warn('Failed to show browser notification', e);
                    }
                }

                // Update an on-page badge if present
                const badge = document.getElementById('notificationBadge');
                if (badge) {
                    const count = parseInt(localStorage.getItem('unseenNotifications') || '0', 10) || 0;
                    badge.textContent = count;
                    badge.style.display = count > 0 ? 'inline-block' : 'none';
                }
            } catch (err) {
                console.error('Error handling incoming notification', err);
            }
        });
    } catch (err) {
        console.error('Failed to setup global socket', err);
    }
}

