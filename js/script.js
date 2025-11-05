// js/script.js

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

let cart = [];

// === Búsqueda ===
function filterProducts() {
  const query = searchInput.value.toLowerCase().trim();
  document.querySelectorAll('.product-card').forEach(card => {
    const text = card.getAttribute('data-search') || '';
    card.style.display = text.includes(query) ? 'block' : 'none';
  });
}
searchInput.addEventListener('input', filterProducts);

// === Galería ===
let currentSlide = 0;
const galleryTrack = document.getElementById('galleryTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function goToSlide(n) {
  currentSlide = (n + 3) % 3;
  galleryTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === currentSlide));
}
prevBtn.onclick = () => goToSlide(currentSlide - 1);
nextBtn.onclick = () => goToSlide(currentSlide + 1);
window.goToSlide = goToSlide;

// Dots
document.querySelectorAll('.thumb').forEach((thumb, i) => {
  const dot = document.createElement('div');
  dot.className = 'dot';
  if (i === 0) dot.classList.add('active');
  dot.onclick = () => goToSlide(i);
  document.getElementById('galleryDots').appendChild(dot);
});

// === Carrusel relacionados ===
let currentRelated = 0;
const relatedTrack = document.getElementById('relatedTrack');
const relatedPrev = document.getElementById('relatedPrev');
const relatedNext = document.getElementById('relatedNext');

relatedNext.onclick = () => {
  if (currentRelated < 1) {
    currentRelated++;
    relatedTrack.style.transform = `translateX(-${currentRelated * 105}%)`;
  }
};
relatedPrev.onclick = () => {
  if (currentRelated > 0) {
    currentRelated--;
    relatedTrack.style.transform = `translateX(-${currentRelated * 105}%)`;
  }
};

// === Carrito ===
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
    div.innerHTML = `<div>${item.name}</div><div>$${item.price.toLocaleString()}</div><button onclick="removeFromCart(${i})">×</button>`;
    cartItems.appendChild(div);
  });

  cartTotal.textContent = `Total: $${total.toLocaleString()}`;
  checkoutButtons.classList.add('show');
  cartBadge.textContent = cart.length;
  cartBadge.style.display = 'flex';
}

window.removeFromCart = (i) => {
  cart.splice(i, 1);
  updateCart();
  showToast('Eliminado');
};

addToCartBtn.onclick = () => {
  const qty = Math.max(1, parseInt(qtyInput.value) || 1);
  for (let i = 0; i < qty; i++) {
    cart.push({ name: 'Gorra "GALAXY CT"', price: 18000 });
  }
  updateCart();
  paymentOptions.classList.add('show');
  showToast('¡Agregado!');
  qtyInput.value = 1;
};

// === Eventos ===
menuBtn.onclick = () => { menuSidebar.classList.add('open'); menuOverlay.classList.add('show'); };
menuClose.onclick = menuOverlay.onclick = () => { menuSidebar.classList.remove('open'); menuOverlay.classList.remove('show'); };

searchBtn.onclick = () => { searchContainer.classList.add('active'); logo.classList.add('hidden'); setTimeout(() => searchInput.focus(), 100); };
closeSearch.onclick = () => { searchContainer.classList.remove('active'); logo.classList.remove('hidden'); searchInput.value = ''; filterProducts(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch.click(); });

cartBtn.onclick = () => cartSidebar.classList.add('open');
closeCart.onclick = () => cartSidebar.classList.remove('open');

// === Toast ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// === Pagos ===
window.paypalSimulate = () => alert('Redirigiendo a PayPal...');
window.cardSimulate = () => alert('Procesando con tarjeta...');

// === Init ===
updateCart();
