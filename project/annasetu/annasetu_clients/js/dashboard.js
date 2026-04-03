// Dashboard Protection and User Display
document.addEventListener('DOMContentLoaded', async () => {
  console.log('=== Dashboard Page Loaded ===');

  // Persist token from URL (Google OAuth) if present
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlUserId = urlParams.get('userId');
    const urlUserName = urlParams.get('userName');
    const urlUserEmail = urlParams.get('userEmail');

    if (urlToken && urlUserId) {
      localStorage.setItem('token', urlToken);
      localStorage.setItem('user', JSON.stringify({ id: urlUserId, name: decodeURIComponent(urlUserName || ''), email: decodeURIComponent(urlUserEmail || '') }));
      window.history.replaceState({}, document.title, '/dashboard.html');
      console.log('Stored token from URL');
    }
  } catch (err) {
    console.warn('URL token handling failed', err);
  }

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) {
    console.log('No token/user found; redirecting to login');
    window.location.href = 'login.html';
    return;
  }

  // Update welcome
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) pageTitle.textContent = `Welcome Back, ${user.name || 'User'}!`;

  // Try to fetch user stats (non-fatal)
  try {
    const statsRes = await fetch('http://localhost:5000/api/auth/user-stats', { headers: { Authorization: `Bearer ${token}` } });
    if (statsRes.ok) {
      const stats = await statsRes.json();
      const cards = document.querySelectorAll('.stats .card');
      if (cards.length >= 2) {
        cards[0].querySelector('h3').textContent = stats.user?.donationsMade ?? '0';
        cards[1].querySelector('h3').textContent = stats.user?.donationsReceived ?? '0';
      }
    }
  } catch (err) {
    console.warn('Failed to fetch stats', err);
  }

  // Load donations with retry mechanism: prefer backend, fallback to localStorage
  let donations = [];
  let retryCount = 0;
  const maxRetries = 8;

  const fetchDonationsWithRetry = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/donations/my-donations', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const body = await res.json();
        donations = body.donations || [];

        // If donations empty and we haven't retried too many times, retry after delay
        if ((!donations || donations.length === 0) && retryCount < maxRetries) {
          retryCount++;
          const delayMs = Math.min(1000 + (retryCount * 1500), 10000); // Increase delay: 2.5s, 4s, 5.5s, etc.
          console.log(`No donations found yet. Retrying in ${delayMs}ms (attempt ${retryCount}/${maxRetries})`);
          await new Promise(r => setTimeout(r, delayMs));
          return fetchDonationsWithRetry();
        }
      }
    } catch (err) {
      console.warn('Backend donations unavailable, will fallback to localStorage');
    }

    return donations;
  };

  donations = await fetchDonationsWithRetry();

  // Also load all available donations (others') to compute nearby/requests by others
  let availableDonations = [];
  try {
    const res2 = await fetch('http://localhost:5000/api/donations/available', { headers: { Authorization: `Bearer ${token}` } });
    if (res2.ok) {
      const body2 = await res2.json();
      availableDonations = body2.donations || [];
    }
  } catch (err) {
    console.warn('Backend available donations unavailable, will fallback to localStorage');
  }

  if (!donations.length) {
    try {
      const stored = JSON.parse(localStorage.getItem('donations') || '[]');
      const currentUserId = user.id || user._id || user.email;
      donations = stored.filter(d => !d.userId || d.userId === currentUserId);

      // If availableDonations empty, derive from stored (others')
      if (!availableDonations.length) {
        availableDonations = stored.filter(d => !d.userId || d.userId !== currentUserId);
      }
    } catch (err) {
      console.warn('Failed to read local donations', err);
    }
  }

  // Render donations
  const table = document.querySelector('#donorSection table');
  if (table) {
    const rows = table.querySelectorAll('tr');
    rows.forEach((r, i) => { if (i > 0) r.remove(); });
    donations.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.food || d.foodName || '-'}</td>
        <td>${d.quantity || d.qty || '-'}</td>
        <td><span class="badge available">${d.status || 'Available'}</span></td>
        <td><button class="btn" onclick="alert('Edit feature coming soon')">Edit</button></td>
      `;
      table.appendChild(tr);
    });
  }

  // Compute dashboard counts and update stat cards
  try {
    const cards = document.querySelectorAll('.stats .card');
    // Determine counts:
    // - donationsMade: number of donations created by current user (donations.length)
    // - requestsByOthers: donations belonging to user that have status 'Requested' (server-side not yet fully modeled) OR count of availableDonations where status === 'Requested'
    // - requestsMadeByUser: we don't have a dedicated endpoint; fallback to localStorage 'requests' array or 0
    // - nearby: number of availableDonations

    const donationsMade = Array.isArray(donations) ? donations.length : 0;
    const requestsByOthers = Array.isArray(donations) ? donations.filter(d => (d.status || '').toLowerCase() === 'requested').length : 0;
    // fallback: check availableDonations for requested flags
    const altRequestsByOthers = Array.isArray(availableDonations) ? availableDonations.filter(d => (d.status || '').toLowerCase() === 'requested').length : 0;
    const finalRequestsByOthers = requestsByOthers || altRequestsByOthers;

    let requestsMadeByUser = 0;
    try {
      const storedRequests = JSON.parse(localStorage.getItem('requests') || '[]');
      requestsMadeByUser = Array.isArray(storedRequests) ? storedRequests.filter(r => (r.requesterId || r.userId || r.from) === (user.id || user._id || user.email)).length : 0;
    } catch (err) {
      requestsMadeByUser = 0;
    }

    const nearby = Array.isArray(availableDonations) ? availableDonations.length : 0;

    if (cards && cards.length >= 4) {
      // Map cards in order: Donations, Requests, Distributed, Nearby
      cards[0].querySelector('h3').textContent = String(donationsMade);
      cards[1].querySelector('h3').textContent = String(finalRequestsByOthers || requestsMadeByUser || '0');
      // Preserve 'Distributed' for now but set to 0 if unknown
      cards[2].querySelector('h3').textContent = cards[2].querySelector('h3').textContent || '0';
      cards[3].querySelector('h3').textContent = String(nearby);
    }
  } catch (err) {
    console.warn('Failed to compute/update dashboard counts', err);
  }

  console.log('=== Dashboard Fully Loaded ===');
});
