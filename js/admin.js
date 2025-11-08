// js/admin.js - ACTUALIZADO PARA type: { anuncio: true, ... }
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmv4Wtlg295lfsWh1vpDtOHkxMD34vmUE", // ← TU API KEY REAL
  authDomain: "boutique-buendia.firebaseapp.com",
  projectId: "boutique-buendia",
  storageBucket: "boutique-buendia.firebasestorage.app",
  messagingSenderId: "430651152709",
  appId: "1:430651152709:web:aaa54eeb8e3ba64c43062c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === PROTEGER ADMIN ===
if (!localStorage.getItem('isAdmin')) {
  window.location.href = 'login.html';
}

// === CARGAR PRODUCTOS POR type.anuncio, type.carrusel, type.normal ===
function loadProductsByType(filterFn, containerId) {
  const unsubscribe = onSnapshot(collection(db, "productos"), (snapshot) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const products = [];

    snapshot.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      if (filterFn(data)) {
        products.push(data);
        const card = createProductCard(data, containerId);
        container.appendChild(card);
      }
    });

    if (containerId === 'newCarousel' || containerId === 'starCarousel') {
      handleAutoCarousel(container, products.length, containerId);
    }
    duplicateForInfiniteScroll(containerId);
  });
  window[`unsubscribe_${containerId}`] = unsubscribe;
}

// FILTROS CORREGIDOS: usa type.anuncio, type.carrusel, type.normal
loadProductsByType(p => p.type && p.type.carrusel, 'newCarousel');
loadProductsByType(p => p.type && p.type.anuncio, 'starCarousel');
loadProductsByType(p => p.type && p.type.normal, 'productsGrid');

// === CARRUSEL ===
function handleAutoCarousel(container, count, containerId) {
  const section = container.parentElement.parentElement;
  section.classList.remove('auto-scroll', 'static-display');
  if (count >= 4) section.classList.add('auto-scroll');
  else section.classList.add('static-display');
}

function duplicateForInfiniteScroll(containerId) {
  const track = document.getElementById(containerId);
  const parent = track.parentElement.parentElement;
  if (!parent.classList.contains('auto-scroll') || track.dataset.duplicated) return;
  const clone = track.cloneNode(true);
  clone.id = containerId + '-clone';
  track.appendChild(clone);
  track.dataset.duplicated = 'true';
}

// === CREAR TARJETA ===
function createProductCard(p, containerId) {
  const div = document.createElement('div');
  div.className = 'product-card';
  div.dataset.id = p.id;

  const isNormal = containerId === 'productsGrid';
  div.innerHTML = `
    <img src="${p.imagen}" alt="${p.nombre}">
    <h3>${p.nombre}</h3>
    ${isNormal ? `<p class="product-desc-small">${p.descripcion || ''}</p>` : ''}
    <p class="product-price">$${p.precio.toLocaleString()}</p>
    <div class="product-actions">
      <button class="admin-btn admin-edit" onclick="editProduct('${p.id}')">Editar</button>
      <button class="admin-btn admin-delete" onclick="deleteProduct('${p.id}')">Quitar</button>
    </div>
  `;
  return div;
}

// === EDITAR ===
window.editProduct = (id) => {
  const product = window.allProducts.find(p => p.id === id);
  if (!product) return;

  document.getElementById('editName').value = product.nombre;
  document.getElementById('editPrice').value = product.precio;
  document.getElementById('editImage').value = product.imagen;

  document.getElementById('editProductModal').classList.add('active');
  window.currentEditId = id;
};

document.getElementById('saveProduct').onclick = async () => {
  const id = window.currentEditId;
  const updated = {
    nombre: document.getElementById('editName').value.trim(),
    precio: parseFloat(document.getElementById('editPrice').value),
    imagen: document.getElementById('editImage').value.trim()
  };

  if (!updated.nombre || isNaN(updated.precio) || !updated.imagen) {
    showToast("Completa todos los campos");
    return;
  }

  await updateDoc(doc(db, "productos", id), updated);
  showToast("Producto actualizado");
  closeModal('editProductModal');
};

// === ELIMINAR ===
window.deleteProduct = async (id) => {
  if (!confirm("¿Eliminar este producto?")) return;
  await deleteDoc(doc(db, "productos", id));
  showToast("Producto eliminado");
};

// === AGREGAR PRODUCTO (type COMO OBJETO) ===
document.getElementById('addPostBtn').onclick = () => {
  document.getElementById('addProductModal').classList.add('active');
  document.getElementById('imagePreview').style.display = 'none';
};

document.getElementById('addImageFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const urlInput = document.getElementById('addImage');
  const preview = document.getElementById('imagePreview');
  const img = document.getElementById('previewImg');
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.src = ev.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    urlInput.disabled = true;
    urlInput.value = '';
  } else {
    preview.style.display = 'none';
    urlInput.disabled = false;
  }
});

