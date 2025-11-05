// js/script.js

/* ------------------------------
   Elementos DOM
   ------------------------------ */
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

// Galería
const galleryTrack = document.getElementById('galleryTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('dots');
const thumbsContainer = document.getElementById('thumbs');
const images = galleryTrack.querySelectorAll('.gallery-img');
let currentIndex = 0;
let autoSlideInterval;

/* Carrito */
let cart = [];

/* ------------------------------
   Galería - Auto-slide cada 10s
   ------------------------------ */
function updateGallery() {
  const offset = -currentIndex * 100;
  galleryTrack.style.transform = `translateX(${offset}%)`;

  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });

  document.querySelectorAll('.thumb').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === currentIndex);
  });
}

function createDots() {
  images.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      currentIndex = i;
      updateGallery();
      resetAutoSlide();
    });
    dotsContainer.appendChild(dot);
  });
}

function goToSlide(index) {
  currentIndex = index;
  updateGallery();
  resetAutoSlide();
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % images.length;
  updateGallery();
}

function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 10000);
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

prevBtn.onclick = () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateGallery();
  resetAutoSlide();
};

nextBtn.onclick = () => {
  nextSlide();
  resetAutoSlide();
};

// Inicializar galería
createDots();
updateGallery();
startAutoSlide();

/* ------------------------------
   Menú lateral
   ------------------------------ */
menuBtn.onclick = () => {
  menuDropdown.classList.add('open');
  menuOverlay.classList.add('show');
  menuDropdown.setAttribute('aria-hidden', 'false');
  menuOverlay.setAttribute('aria-hidden', 'false');
};

const closeMenu = () => {
  menuDropdown.classList.remove('open');
  menuOverlay.classList.remove('show');
  menuDropdown.setAttribute('aria-hidden', 'true');
  menuOverlay.setAttribute('aria-hidden', 'true');
};

menuClose.onclick = closeMenu;
menuOverlay.onclick = closeMenu;

/* ------------------------------
   Carrito panel
   ------------------------------ */
cartBtn.onclick = () => {
  cartPanel.classList.add('open');
  cartPanel.setAttribute('aria-hidden', 'false');
};

closeCart.onclick = () => {
  cartPanel.classList.remove('open');
  cartPanel.setAttribute('aria-hidden', 'true');
};

/* ------------------------------
   Agregar al carrito
   ------------------------------ */
addToCartBtn.onclick = (e) => {
  e.preventDefault();
  const qty = Math.max(1, parseInt(qtyInput.value) || 1);
  const product = {
    name: 'Gorra Barbas Hats x CT "GALAXY CT"',
    price: 18000
  };

  for (let i = 0; i < qty; i++) {
    cart.push(product);
  }

  renderCart();
  animateCartIcon();
  showToast('¡Producto agregado con éxito! Shopping Cart');
  qtyInput.value = 1;
  paymentOptions.classList.add('show');
};

/* ------------------------------
   Renderizar carrito
   ------------------------------ */
function renderCart() {
  cartItemsEl.innerHTML = '';
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<div class="cart-empty">Tu carrito está vacío Shopping Bag</div>';
    cartTotalEl.textContent = 'Total: $0';
    paymentArea.classList.remove('show');
    paymentOptions.classList.remove('show');
    cartBadge.style.display = 'none';
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>${item.name}</div>
      <div>$${item.price.toLocaleString('es-MX')}</div>
      <button onclick="removeItem(${index})" aria-label="Eliminar item">×</button>
    `;
    cartItemsEl.appendChild(row);
    total += item.price;
  });

  cartTotalEl.textContent = `Total: $${total.toLocaleString('es-MX')}`;
  paymentArea.classList.add('show');
  cartBadge.textContent = cart.length;
  cartBadge.style.display = 'flex';
}

/* ------------------------------
   Eliminar item
   ------------------------------ */
function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
  showToast('Producto eliminado del carrito');
  if (cart.length === 0) {
    paymentOptions.classList.remove('show');
  }
}

window.removeItem = removeItem;
window.goToSlide = goToSlide;

/* ------------------------------
   Animación icono carrito
   ------------------------------ */
function animateCartIcon() {
  const img = cartBtn.querySelector('img');
  if (!img) return;
  img.classList.add('shake');
  setTimeout(() => img.classList.remove('shake'), 480);
}

/* ------------------------------
   Toast
   ------------------------------ */
let toastTimeout = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

/* ------------------------------
   Simulación de pagos
   ------------------------------ */
function paypalSimulate(e) {
  e?.stopPropagation();
  alert('Redirigiendo a PayPal (simulación)...');
}

function cardSimulate(e) {
  e?.stopPropagation();
  alert('Procesando pago con tarjeta (simulación)...');
}

document.getElementById('paypalCheckout').onclick = paypalSimulate;
document.getElementById('cardCheckout').onclick = cardSimulate;

/* ------------------------------
   Inicialización
   ------------------------------ */
renderCart();
