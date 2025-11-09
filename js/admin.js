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
  setDoc,
  arrayUnion
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

// === CARGAR PRODUCTOS ===
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

// === EDITAR PRODUCTO ===
window.editProduct = (id) => {
  const card = document.querySelector(`.product-card[data-id="${id}"]`);
  if (!card) return;
  const p = {
    nombre: card.querySelector('h3').textContent,
    precio: parseFloat(card.querySelector('.product-price')?.textContent.replace('$', '') || 0),
    descripcion: card.querySelector('.product-desc-small')?.textContent || '',
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
    nombre: document.getElementById('editName').value,
    precio: parseFloat(document.getElementById('editPrice').value),
    imagen: document.getElementById('editImage').value
  };
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

// === AGREGAR PRODUCTO (LIMPIAR + DISPONIBLES) ===
document.getElementById('addPostBtn').onclick = () => {
  document.getElementById('addProductModal').classList.add('active');
  ['addName', 'addPrice', 'addSizes', 'addDesc', 'addImage'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('addImageFile').value = '';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('addAvailable').checked = false;
};

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

  const producto = {
    nombre: document.getElementById('addName').value.trim(),
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

  const docRef = await addDoc(collection(db, "productos"), producto);

  if (document.getElementById('addAvailable').checked) {
    await setDoc(doc(db, "productos_disponibles", "disponibles"), {
      activos: arrayUnion(producto.nombre)
    }, { merge: true });
    showToast("Producto agregado y en disponibles");
  } else {
    showToast("Producto agregado");
  }

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

// === EDICIÓN DIRECTA DE TEXTOS ===
document.querySelectorAll('[contenteditable="true"]').forEach(el => {
  el.addEventListener('focus', () => el.classList.add('editing'));
  el.addEventListener('blur', () => {
    el.classList.remove('editing');
    setTimeout(() => saveEditable(el), 300);
  });
});

async function saveEditable(el) {
  const coll = el.dataset.collection;
  const docu = el.dataset.doc;
  const field = el.dataset.field;
  const value = el.textContent.trim();
  await setDoc(doc(db, coll, docu), { [field]: value }, { merge: true });
}

// === PANEL DE EDICIÓN DE TEXTOS ===
document.getElementById('openTextEditor').onclick = () => {
  document.getElementById('textEditorPanel').classList.add('active');
  loadTextEditorValues();
};

document.getElementById('closeTextEditor').onclick = () => {
  document.getElementById('textEditorPanel').classList.remove('active');
};

function loadTextEditorValues() {
  onSnapshot(doc(db, "textos", "hero"), snap => {
    if (snap.exists()) {
      const d = snap.data();
      document.getElementById('editHeroTitle').value = d.titulo || '';
      document.getElementById('editHeroTag').value = d.subtitulo || '';
      document.getElementById('editHeroBg').value = d.fondo_url || '';
      if (d.fondo_url) {
        const img = document.getElementById('heroBgPreview');
        img.src = d.fondo_url;
        img.style.display = 'block';
      }
    }
  });

  onSnapshot(doc(db, "textos", "secciones"), snap => {
    if (snap.exists()) {
      const d = snap.data();
      document.getElementById('editNewTitle').value = d.nuevos_lanzamientos || '';
      document.getElementById('editStarTitle').value = d.productos_estrella || '';
      document.getElementById('editAllTitle').value = d.todos_productos || '';
    }
  });
}

document.getElementById('saveAllTexts').onclick = async () => {
  const hero = {
    titulo: document.getElementById('editHeroTitle').value,
    subtitulo: document.getElementById('editHeroTag').value,
    fondo_url: document.getElementById('editHeroBg').value
  };
  const secciones = {
    nuevos_lanzamientos: document.getElementById('editNewTitle').value,
    productos_estrella: document.getElementById('editStarTitle').value,
    todos_productos: document.getElementById('editAllTitle').value
  };

  await setDoc(doc(db, "textos", "hero"), hero, { merge: true });
  await setDoc(doc(db, "textos", "secciones"), secciones, { merge: true });
  showToast("Textos guardados");
  document.getElementById('textEditorPanel').classList.remove('active');
};

// === CARGAR FONDO HERO ===
onSnapshot(doc(db, "textos", "hero"), snap => {
  if (snap.exists() && snap.data().fondo_url) {
    document.getElementById('heroBanner').style.backgroundImage = `url(${snap.data().fondo_url})`;
  }
});

// === INICIAR REDES ===
loadSocialLinks();
