// js/index.js - 100% DINÁMICO DESDE FIRESTORE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot,
  query,
  where,
  or
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

// === ELEMENTOS ===
const carouselTrack = document.getElementById('carouselTrack');
const anunciosTrack = document.getElementById('anunciosTrack');
const productsGrid = document.getElementById('productsGrid');
const cartBadge = document.getElementById('cartBadge');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const goToPay = document.getElementById('goToPay');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchResultsContainer = document.getElementById('searchResultsContainer');

// === CARRITO ===
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function updateCart() {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.precio * i.qty, 0);

  cartBadge.textContent = totalQty;
  cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';
  cartTotal.textContent = `Total: $${totalPrice.toLocaleString()}`;

  cartItems.innerHTML = '';
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    goToPay.style.display = 'none';
    return;
  }

  goToPay.style.display = 'block';
  cart.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" class="thumb">
      <div>
        <div>${item.nombre}</div>
        <small>x${item.qty} • $${(item.precio * item.qty).toLocaleString()}</small>
      </div>
      <button onclick="removeFromCart(${i})">X</button>
    `;
    cartItems.appendChild(div);
  });
}

window.removeFromCart = (i) => {
  cart.splice(i, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  showToast('Producto eliminado');
};

window.addToCart = (id) => {
  const product = window.allProducts.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  showToast('¡Agregado al carrito!');
};

goToPay.onclick = () => {
  if (cart.length === 0) return;
  localStorage.setItem('pendingPayment', JSON.stringify(cart));
  window.location.href = 'pago.html';
};

// === RENDER ===
function renderCarousel(container, filterFn) {
  container.innerHTML = '';
  const filtered = window.allProducts.filter(filterFn);
  [...filtered, ...filtered].forEach(p => {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.innerHTML = `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy">`;
    item.onclick = () => window.location.href = `product.html?id=${p.id}`;
    container.appendChild(item);
  });
}

function renderGrid() {
  productsGrid.innerHTML = '';
  window.allProducts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <div class="card-info">
        <h3>${p.nombre}</h3>
        <p class="desc">${p.descripcion || ''}</p>
        <div class="price-container">
          ${p.precioAntiguo ? `<span class="old-price">$${p.precioAntiguo.toLocaleString()}</span>` : ''}
          <span class="price ${p.precioAntiguo ? 'offer-price' : ''}">$${p.precio.toLocaleString()}</span>
        </div>
        <button class="add-btn" onclick="event.stopPropagation(); addToCart('${p.id}')">Agregar</button>
      </div>
    `;
    card.onclick = () => window.location.href = `product.html?id=${p.id}`;
    productsGrid.appendChild(card);
  });
}

// === ESCUCHAR FIRESTORE ===
let allProducts = [];

const productosRef = collection(db, "productos");
onSnapshot(productosRef, (snapshot) => {
  allProducts = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    allProducts.push({
      id: doc.id,
      nombre: data.nombre || '',
      precio: data.precio || 0,
      precioAntiguo: data.precioAntiguo || null,
      descripcion: data.descripcion || '',
      imagen: data.imagen || '',
      carrusel: data.carrusel || false,
      anuncios: data.anuncios || false
    });
  });

  renderCarousel(carouselTrack, p => p.carrusel);
  renderCarousel(anunciosTrack, p => p.anuncios);
  renderGrid();
  window.allProducts = allProducts;
});

// === BÚSQUEDA ===
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const term = searchInput.value.trim().toLowerCase();
  if (term.length < 2) {
    searchResultsContainer.style.display = 'none';
    return;
  }

  searchTimeout = setTimeout(() => {
    const results = allProducts.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(term))
    );

    searchResults.innerHTML = '';
    if (results.length === 0) {
      searchResults.innerHTML = '<p class="no-results">No se encontraron productos.</p>';
    } else {
      results.forEach(p => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${p.nombre}</strong><br><small>${p.descripcion}</small><br><strong>$${p.precio}</strong>`;
        div.style.padding = '10px 0';
        div.style.borderBottom = '1px solid #eee';
        div.style.cursor = 'pointer';
        div.onclick = () => window.location.href = `product.html?id=${p.id}`;
        searchResults.appendChild(div);
      });
    }
    searchResultsContainer.style.display = 'block';
  }, 300);
});

// Cerrar búsqueda al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!document.getElementById('searchBarHeader').contains(e.target) && 
      !searchResultsContainer.contains(e.target)) {
    searchResultsContainer.style.display = 'none';
  }
});

// === TOAST ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// === INICIO ===
updateCart();

// === LÓGICA DE MENÚS (ya tienes en tu HTML) ===
