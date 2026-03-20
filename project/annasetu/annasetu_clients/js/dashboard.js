// Dashboard Protection and User Display
document.addEventListener('DOMContentLoaded', async () => {
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

  console.log('✓ User authenticated, loading personal dashboard...');

  // Display user name in the welcome message
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    pageTitle.textContent = `Welcome Back, ${user.name}! 👋`;
    console.log('✓ Welcome message updated');
  }

  // Fetch user stats from server
  try {
    console.log('Fetching user stats from API...');
    const statsResponse = await fetch('http://localhost:5000/api/auth/user-stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!statsResponse.ok) {
      throw new Error(`Failed to fetch stats: ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();
    console.log('✓ User stats retrieved:', statsData.user);

    // Update stats cards with real data
    const statsCards = document.querySelectorAll('.stats .card');
    if (statsCards.length >= 4) {
      // Donations made
      statsCards[0].querySelector('h3').textContent = statsData.user.donationsMade;
      statsCards[0].querySelector('p').textContent = 'Donations Made';

      // Donations received
      statsCards[1].querySelector('h3').textContent = statsData.user.donationsReceived;
      statsCards[1].querySelector('p').textContent = 'Donations Received';

      // You can add more stats here in future
      statsCards[2].querySelector('h3').textContent = '0';
      statsCards[2].querySelector('p').textContent = 'Completed';

      statsCards[3].querySelector('h3').textContent = '0';
      statsCards[3].querySelector('p').textContent = 'Nearby';

      console.log('✓ Stats cards updated with real data');
    }
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Show default values if fetch fails
    const statsCards = document.querySelectorAll('.stats .card');
    if (statsCards.length >= 2) {
      statsCards[0].querySelector('h3').textContent = '0';
      statsCards[1].querySelector('h3').textContent = '0';
    }
  }

  // Render donations from database into the table
  try {
    const token = localStorage.getItem('token');
    console.log('Fetching donations from database for user:', user.id);
    
    const response = await fetch('http://localhost:5000/api/donations/my-donations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Donations response:', data);
    console.log('User ID from response:', data.userId);
    console.log('Donations count:', data.count);

    if (response.ok && data.donations && data.donations.length > 0) {
      const donations = data.donations;
      const table = document.querySelector('#donorSection table');
      
      if (table) {
        // Remove existing sample rows (keep header)
        const rows = table.querySelectorAll('tr');
        rows.forEach((r, idx) => { if (idx > 0) r.remove(); });

        donations.forEach(d => {
          const tr = document.createElement('tr');
          const date = new Date(d.cookedTime).toLocaleDateString();
          tr.innerHTML = `
            <td>${d.food}</td>
            <td>${d.quantity}</td>
            <td><span class="badge available">${d.status}</span></td>
            <td><button class="btn" onclick="alert('Edit feature coming soon')">Edit</button></td>
          `;
          table.appendChild(tr);
        });
        console.log(`✓ Loaded ${donations.length} donations from database`);
      }
    } else {
      console.log('No donations found in database');
      // Show empty state message
      const table = document.querySelector('#donorSection table');
      if (table) {
        const rows = table.querySelectorAll('tr');
        rows.forEach((r, idx) => { if (idx > 0) r.remove(); });
      }
    }
  } catch (err) {
    console.error('Failed to fetch donations from database', err);
  }

  // Handle logout
  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Only clear auth data - KEEP donations data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Note: Donations are kept for when user logs back in
      console.log('✓ User logged out - Donations preserved');
      alert('Logged out successfully');
      window.location.href = 'index.html';
    });
  }
  
  console.log('=== Dashboard Fully Loaded ===');
});
