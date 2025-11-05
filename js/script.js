import { db, auth } from "./firebase.js";

const DOM = {
  menuBtn: document.getElementById('menuBtn'),
  menu: document.getElementById('menu'),
  overlay: document.getElementById('menuOverlay'),
  searchBtn: document.getElementById('searchBtn'),
  searchInput: document.getElementById('searchInput'),
  cartBtn: document.getElementById('cartBtn'),
  cart: document.getElementById('cart'),
  cartCount: document.getElementById('cartCount'),
  carouselGrid: document.getElementById('carouselGrid'),
  productsGrid: document.getElementById('productsGrid'),
  toast: document.getElementById('toast')
};

let products = [], cart = JSON.parse(localStorage.getItem('cart') || '[]');
updateCartCount();

// === MENU ===
DOM.menuBtn.onclick = () => {
  DOM.menu.classList.add('open');
  DOM.overlay.classList.add('show');
};
DOM.overlay.onclick = () => {
  DOM.menu.classList.remove('open');
  DOM.overlay.classList.remove('show');
};

// Submenús
document.querySelectorAll('.menu-header').forEach(h => {
  h.onclick = () => h.nextElementSibling.classList.toggle('open');
});

// === CARRITO ===
function addToCart(product) {
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showToast(`¡${product.nombre} agregado!`);
}

function updateCartCount() {
  DOM.cartCount.textContent = cart.length;
}

// === RENDER ===
async function loadProducts() {
  const snap = await db.ref('products').once('value');
  products = Object.entries(snap.val() || {}).map(([id, p]) => ({ id, ...p, img: `img/${p.img}` }));
  renderAll();
}

function renderAll() {
  renderCarousel();
  renderProducts();
}

function renderCarousel() {
  const featured = products.filter(p => p.destacado);
  DOM.carouselGrid.innerHTML = featured.map(p => `
    <div class="carousel-item">
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
      <div><strong>${p.nombre}</strong><div>$${p.precio.toLocaleString()}</div></div>
    </div>
  `).join('');
}

function renderProducts() {
  DOM.productsGrid.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
      <div class="meta">
        <div class="title">${p.nombre}</div>
        <div class="price">$${p.precio.toLocaleString()}</div>
        <button class="addBtn" onclick="addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">Agregar</button>
      </div>
    </div>
  `).join('');
}

// === TOAST ===
function showToast(msg) {
  DOM.toast.textContent = msg;
  DOM.toast.classList.add('show');
  setTimeout(() => DOM.toast.classList.remove('show'), 2000);
}

// === INIT ===
loadProducts();
