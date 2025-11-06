// js/script.js
// =============================================
// SCRIPT COMPLETO: CARRITO + CARRUSEL INFINITO + PRODUCTOS + ANIMACIONES
// =============================================

const cart = JSON.parse(localStorage.getItem('cart')) || [];
const newCarousel = document.getElementById('newCarousel');
const starCarousel = document.getElementById('starCarousel');
const productsGrid = document.getElementById('productsGrid');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const toast = document.getElementById('toast');

// === FIREBASE CONFIG (ya inicializado en index.html) ===
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
const db = getFirestore();

// === CARGAR PRODUCTOS DESDE FIREBASE ===
async function loadProducts() {
  const snapshot = await getDocs(collection(db, "productos"));
  const products = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    data.id = doc.id;
    products.push(data);
  });
  renderProducts(products);
  renderCarousels(products);
}

// === RENDERIZAR GRID DE PRODUCTOS ===
function renderProducts(products) {
  productsGrid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <div class="card-info">
        <h3>${p.nombre}</h3>
        <div class="price-container">
          ${p.precioOferta ? `<span class="old-price">$${p.precio}</span>` : ''}
          <span class="offer-price">$${p.precioOferta || p.precio}</span>
        </div>
        <button class="add-btn" data-id="${p.id}">Añadir al carrito</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });

  // Añadir al carrito
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const product = products.find(p => p.id === id);
      addToCart(product);
    });
  });
}

// === RENDERIZAR CARRUSELES (solo imagen) ===
function renderCarousels(products) {
  const nuevos = products.filter(p => p.esNuevo);
  const destacados = products.filter(p => p.esDestacado);

  renderCarousel(newCarousel, nuevos);
  renderCarousel(starCarousel, destacados);
  duplicateForInfinite(); // Duplicar para efecto infinito
}

function renderCarousel(container, items) {
  container.innerHTML = '';
  items.forEach(p => {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.innerHTML = `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy">`;
    container.appendChild(item);
  });
}

// === DUPLICAR PARA EFECTO INFINITO ===
function duplicateForInfinite() {
  [newCarousel, starCarousel].forEach(track => {
    const items = track.innerHTML;
    track.innerHTML += items; // Duplicar contenido
  });
}

// === CARRITO ===
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.cantidad += 1;
  } else {
    cart.push({ ...product, cantidad: 1 });
  }
  saveCart();
  updateCartUI();
  showToast('¡Añadido al carrito!');
}

function removeFromCart(id) {
  const index = cart.findIndex(item => item.id === id);
  if (index !== -1) {
    if (cart[index].cantidad > 1) {
      cart[index].cantidad -= 1;
    } else {
      cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
    showToast('Producto eliminado');
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  renderCartItems();
  updateTotal();
  updateBadge();
  updateCartFooter(); // PayPal visibility
}

function renderCartItems() {
  cartItemsContainer.innerHTML = cart.length === 0
    ? '<p class="empty-cart">Tu carrito está vacío</p>'
    : '';

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div>
        <strong>${item.nombre}</strong><br>
        <small>$${item.precioOferta || item.precio} × ${item.cantidad}</small>
      </div>
      <button data-id="${item.id}">x</button>
    `;
    cartItemsContainer.appendChild(div);
  });

  // Botón eliminar
  document.querySelectorAll('.cart-item button').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id);
    });
  });
}

function updateTotal() {
  const total = cart.reduce((sum, item) => {
    const precio = item.precioOferta || item.precio;
    return sum + (precio * item.cantidad);
  }, 0);
  cartTotal.textContent = `Total: $${total}`;
}

function updateBadge() {
  const count = cart.reduce((sum, item) => sum + item.cantidad, 0);
  cartBadge.textContent = count;
  cartBadge.style.display = count > 0 ? 'flex' : 'none';
}

// === TOAST ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// === ACTUALIZAR VISIBILIDAD PAYPAL ===
function updateCartFooter() {
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
  const hasItems = cart.length > 0;
  document.getElementById('goToPay').style.display = (isLoggedIn && hasItems) ? 'block' : 'none';
  document.getElementById('paypal-button-container').style.display = (isLoggedIn && hasItems) ? 'block' : 'none';
}

// === INICIAR ===
loadProducts();
updateCartUI();

// Escuchar cambios en localStorage (login/logout)
window.addEventListener('storage', () => {
  updateCartUI();
});
