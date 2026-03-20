// Check for token in URL (from Google OAuth redirect)
function checkForGoogleToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userId = urlParams.get('userId');
  const userName = urlParams.get('userName');
  const userEmail = urlParams.get('userEmail');

  console.log('=== Checking for Google Token ===');
  console.log('Token:', token ? '✓ Found' : '✗ Not found');
  console.log('URL Params:', { token: !!token, userId, userName, userEmail });

  if (token && userId && userName && userEmail) {
    console.log('✓ All credentials found, storing and redirecting...');
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({
      id: userId,
      name: decodeURIComponent(userName),
      email: decodeURIComponent(userEmail)
    }));
    
    // Clear the URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Redirect to dashboard
    console.log('Redirecting to dashboard...');
    window.location.href = 'dashboard.html';
    return true;
  }
  console.log('=== No valid token found ===');
  return false;
}

// Google OAuth callback handler
function handleCredentialResponse(response) {
  console.log("Google Sign-In successful");
  const token = response.credential;
  
  // Redirect to the Google auth callback
  window.location.href = `http://localhost:5000/api/auth/google/callback?token=${token}`;
}

// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
  console.log('Login page loaded');
  
  // Check for Google token on page load FIRST
  if (checkForGoogleToken()) {
    return; // Exit if token was found and we're redirecting
  }
  
  const loginForm = document.querySelector('form');
  console.log('Form found:', !!loginForm);
  
  if (loginForm) {
    console.log('Attaching submit event listener');
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Form submitted');

      // Get form values
      const email = document.querySelector('input[name="email"]').value;
      const password = document.querySelector('input[name="password"]').value;

      console.log('Form values:', { email, password });

      // Validation
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }

      try {
        console.log('Sending fetch request to: http://localhost:5000/api/auth/login');
        
        // Send login request
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password
          })
        });

        console.log('Response received - Status:', response.status, 'OK:', response.ok);

        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
          // Store token in localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Migrate old global donations to user-specific key if they exist
          const oldDonations = localStorage.getItem('donations');
          if (oldDonations) {
            const userDonationsKey = `donations_${data.user.id}`;
            localStorage.setItem(userDonationsKey, oldDonations);
            localStorage.removeItem('donations');
          }

          alert('Login successful! Redirecting to dashboard...');
          window.location.href = 'dashboard.html';
        } else {
          alert(data.message || 'Login failed, please try again');
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        alert('Error: ' + error.message);
      }
    });
  } else {
    console.error('Form not found on page');
  }
});

