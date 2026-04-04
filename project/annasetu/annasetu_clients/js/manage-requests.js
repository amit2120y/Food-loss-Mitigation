// Manage Requests Page
let allRequests = [];
let filteredRequests = [];
let currentFilter = 'all';
let currentPage = 1;
const itemsPerPage = 12;

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user) {
        alert('Please log in first');
        window.location.href = 'login.html';
        return;
    }

    // Load all requests
    await loadAllRequests();

    // Setup search functionality
    const searchInput = document.getElementById('searchRequests');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            handleSearch();
        }, 300);
    });
});

// Load all requests for donor's donations
async function loadAllRequests() {
    try {
        const token = localStorage.getItem('token');
        const loadingEl = document.getElementById('loadingState');
        const emptyEl = document.getElementById('emptyState');
        const containerEl = document.getElementById('requestsContainer');

        loadingEl.classList.remove('hidden');
        emptyEl.classList.add('hidden');
        containerEl.innerHTML = '';

        // Fetch user's donations
        const res = await fetch('http://localhost:5000/api/donations/my-donations', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch donations: ${res.status}`);
        }

        const body = await res.json();
        const donations = body.donations || [];

        // Collect all claims from all donations
        allRequests = [];
        donations.forEach((donation) => {
            if (donation.claims && donation.claims.length > 0) {
                donation.claims.forEach((claim) => {

                    const requestObj = {
                        ...claim,
                        donationId: donation._id,
                        food: donation.food,
                        foodType: donation.foodType,
                        quantity: donation.quantity,
                        location: donation.location,
                        cookedTime: donation.cookedTime
                    };

                    allRequests.push(requestObj);
                });
            }
        });

        // Apply initial filter
        filterRequests('all');

        // Update statistics
        updateStatistics();

        loadingEl.classList.add('hidden');

        if (allRequests.length === 0) {
            emptyEl.classList.remove('hidden');
        }

    } catch (error) {
        console.error('Error loading requests:', error);
        const loadingEl = document.getElementById('loadingState');
        loadingEl.classList.add('hidden');
        document.getElementById('requestsContainer').innerHTML = `
      <div style="text-align: center; padding: 40px; color: #f44336;">
        <p>Error loading requests: ${error.message}</p>
      </div>
    `;
    }
}

// Filter requests by status
function filterRequests(status) {
    currentFilter = status;

    // Update active button - handle both click events and programmatic calls
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Only update active class if event.target exists
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Programmatic call - find and activate the correct button
        buttons.forEach(btn => {
            const btnStatus = btn.textContent.toLowerCase();
            if ((status === 'all' && btnStatus.includes('all')) ||
                (status === 'pending' && btnStatus.includes('pending')) ||
                (status === 'accepted' && btnStatus.includes('accepted')) ||
                (status === 'rejected' && btnStatus.includes('rejected'))) {
                btn.classList.add('active');
            }
        });
    }

    if (status === 'all') {
        filteredRequests = [...allRequests];
    } else {
        filteredRequests = allRequests.filter(r => r.status === status);
    }

    displayRequests();
}

// Search requests
function handleSearch() {
    const searchTerm = document.getElementById('searchRequests').value.toLowerCase();

    if (!searchTerm) {
        filterRequests(currentFilter);
        return;
    }

    const baseRequests = currentFilter === 'all' ? allRequests : allRequests.filter(r => r.status === currentFilter);

    filteredRequests = baseRequests.filter(req =>
        req.food.toLowerCase().includes(searchTerm) ||
        req.userName.toLowerCase().includes(searchTerm) ||
        req.address.toLowerCase().includes(searchTerm) ||
        req.purpose.toLowerCase().includes(searchTerm)
    );

    displayRequests();
}

// Display requests in grid
function displayRequests() {
    const container = document.getElementById('requestsContainer');
    container.innerHTML = '';

    if (filteredRequests.length === 0) {
        const emptyMsg = currentFilter === 'all'
            ? 'No requests available. When someone claims your food, their request will appear here.'
            : `No ${currentFilter} requests found.`;
        container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;">
        <p>${emptyMsg}</p>
      </div>
    `;
        return;
    }

    filteredRequests.forEach((request) => {
        const card = createRequestCard(request);
        container.appendChild(card);
    });
}

// Create request card element
function createRequestCard(request) {
    const div = document.createElement('div');

    const statusColor = {
        'pending': '#ff9800',
        'accepted': '#4caf50',
        'rejected': '#f44336'
    }[request.status];

    const statusText = {
        'pending': 'PENDING',
        'accepted': 'ACCEPTED',
        'rejected': 'REJECTED'
    }[request.status];

    const cookedDate = request.cookedTime
        ? new Date(request.cookedTime).toLocaleDateString()
        : 'Unknown Date';

    let actionButtons = '';
    if (request.status === 'pending') {
        actionButtons = `
      <button class="btn-action btn-accept" onclick="handleRequestAction('${request.donationId}', '${request.userId}', 'accept')" title="Accept this claim">
        Accept
      </button>
      <button class="btn-action btn-reject" onclick="handleRequestAction('${request.donationId}', '${request.userId}', 'reject')" title="Reject this claim">
        Reject
      </button>
    `;
    } else {
        actionButtons = `
      <button class="btn-action btn-details" onclick="viewRequestDetails('${encodeURIComponent(JSON.stringify(request))}')">View Details</button>
    `;
    }

    div.innerHTML = `
    <div class="request-card">
      <div class="request-header">
        <div class="food-info">
          <h3>${request.food || 'N/A'}</h3>
          <span class="food-type-badge">${request.foodType || 'N/A'}</span>
        </div>
        <span class="status-badge ${request.status}">
          ${statusText}
        </span>
      </div>

      <div class="claimant-info">
        <p class="claimant-name"><strong>${request.userName || 'Unknown'}</strong></p>
        <p class="claimant-email">${request.userEmail || 'N/A'}</p>
        ${request.userPhone ? `<p>${request.userPhone}</p>` : ''}
      </div>

      <div class="request-details">
        <div class="detail-row">
          <span class="detail-label">Purpose:</span>
          <span class="detail-value">${request.purpose || 'Not provided'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Beneficiaries:</span>
          <span class="detail-value">${request.beneficiaries || 'Not specified'} ${request.beneficiaries ? 'people' : ''}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Delivery Address:</span>
          <span class="detail-value" title="${request.address || 'N/A'}">${(request.address || 'N/A').substring(0, 30)}${(request.address || 'N/A').length > 30 ? '...' : ''}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cooked:</span>
          <span class="detail-value">${cookedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Requested:</span>
          <span class="detail-value">${request.claimedAt ? new Date(request.claimedAt).toLocaleString() : 'N/A'}</span>
        </div>
      </div>

      <div class="card-actions">
        ${actionButtons}
      </div>
    </div>
  `;

    return div;
}

// Update statistics cards
function updateStatistics() {
    const totalRequests = allRequests.length;
    const pendingRequests = allRequests.filter(r => r.status === 'pending').length;
    const acceptedRequests = allRequests.filter(r => r.status === 'accepted').length;
    const rejectedRequests = allRequests.filter(r => r.status === 'rejected').length;

    document.getElementById('totalRequests').textContent = totalRequests;
    document.getElementById('pendingRequests').textContent = pendingRequests;
    document.getElementById('acceptedRequests').textContent = acceptedRequests;
    document.getElementById('rejectedRequests').textContent = rejectedRequests;
}

// Handle accept/reject actions
async function handleRequestAction(donationId, claimUserId, action) {
    try {
        const token = localStorage.getItem('token');
        const endpoint = action === 'accept'
            ? `http://localhost:5000/api/donations/${donationId}/claims/${claimUserId}/accept`
            : `http://localhost:5000/api/donations/${donationId}/claims/${claimUserId}/reject`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to ${action} claim`);
        }

        alert(`✅ Claim ${action}ed successfully!`);
        await loadAllRequests();

    } catch (error) {
        console.error(`[ERROR] ${action}ing claim:`, error);
        alert(`❌ Error: ${error.message}`);
    }
}

// View request details in modal
function viewRequestDetails(encodedRequest) {
    try {
        const request = JSON.parse(decodeURIComponent(encodedRequest));
        const modal = document.getElementById('requestDetailsModal');
        const content = document.getElementById('requestDetailsContent');
        const actionButtons = document.getElementById('actionButtons');

        const cookedDate = request.cookedTime
            ? new Date(request.cookedTime).toLocaleString()
            : 'Unknown Date';

        const claimedDate = new Date(request.claimedAt).toLocaleString();

        content.innerHTML = `
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #333;">Donation Details</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px;">
          <div>
            <strong>Food Item:</strong>
            <p style="margin: 5px 0 0 0; color: #666;">${request.food}</p>
          </div>
          <div>
            <strong>Type:</strong>
            <p style="margin: 5px 0 0 0; color: #666;">${request.foodType}</p>
          </div>
          <div>
            <strong>Quantity:</strong>
            <p style="margin: 5px 0 0 0; color: #666;">${request.quantity}</p>
          </div>
          <div>
            <strong>Location:</strong>
            <p style="margin: 5px 0 0 0; color: #666;">${request.location}</p>
          </div>
          <div>
            <strong>Cooked Date:</strong>
            <p style="margin: 5px 0 0 0; color: #666;">${cookedDate}</p>
          </div>
        </div>
      </div>

      <div style="background: #fff8f0; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ff9800;">
        <h3 style="margin: 0 0 15px 0; color: #333;">Claimant Information</h3>
        <div style="font-size: 13px;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${request.userName}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${request.userEmail}</p>
          ${request.userPhone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${request.userPhone}</p>` : ''}
        </div>
      </div>

      <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
        <h3 style="margin: 0 0 15px 0; color: #333;">Claim Details</h3>
        <div style="font-size: 13px;">
          <p style="margin: 8px 0;"><strong>Purpose:</strong> ${request.purpose}</p>
          <p style="margin: 8px 0;"><strong>Beneficiaries:</strong> ${request.beneficiaries} people</p>
          <p style="margin: 8px 0;"><strong>Delivery Address:</strong> ${request.address}</p>
          ${request.preferredPickupTime ? `<p style="margin: 8px 0;"><strong>Preferred Time:</strong> ${new Date(request.preferredPickupTime).toLocaleString()}</p>` : ''}
          ${request.notes ? `<p style="margin: 8px 0;"><strong>Special Notes:</strong><br>${request.notes}</p>` : ''}
          <p style="margin: 8px 0;"><strong>Claimed At:</strong> ${claimedDate}</p>
          <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: ${request.status === 'pending' ? '#ff9800' : request.status === 'accepted' ? '#4caf50' : '#f44336'}; font-weight: 600;">${request.status.toUpperCase()}</span></p>
        </div>
      </div>
    `;

        // Set action buttons based on status
        if (request.status === 'pending') {
            actionButtons.innerHTML = `
        <button class="modal-accept" onclick="handleRequestAction('${request.donationId}', '${request.userId}', 'accept')">
          Accept Request
        </button>
        <button class="modal-reject" onclick="handleRequestAction('${request.donationId}', '${request.userId}', 'reject')">
          Reject Request
        </button>
        <button class="modal-close" onclick="closeRequestModal()">
          Close
        </button>
      `;
        } else {
            actionButtons.innerHTML = `
        <button class="modal-close" style="flex: 1;" onclick="closeRequestModal()">
          Close
        </button>
      `;
        }

        modal.classList.remove('hidden');

    } catch (error) {
        console.error('[ERROR] Error parsing request:', error);
        alert('Error loading request details');
    }
}

// Close request details modal
function closeRequestModal() {
    const modal = document.getElementById('requestDetailsModal');
    modal.classList.add('hidden');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('requestDetailsModal');
    if (e.target === modal) {
        closeRequestModal();
    }
});
