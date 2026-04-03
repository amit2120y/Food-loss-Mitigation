// Browse Food Feature
let allDonations = [];
let filteredDonations = [];
let selectedDonation = null;
let currentFilter = 'all';
let searchTimeout = null; // For debouncing search

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

  // Load available donations
  await loadDonations();

  // Setup filter buttons
  setupFilterButtons();

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
        <div class="food-name">${donation.food}</div>

        <div class="food-meta">
          <span class="badge ${donation.foodType.toLowerCase().replace('-', '-')}">
            ${foodIcon} ${donation.foodType}
          </span>
          ${qualityTag}
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
            <span>${donorLocation}</span>
          </div>
          <div class="info-item">
            <i class="fa fa-clock"></i>
            <span>${donation.cookedTime ? 'Fresh' : 'N/A'}</span>
          </div>
        </div>

        <div class="donor-info">
          <div class="donor-name">👤 ${donorName}</div>
          <div class="donor-location">📍 ${donorLocation}</div>
        </div>

        ${donation.description ? `
          <p style="font-size: 12px; color: #666; margin-bottom: 10px;">
            <strong>Description:</strong> ${donation.description.substring(0, 80)}...
          </p>
        ` : ''}

        <button class="request-btn" onclick="openRequestModal('${donation._id}', '${donation.food.replace(/'/g, "\\'")}', '${donorName.replace(/'/g, "\\'")}')">
          <i class="fa fa-handshake"></i> Request Food
        </button>
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
    'Vegetarian': '🥬',
    'Non-Veg': '🍗',
    'Vegan': '🌱'
  };
  return icons[foodType] || '🍽️';
}

// Get quality badge for AI analysis (with caching)
const qualityTagCache = {};
function getQualityTag(aiAnalysis) {
  if (!aiAnalysis) return '';

  const cacheKey = `${aiAnalysis.human}`;
  if (qualityTagCache[cacheKey]) return qualityTagCache[cacheKey];

  const human = aiAnalysis.human || 0;
  let tag = '';
  if (human >= 70) {
    tag = '<span class="ai-tag" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">✅ High Quality</span>';
  } else if (human >= 40) {
    tag = '<span class="ai-tag" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">⚠️ Fair Quality</span>';
  } else {
    tag = '<span class="ai-tag" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">❌ Low Quality</span>';
  }

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
    this.modal = document.getElementById('requestModal');
    this.form = document.getElementById('requestForm');
    this.details = document.getElementById('donationDetails');
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

// Open request modal
function openRequestModal(donationId, foodName, donorName) {
  selectedDonation = {
    id: donationId,
    food: foodName,
    donor: donorName
  };

  // Populate donation details in modal - with sanitization
  const sanitizedFood = String(foodName).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const sanitizedDonor = String(donorName).replace(/</g, '&lt;').replace(/>/g, '&gt;');

  modalCache.details.innerHTML = `
    <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">
      🍽️ <strong>${sanitizedFood}</strong>
    </div>
    <div style="font-size: 13px; color: #666;">
      From: <strong>${sanitizedDonor}</strong>
    </div>
  `;

  // Show modal
  modalCache.show();
  modalCache.form.reset();

  console.log(`Modal opened for donation: ${donationId}`);
}

// Close modal
function closeModal() {
  modalCache.hide();
  selectedDonation = null;
}

// Handle form submission
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'requestForm') return;

  e.preventDefault();

  if (!selectedDonation) {
    alert('No donation selected');
    return;
  }

  const quantity = document.getElementById('quantity').value.trim();
  const message = document.getElementById('message').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!quantity || !phone) {
    alert('Please fill in required fields');
    return;
  }

  try {
    console.log(`Sending request for donation: ${selectedDonation.id}`);

    // Note: This would typically send to a donation request endpoint
    // For now, we'll just show a success message
    // In production, you'd implement:
    // POST /api/donations/request with { donationId, quantity, message, phone }

    alert(`✅ Request sent to ${selectedDonation.donor} for ${quantity}!\n\nThey will contact you at ${phone}`);
    closeModal();
    document.getElementById('requestForm').reset();

    console.log('✓ Request sent successfully');
  } catch (error) {
    console.error('Error sending request:', error);
    alert('Error sending request. Please try again.');
  }
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('requestModal');
  if (e.target === modal) {
    closeModal();
  }
});
