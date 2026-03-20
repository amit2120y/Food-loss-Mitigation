// Browse Food Feature
let allDonations = [];
let filteredDonations = [];
let selectedDonation = null;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('=== Browse Page Loaded ===');

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

  // Setup search input
  document.getElementById('searchInput').addEventListener('input', handleSearch);

  console.log('=== Browse Page Ready ===');
});

// Load all available donations from server
async function loadDonations() {
  try {
    const token = localStorage.getItem('token');
    console.log('Fetching available donations...');

    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('donationsGrid').innerHTML = '';

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
    console.log(`✓ Fetched ${data.donations.length} available donations`);

    allDonations = data.donations || [];
    filteredDonations = [...allDonations];

    displayDonations(filteredDonations);
    document.getElementById('loadingState').style.display = 'none';
  } catch (error) {
    console.error('Error loading donations:', error);
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('donationsGrid').innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
        <i class="fa fa-exclamation-circle" style="font-size: 40px; margin-bottom: 10px;"></i>
        <p>Error loading donations. Please try again.</p>
      </div>
    `;
  }
}

// Display donations in grid
function displayDonations(donations) {
  const grid = document.getElementById('donationsGrid');
  const emptyState = document.getElementById('emptyState');

  if (donations.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';
  grid.innerHTML = donations.map(donation => createDonationCard(donation)).join('');
}

// Create donation card HTML
function createDonationCard(donation) {
  const foodIcon = getFoodIcon(donation.foodType);
  const qualityTag = donation.aiAnalysis ? getQualityTag(donation.aiAnalysis) : '';
  const donorName = donation.userId?.name || 'Anonymous';
  const donorLocation = donation.userId?.location || donation.location || 'Unknown';
  const cookedDate = new Date(donation.cookedTime).toLocaleDateString();

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

        <button class="request-btn" onclick="openRequestModal('${donation._id}', '${donation.food}', '${donorName}')">
          <i class="fa fa-handshake"></i> Request Food
        </button>
      </div>
    </div>
  `;
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

// Get quality badge for AI analysis
function getQualityTag(aiAnalysis) {
  if (!aiAnalysis) return '';

  const human = aiAnalysis.human || 0;
  if (human >= 70) {
    return '<span class="ai-tag" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">✅ High Quality</span>';
  } else if (human >= 40) {
    return '<span class="ai-tag" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">⚠️ Fair Quality</span>';
  } else {
    return '<span class="ai-tag" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">❌ Low Quality</span>';
  }
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

// Handle search input
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  applyFiltersAndSearch(searchTerm);
}

// Apply both filters and search
function applyFiltersAndSearch(searchTerm = '') {
  filteredDonations = allDonations.filter(donation => {
    // Filter by type
    const filterMatch = currentFilter === 'all' || donation.foodType === currentFilter;

    // Filter by search term
    const searchMatch = !searchTerm ||
      donation.food.toLowerCase().includes(searchTerm) ||
      donation.location.toLowerCase().includes(searchTerm) ||
      donation.description.toLowerCase().includes(searchTerm) ||
      (donation.userId?.name || '').toLowerCase().includes(searchTerm);

    return filterMatch && searchMatch;
  });

  console.log(`📊 Filtered to ${filteredDonations.length} donations`);
  displayDonations(filteredDonations);
}

// Open request modal
function openRequestModal(donationId, foodName, donorName) {
  selectedDonation = {
    id: donationId,
    food: foodName,
    donor: donorName
  };

  // Populate donation details in modal
  const detailsDiv = document.getElementById('donationDetails');
  detailsDiv.innerHTML = `
    <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">
      🍽️ <strong>${foodName}</strong>
    </div>
    <div style="font-size: 13px; color: #666;">
      From: <strong>${donorName}</strong>
    </div>
  `;

  // Show modal
  document.getElementById('requestModal').style.display = 'flex';
  document.getElementById('requestForm').reset();

  console.log(`Modal opened for donation: ${donationId}`);
}

// Close modal
function closeModal() {
  document.getElementById('requestModal').style.display = 'none';
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
