const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signInBtn = document.getElementById('signInButton');
const signUpNameInput = document.getElementById('name');
const signUpEmailInput = document.getElementById('signUpEmail');
const signUpPasswordInput = document.getElementById('signUpPassword');
const signUpBtn = document.getElementById('signUpButton');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

signInBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const response = await fetch('/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token); // Store JWT token
        window.location.href = '/dashboard';
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
});

signUpBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const name = signUpNameInput.value;
    const email = signUpEmailInput.value;
    const password = signUpPasswordInput.value;

    try {
      const response = await fetch('/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token); // Store user ID in local storage
        window.location.href = '/dashboard';
      } else {
        alert('Signup failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
});