// Notifications Page JavaScript
let isPageInitialized = false;
let initStartTime = 0;
let notifications = [];

// Initialize on page load with better error handling
document.addEventListener('DOMContentLoaded', async () => {
  if (isPageInitialized) {
    console.warn('⚠️ Page already initialized, skipping...');
    return;
  }

  initStartTime = Date.now();
  console.log('=== Notifications Page Loading ===');

  // Add a small delay to ensure DOM is fully painted
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    // Check authentication
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
      console.warn('⚠️ Not authenticated, redirecting to login...');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 500);
      return;
    }

    console.log(`✓ User authenticated: ${user.name}`);

    // Load notifications
    await loadNotifications();

    // Setup event listeners
    setupEventListeners();

    // Mark page as initialized
    isPageInitialized = true;
    const loadTime = Date.now() - initStartTime;
    console.log(`✓ Notifications Page Ready (loaded in ${loadTime}ms)`);
  } catch (error) {
    console.error('❌ Error initializing notifications page:', error);
    isPageInitialized = false;
  }
});

// Handle page visibility changes (user returns to tab)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Notifications page hidden');
    return;
  }

  console.log('Notifications page visible again');
  // Verify user is still authenticated
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    console.warn('⚠️ Session expired, redirecting to login...');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
    return;
  }

  // Refresh notifications if needed
  if (isPageInitialized) {
    console.log('Refreshing notifications...');
    loadNotifications();
  }
});

// Load notifications
async function loadNotifications() {
  try {
    // For now, use empty state
    // In future, you can fetch from backend:
    // const token = localStorage.getItem('token');
    // const response = await fetch('http://localhost:5000/api/notifications', {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // const data = await response.json();
    // notifications = data.notifications || [];
    
    notifications = [];
    displayNotifications();
    console.log('✓ Notifications loaded successfully');
  } catch (error) {
    console.error('Error loading notifications:', error);
    displayNotifications();
  }
}

// Display notifications on page
function displayNotifications() {
  try {
    const container = document.getElementById('notificationsContainer');
    
    if (!container) {
      console.warn('Notifications container not found');
      return;
    }

    if (notifications.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
          <h3 style="color: #666; margin-bottom: 10px;">No Notifications Yet</h3>
          <p style="color: #999;">When you receive notifications, they'll appear here.</p>
        </div>
      `;
      return;
    }

    // Render notifications
    const notificationsList = notifications.map(notif => `
      <div class="notification-item">
        <div class="notification-icon">
          <i class="fas ${notif.icon || 'fa-bell'}"></i>
        </div>
        <div class="notification-content">
          <h4>${notif.title || 'Notification'}</h4>
          <p>${notif.message || ''}</p>
          <span class="notification-time">${formatTime(notif.timestamp)}</span>
        </div>
        <button class="notification-close" onclick="closeNotification(this)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');

    container.innerHTML = notificationsList;
    console.log(`✓ ${notifications.length} notifications displayed`);
  } catch (error) {
    console.error('Error displaying notifications:', error);
  }
}

// Close notification
function closeNotification(element) {
  element.closest('.notification-item').remove();
}

// Format time
function formatTime(timestamp) {
  if (!timestamp) return 'Just now';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return date.toLocaleDateString();
}

// Setup event listeners
function setupEventListeners() {
  // Add any notification-related event listeners here
  console.log('Notification event listeners setup complete');
}
