/**Logica del login, registro y gestion del token*/
// frontend/js/auth.js
const apiUrl = 'http://localhost:3000/api/auth/signin';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
      // Guardar token y rol en localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('userId', result.user._id);
      localStorage.setItem('userRole', result.user.role);

      Swal.fire({
        icon: 'success',
        title: 'Bienvenido',
        text: `Hola, ${result.user.username}`,
        timer: 2000,
        showConfirmButton: false
      });

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message || 'Credenciales inválidas'
      });
    }

  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo conectar con el servidor'
    });
  }
});
