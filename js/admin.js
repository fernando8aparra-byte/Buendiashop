// admin.js - COMPLETO Y CORREGIDO
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmv4Wtlg295lfsWh1vpDtOHkxMD34vmUE",
  authDomain: "boutique-buendia.firebaseapp.com",
  projectId: "boutique-buendia",
  storageBucket: "boutique-buendia.firebasestorage.app",
  messagingSenderId: "430651152709",
  appId: "1:430651152709:web:aaa54eeb8e3ba64c43062c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === DOM ===
const addNombre = document.getElementById('addNombre');
const addPrecio = document.getElementById('addPrecio');
const addImagen = document.getElementById('addImagen');
const addType = document.getElementById('addType');
const addBtn = document.getElementById('addBtn');
const newCarousel = document.getElementById('newCarousel');
const starCarousel = document.getElementById('starCarousel');
const productsGrid = document.getElementById('productsGrid');
const toast = document.getElementById('toast');

// === TOAST ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// === AGREGAR PRODUCTO (CORREGIDO) ===
addBtn.onclick = () => {
  const nombre = addNombre.value.trim();
  const precio = parseFloat(addPrecio.value);
  const imagen = addImagen.value.trim();
  const type = addType.value;

  if (!nombre || isNaN(precio) || !imagen) {
    showToast('Completa todos los campos');
    return;
  }

  db.collection('productos').add({
    nombre,
    precio,
    imagen,
    type,
    nuevo: type === 'carrusel',
    estrella: type === 'anuncio' // CORREGIDO: estrella = true si es anuncio
  }).then(() => {
    addNombre.value = '';
    addPrecio.value = '';
    addImagen.value = '';
    showToast('Producto agregado');
  }).catch(err => {
    console.error(err);
    showToast('Error al agregar');
  });
};

// === LIMPIAR FORMULARIO ===
function clearAddForm() {
  addNombre.value = '';
  addPrecio.value = '';
  addImagen.value = '';
  addType.value = 'normal';
}

// === RENDER CARRUSEL ===
function renderCarousel(container, products) {
  container.innerHTML = '';
  if (products.length === 0) {
    container.innerHTML = '<p style="color:#999;padding:15px;text-align:center;">No hay productos</p>';
    return;
  }
  products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.innerHTML = `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy">`;
    container.appendChild(item);
  });
}

// === RENDER GRILLA ===
function renderGrid(products) {
  productsGrid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <div class="card-info">
        <h3>${p.nombre}</h3>
        <p class="price">$${p.precio.toLocaleString()}</p>
        <button class="edit-btn" data-id="${p.id}">Editar</button>
        <button class="delete-btn" data-id="${p.id}">Eliminar</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });

  // EDITAR
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = (e) => {
      const id = e.target.dataset.id;
      const product = window.allProducts.find(p => p.id === id);
      if (!product) return;

      const nuevoNombre = prompt('Nombre:', product.nombre);
      const nuevoPrecio = prompt('Precio:', product.precio);
      const nuevaImagen = prompt('URL Imagen:', product.imagen);

      if (nuevoNombre && nuevoPrecio && nuevaImagen) {
        updateDoc(doc(db, 'productos', id), {
          nombre: nuevoNombre,
          precio: parseFloat(nuevoPrecio),
          imagen: nuevaImagen
        }).then(() => showToast('Actualizado'));
      }
    };
  });

  // ELIMINAR
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = (e) => {
      if (!confirm('¿Eliminar este producto?')) return;
      const id = e.target.dataset.id;
      deleteDoc(doc(db, 'productos', id)).then(() => showToast('Eliminado'));
    };
  });
}

// === ESCUCHAR PRODUCTOS EN TIEMPO REAL ===
let allProducts = [];
onSnapshot(collection(db, 'productos'), (snapshot) => {
  allProducts = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    allProducts.push({
      id: doc.id,
      nombre: data.nombre || '',
      precio: data.precio || 0,
      imagen: data.imagen || '',
      type: data.type || 'normal',
      nuevo: data.nuevo === true,
      estrella: data.estrella === true
    });
  });
  window.allProducts = allProducts;

  const nuevos = allProducts.filter(p => p.nuevo);
  const anuncios = allProducts.filter(p => p.estrella);
  const normales = allProducts.filter(p => p.type === 'normal');

  renderCarousel(newCarousel, nuevos);
  renderCarousel(starCarousel, anuncios);
  renderGrid(normales);
});
