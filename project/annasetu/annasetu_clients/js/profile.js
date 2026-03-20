// Profile Page JavaScript
let currentUser = null;
let isEditingProfile = false;
let isPageInitialized = false;
let initStartTime = 0;

// Initialize on page load with better error handling
document.addEventListener('DOMContentLoaded', async () => {
  if (isPageInitialized) {
    console.warn('⚠️ Page already initialized, skipping...');
    return;
  }

  initStartTime = Date.now();
  console.log('=== Profile Page Loading ===');

  // Add a small delay to ensure DOM is fully painted
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    // Check authentication
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
      console.warn('⚠️ Not authenticated, redirecting to login...');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 500);
      return;
    }

    console.log(`✓ User authenticated: ${user.name}`);
    currentUser = user;

    // Load user profile data
    await loadProfileData();

    // Setup event listeners
    setupEventListeners();

    // Mark page as initialized
    isPageInitialized = true;
    const loadTime = Date.now() - initStartTime;
    console.log(`✓ Profile Page Ready (loaded in ${loadTime}ms)`);
  } catch (error) {
    console.error('❌ Error initializing profile page:', error);
    isPageInitialized = false;
  }
});

// Handle page visibility changes (user returns to tab)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Profile page hidden');
    return;
  }
  
  console.log('Profile page visible again');
  // Verify user is still authenticated
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    console.warn('⚠️ Session expired, redirecting to login...');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
    return;
  }
  
  // Refresh profile data if needed
  if (currentUser && isPageInitialized) {
    console.log('Refreshing profile data...');
    const updatedUser = JSON.parse(user);
    currentUser = updatedUser;
    displayProfileData(currentUser);
  }
});

// Load user profile data from server
async function loadProfileData() {
  try {
    const token = localStorage.getItem('token');
    
    if (!currentUser) {
      console.warn('No current user data available');
      return;
    }

    // For now, use data from localStorage
    displayProfileData(currentUser);

    console.log('✓ Profile data loaded successfully');

    // In future, you can fetch from backend:
    // const response = await fetch('http://localhost:5000/api/users/profile', {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // const data = await response.json();
    // displayProfileData(data.user);

  } catch (error) {
    console.error('Error loading profile data:', error);
    // Display placeholders instead of failing
    if (currentUser) {
      displayProfileData(currentUser);
    }
  }
}

// Display profile data on page
function displayProfileData(user) {
  if (!user) {
    console.error('No user data to display');
    return;
  }

  try {
    // Update header
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const joinDateEl = document.getElementById('joinDate');
    
    if (userNameEl) userNameEl.textContent = user.name || 'User';
    if (userEmailEl) userEmailEl.textContent = user.email || 'email@example.com';

    // Calculate join date
    const joinDate = new Date(user.createdAt || new Date());
    const monthsDiff = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24 * 30));
    if (joinDateEl) {
      if (monthsDiff === 0) {
        joinDateEl.textContent = 'Joined recently';
      } else if (monthsDiff === 1) {
        joinDateEl.textContent = 'Joined 1 month ago';
      } else {
        joinDateEl.textContent = `Joined ${monthsDiff} months ago`;
      }
    }

    // Update profile picture
    const profileImg = document.getElementById('profileImage');
    if (profileImg && user.googleProfilePicture) {
      profileImg.src = user.googleProfilePicture;
    }

    // Update stats
    const donationsMadeEl = document.getElementById('donationsMade');
    const donationsReceivedEl = document.getElementById('donationsReceived');
    
    if (donationsMadeEl) donationsMadeEl.textContent = user.donationsMade || 0;
    if (donationsReceivedEl) donationsReceivedEl.textContent = user.donationsReceived || 0;

    // Update personal info display
    const displayNameEl = document.getElementById('displayName');
    const displayEmailEl = document.getElementById('displayEmail');
    const displayPhoneEl = document.getElementById('displayPhone');
    const displayLocationEl = document.getElementById('displayLocation');
    
    if (displayNameEl) displayNameEl.textContent = user.name || '-';
    if (displayEmailEl) displayEmailEl.textContent = user.email || '-';
    if (displayPhoneEl) displayPhoneEl.textContent = user.phone || 'Not provided';
    if (displayLocationEl) displayLocationEl.textContent = user.location || 'Not provided';

    // Populate edit form
    const editNameEl = document.getElementById('editName');
    const editPhoneEl = document.getElementById('editPhone');
    const editLocationEl = document.getElementById('editLocation');
    
    if (editNameEl) editNameEl.value = user.name || '';
    if (editPhoneEl) editPhoneEl.value = user.phone || '';
    if (editLocationEl) editLocationEl.value = user.location || '';

    console.log('✓ Profile data displayed successfully');
  } catch (error) {
    console.error('Error displaying profile data:', error);
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Edit profile button
  const editBtn = document.getElementById('editInfoBtn');
  if (editBtn) editBtn.addEventListener('click', toggleEditMode);

  // Cancel edit button
  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', toggleEditMode);

  // Save profile form
  const editForm = document.getElementById('editProfileForm');
  if (editForm) editForm.addEventListener('submit', saveProfileChanges);

  // Change password button
  const changePwBtn = document.getElementById('changePasswordBtn');
  if (changePwBtn) changePwBtn.addEventListener('click', openPasswordModal);

  // Password modal close
  const closePwModal = document.getElementById('closePasswordModal');
  if (closePwModal) closePwModal.addEventListener('click', closePasswordModal);
  
  const cancelPwBtn = document.getElementById('cancelPasswordBtn');
  if (cancelPwBtn) cancelPwBtn.addEventListener('click', closePasswordModal);

  // Password form submit
  const pwForm = document.getElementById('passwordForm');
  if (pwForm) pwForm.addEventListener('submit', changePassword);

  // Other buttons
  const twoFABtn = document.getElementById('enableTwoFABtn');
  if (twoFABtn) twoFABtn.addEventListener('click', enableTwoFA);
  
  const deleteBtn = document.getElementById('deleteAccountBtn');
  if (deleteBtn) deleteBtn.addEventListener('click', deleteAccount);

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('passwordModal');
    if (modal && e.target === modal) {
      closePasswordModal();
    }
  });
}

