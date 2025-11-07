
// js/admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = { /* TU CONFIG */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (!localStorage.getItem('isAdmin')) {
  alert('Acceso denegado');
  window.location.href = 'index.html';
}

let products = {};
let showDemos = true;

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

function renderCarousel(id, section) {
  const track = document.getElementById(id);
  const items = Object.values(products).filter(p => p.section === section && (showDemos || !p.esDemo));
  track.innerHTML = items.map(p => `
    <div class="carousel-item" data-id="${p.id}">
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="product-actions">
        <button class="admin-btn admin-edit" onclick="editProduct('${p.id}')">Editar</button>
        <button class="admin-btn admin-delete" onclick="deleteProduct('${p.id}')">Quitar</button>
      </div>
    </div>
  `).join('');
}

function renderGrid(id, section) {
  const grid = document.getElementById(id);
  const items = Object.values(products).filter(p => p.section === section && (showDemos || !p.esDemo));
  grid.innerHTML = items.map(p => `
    <div class="product-card" data-id="${p.id}">
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>$${p.precio}</p>
      <div class="product-actions">
        <button class="admin-btn admin-edit" onclick="editProduct('${p.id}')">Editar</button>
        <button class="admin-btn admin-delete" onclick="deleteProduct('${p.id}')">Quitar</button>
      </div>
    </div>
  `).join('');
}

// TOGGLE DEMOS
document.getElementById('toggleDemo').onclick = () => {
  showDemos = !showDemos;
  document.getElementById('toggleDemo').textContent = showDemos ? 'Ocultar Demos' : 'Mostrar Demos';
  renderAll();
};

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
    section: section,
    esDemo: false
  };
  await setDoc(doc(db, "productos", id), data);
  products[id] = { id, ...data };
  renderAll();
  showToast("Agregado");
  closeModal('addPostModal');
};

// EDITAR / ELIMINAR
window.editProduct = (id) => { /* modal */ };
window.deleteProduct = async (id) => { /* eliminar */ };

// REDES
document.querySelectorAll('.edit-social').forEach(el => { /* editar link */ });

// MENÚ (usa script.js original)
