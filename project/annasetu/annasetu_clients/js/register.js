// Check for token in URL (from Google OAuth redirect)
function checkForGoogleToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userId = urlParams.get('userId');
  const userName = urlParams.get('userName');
  const userEmail = urlParams.get('userEmail');

  console.log('=== Checking for Google Token (Register Page) ===');
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

// Register Form Handler
document.addEventListener('DOMContentLoaded', () => {
  console.log('Register page loaded');
  
  // Check for Google token on page load FIRST
  if (checkForGoogleToken()) {
    return; // Exit if token was found and we're redirecting
  }
  
  const registerForm = document.querySelector('form');
  console.log('Form found:', !!registerForm);
  
  if (registerForm) {
    console.log('Attaching submit event listener');
    
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Form submitted');

      // Get form values
      const name = document.querySelector('input[name="fullname"]').value;
      const email = document.querySelector('input[name="email"]').value;
      const phone = document.querySelector('input[name="phone"]').value;
      const password = document.querySelector('input[name="password"]').value;
      const confirmPassword = document.querySelector('input[name="confirm_password"]').value;

      console.log('Form values:', { name, email, phone, password, confirmPassword });

      // Validation
      if (!name || !email || !phone || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      try {
        console.log('Sending fetch request to: http://localhost:5000/api/auth/register');
        
        // Send registration request
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            password
          })
        });

        console.log('Response received - Status:', response.status, 'OK:', response.ok);

        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
          alert('Registration successful! Please login with your credentials.');
          window.location.href = 'login.html';
        } else {
          alert(data.message || 'Registration failed, please try again');
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
