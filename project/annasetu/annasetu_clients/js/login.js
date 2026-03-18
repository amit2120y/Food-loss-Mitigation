// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
  console.log('Login page loaded');
  
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
