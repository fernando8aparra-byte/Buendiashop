// js/script.js
import { db } from "./firebase.js";

const DOM = {
  welcomeBar: document.getElementById("welcomeBar"),
  maintenanceBar: document.getElementById("maintenanceBar"),
  menuBtn: document.getElementById("menuBtn"),
  menuDropdown: document.getElementById("menuDropdown"),
  menuOverlay: document.getElementById("menuOverlay"),
  menuClose: document.getElementById("menuClose"),
  menuCuentaBtn: document.getElementById("menuCuentaBtn"),
  submenuCuenta: document.getElementById("submenuCuenta"),
  menuNosotrosBtn: document.getElementById("menuNosotrosBtn"),
  submenuNosotros: document.getElementById("submenuNosotros"),
  menuProductosBtn: document.getElementById("menuProductosBtn"),
  submenuProductos: document.getElementById("submenuProductos"),
  menuEstadoSesion: document.getElementById("menuEstadoSesion"),
  searchBtn: document.getElementById("searchBtn"),
  searchInput: document.getElementById("searchInput"),
  cartBtn: document.getElementById("cartBtn"),
  cartPanel: document.getElementById("cartPanel"),
  closeCart: document.getElementById("closeCart"),
  cartItemsEl: document.getElementById("cartItems"),
  cartFooter: document.getElementById("cartFooter"),
  cartTotalEl: document.getElementById("cartTotal"),
  toastEl: document.getElementById("toast"),
  productsGrid: document.getElementById("productsGrid"),
  carouselGrid: document.getElementById("carouselGrid"),
  logoText: document.getElementById("logoText"),
  siteTitle: document.getElementById("siteTitle"),
  filters: document.getElementById("filters")
};

let products = [], config = {};

// === CARGA CONFIG ===
async function loadConfig() {
  const snap = await db.ref('config').once('value');
  config = snap.val() || {};
  if (config.nombre) {
    DOM.logoText.textContent = config.nombre;
    DOM.siteTitle.textContent = `${config.nombre} | Moda Premium`;
  }
  if (config.mantenimiento) {
    DOM.maintenanceBar.classList.add('visible');
    DOM.productsGrid.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted)">Página en mantenimiento</p>';
    return false;
  }
  setupSocialLinks();
  return true;
}

function setupSocialLinks() {
  const socials = config.socials || {};
  Object.keys(socials).forEach(key => {
    const el = DOM.submenuNosotros.querySelector(`[data-social="${key}"]`);
    if (el && socials[key].enabled && socials[key].url) {
      el.style.display = 'flex';
      el.onclick = () => window.open(key === 'whatsapp' ? `https://wa.me/${config.whatsapp}` : socials[key].url, '_blank');
    } else {
      el.style.display = 'none';
    }
  });
}

// === PRODUCTOS ===
async function loadProducts() {
  const snap = await db.ref('products').once('value');
  products = Object.entries(snap.val() || {}).map(([id, p]) => ({ id, ...p })).filter(p => p.enabled !== false);
  renderProducts(products);
  renderDestacados(products.filter(p => p.tipo === 'carrusel' || p.tipo === 'principal'));
}

function renderDestacados(list) {
  DOM.carouselGrid.innerHTML = list.map(p => `
    <div class="carousel-item">
      <img src="${p.img}" alt="${p.nombre}">
      <div><strong>${p.nombre}</strong><div>$${formatPrice(p.precio)}</div></div>
    </div>
  `).join('');
}

function renderProducts(list) {
  DOM.productsGrid.innerHTML = list.length ? list.map(p => /* ... igual que antes ... */).join('') : '<p>No hay productos</p>';
}

function formatPrice(num) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num).replace('MXN', '');
}

// === INIT ===
(async () => {
  if (!await loadConfig()) return;
  await loadProducts();
  // ... resto de eventos: menú, carrito, modal, etc.
})();
