// js/admin.js
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
  apiKey: "TU_API_KEY",
  authDomain: "boutique-buendia.firebaseapp.com",
  projectId: "boutique-buendia",
  storageBucket: "boutique-buendia.firebasestorage.app",
  messagingSenderId: "430651152709",
  appId: "1:430651152709:web:aaa54eeb8e3ba64c43062c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === VERIFICAR ADMIN ===
if (!localStorage.getItem('isAdmin')) {
  alert('Acceso denegado');
  window.location.href = 'index.html';
}

// === CARGAR PRODUCTOS POR TIPO ===
function loadProductsByType(type, containerId) {
  const q = query(collection(db, "productos"), where("type", "==", type));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const products = [];
    
    snapshot.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      products.push(data);
      const card = createProductCard(data, type);
      container.appendChild(card);
    });

    if (containerId === 'newCarousel' || containerId === 'starCarousel') {
      handleAutoCarousel(container, products.length, containerId);
    }

    duplicateForInfiniteScroll(containerId);
  });

  window[`unsubscribe_${containerId}`] = unsubscribe;
}

loadProductsByType('carrusel', 'newCarousel');
loadProductsByType('publicidad', 'starCarousel');
loadProductsByType('normal', 'productsGrid');

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
function createProductCard(p, sectionType) {
  const div = document.createElement('div');
  div.className = 'product-card';
  div.dataset.id = p.id;

  if (sectionType === 'normal') {
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p class="product-price">$${p.precio}</p>
      <p class="product-desc-small">${p.descripcion || ''}</p>
      <div class="product-actions">
        <button class="admin-btn admin-edit" onclick="editProduct('${p.id}')">Editar</button>
        <button class="admin-btn admin-delete" onclick="deleteProduct('${p.id}')">Quitar</button>
      </div>
    `;
  } else {
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>$${p.precio}</p>
      <div class="product-actions">
        <button class="admin-btn admin-edit" onclick="editProduct('${p.id}')">Editar</button>
        <button class="admin-btn admin-delete" onclick="deleteProduct('${p.id}')">Quitar</button>
      </div>
    `;
  }
  return div;
}

// === EDITAR ===
window.editProduct = (id) => {
  const card = document.querySelector(`.product-card[data-id="${id}"]`);
  const p = {
    nombre: card.querySelector('h3').textContent,
    precio: parseFloat(card.querySelector('.product-price')?.textContent.replace('$', '') || card.querySelector('p')?.textSIGContent?.replace('$', '')),
    descripcion: card.querySelector('.product-desc-small')?.textContent || '',
    imagen: card.querySelector('img').src
  };
  document.getElementById('editName').value = p.nombre;
  document.getElementById('addImage').value = p.imagen;
  document.getElementById('editProductModal').classList.add('active');
  window.currentEditId = id;
};

document.getElementById('saveProduct').onclick = async () => {
  const id = window.currentEditId;
  const updated = {
    nombre: document.getElementById('editName').value,
    imagen: document.getElementById('addImage').value
  };
  await updateDoc(doc(db, "productos", id), updated);
  showToast("Actualizado");
  closeModal('editProductModal');
};

// === ELIMINAR ===
window.deleteProduct = async (id) => {
  if (!confirm("¿Eliminar?")) return;
  await deleteDoc(doc(db, "productos", id));
  showToast("Eliminado");
};

// === AGREGAR ===
document.getElementById('addPostBtn').onclick = () => {
  document.getElementById('addProductModal').classList.add('active');
};

// === PREVISUALIZAR IMAGEN ===
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

// === GUARDAR NUEVO ===
document.getElementById('saveNewProduct').onclick = async () => {
  const url = document.getElementById('addImage').value;
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

  const producto = {
    nombre: document.getElementById('addName').value,
    precio: parseFloat(document.getElementById('addPrice').value),
    talla: document.getElementById('addSizes').value.split(',').map(s => s.trim()).filter(Boolean),
    descripcion: document.getElementById('addDesc').value,
    tipo: document.getElementById('addCategory').value,
    type: document.getElementById('addType').value,
    imagen: url,
    creado: new Date()
  };

  if (!producto.nombre || !producto.precio || !producto.type) {
    showToast("Faltan datos");
    return;
  }

  await addDoc(collection(db, "productos"), producto);
  showToast("Producto agregado (imagen por URL)");
  closeModal('addProductModal');
};

// === MODALES ===
document.querySelectorAll('[id^="cancel"]').forEach(btn => {
  btn.onclick = () => closeModal(btn.closest('.modal').id);
});
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => e.target === m && closeModal(m.id));
});
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// === TOAST ===
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// === REDES ===
document.querySelectorAll('.edit-social').forEach(el => {
  el.onclick = e => {
    e.preventDefault();
    const type = el.dataset.type;
    const url = prompt(`Editar ${type}`, document.getElementById(type + 'Link').href);
    if (url) {
      document.getElementById(type + 'Link').href = url;
      setDoc(doc(db, "config", "redes"), { [type]: url }, { merge: true });
    }
  };
});

// === ENGRANAJE ===
document.getElementById('adminGear').onclick = e => {
  e.stopPropagation();
  document.getElementById('adminDropdown').classList.toggle('show');
};
document.addEventListener('click', () => document.getElementById('adminDropdown').classList.remove('show'));

// === LOGOUT ===
document.getElementById('authBtn').onclick = () => {
  localStorage.clear();
  window.location.href = 'index.html';
};
