// js/script.js
// Tienda Efraín - Versión completa con localStorage, carruseles infinitos, búsqueda, carrito animado, login básico, etc.

// =============================================
// 1. DATOS INICIALES (ADMIN CONFIGURABLE)
// =============================================
const ADMIN_CONFIG = {
  siteName: "Efraín",
  maintenance: false,
  socials: {
    instagram: "https://instagram.com/efrain",
    facebook: "https://facebook.com/efrain",
    x: "https://x.com/efrain",
    youtube: "https://youtube.com/efrain"
  },
  payments: {
    paypal: true,
    card: true,
    oxxo: true,
    clabe: true
  }
};

// Productos (admin puede agregar/editar/eliminar)
let products = JSON.parse(localStorage.getItem('products')) || [
  { id: 1, name: "Gorra GALAXY CT", price: 18000, desc: "Edición limitada 24K", cat: "gorras", stock: 5, new: true, star: true, img: "http://imgfz.com/i/TBumyjZ.webp" },
  { id: 2, name: "Camiseta Oversize Negra", price: 850, desc: "Algodón premium", cat: "camisetas", sizes: ["S", "M", "L", "XL"], stock: 20, new: true, img: "http://imgfz.com/i/rTJ1Xnl.webp" },
  { id: 3, name: "Tenis Urban Pro", price: 3200, desc: "Suela antideslizante", cat: "tenis", stock: 8, star: true, img: "http://imgfz.com/i/P9gF7m8.webp" },
  { id: 4, name: "Cinturón Piel Negro", price: 1200, desc: "Hebilla metálica", cat: "cintos", stock: 15, img: "http://imgfz.com/i/TBumyjZ.webp" },
  { id: 5, name: "Sudadera Hoodie Gris", price: 1400, desc: "Capucha ajustable", cat: "sudaderas", sizes: ["M", "L"], stock: 12, new: true, img: "http://imgfz.com/i/rTJ1Xnl.webp" },
  { id: 6, name: "Pantalón Cargo Beige", price: 1800, desc: "6 bolsillos", cat: "pantalones", sizes: ["30", "32", "34"], stock: 10, img: "http://imgfz.com/i/P9gF7m8.webp" }
];

// Guardar productos iniciales si no existen
if (!localStorage.getItem('products')) {
  localStorage.setItem('products', JSON.stringify(products));
}

// =============================================
// 2. DOM ELEMENTS
// =============================================
const menuBtn = document.getElementById('menuBtn');
const menuSidebar = document.getElementById('menuSidebar');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose = document.getElementById('menuClose');
const dropdownToggle = document.querySelector('.dropdown-toggle');
const productsSubmenu = document.getElementById('productsSubmenu');

const searchBtn = document.getElementById('searchBtn');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const closeSearch = document.getElementById('closeSearch');
const logo = document.getElementById('logo');

const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartBadge = document.getElementById('cartBadge');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartFooter = document.getElementById('cartFooter');

const newTrack = document.getElementById('newTrack');
const starTrack = document.getElementById('starTrack');
const productsGrid = document.getElementById('productsGrid');
const toast = document.getElementById('toast');

const userSection = document.getElementById('userSection');
const loginPrompt = document.getElementById('loginPrompt');
const userWelcome = document.getElementById('userWelcome');
const userNameSpan = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// =============================================
// 3. ESTADO GLOBAL
// =============================================
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isDropdownOpen = false;

// =============================================
// 4. INICIALIZACIÓN
// =============================================
function init() {
  if (ADMIN_CONFIG.maintenance && !isAdmin()) {
    document.body.innerHTML = `<div style="text-align:center;padding:100px;font-family:sans-serif;">
      <h1>Página en mantenimiento</h1><p>Volveremos pronto.</p>
    </div>`;
    return;
  }

  updateSiteName();
  renderProducts();
  renderInfiniteCarousels();
  updateCart();
  updateUserUI();
  addEventListeners();
}
init();

// =============================================
// 5. EVENT LISTENERS
// =============================================
function addEventListeners() {
  // Menú
  menuBtn.onclick = () => { menuSidebar.classList.add('open'); menuOverlay.classList.add('show'); };
  menuClose.onclick = menuOverlay.onclick = closeMenu;

  // Dropdown Productos
  dropdownToggle.onclick = () => {
    isDropdownOpen = !isDropdownOpen;
    productsSubmenu.style.display = isDropdownOpen ? 'block' : 'none';
  };

  // Búsqueda
  searchBtn.onclick = () => { searchContainer.classList.add('active'); logo.classList.add('hidden'); setTimeout(() => searchInput.focus(), 100); };
  closeSearch.onclick = () => { searchContainer.classList.remove('active'); logo.classList.remove('hidden'); searchInput.value = ''; filterProducts(); };
  searchInput.addEventListener('input', debounce(filterProducts, 300));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && searchContainer.classList.contains('active')) closeSearch.click(); });

  // Carrito
  cartBtn.onclick = () => cartSidebar.classList.add('open');
  closeCart.onclick = () => cartSidebar.classList.remove('open');

  // Logout
  logoutBtn.onclick = () => {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateUserUI();
    showToast('Sesión cerrada');
  };
}

// =============================================
// 6. FUNCIONES PRINCIPALES
// =============================================

// Cerrar menú
function closeMenu() {
  menuSidebar.classList.remove('open');
  menuOverlay.classList.remove('show');
  isDropdownOpen = false;
  productsSubmenu.style.display = 'none';
}

