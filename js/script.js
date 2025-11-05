// js/script.js

/* ===== BÚSQUEDA CON FILTRO REAL ===== */
const searchBtn = document.getElementById('searchBtn');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const closeSearch = document.getElementById('closeSearch');
const logo = document.getElementById('logo');
const cards = document.querySelectorAll('.card');

function openSearch() {
  searchContainer.classList.add('active');
  logo.classList.add('hidden');
  setTimeout(() => searchInput.focus(), 100);
}

function closeSearchFn() {
  searchContainer.classList.remove('active');
  logo.classList.remove('hidden');
  searchInput.value = '';
  filterProducts('');
}

function filter Frequency() {
  const query = searchInput.value.toLowerCase().trim();
  filterProducts(query);
}

function filterProducts(query) {
  cards.forEach(card => {
    const text = card.getAttribute('data-search') || '';
    const matches = text.includes(query);
    card.style.display = matches || query === '' ? 'flex' : 'none';
  });
}

searchBtn.onclick = openSearch;
closeSearch.onclick = closeSearchFn;
searchInput.addEventListener('input', filterProducts);

// Cerrar con ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
    closeSearchFn();
  }
});

/* ===== MODO OSCURO AUTOMÁTICO ===== */
function applyDarkMode() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.classList.toggle('dark-mode', prefersDark);
}

// Aplicar al cargar
applyDarkMode();

// Escuchar cambios
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyDarkMode);

/* ===== GALERÍA, MENÚ, CARRITO, TOAST ===== */
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose = document.getElementById('menuClose');

const cartBtn = document.getElementById('cartBtn');
const cartPanel = document.getElementById('cartPanel');
const closeCart = document.getElementById('closeCart');
const cartBadge = document.getElementById('cartBadge');

const addToCartBtn = document.getElementById('addToCartBtn');
const qtyInput = document.getElementById('qty');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const paymentArea = document.getElementById('paymentArea');
const paymentOptions = document.getElementById('paymentOptions');
const toast = document.getElementById('toast');

let cart = [];
let currentIndex = 0;
let autoSlideInterval;

// Galería
const galleryTrack = document.getElementById('galleryTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('dots');
const thumbs = document.querySelectorAll('.thumb');
const images = galleryTrack.querySelectorAll('.gallery-img');

function updateGallery() {
  galleryTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
}

function createDots() {
  images.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i === 0) dot.classList.add('active');
    dot.onclick = () => { currentIndex = i; updateGallery(); resetAutoSlide(); };
    dotsContainer.appendChild(dot);
  });
}

function goToSlide(i) { currentIndex = i; updateGallery(); resetAutoSlide(); }
function nextSlide() { currentIndex = (currentIndex + 1) % images.length; updateGallery(); }
function startAutoSlide() { autoSlideInterval = setInterval(nextSlide, 10000); }
function resetAutoSlide() { clearInterval(autoSlideInterval); startAutoSlide(); }

prevBtn.onclick = () => { currentIndex = (currentIndex - 1 + images.length) % images.length; updateGallery(); resetAutoSlide(); };
nextBtn.onclick = () => { nextSlide(); resetAutoSlide(); };

createDots(); updateGallery(); startAutoSlide();

// Menú
menuBtn.onclick = () => { menuDropdown.classList.add('open'); menuOverlay.classList.add('show'); };
const closeMenu = () => { menuDropdown.classList.remove('open'); menuOverlay.classList.remove('show'); };
menuClose.onclick = closeMenu;
menuOverlay.onclick = closeMenu;

// Carrito
cartBtn.onclick = () => cartPanel.classList.add('open');
closeCart.onclick = () => cartPanel.classList.remove('open');

addToCartBtn.onclick = () => {
  const qty = Math.max(1, parseInt(qtyInput.value) || 1);
  for (let i = 0; i < qty; i++) {
    cart.push({ name: 'Gorra Barbas Hats x CT "GALAXY CT"', price: 18000 });
  }
  renderCart();
  animateCartIcon();
  showToast('¡Agregado al carrito!');
  qtyInput.value = 1;
  paymentOptions.classList.add('show');
};

function renderCart() {
  cartItemsEl.innerHTML = cart.length === 0
    ? '<div class="cart-empty">Tu carrito está vacío</div>'
    : cart.map((item, i) => `
      <div class="cart-item">
        <div>${item.name}</div>
        <div>$${item.price.toLocaleString('es-MX')}</div>
        <button onclick="removeItem(${i})">×</button>
      </div>
    `).join('');
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotalEl.textContent = `Total: $${total.toLocaleString('es-MX')}`;
  paymentArea.classList.toggle('show', cart.length > 0);
  cartBadge.textContent = cart.length;
  cartBadge.style.display = cart.length > 0 ? 'flex' : 'none';
}

window.removeItem = (i) => {
  cart.splice(i, 1);
  renderCart();
  showToast('Producto eliminado');
  if (cart.length === 0) paymentOptions.classList.remove('show');
};

function animateCartIcon() {
  const img = cartBtn.querySelector('img');
  img.classList.add('shake');
  setTimeout(() => img.classList.remove('shake'), 480);
}

let toastTimeout;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2400);
}

// Pagos
document.getElementById('paypalCheckout').onclick = () => alert('Redirigiendo a PayPal...');
document.getElementById('cardCheckout').onclick = () => alert('Procesando tarjeta...');

window.goToSlide = goToSlide;
renderCart();
