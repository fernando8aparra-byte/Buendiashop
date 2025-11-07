// js/admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

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

// === VERIFICAR ADMIN ===
if (!localStorage.getItem('isAdmin')) {
  alert('Acceso denegado');
  window.location.href = 'index.html';
}

// === PRODUCTOS LOCALES (para edición rápida) ===
let localProducts = [];

// === CARGAR Y RENDERIZAR PRODUCTOS POR TIPO (en tiempo real) ===
function loadProductsByType(type, containerId) {
  const q = query(collection(db, "productos"), where("type", "==", type));
  onSnapshot(q, (snapshot) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = createProductCard({ id: docSnap.id, ...data });
      container.appendChild(card);
    });
    // Reiniciar carrusel si usas uno (ej: Infinite Carousel)
    if (window.initCarousel) window.initCarousel(containerId);
  });
}

// Cargar los 3 apartados
loadProductsByType('carrusel', 'newCarousel');
loadProductsByType('publicidad', 'starCarousel');
loadProductsByType('normal', 'productsGrid');

// === RENDERIZAR PRODUCTO (para grid y carruseles) ===
function createProductCard(p) {
  const div = document.createElement('div');
  div.className = 'product-card';
  div.dataset.id = p.id;
  div.innerHTML = `
    <img src="${p.imagen}" alt="${p.nombre}">
    <h3>${p.nombre}</h3>
    <p>$${p.precio}</p>
    <div class="product-actions">
      <button class="admin-btn admin-edit" onclick="editProduct('${p.id}')">Editar</button>
      <button class="admin-btn admin-delete" onclick="deleteProduct('${p.id}')">Quitar</button>
    </div>
  `;
  return div;
}

// === CARGAR TODOS LOS PRODUCTOS (para edición local) ===
async function loadAllProducts() {
  const snapshot = await getDocs(collection(db, "productos"));
  localProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
loadAllProducts();

// === EDITAR PRODUCTO ===
window.editProduct = (id) => {
  const p = localProducts.find(x => x.id === id);
  if (!p) return;

  document.getElementById('editName').value = p.nombre;
  document.getElementById('editPrice').value = p.precio;
  document.getElementById('editSizes').value = p.talla?.join(', ') || '';
  document.getElementById('editDesc').value = p.descripcion || '';
  document.getElementById('editType').value = p.tipo || 'gorra';
  document.getElementById('editImage').value = p.imagen;

  const modal = document.getElementById('editProductModal');
  modal.classList.add('active');
  window.currentEditId = id;
};

// === GUARDAR EDICIÓN ===
document.getElementById('saveProduct').onclick = async () => {
  const id = window.currentEditId;
  const updated = {
    nombre: document.getElementById('editName').value,
    precio: parseFloat(document.getElementById('editPrice').value),
    talla: document.getElementById('editSizes').value.split(',').map(s => s.trim()).filter(Boolean),
    descripcion: document.getElementById('editDesc').value,
    tipo: document.getElementById('editType').value,
    imagen: document.getElementById('editImage').value
  };

  // Actualizar local
  const index = localProducts.findIndex(x => x.id === id);
  if (index !== -1) {
    localProducts[index] = { ...localProducts[index], ...updated };
  }

  // Firebase
  try {
    await updateDoc(doc(db, "productos", id), updated);
    showToast("Producto actualizado");
  } catch (error) {
    showToast("Error: " + error.message);
  }

  closeModal('editProductModal');
};

// === ELIMINAR PRODUCTO ===
window.deleteProduct = async (id) => {
  if (!confirm("¿Eliminar este producto?")) return;

  // Local
  localProducts = localProducts.filter(x => x.id !== id);

  // Firebase
  try {
    await deleteDoc(doc(db, "productos", id));
    showToast("Producto eliminado");
  } catch (error) {
    showToast("Error: " + error.message);
  }
};

// === BOTÓN + → AGREGAR PRODUCTO ===
document.getElementById('addPostBtn').onclick = () => {
  // Limpiar campos
  document.getElementById('addName').value = '';
  document.getElementById('addPrice').value = '';
  document.getElementById('addSizes').value = '';
  document.getElementById('addDesc').value = '';
  document.getElementById('addCategory').value = 'gorra';
  document.getElementById('addType').value = 'normal';
  document.getElementById('addImage').value = '';

  document.getElementById('addProductModal').classList.add('active');
};

// === GUARDAR NUEVO PRODUCTO ===
document.getElementById('saveNewProduct').onclick = async () => {
  const producto = {
    nombre: document.getElementById('addName').value,
    precio: parseFloat(document.getElementById('addPrice').value),
    talla: document.getElementById('addSizes').value.split(',').map(s => s.trim()).filter(Boolean),
    descripcion: document.getElementById('addDesc').value,
    tipo: document.getElementById('addCategory').value,
    type: document.getElementById('addType').value, // ← CLAVE PARA FILTRAR
    imagen: document.getElementById('addImage').value,
    creado: new Date()
  };

  if (!producto.nombre || !producto.precio || !producto.type) {
    showToast("Completa nombre, precio y tipo de sección");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "productos"), producto);
    localProducts.push({ id: docRef.id, ...producto });
    showToast("Producto agregado");
    closeModal('addProductModal');
  } catch (error) {
    showToast("Error: " + error.message);
  }
};

// === CANCELAR MODALES ===
document.getElementById('cancelAdd').onclick = () => closeModal('addProductModal');
document.getElementById('cancelEdit').onclick = () => closeModal('editProductModal');

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

// === ENGRANAJE ADMIN ===
document.getElementById('adminGear').onclick = (e) => {
  e.stopPropagation();
  document.getElementById('adminDropdown').classList.toggle('show');
};
document.addEventListener('click', () => {
  document.getElementById('adminDropdown').classList.remove('show');
});

// === CERRAR MODALES AL HACER CLIC FUERA ===
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal.id);
  });
});

// === TOAST ===
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// === CERRAR SESIÓN ===
document.getElementById('authBtn').onclick = () => {
  localStorage.clear();
  window.location.href = 'index.html';
};
