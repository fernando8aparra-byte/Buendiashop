// js/admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "boutique-buendia.firebaseapp.com",
  projectId: "boutique-buendia",
  storageBucket: "boutique-buendia.firebasestorage.app",
  messagingSenderId: "430651152709",
  appId: "1:430651152709:web:aaa54eeb8e3ba64c43062c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Verificar admin
if (!localStorage.getItem('isAdmin')) {
  alert('Acceso denegado');
  window.location.href = 'index.html';
}

// === PRODUCTOS LOCALES (para cambios instantáneos) ===
let localProducts = [];

// Cargar productos
async function loadProducts() {
  const snapshot = await getDocs(collection(db, "productos"));
  localProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderProducts();
}
loadProducts();

// Renderizar
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = localProducts.map(p => `
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

// Editar producto
window.editProduct = (id) => {
  const p = localProducts.find(x => x.id === id);
  document.getElementById('editName').value = p.nombre;
  document.getElementById('editPrice').value = p.precio;
  document.getElementById('editSizes').value = p.talla?.join(', ');
  document.getElementById('editDesc').value = p.descripcion;
  document.getElementById('editType').value = p.tipo;
  document.getElementById('editImage').value = p.imagen;

  const modal = document.getElementById('editProductModal');
  modal.classList.add('active');
  window.currentEditId = id;
};

// Guardar edición
document.getElementById('saveProduct').onclick = async () => {
  const id = window.currentEditId;
  const updated = {
    nombre: document.getElementById('editName').value,
    precio: parseFloat(document.getElementById('editPrice').value),
    talla: document.getElementById('editSizes').value.split(',').map(s => s.trim()),
    descripcion: document.getElementById('editDesc').value,
    tipo: document.getElementById('editType').value,
    imagen: document.getElementById('editImage').value
  };

  // Local
  const index = localProducts.findIndex(x => x.id === id);
  localProducts[index] = { ...localProducts[index], ...updated };
  renderProducts();

  // Firebase
  await updateDoc(doc(db, "productos", id), updated);
  showToast("Producto actualizado");
  closeModal('editProductModal');
};

// Quitar producto
window.deleteProduct = async (id) => {
  if (!confirm("¿Quitar este producto demo?")) return;

  // Local
  localProducts = localProducts.filter(x => x.id !== id);
  renderProducts();

  // Firebase
  await deleteDoc(doc(db, "productos", id));
  showToast("Producto eliminado");
};

// === REDES SOCIALES ===
document.querySelectorAll('.edit-social').forEach(el => {
  el.onclick = (e) => {
    e.preventDefault();
    const type = el.dataset.type;
    const current = document.getElementById(type + 'Link').href;
    const url = prompt(`Editar enlace de ${type}`, current);
    if (url) {
      document.getElementById(type + 'Link').href = url;
      setDoc(doc(db, "config", "redes"), { [type]: url }, { merge: true });
    }
  };
});

// === BOTÓN + ===
document.getElementById('addPostBtn').onclick = () => {
  document.getElementById('addPostModal').classList.add('active');
};

document.getElementById('savePost').onclick = async () => {
  const post = {
    tipo: document.getElementById('postType').value,
    titulo: document.getElementById('postTitle').value,
    contenido: document.getElementById('postContent').value,
    imagen: document.getElementById('postImage').value,
    fecha: new Date()
  };
  const id = Date.now().toString();
  await setDoc(doc(db, "publicaciones", id), post);
  showToast("Publicación agregada");
  closeModal('addPostModal');
};

// === ENGRANAJE ===
document.getElementById('adminGear').onclick = (e) => {
  e.stopPropagation();
  document.getElementById('adminDropdown').classList.toggle('show');
};
document.addEventListener('click', () => {
  document.getElementById('adminDropdown').classList.remove('show');
});

// === MODALES ===
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}
document.querySelectorAll('[id^="cancel"]').forEach(btn => {
  btn.onclick = () => closeModal(btn.closest('.modal').id);
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Cerrar sesión
document.getElementById('authBtn').onclick = () => {
  localStorage.clear();
  window.location.href = 'index.html';
};