document.getElementById('addImage').addEventListener('input', (e) => {
  const fileInput = document.getElementById('addImageFile');
  const preview = document.getElementById('imagePreview');
  if (e.target.value.trim()) {
    fileInput.disabled = true;
    fileInput.value = '';
    preview.style.display = 'none';
  } else {
    fileInput.disabled = false;
  }
});

document.getElementById('saveNewProduct').onclick = async () => {
  const url = document.getElementById('addImage').value.trim();
  const fileInput = document.getElementById('addImageFile');
  const hasFile = fileInput.files.length > 0;

  if (hasFile && !url) {
    showToast("La subida de imágenes aún no está habilitada. Usa una URL.");
    return;
  }
  if (!url && !hasFile) {
    showToast("Agrega una imagen (URL o archivo)");
    return;
  }

  const typeSelect = document.getElementById('addType').value;

  const producto = {
    nombre: document.getElementById('addName').value.trim(),
    precio: parseFloat(document.getElementById('addPrice').value),
    talla: document.getElementById('addSizes').value.split(',').map(s => s.trim()).filter(Boolean),
    descripcion: document.getElementById('addDesc').value.trim(),
    tipo: document.getElementById('addCategory').value,
    imagen: url,
    creado: new Date(),
    type: {
      anuncio: typeSelect === 'publicidad',
      carrusel: typeSelect === 'carrusel',
      normal: typeSelect === 'normal'
    }
  };

  if (!producto.nombre || isNaN(producto.precio) || !producto.imagen) {
    showToast("Faltan datos obligatorios");
    return;
  }

  try {
    await addDoc(collection(db, "productos"), producto);
    showToast("Producto agregado");
    closeModal('addProductModal');
    // Limpiar formulario
    ['addName', 'addPrice', 'addSizes', 'addDesc', 'addImage'].forEach(id => {
      document.getElementById(id).value = '';
    });
    fileInput.value = '';
  } catch (err) {
    console.error(err);
    showToast("Error al agregar");
  }
};

// === CERRAR SESIÓN ===
document.getElementById('logoutBtn').onclick = () => {
  if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
  }
};

// === REDES SOCIALES ===
document.getElementById('openSocialModal').onclick = () => {
  document.getElementById('socialLinksModal').classList.add('active');
  loadSocialLinks();
};

document.getElementById('cancelSocial').onclick = () => closeModal('socialLinksModal');

document.getElementById('saveSocialLinks').onclick = async () => {
  const links = {
    tiktok: document.getElementById('tiktokInput').value.trim(),
    instagram: document.getElementById('instagramInput').value.trim(),
    facebook: document.getElementById('facebookInput').value.trim(),
    x: document.getElementById('xInput').value.trim(),
    whatsapp: document.getElementById('whatsappInput').value.trim()
  };

  try {
    await setDoc(doc(db, "links", "social"), links, { merge: true });
    showToast("Redes sociales guardadas");
    closeModal('socialLinksModal');
  } catch (error) {
    showToast("Error: " + error.message);
  }
};

function loadSocialLinks() {
  onSnapshot(doc(db, "links", "social"), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('tiktokInput').value = data.tiktok || '';
      document.getElementById('instagramInput').value = data.instagram || '';
      document.getElementById('facebookInput').value = data.facebook || '';
      document.getElementById('xInput').value = data.x || '';
      document.getElementById('whatsappInput').value = data.whatsapp || '';
    }
  });
}

// === MODALES ===
document.querySelectorAll('[id^="cancel"]').forEach(btn => {
  btn.onclick = () => closeModal(btn.closest('.modal').id);
});

document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => e.target === m && closeModal(m.id));
});

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// === TOAST ===
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// === ENGRANAJE ===
document.getElementById('adminGear').onclick = e => {
  e.stopPropagation();
  document.getElementById('adminDropdown').classList.toggle('show');
};

document.addEventListener('click', () => {
  document.getElementById('adminDropdown').classList.remove('show');
});

// === GUARDAR TODOS LOS PRODUCTOS EN MEMORIA ===
let allProducts = [];
onSnapshot(collection(db, "productos"), (snapshot) => {
  allProducts = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    allProducts.push({
      id: doc.id,
      nombre: data.nombre || '',
      precio: data.precio || 0,
      imagen: data.imagen || '',
      descripcion: data.descripcion || '',
      talla: data.talla || [],
      tipo: data.tipo || '',
      type: data.type || { normal: true }
    });
  });
  window.allProducts = allProducts;
});

// === INICIAR REDES ===
loadSocialLinks();
