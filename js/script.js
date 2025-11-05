// js/script.js

/* ===== DOM Elements ===== */
const menuBtn = document.getElementById('menuBtn');
const menuSidebar = document.getElementById('menuSidebar');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose = document.getElementById('menuClose');

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
const checkoutButtons = document.getElementById('checkoutButtons');
const paymentOptions = document.getElementById('paymentOptions');

const addToCartBtn = document.getElementById('addToCartBtn');
const qtyInput = document.getElementById('qty');
const toast = document.getElementById('toast');

// Galería
const galleryTrack = document.getElementById('galleryTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const galleryDots = document.getElementById('galleryDots');
const thumbs = document.querySelectorAll('.thumb');
let currentSlide = 0;
let autoSlideInterval;

// Carrusel relacionados
const relatedTrack = document.getElementById('relatedTrack');
const relatedPrev = document.getElementById('relatedPrev');
const relatedNext = document.getElementById('relatedNext');
const productCards = document.querySelectorAll('.product-card');
let currentRelated = 0;
const cardsPerView = window.innerWidth > 768 ? 3 : window.innerWidth > 480 ? 2 : 1;

/* ===== Carrito ===== */
let cart = [];

function updateCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    cartTotal.textContent = 'Total: $0';
    checkoutButtons.classList.remove('show');
    paymentOptions.classList.remove('show');
    cartBadge.style.display = 'none';
    return;
  }

  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach((item, i) => {
    total += item.price;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div>${item.name}</div>
      <div>$${item.price.toLocaleString('es-MX')}</div>
      <button onclick="removeFromCart(${i})">×</button>
    `;
    cartItems.appendChild(div);
  });

  cartTotal.textContent = `Total: $${total.toLocaleString('es-MX')}`;
  checkoutButtons.classList.add('show');
  cartBadge.textContent = cart.length;
  cartBadge.style.display = 'flex';
}

window.removeFromCart = (i) => {
  cart.splice(i, 1);
  updateCart();
  showToast('Producto eliminado');
};

/* ===== Búsqueda ===== */
function filterProducts() {
  const query = searchInput.value.toLowerCase().trim();
  productCards.forEach(card => {
    const text = card.getAttribute('data-search') || '';
    card.style.display = text.includes(query) ? 'block' : 'none';
  });
}

searchInput.addEventListener('input', filterProducts);

/* ===== Galería ===== */
function createDots() {
  galleryDots.innerHTML = '';
  thumbs.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i === 0) dot.classList.add('active');
    dot.onclick = () => goToSlide(i);
    galleryDots.appendChild(dot);
  });
}

function goToSlide(n) {
  currentSlide = (n + thumbs.length) % thumbs.length;
  galleryTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  thumbs.forEach((t, i) => t.classList.toggle('active', i === currentSlide));
  resetAutoSlide();
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 8000);
}
function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

prevBtn.onclick = prevSlide;
nextBtn.onclick = nextSlide;
createDots();
startAutoSlide();

/* ===== Carrusel Relacionados ===== */
function updateRelatedCarousel() {
  const cardWidth = productCards[0].offsetWidth + 20;
  const offset = -currentRelated * cardWidth;
  relatedTrack.style.transform = `translateX(${offset}px)`;
}

relatedNext.onclick = () => {
  currentRelated = Math.min(currentRelated + 1, productCards.length - cardsPerView);
  updateRelatedCarousel();
};
relatedPrev.onclick = () => {
  currentRelated = Math.max(currentRelated - 1, 0);
  updateRelatedCarousel();
};

window.addEventListener('resize', () => {
  const newPerView = window.innerWidth > 768 ? 3 : window.innerWidth > 480 ? 2 : 1;
  if (newPerView !== cardsPerView) location.reload();
});

/* ===== Eventos ===== */
menuBtn.onclick = () => { menuSidebar.classList.add('open'); menuOverlay.classList.add('show'); };
menuClose.onclick = menuOverlay.onclick = () => { menuSidebar.classList.remove('open'); menuOverlay.classList.remove('show'); };

searchBtn.onclick = () => { searchContainer.classList.add('active'); logo.classList.add('hidden'); setTimeout(() => searchInput.focus(), 100); };
closeSearch.onclick = () => { searchContainer.classList.remove('active'); logo.classList.remove('hidden'); searchInput.value = ''; filterProducts(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && searchContainer.classList.contains('active')) closeSearch.click(); });

cartBtn.onclick = () => cartSidebar.classList.add('open');
closeCart.onclick = () => cartSidebar.classList.remove('open');

addToCartBtn.onclick = () => {
  const qty = Math.max(1, parseInt(qtyInput.value) || 1);
  for (let i = 0; i < qty; i++) {
    cart.push({ name: 'Gorra "GALAXY CT"', price: 18000 });
  }
  updateCart();
  paymentOptions.classList.add('show');
  showToast('¡Agregado al carrito!');
  qtyInput.value = 1;
  animateCartIcon();
};

function animateCartIcon() {
  const img = cartBtn.querySelector('img');
  img.style.transform = 'scale(1.3) rotate(20deg)';
  setTimeout(() => img.style.transform = '', 300);
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ===== Pagos simulados ===== */
window.paypalSimulate = () => alert('Redirigiendo a PayPal...');
window.cardSimulate = () => alert('Procesando tarjeta...');

/* ===== Inicialización ===== */
updateCart();
updateRelatedCarousel();
