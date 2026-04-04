// Browse Food Feature
let allDonations = [];
let filteredDonations = [];
let selectedDonation = null;
let currentFilter = 'all';
let searchTimeout = null; // For debouncing search
let userCoordinates = null; // Store user's current coordinates for distance calculation

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
        resolve(null); // Still resolve, so page loads
      }
    );
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('=== Browse Page Loaded ===');

  // Initialize modal cache
  modalCache.init();

  // Check authentication
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) {
    alert('Please log in first');
    window.location.href = 'login.html';
    return;
  }

  console.log(`✓ User authenticated: ${user.name}`);

  // Get user's current location BEFORE loading donations
  console.log('📍 Requesting user location...');
  await getGeolocation();
  console.log('📍 Location ready. User coordinates:', userCoordinates);

  // Load available donations
  await loadDonations();

  // Setup filter buttons
  setupFilterButtons();

  // Setup map toggle button
  setupMapToggle();

  // Setup search input with debouncing
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', () => {
    // Clear previous timeout
    clearTimeout(searchTimeout);

    // Show loading indicator while typing
    searchTimeout = setTimeout(() => {
      handleSearch();
    }, 300); // Wait 300ms after user stops typing
  });

  console.log('=== Browse Page Ready ===');
});

// Load all available donations from server
async function loadDonations() {
  try {
    const token = localStorage.getItem('token');
    console.log('Fetching available donations...');

    // Show loading state
    const loadingEl = document.getElementById('loadingState');
    const gridEl = document.getElementById('donationsGrid');
    const emptyEl = document.getElementById('emptyState');

    loadingEl.classList.remove('hidden');
    gridEl.innerHTML = '';
    emptyEl.classList.add('hidden');

    const startTime = performance.now();

    const response = await fetch('http://localhost:5000/api/donations/available', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch donations: ${response.status}`);
    }

    const data = await response.json();
    const loadTime = performance.now() - startTime;

    console.log(`✓ Fetched ${data.donations.length} available donations in ${loadTime.toFixed(2)}ms`);
    console.log('Sample donation:', data.donations[0]); // Debug: see what data looks like

    allDonations = data.donations || [];
    filteredDonations = [...allDonations];

    // Hide loading, show results
    loadingEl.classList.add('hidden');
    displayDonations(filteredDonations);

  } catch (error) {
    console.error('Error loading donations:', error);
    const loadingEl = document.getElementById('loadingState');
    const gridEl = document.getElementById('donationsGrid');

    loadingEl.classList.add('hidden');
    gridEl.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
        <i class="fa fa-exclamation-circle" style="font-size: 40px; margin-bottom: 10px;"></i>
        <p>Error loading donations: ${error.message}</p>
      </div>
    `;
  }
}

// Calculate distance between two coordinates using Haversine formula
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

// Get distance text for donation card
function getDistanceText(donation) {
  if (!userCoordinates) {
    console.warn('⚠️ User coordinates not available yet');
    return 'Distance N/A';
  }

  if (!donation.coordinates) {
    console.warn('⚠️ Donation coordinates missing:', donation.food);
    return 'Distance N/A';
  }

  try {
    const distance = calculateDistance(
      userCoordinates.latitude,
      userCoordinates.longitude,
      donation.coordinates.latitude,
      donation.coordinates.longitude
    );

    if (isNaN(distance)) {
      console.warn('⚠️ Invalid distance calculation for:', donation.food);
      return 'Distance N/A';
    }

    return `${distance.toFixed(1)} km away`;
  } catch (err) {
    console.warn('❌ Distance calculation error for', donation.food, ':', err);
    return 'Distance N/A';
  }
}

// Display donations in grid with optimized rendering
function displayDonations(donations) {
  const grid = document.getElementById('donationsGrid');
  const emptyState = document.getElementById('emptyState');

  if (donations.length === 0) {
    grid.style.display = 'none';
    emptyState.classList.remove('hidden');
    return;
  }

  grid.style.display = 'grid';
  emptyState.classList.add('hidden');

  try {
    // Create all cards at once, then insert
    const fragment = document.createDocumentFragment();
    const cards = donations.map(donation => {
      const div = document.createElement('div');
      const cardHTML = createDonationCard(donation);
      div.innerHTML = cardHTML;
      return div.firstElementChild;
    }).filter(card => card !== null); // Filter out any null cards

    cards.forEach(card => fragment.appendChild(card));
    grid.innerHTML = ''; // Clear
    grid.appendChild(fragment);

    console.log(`⚡ Rendered ${donations.length} cards in grid`);
  } catch (error) {
    console.error('Error displaying donations:', error);
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
        <i class="fa fa-exclamation-circle" style="font-size: 40px; margin-bottom: 10px;"></i>
        <p>Error rendering donations: ${error.message}</p>
      </div>
    `;
  }
}

// Create donation card HTML
function createDonationCard(donation) {
  try {
    const foodIcon = getFoodIcon(donation.foodType);
    const qualityTag = donation.aiAnalysis ? getQualityTag(donation.aiAnalysis) : '';
    const donorName = donation.userId?.name || 'Anonymous';
    const donorLocation = donation.userId?.location || donation.location || 'Unknown';

    // Safe date parsing
    let cookedDate = 'Unknown Date';
    if (donation.cookedTime) {
      try {
        cookedDate = new Date(donation.cookedTime).toLocaleDateString();
      } catch (e) {
        console.warn('Invalid cookedTime:', donation.cookedTime);
        cookedDate = 'Unknown Date';
      }
    }

    return `
    <div class="donation-card">
      <div class="card-image">
        ${donation.images && donation.images.length > 0 ?
        `<img src="${donation.images[0]}" alt="${donation.food}">` :
        `<span>${foodIcon}</span>`
      }
      </div>

      <div class="card-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div class="food-name">${donation.food}</div>
          ${qualityTag}
        </div>

        <div class="food-meta">
          <span class="badge ${donation.foodType.toLowerCase().replace('-', '-')}">
            ${foodIcon} ${donation.foodType}
          </span>
        </div>

        <div class="food-info">
          <div class="info-item">
            <i class="fa fa-weight"></i>
            <span>${donation.quantity}</span>
          </div>
          <div class="info-item">
            <i class="fa fa-calendar"></i>
            <span>${cookedDate}</span>
          </div>
          <div class="info-item">
            <i class="fa fa-map-marker-alt"></i>
            <span>${getDistanceText(donation)}</span>
          </div>
        </div>

        <div class="donor-info">
          <div class="donor-name">👤 ${donorName}</div>
          <div class="donor-location">📍 ${donorLocation}</div>
        </div>

        ${donation.aiAnalysis?.recommendation ? `
          <p style="font-size: 12px; color: #666; margin-bottom: 10px;">
            <strong>AI Analysis:</strong> ${donation.aiAnalysis.recommendation.substring(0, 80)}...
          </p>
        ` : donation.description ? `
          <p style="font-size: 12px; color: #666; margin-bottom: 10px;">
            <strong>Description:</strong> ${donation.description.substring(0, 80)}...
          </p>
        ` : ''}

        <div class="claim-action">
          ${getClaimButton(donation)}
        </div>
      </div>
    </div>
  `;
  } catch (error) {
    console.error('Error creating donation card:', error, donation);
    return `
      <div class="donation-card" style="opacity: 0.5;">
        <p style="color: red;">Error loading this donation</p>
      </div>
    `;
  }
}

// Get food type emoji
function getFoodIcon(foodType) {
  const icons = {
    'Vegetarian': '',
    'Non-Veg': '',
    'Vegan': ''
  };
  return icons[foodType] || '';
}

// Get claim button based on donation status and user claims
function getClaimButton(donation) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return '';

    // User object can have 'id', '_id', or 'email'
    const userId = user.id || user._id || user.email;
    if (!userId) return '';

    // Check if user has already claimed this donation
    const userClaim = donation.claims?.find(c => {
      try {
        // Claims array uses 'userId' field, not 'claimedBy'
        const claimUserId = typeof c.userId === 'object' ? c.userId?.toString() : String(c.userId);
        return claimUserId === userId;
      } catch (e) {
        return false;
      }
    });

    if (userClaim) {
      const statusColors = {
        'pending': '#ff9800',
        'accepted': '#4caf50',
        'rejected': '#f44336'
      };
      const statusIcons = {
        'pending': 'fa-hourglass-half',
        'accepted': 'fa-check-circle',
        'rejected': 'fa-times-circle'
      };
      const statusText = {
        'pending': 'Pending',
        'accepted': 'Accepted',
        'rejected': 'Rejected'
      };

      return `
        <button class="claim-status-btn" style="background: ${statusColors[userClaim.status]};" disabled>
          <i class="fa ${statusIcons[userClaim.status]}"></i> ${statusText[userClaim.status]}
        </button>
      `;
    }

    // Show claim button if not claimed by anyone
    if (donation.status === 'Available') {
      return `
        <button class="claim-btn" onclick="handleClaimDonation('${donation._id}', '${donation.food.replace(/'/g, "\\'")}')">
          <i class="fa fa-star"></i> Claim Food
        </button>
      `;
    }

    // Show status for claimed/completed donations
    const statusText = {
      'Claimed': '🔒 Already Claimed',
      'Completed': '✅ Completed',
      'Expired': '⏰ Expired'
    };

    return `
      <button class="claim-btn disabled" style="opacity: 0.6;" disabled>
        ${statusText[donation.status] || donation.status}
      </button>
    `;
  } catch (error) {
    console.error('Error in getClaimButton:', error);
    return '<button class="claim-btn disabled" style="opacity: 0.6;" disabled>--</button>';
  }
}

// Get quality badge for AI analysis (with caching)
const qualityTagCache = {};
function getQualityTag(aiAnalysis) {
  if (!aiAnalysis) return '';

  const cacheKey = `${aiAnalysis.human}_${aiAnalysis.cattle}_${aiAnalysis.fertilizer}`;
  if (qualityTagCache[cacheKey]) return qualityTagCache[cacheKey];

  const human = aiAnalysis.human || 0;
  const cattle = aiAnalysis.cattle || 0;
  const fertilizer = aiAnalysis.fertilizer || 0;

  // Find which category it's most suitable for
  let suitability = '';
  let bgColor = '';

  if (human > cattle && human > fertilizer) {
    suitability = 'Suitable for: Human Consumption';
    bgColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  } else if (cattle > human && cattle > fertilizer) {
    suitability = 'Suitable for: Animal Feed';
    bgColor = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
  } else {
    suitability = 'Suitable for: Fertilizer';
    bgColor = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
  }

  const tag = `<span class="ai-tag" style="background: ${bgColor}; white-space: nowrap; padding: 4px 10px; border-radius: 10px; font-size: 15px; color: white; font-weight: 500;">${suitability}</span>`;

  qualityTagCache[cacheKey] = tag;
  return tag;
}

// Setup filter buttons
function setupFilterButtons() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      buttons.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      btn.classList.add('active');

      currentFilter = btn.dataset.filter;
      applyFiltersAndSearch();
    });
  });
}

// Handle search input with debouncing
function handleSearch() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
  applyFiltersAndSearch(searchTerm);
}

// Apply both filters and search with optimized logic
function applyFiltersAndSearch(searchTerm = '') {
  const startTime = performance.now();

  // Early exit if search term is empty and filter is 'all'
  if (!searchTerm && currentFilter === 'all') {
    filteredDonations = [...allDonations];
    console.log(`⚡ No filters applied - showing all ${allDonations.length} donations`);
    displayDonations(filteredDonations);
    return;
  }

  const searchLower = searchTerm.toLowerCase().trim();

  // Pre-compile filter function for reuse
  const filterFunc = (donation) => {
    // Filter by type first (faster check)
    if (currentFilter !== 'all' && donation.foodType !== currentFilter) {
      return false;
    }

    // If no search term, we're done
    if (!searchLower) return true;

    // Search across multiple fields with early exit
    const food = donation.food?.toLowerCase() || '';
    if (food.includes(searchLower)) return true;

    const location = donation.location?.toLowerCase() || '';
    if (location.includes(searchLower)) return true;

    const description = donation.description?.toLowerCase() || '';
    if (description.includes(searchLower)) return true;

    const donor = donation.userId?.name?.toLowerCase() || '';
    if (donor.includes(searchLower)) return true;

    return false;
  };

  filteredDonations = allDonations.filter(filterFunc);

  const filterTime = performance.now() - startTime;
  console.log(`⚡ Filtered ${currentFilter !== 'all' ? `by ${currentFilter}` : ''} ${searchLower ? `+ search "${searchLower}"` : ''} → ${filteredDonations.length}/${allDonations.length} donations in ${filterTime.toFixed(2)}ms`);
  displayDonations(filteredDonations);
}

// Cache DOM elements for better performance
const modalCache = {
  modal: null,
  form: null,
  details: null,

  init() {
    this.modal = document.getElementById('claimModal');
    this.form = document.getElementById('claimForm');
    this.details = document.getElementById('claimDetails');
  },

  show() {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    this.modal.style.display = 'flex';
  },

  hide() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.modal.style.display = 'none';
  }
};

// Handle claim food button
async function handleClaimDonation(donationId, foodName) {
  selectedDonation = {
    id: donationId,
    food: foodName
  };

  // Populate donation details in modal - with sanitization
  const sanitizedFood = String(foodName).replace(/</g, '&lt;').replace(/>/g, '&gt;');

  if (modalCache.details) {
    modalCache.details.innerHTML = `
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 15px;">
        🍽️ <strong>${sanitizedFood}</strong>
      </div>
      <p style="font-size: 13px; color: #666; margin-bottom: 20px;">
        Are you sure you want to claim this food? The donor will receive a notification about your request.
      </p>
    `;
  }

  // Show modal
  modalCache.show();

  console.log(`Claim modal opened for donation: ${donationId}`);
}

// Close modal
function closeModal() {
  modalCache.hide();
  selectedDonation = null;
}

// Setup map toggle and initialization
let donationMap = null;
let mapMarkers = [];

function setupMapToggle() {
  const toggleBtn = document.getElementById('mapToggleBtn');
  const mapDiv = document.getElementById('foodDonationsMap');

  if (!toggleBtn || !mapDiv) return;

  toggleBtn.addEventListener('click', () => {
    if (mapDiv.style.display === 'none') {
      mapDiv.style.display = 'block';
      toggleBtn.textContent = '📍 Hide Map';

      // Initialize map if not already done
      if (!donationMap) {
        initializeDonationMap();
      } else {
        // Refresh map bounds if already initialized
        donationMap.invalidateSize();
        updateMapMarkers();
      }
    } else {
      mapDiv.style.display = 'none';
      toggleBtn.textContent = '📍 Show Map';
    }
  });
}

// Initialize Leaflet map with donations
function initializeDonationMap() {
  const mapDiv = document.getElementById('foodDonationsMap');
  if (!mapDiv || donationMap) return;

  // Get default center (user location or default coordinates)
  const centerLat = userCoordinates?.latitude || 28.6139; // Default: Delhi
  const centerLng = userCoordinates?.longitude || 77.2090;

  // Create map
  donationMap = L.map('foodDonationsMap').setView([centerLat, centerLng], 12);

  // Add tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(donationMap);

  // Add user location marker
  if (userCoordinates) {
    L.circleMarker([centerLat, centerLng], {
      radius: 8,
      fillColor: '#007bff',
      color: '#0056b3',
      weight: 3,
      opacity: 0.8,
      fillOpacity: 0.8,
      title: 'Your Location'
    }).addTo(donationMap).bindPopup('📍 Your Location');
  }

  // Add donation markers
  updateMapMarkers();
}

// Update map markers based on filtered donations
function updateMapMarkers() {
  if (!donationMap) return;

  // Remove existing donation markers
  mapMarkers.forEach(marker => {
    donationMap.removeLayer(marker);
  });
  mapMarkers = [];

  // Add markers for each donation
  filteredDonations.forEach(donation => {
    if (!donation.coordinates || !donation.coordinates.latitude) return;

    const { latitude, longitude } = donation.coordinates;
    const suitability = getQualityTag(donation.aiAnalysis, donation.cookedTime);

    // Color code by category
    let markerColor = '#4CAF50'; // Default: green (human consumption)
    if (suitability.includes('Animal Feed')) {
      markerColor = '#FF9800'; // Orange
    } else if (suitability.includes('Fertilizer')) {
      markerColor = '#2196F3'; // Blue
    }

    const marker = L.circleMarker([latitude, longitude], {
      radius: 10,
      fillColor: markerColor,
      color: '#333',
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.7,
      title: donation.food
    }).addTo(donationMap);

    // Create popup content
    const popupContent = `
      <div style="min-width: 180px; font-size: 12px;">
        <strong>${donation.food}</strong><br>
        ${suitability}<br>
        Qty: ${donation.quantity}<br>
        <small style="color: #666;">${(donation.coordinates.latitude.toFixed(4))}, ${(donation.coordinates.longitude.toFixed(4))}</small>
      </div>
    `;

    marker.bindPopup(popupContent);
    mapMarkers.push(marker);
  });

  // Auto-zoom to fit all markers
  if (mapMarkers.length > 0) {
    const group = new L.featureGroup(mapMarkers);
    donationMap.fitBounds(group.getBounds().pad(0.1));
  }
}

// Override displayDonations to also update map
const originalDisplayDonations = displayDonations;
displayDonations = function (donations) {
  originalDisplayDonations.call(this, donations);

  // Update map markers if map is visible
  const mapDiv = document.getElementById('foodDonationsMap');
  if (mapDiv && mapDiv.style.display !== 'none') {
    updateMapMarkers();
  }
};

// Handle claim form submission
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'claimForm') return;

  e.preventDefault();

  if (!selectedDonation) {
    alert('No donation selected');
    return;
  }

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submitting Request...';

    // Collect form data
    const claimData = {
      purpose: document.getElementById('claimPurpose').value,
      beneficiaries: parseInt(document.getElementById('claimBeneficiaries').value),
      address: document.getElementById('claimAddress').value,
      preferredPickupTime: document.getElementById('claimPickupTime').value || null,
      notes: document.getElementById('claimNotes').value
    };

    const response = await fetch(`http://localhost:5000/api/donations/${selectedDonation.id}/claim`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(claimData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[CLAIM-SUBMIT] Error response:', errorData);
      throw new Error(errorData.message || 'Failed to submit claim request');
    }

    const data = await response.json();

    alert(`✅ Claim Request Submitted!\n\nFood: ${selectedDonation.food}\nBeneficiaries: ${claimData.beneficiaries}\nPurpose: ${claimData.purpose}\n\nThe donor will review your request shortly.`);
    closeModal();

    // Reload donations to update button status (non-blocking)
    try {
      await loadDonations();
    } catch (reloadError) {
      // Don't throw - reload is not critical
    }

  } catch (error) {
    console.error('Error submitting claim request:', error);
    alert(`❌ Error: ${error.message}`);
  } finally {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa fa-check"></i> Submit Claim Request';
    }
  }
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('claimModal');
  if (e.target === modal) {
    closeModal();
  }
});

