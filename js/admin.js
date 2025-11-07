// js/admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = { /* PEGA TUS CREDENCIALES */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (!localStorage.getItem('isAdmin')) {
  alert('Acceso denegado');
  window.location.href = 'index.html';
}

let products = {};

async function loadProducts() {
  const snapshot = await getDocs(collection(db, "productos"));
  products = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    products[doc.id] = { id: doc.id, ...data };
  });
  renderAll();
}
loadProducts();

function renderAll() {
  renderCarousel('newCarousel', 'new');
  renderCarousel('starCarousel', 'star');
  renderGrid('productsGrid', 'normal');
}

function renderCarousel(containerId, section) {
  const container = document.getElementById(containerId);
  const items = Object.values(products).filter(p => p.section === section);
  container.innerHTML = items.map(p => `
    <div class="carousel-item" data-id="${p.id}">
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="product-actions">
        <button class="admin-btn admin-edit" onclick="editProduct('${p.id}')">Editar</button>
        <button class="admin-btn admin-delete" onclick="deleteProduct('${p.id}')">Quitar</button>
      </div>
    </div>
  `).join('');
}

function renderGrid(containerId, section) {
  const container = document.getElementById(containerId);
  const items = Object.values(products).filter(p => p.section === section);
  container.innerHTML = items.map(p => `
    <div class="product-card" data-id="${p.id}">
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3 class="product-title">${p.nombre}</h3>
      <p class="price">$${p.precio}</p>
      <div class="product-actions">
        <button class="admin-btn admin-edit" onclick="editProduct('${p.id}')">Editar</button>
        <button class="admin-btn admin-delete" onclick="deleteProduct('${p.id}')">Quitar</button>
      </div>
    </div>
  `).join('');
}

// AGREGAR
document.getElementById('addPostBtn').onclick = () => {
  document.getElementById('addPostModal').classList.add('active');
};

document.getElementById('savePost').onclick = async () => {
  const id = Date.now().toString();
  const section = document.getElementById('postSection').value;
  const data = {
    nombre: document.getElementById('postName').value,
    precio: parseFloat(document.getElementById('postPrice').value),
    imagen: document.getElementById('postImage').value,
    section: section
  };
  await setDoc(doc(db, "productos", id), data);
  products[id] = { id, ...data };
  renderAll();
  showToast("Agregado");
  closeModal('addPostModal');
};

// EDITAR
window.editProduct = (id) => {
  const p = products[id];
  document.getElementById('editName').value = p.nombre;
  document.getElementById('editPrice').value = p.precio;
  document.getElementById('editImage').value = p.imagen;
  document.getElementById('editProductModal').classList.add('active');
  window.currentEditId = id;
};

document.getElementById('saveEdit').onclick = async () => {
  const id = window.currentEditId;
  const updated = {
    nombre: document.getElementById('editName').value,
    precio: parseFloat(document.getElementById('editPrice').value),
    imagen: document.getElementById('editImage').value
  };
  await updateDoc(doc(db, "productos", id), updated);
  products[id] = { ...products[id], ...updated };
  renderAll();
  showToast("Actualizado");
  closeModal('editProductModal');
};

// ELIMINAR
window.deleteProduct = async (id) => {
  if (confirm("¿Quitar este producto?")) {
    await deleteDoc(doc(db, "productos", id));
    delete products[id];
    renderAll();
    showToast("Eliminado");
  }
};

// REDES
document.querySelectorAll('.edit-social').forEach(el => {
  el.onclick = (e) => {
    e.preventDefault();
    const type = el.dataset.type;
    const url = prompt(`Editar ${type}`, document.getElementById(type + 'Link').href);
    if (url) {
      document.getElementById(type + 'Link').href = url;
      setDoc(doc(db, "config", "redes"), { [type]: url }, { merge: true });
    }
  };
});

// MENÚ
document.getElementById('menuBtn').onclick = () => {
  document.getElementById('menuSidebar').classList.add('open');
  document.getElementById('menuOverlay').classList.add('show');
};
document.getElementById('closeMenu').onclick = () => {
  document.getElementById('menuSidebar').classList.remove('open');
  document.getElementById('menuOverlay').classList.remove('show');
};

// MODALES
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}
document.querySelectorAll('[id^="cancel"]').forEach(b => b.onclick = () => closeModal(b.closest('.modal').id));

// TOAST
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
