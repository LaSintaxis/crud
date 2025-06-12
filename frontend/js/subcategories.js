const token = localStorage.getItem('token');
const API_URL = 'http://localhost:3000/api/subcategories';

const tbody = document.getElementById('subcategory-table-body');
const form = document.getElementById('subcategory-form');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const categoryInput = document.getElementById('category');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    name: nameInput.value,
    description: descriptionInput.value,
    category: categoryInput.value
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

    if (!res.ok) throw new Error('Error al crear subcategoría');

    form.reset();
    loadSubcategories();
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

async function loadSubcategories() {
  tbody.innerHTML = '';

  try {
    const res = await fetch(API_URL, {
      headers: {
        'x-access-token': token
      }
    });

    const result = await res.json();
    const subcategories = result.subcategories || result.data || result;

    if (!Array.isArray(subcategories)) throw new Error('La respuesta no es una lista');

    subcategories.forEach(sub => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${sub.name}</td>
        <td>${sub.description}</td>
        <td>${sub.category?.name || 'Sin categoria'}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editSubcategory('${sub._id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteSubcategory('${sub._id}')">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Error al cargar subcategorías:', error);
    alert('No se pudieron cargar las subcategorías');
  }
}

async function deleteSubcategory(id) {
  if (!confirm('¿Eliminar esta subcategoría?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'x-access-token': token
      }
    });

    if (!res.ok) throw new Error('No se pudo eliminar');
    loadSubcategories();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function editSubcategory(id) {
  alert('Función de edición aún no implementada. ID: ' + id);
}

loadSubcategories();
