// frontend/js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('welcomeMsg').textContent = `Bienvenido, rol: ${role}`;

    const options = [
        { name: 'Usuarios', href: 'users.html', roles: ['admin', 'coordinador'] },
        { name: 'Categorías', href: 'categories.html', roles: ['admin', 'coordinador', 'auxiliar'] },
        { name: 'Subcategorías', href: 'subcategories.html', roles: ['admin', 'coordinador', 'auxiliar'] },
        { name: 'Productos', href: 'products.html', roles: ['admin', 'coordinador', 'auxiliar'] }
    ];

    const container = document.getElementById('menuOptions');

    options.forEach(option => {
        if (option.roles.includes(role)) {
            const col = document.createElement('div');
            col.className = 'col-md-3';

            const card = `
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h5 class="card-title">${option.name}</h5>
            <a href="${option.href}" class="btn btn-primary">Ir</a>
          </div>
        </div>
      `;
            col.innerHTML = card;
            container.appendChild(col);
        }
    });
});

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
