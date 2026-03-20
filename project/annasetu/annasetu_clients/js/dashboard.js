// Dashboard Protection and User Display
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    // Redirect to login if not authenticated
    alert('Please log in first');
    window.location.href = 'login.html';
    return;
  }

  // Display user name in the welcome message
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    pageTitle.textContent = `Welcome Back, ${user.name}! 👋`;
  }

  // Handle logout
  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Logged out successfully');
      window.location.href = 'index.html';
    });
  }
});
