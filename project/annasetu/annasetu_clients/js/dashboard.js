// Dashboard Protection and User Display
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== Dashboard Page Loaded ===');
  
  // First, check if there's a token in the URL (from Google OAuth redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');
  const urlUserId = urlParams.get('userId');
  const urlUserName = urlParams.get('userName');
  const urlUserEmail = urlParams.get('userEmail');

  // If token is in URL, store it in localStorage
  if (urlToken && urlUserId && urlUserName && urlUserEmail) {
    console.log('✓ Found token in URL from Google OAuth redirect');
    console.log('Storing credentials in localStorage...');
    localStorage.setItem('token', urlToken);
    localStorage.setItem('user', JSON.stringify({
      id: urlUserId,
      name: decodeURIComponent(urlUserName),
      email: decodeURIComponent(urlUserEmail)
    }));
    
    // Clear the URL parameters to clean up the address bar
    window.history.replaceState({}, document.title, '/dashboard.html');
    console.log('✓ Credentials stored and URL cleaned');
  }

  // Now check if user is logged in
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  console.log('=== Checking Authentication ===');
  console.log('Token exists:', !!token);
  console.log('User exists:', !!user);
  console.log('User data:', user ? { id: user.id, name: user.name, email: user.email } : 'N/A');

  if (!token || !user) {
    // Redirect to login if not authenticated
    console.log('❌ Authentication failed - redirecting to login');
    alert('Please log in first');
    window.location.href = 'login.html';
    return;
  }

  console.log('✓ User authenticated, loading dashboard...');

  // Display user name in the welcome message
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    pageTitle.textContent = `Welcome Back, ${user.name}! 👋`;
    console.log('✓ Welcome message updated');
  }

  // Render donations from localStorage into the table
  try {
    const userDonationsKey = `donations_${user.id}`;
    const donations = JSON.parse(localStorage.getItem(userDonationsKey) || '[]');
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
      console.log(`✓ Loaded ${donations.length} donations from localStorage`);
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
      const userDonationsKey = `donations_${user.id}`;
      localStorage.removeItem(userDonationsKey);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✓ User logged out');
      alert('Logged out successfully');
      window.location.href = 'index.html';
    });
  }
  
  console.log('=== Dashboard Fully Loaded ===');
});
