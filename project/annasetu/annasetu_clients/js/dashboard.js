// Dashboard Protection and User Display
let userCoordinates = null; // Store user's location for distance calculation

// Promise to wait for geolocation
function getGeolocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('⚠️ Geolocation not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        userCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        console.log('✓ User location obtained:', userCoordinates);
        resolve(userCoordinates);
      },
      (error) => {
        console.warn('⚠️ Could not get user location:', error.message);
        resolve(null);
      }
    );
  });
}

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

  // Get user's location for distance calculation
  console.log('📍 Requesting user location...');
  await getGeolocation();
  console.log('📍 Location ready. User coordinates:', userCoordinates);

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
        <td><button class="btn" onclick="openEditModal('${d._id || ''}', '${(d.food || d.foodName || '').replace(/'/g, "\\'")}', '${d.foodType || ''}', '${(d.quantity || d.qty || '').replace(/'/g, "\\'")}', '${(d.description || '').replace(/'/g, "\\'")}', '${(d.location || '').replace(/'/g, "\\'")}')" ${!d._id ? 'disabled' : ''}>Edit</button></td>
      `;
      table.appendChild(tr);
    });
  }

  // Render available food from other users (Receiver section)
  const receiverTable = document.querySelector('#receiverSection table');
  if (receiverTable) {
    const rows = receiverTable.querySelectorAll('tr');
    rows.forEach((r, i) => { if (i > 0) r.remove(); });

    availableDonations.forEach(d => {
      const tr = document.createElement('tr');

      // Calculate distance if location available
      let distance = 'N/A';
      if (userCoordinates && d.coordinates) {
        try {
          const dist = calculateDistance(
            userCoordinates.latitude,
            userCoordinates.longitude,
            d.coordinates.latitude,
            d.coordinates.longitude
          );
          distance = getFormattedDistance(dist);
        } catch (err) {
          console.warn('❌ Distance calculation error for', d.food, ':', err);
          distance = 'N/A';
        }
      } else if (!userCoordinates) {
        console.warn('⚠️ User coordinates not available for distance calculation');
      } else if (!d.coordinates) {
        console.warn('⚠️ Donation coordinates missing:', d.food);
      }

      tr.innerHTML = `
        <td>${d.food || d.foodName || '-'}</td>
        <td>${d.quantity || d.qty || '-'}</td>
        <td>${distance}</td>
        <td><button class="btn-request" onclick="alert('Request feature coming soon')">Request</button></td>
      `;
      receiverTable.appendChild(tr);
    });

    // If no available donations, show message
    if (availableDonations.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td colspan="4" style="text-align: center; padding: 20px; color: #999;">
          No available food from other users at the moment. Check back later!
        </td>
      `;
      receiverTable.appendChild(tr);
    }
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

  console.log('=== Dashboard Fully Loaded ===')
});



// Edit Modal Functions
let currentEditingDonationId = null;

function openEditModal(donationId, foodName, foodType, quantity, description, location) {
  if (!donationId) {
    alert('Cannot edit this donation');
    return;
  }

  currentEditingDonationId = donationId;

  // Display read-only fields
  document.getElementById('displayFoodName').textContent = foodName;
  document.getElementById('displayFoodType').textContent = foodType;
  document.getElementById('displayLocation').textContent = location;

  // Only populate editable quantity field
  document.getElementById('editQuantity').value = quantity;

  // Show modal
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  currentEditingDonationId = null;
}

// Handle edit form submission
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'editForm') return;

  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token || !currentEditingDonationId) {
    alert('Error: Not authenticated');
    return;
  }

  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Saving...';

    const updateData = {
      quantity: document.getElementById('editQuantity').value
    };

    console.log(`[EDIT] Sending PATCH to /api/donations/${currentEditingDonationId}`, updateData);

    const response = await fetch(`http://localhost:5000/api/donations/${currentEditingDonationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    console.log(`[EDIT] Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[EDIT] Error response:', errorData);
      throw new Error(errorData.message || 'Failed to update donation');
    }

    const returnedData = await response.json();
    console.log('[EDIT] Success response:', returnedData);

    alert('✅ Donation updated successfully!');
    closeEditModal();

    // Reload page to show updated donation
    console.log('[EDIT] Reloading page...');
    window.location.reload();

  } catch (error) {
    console.error('Error updating donation:', error);
    alert(`❌ Error: ${error.message}`);
  } finally {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Save Changes';
    }
  }
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('editModal');
  if (e.target === modal) {
    closeEditModal();
  }
});
