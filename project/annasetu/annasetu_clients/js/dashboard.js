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

  // Render donations from localStorage into the table
  try {
    const donations = JSON.parse(localStorage.getItem('donations') || '[]');
    const table = document.querySelector('#donorSection table');
    if (table && donations.length) {
      // remove existing sample rows (keep header)
      const rows = table.querySelectorAll('tr');
      // remove all rows except the header
      rows.forEach((r, idx) => { if (idx > 0) r.remove(); });

      donations.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${d.food}</td>
          <td>${d.qty}</td>
          <td><span class="badge available">${d.status}</span></td>
          <td><button class="btn">Edit</button></td>
        `;
        table.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Failed to render donations from localStorage', err);
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