// Toggle edit mode
function toggleEditMode() {
  isEditingProfile = !isEditingProfile;
  const viewMode = document.getElementById('viewMode');
  const editMode = document.getElementById('editMode');

  if (isEditingProfile) {
    viewMode.style.display = 'none';
    editMode.style.display = 'block';
  } else {
    viewMode.style.display = 'block';
    editMode.style.display = 'none';
  }
}

// Save profile changes
async function saveProfileChanges(e) {
  e.preventDefault();

  try {
    const name = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const location = document.getElementById('editLocation').value.trim();

    if (!name) {
      alert('Name is required');
      return;
    }

    // Update localStorage
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.location = location;
    localStorage.setItem('user', JSON.stringify(currentUser));

    // In future, send to backend:
    // const response = await fetch('http://localhost:5000/api/users/profile', {
    //   method: 'PUT',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ name, phone, location })
    // });

    console.log('✓ Profile updated');
    displayProfileData(currentUser);
    toggleEditMode();
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Error saving profile changes');
  }
}

// Password modal functions
function openPasswordModal() {
  document.getElementById('passwordModal').style.display = 'flex';
}

function closePasswordModal() {
  document.getElementById('passwordModal').style.display = 'none';
  document.getElementById('passwordForm').reset();
}

// Change password
async function changePassword(e) {
  e.preventDefault();

  try {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // In future, send to backend:
    // const response = await fetch('http://localhost:5000/api/users/change-password', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ currentPassword, newPassword })
    // });

    console.log('✓ Password would be changed (feature pending)');
    alert('⚠️ Password change feature coming soon!\nFor now, contact support to change your password.');
    closePasswordModal();
  } catch (error) {
    console.error('Error changing password:', error);
    alert('Error changing password');
  }
}

// Enable two-factor authentication
function enableTwoFA() {
  alert('⚠️ Two-Factor Authentication feature coming soon!\nWe\'re working on adding this security feature.');
}

// Delete account
function deleteAccount() {
  const confirm = window.confirm(
    '⚠️ WARNING: This will permanently delete your account and all associated data.\n\n' +
    'Are you sure you want to continue?\n\n' +
    'Type "DELETE" in the next prompt to confirm.'
  );

  if (!confirm) return;

  const confirmation = window.prompt('Type "DELETE" to confirm account deletion:');
  if (confirmation !== 'DELETE') {
    alert('Account deletion cancelled.');
    return;
  }

  // In future, send to backend
  alert('⚠️ Account deletion feature coming soon!\nPlease contact support to delete your account.');
  console.log('Account deletion requested');
}

// Logout
function logout() {
  const confirm = window.confirm('Are you sure you want to logout?');
  if (!confirm) return;

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('User logged out');
  window.location.href = 'login.html';
}
