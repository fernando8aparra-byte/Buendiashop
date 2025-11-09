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

// === PROTEGER ADMIN ===
if (!localStorage.getItem('isAdmin')) {
  window.location.href = 'login.html';
}

// === ESTADO DE EDICIÓN DE TEXTOS ===
let textEditMode = false;
let textChanges = {};

// === CARGAR TODOS LOS PRODUCTOS EN SUS SECCIONES ===
function loadProductsByType(typeKey, containerId) {
  const q = query(collection(db, "productos"), where(`type.${typeKey}`, "==", true));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const products = [];
    
    snapshot.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      products.push(data);
      const card = createProductCard(data, typeKey);
      container.appendChild(card);
    });

    if (containerId === 'newCarousel' || containerId === 'starCarousel') {
      handleAutoCarousel(container, products.length, containerId);
    }

    duplicateForInfiniteScroll(containerId);
  });

  window[`unsubscribe_${containerId}`] = unsubscribe;
}

// CARGAR CADA SECCIÓN
loadProductsByType('carrusel', 'newCarousel');
loadProductsByType('anuncio', 'starCarousel');
loadProductsByType('normal', 'productsGrid');

// === CARRUSEL AUTOMÁTICO ===
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

// === CREAR TARJETA DE PRODUCTO (CON BOTONES EDITAR/ELIMINAR) ===
function createProductCard(p, sectionType) {
  const div = document.createElement('div');
  div.className = 'product-card';
  div.dataset.id = p.id;

  const stockInfo = p.disponibles > 0 
    ? `<p style="color:#0a0; font-weight:bold; margin:5px 0;">${p.disponibles} disponibles</p>` 
    : '';

  if (sectionType === 'normal') {
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p class="product-price">$${p.precio}</p>
      <p class="product-desc-small">${p.descripcion || ''}</p>
      ${stockInfo}
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
      ${stockInfo}
      <div class="product-actions">
        <button class="admin-btn admin-edit" onclick="editProduct('${p.id}')">Editar</button>
        <button class="admin-btn admin-delete" onclick="deleteProduct('${p.id}')">Quitar</button>
      </div>
    `;
  }
  return div;
}

// === EDITAR PRODUCTO ===
window.editProduct = (id) => {
  const card = document.querySelector(`.product-card[data-id="${id}"]`);
  if (!card) return;

  const p = {
    nombre: card.querySelector('h3').textContent,
    precio: parseFloat(card.querySelector('.product-price')?.textContent.replace('$', '') || 0),
    imagen: card.querySelector('img').src
  };

  document.getElementById('editName').value = p.nombre;
  document.getElementById('editPrice').value = p.precio;
  document.getElementById('editImage').value = p.imagen;
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
  if (!updated.nombre || !updated.precio) {
    showToast("Faltan datos");
    return;
  }
  await updateDoc(doc(db, "productos", id), updated);
  showToast("Producto actualizado");
  closeModal('editProductModal');
};

// === ELIMINAR PRODUCTO ===
window.deleteProduct = async (id) => {
  if (!confirm("¿Eliminar este producto?")) return;
  await deleteDoc(doc(db, "productos", id));
  showToast("Producto eliminado");
};

// === AGREGAR PRODUCTO ===
document.getElementById('addPostBtn').onclick = () => {
  document.getElementById('addProductModal').classList.add('active');
  ['addName', 'addPrice', 'addSizes', 'addDesc', 'addImage'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('addImageFile').value = '';
  document.getElementById('imagePreview').style.display = 'none';

  // Resetear cantidad
  const box = document.getElementById('availableBox');
  const input = document.getElementById('addAvailableCount');
  const inputContainer = document.getElementById('availableInput');
  input.value = '0';
  box.textContent = '+';
  box.style.display = 'flex';
  inputContainer.style.display = 'none';
};

// === CANTIDAD DISPONIBLE: CUADRADO + (ESTILO SUAVE) ===
document.getElementById('availableBox').onclick = () => {
  const box = document.getElementById('availableBox');
  const inputContainer = document.getElementById('availableInput');
  const input = document.getElementById('addAvailableCount');

  box.style.display = 'none';
  inputContainer.style.display = 'block';
  input.focus();
  input.select();
};

document.getElementById('addAvailableCount').addEventListener('blur', () => {
  const box = document.getElementById('availableBox');
  const inputContainer = document.getElementById('availableInput');
  const value = document.getElementById('addAvailableCount').value.trim();

  box.textContent = value && value !== '0' ? value : '+';
  box.style.display = 'flex';
  inputContainer.style.display = 'none';
});

// === GUARDAR NUEVO PRODUCTO (type COMO OBJETO) ===
document.getElementById('saveNewProduct').onclick = async () => {
  const url = document.getElementById('addImage').value.trim();
  const hasFile = document.getElementById('addImageFile').files.length > 0;

  if (hasFile && !url) {
    showToast("Usa URL por ahora");
    return;
  }
  if (!url && !hasFile) {
    showToast("Agrega imagen");
    return;
  }

  const typeValue = document.getElementById('addType').value;
  let typeObj = { normal: false, carrusel: false, anuncio: false };
  if (typeValue === 'carrusel') typeObj.carrusel = true;
  else if (typeValue === 'publicidad') typeObj.anuncio = true;
  else if (typeValue === 'normal') typeObj.normal = true;

  const producto = {
    nombre: document.getElementById('addName').value.trim(),
    precio: parseFloat(document.getElementById('addPrice').value),
    talla: document.getElementById('addSizes').value.split(',').map(s => s.trim()).filter(Boolean),
    descripcion: document.getElementById('addDesc').value,
    tipo: document.getElementById('addCategory').value,
    type: typeObj,
    imagen: url,
    disponibles: parseInt(document.getElementById('addAvailableCount').value) || 0,
    creado: new Date()
  };

  if (!producto.nombre || !producto.precio || !typeValue) {
    showToast("Faltan datos");
    return;
  }

  await addDoc(collection(db, "productos"), producto);
  showToast("Producto agregado");
  closeModal('addProductModal');
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

  await setDoc(doc(db, "links", "social"), links, { merge: true });
  showToast("Redes guardadas");
  closeModal('socialLinksModal');
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
document.addEventListener('click', () => document.getElementById('adminDropdown').classList.remove('show'));

// === EDICIÓN DE TEXTOS ===
document.getElementById('toggleTextEdit').onclick = () => {
  textEditMode = !textEditMode;
  const controls = document.getElementById('textEditControls');
  const editables = document.querySelectorAll('[contenteditable="true"]');

  if (textEditMode) {
    controls.classList.add('active');
    editables.forEach(el => el.classList.add('editing'));
  } else {
    controls.classList.remove('active');
    editables.forEach(el => el.classList.remove('editing'));
    textChanges = {};
  }
};

document.getElementById('saveTextChanges').onclick = async () => {
  for (const [key, value] of Object.entries(textChanges)) {
    const [coll, docu, field] = key.split('|');
    await setDoc(doc(db, coll, docu), { [field]: value }, { merge: true });
  }
  showToast("Cambios guardados");
  textEditMode = false;
  document.getElementById('textEditControls').classList.remove('active');
  document.querySelectorAll('[contenteditable="true"]').forEach(el => el.classList.remove('editing'));
  textChanges = {};
};

document.getElementById('cancelTextChanges').onclick = () => {
  location.reload();
};

document.querySelectorAll('[contenteditable="true"]').forEach(el => {
  el.addEventListener('input', () => {
    const key = `${el.dataset.collection}|${el.dataset.doc}|${el.dataset.field}`;
    textChanges[key] = el.textContent.trim();
  });
});

// === CARGAR FONDO HERO ===
onSnapshot(doc(db, "textos", "hero"), snap => {
  if (snap.exists() && snap.data().fondo_url) {
    document.getElementById('heroBanner').style.backgroundImage = `url(${snap.data().fondo_url})`;
  }
});

// === INICIAR REDES ===
loadSocialLinks();
