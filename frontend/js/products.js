const apiUrl = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const headers = {
  'Content-Type': 'application/json',
  'x-access-token': token
};

const productTableBody = document.getElementById('productTableBody');
const productForm = document.getElementById('productForm');
const productIdField = document.getElementById('productId');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const priceInput = document.getElementById('price');
const stockInput = document.getElementById('stock');
const categorySelect = document.getElementById('categorySelect');
const subcategorySelect = document.getElementById('subcategorySelect');

// Cargar categorías
async function loadCategories() {
  const res = await fetch(`${apiUrl}/categories`, { headers });
  const categories = await res.json();
  categorySelect.innerHTML = categories.map(cat =>
    `<option value="${cat._id}">${cat.name}</option>`
  ).join('');
}

// Cargar subcategorías
async function loadSubcategories() {
  const res = await fetch(`${apiUrl}/subcategories`, { headers });
  const subcategories = await res.json();
  subcategorySelect.innerHTML = subcategories.map(sub =>
    `<option value="${sub._id}">${sub.name} (${sub.category.name})</option>`
  ).join('');
}

// Cargar productos
async function loadProducts() {
  const res = await fetch(`${apiUrl}/products`, { headers });
  const products = await res.json();

  productTableBody.innerHTML = '';

  products.forEach(product => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product.name}</td>
      <td>${product.description}</td>
      <td>$${product.price}</td>
      <td>${product.stock}</td>
      <td>${product.category?.name || 'Sin categoría'}</td>
      <td>${product.subcategory?.name || 'Sin subcategoría'}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="editProduct('${product._id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')">Eliminar</button>
      </td>
    `;
    productTableBody.appendChild(tr);
  });
}

// Crear o actualizar producto
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const product = {
    name: nameInput.value,
    description: descriptionInput.value,
    price: parseFloat(priceInput.value),
    stock: parseInt(stockInput.value),
    category: categorySelect.value,
    subcategory: subcategorySelect.value
  };

  const id = productIdField.value;

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${apiUrl}/products/${id}` : `${apiUrl}/products`;

  const res = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(product)
  });

  if (res.ok) {
    productForm.reset();
    productIdField.value = '';
    await loadProducts();
  } else {
    const error = await res.json();
    alert('Error: ' + (error.message || 'No se pudo guardar el producto'));
  }
});

// Editar producto
async function editProduct(id) {
  const res = await fetch(`${apiUrl}/products/${id}`, { headers });
  const product = await res.json();

  productIdField.value = product._id;
  nameInput.value = product.name;
  descriptionInput.value = product.description;
  priceInput.value = product.price;
  stockInput.value = product.stock;
  categorySelect.value = product.category;
  subcategorySelect.value = product.subcategory;
}

// Eliminar producto
async function deleteProduct(id) {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    const res = await fetch(`${apiUrl}/products/${id}`, {
      method: 'DELETE',
      headers
    });

    if (res.ok) {
      await loadProducts();
    } else {
      alert('Error al eliminar el producto');
    }
  }
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// Inicializar
(async () => {
  await loadCategories();
  await loadSubcategories();
  await loadProducts();
})();
