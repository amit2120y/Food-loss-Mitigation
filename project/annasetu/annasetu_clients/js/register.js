// Register Form Handler
document.addEventListener('DOMContentLoaded', () => {
  console.log('Register page loaded');
  
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
          alert('Registration successful! Redirecting to login...');
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
