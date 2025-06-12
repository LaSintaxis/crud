const token = localStorage.getItem('token');
const API_URL = 'http://localhost:3000/api/categories';

const tbody = document.getElementById('category-table-body');
const form = document.getElementById('category-form');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    name: nameInput.value,
    description: descriptionInput.value
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Error al crear la categoría');

    nameInput.value = '';
    descriptionInput.value = '';
    loadCategories();
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

async function loadCategories() {
  tbody.innerHTML = '';

  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'x-access-token': token
      }
    });

    const result = await res.json();
    const categories = result.categories || result.data || result;

    categories.forEach(cat => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cat.name}</td>
        <td>${cat.description}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editCategory('${cat._id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCategory('${cat._id}')">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

async function deleteCategory(id) {
  if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'x-access-token': token
      }
    });

    if (!res.ok) throw new Error('No se pudo eliminar la categoría');
    loadCategories();
  } catch (err) {
    alert('Error al eliminar categoría: ' + err.message);
  }
}

// Para más adelante:
function editCategory(id) {
  alert(`Función para editar categoría con ID: ${id} (por implementar)`);
}

loadCategories();