// Actualizar nombre del sitio
function updateSiteName() {
  document.getElementById('logo').textContent = ADMIN_CONFIG.siteName;
}

// Renderizar productos en grid
function renderProducts() {
  productsGrid.innerHTML = '';
  const filtered = getFilteredProducts();
  if (filtered.length === 0) {
    productsGrid.innerHTML = '<p style="text-align:center;color:#777;padding:40px;">No se encontraron productos.</p>';
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => goToProduct(product.id);

    const sizesHtml = product.sizes ? `<div class="sizes">Tallas: ${product.sizes.join(', ')}</div>` : '';
    const stockHtml = product.stock > 0 ? '' : '<span class="out-stock">Agotado</span>';

    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}" loading="lazy">
      <div class="card-info">
        <h3>${product.name}</h3>
        <p class="desc">${product.desc}</p>
        ${sizesHtml}
        <p class="price">$${product.price.toLocaleString()}</p>
        ${stockHtml}
        <button class="add-btn" ${product.stock === 0 ? 'disabled' : ''} onclick="event.stopPropagation(); addToCart(${product.id})">
          Agregar
        </button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// Filtrar productos (búsqueda)
function filterProducts() {
  const query = searchInput.value.toLowerCase().trim();
  if (query.length < 3) {
    renderProducts();
    return;
  }
  renderProducts(); // Ya filtra en getFilteredProducts()
}

function getFilteredProducts() {
  const query = searchInput.value.toLowerCase().trim();
  return products.filter(p =>
    (p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query)) &&
    p.stock > 0
  );
}

// Ir a producto
function goToProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

// =============================================
// 7. CARRUSELES INFINITOS
// =============================================
function renderInfiniteCarousels() {
  renderCarousel('newTrack', products.filter(p => p.new && p.stock > 0));
  renderCarousel('starTrack', products.filter(p => p.star && p.stock > 0));
}

function renderCarousel(trackId, items) {
  const track = document.getElementById(trackId);
  track.innerHTML = '';
  if (items.length === 0) {
    track.parentElement.style.display = 'none';
    return;
  }
  track.parentElement.style.display = 'block';

  // Duplicar para infinito
  const allItems = [...items, ...items];
  allItems.forEach(product => {
    const card = document.createElement('div');
    card.className = 'carousel-item';
    card.onclick = () => goToProduct(product.id);
    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <div class="item-info">
        <h4>${product.name}</h4>
        <p>$${product.price.toLocaleString()}</p>
      </div>
    `;
    track.appendChild(card);
  });

  // Auto scroll infinito
  let scrollAmount = 0;
  const speed = 1;
  const itemWidth = 180;

  function autoScroll() {
    scrollAmount += speed;
    if (scrollAmount >= items.length * itemWidth) {
      scrollAmount = 0;
    }
    track.style.transform = `translateX(-${scrollAmount}px)`;
    requestAnimationFrame(autoScroll);
  }
  autoScroll();
}

// =============================================
// 8. CARRITO
// =============================================
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.stock === 0) return;

  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    img: product.img,
    qty: 1
  };

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push(cartItem);
  }

  product.stock--;
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('cart', JSON.stringify(cart));

  updateCart();
  animateCartIcon();
  showToast('¡Agregado!', 'success');
}

function removeFromCart(index) {
  const item = cart[index];
  const product = products.find(p => p.id === item.id);
  if (product) product.stock += item.qty;
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  localStorage.setItem('products', JSON.stringify(products));
  updateCart();
  showToast('Eliminado');
}

function updateCart() {
  cartItems.innerHTML = '';
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    cartFooter.style.display = 'none';
    cartBadge.style.display = 'none';
    return;
  }

  let total = 0;
  cart.forEach((item, i) => {
    total += item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="thumb">
      <div>
        <div>${item.name}</div>
        <small>x${item.qty} • $${(item.price * item.qty).toLocaleString()}</small>
      </div>
      <button onclick="removeFromCart(${i})">×</button>
    `;
    cartItems.appendChild(div);
  });

  cartTotal.textContent = `Total: $${total.toLocaleString()}`;
  cartFooter.style.display = 'block';
  cartBadge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
  cartBadge.style.display = 'flex';
}

// Animación del carrito
function animateCartIcon() {
  cartBtn.classList.add('shake');
  setTimeout(() => cartBtn.classList.remove('shake'), 1000);
}

// Ir a checkout
function goToCheckout(method) {
  localStorage.setItem('paymentMethod', method);
  window.location.href = 'checkout.html';
}

// =============================================
// 9. USUARIO Y LOGIN
// =============================================
function updateUserUI() {
  if (currentUser) {
    loginPrompt.style.display = 'none';
    userWelcome.style.display = 'block';
    userNameSpan.textContent = currentUser.name;
    logoutBtn.style.display = 'block';
  } else {
    loginPrompt.style.display = 'block';
    userWelcome.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
}

// Simular login (para pruebas)
window.simulateLogin = (name) => {
  currentUser = { name };
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  updateUserUI();
  closeMenu();
  showToast(`Bienvenido, ${name}!`);
};

// =============================================
// 10. UTILIDADES
// =============================================
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function isAdmin() {
  return localStorage.getItem('isAdmin') === 'true';
}

// Exponer funciones globales
window.removeFromCart = removeFromCart;
window.addToCart = addToCart;
window.goToProduct = goToProduct;
