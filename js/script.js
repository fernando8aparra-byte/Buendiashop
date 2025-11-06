// js/script.js - Versión DEMO + FUNCIONAL
const db = null; // Simulado (no se usa Firebase para demo)

// === PRODUCTOS DEMO (si Firebase falla o para pruebas) ===
const DEMO_PRODUCTS = [
  { id: "1", nombre: "Gorra Negra Premium", precio: 499, imagen: "https://via.placeholder.com/160/000000/FFFFFF?text=Gorra", nuevo: true, estrella: false, descripcion: "Gorra ajustable de alta calidad" },
  { id: "2", nombre: "Camiseta Oversize", precio: 599, imagen: "https://via.placeholder.com/160/333333/FFFFFF?text=Camiseta", nuevo: false, estrella: true, descripcion: "100% algodón, talla única" },
  { id: "3", nombre: "Tenis Urban", precio: 1299, imagen: "https://via.placeholder.com/160/FF0000/FFFFFF?text=Tenis", nuevo: true, estrella: true, descripcion: "Edición limitada" },
  { id: "4", nombre: "Perfume Intense", precio: 899, imagen: "https://via.placeholder.com/160/1E90FF/FFFFFF?text=Perfume", nuevo: false, estrella: false, descripcion: "Aroma duradero 12h" },
  { id: "5", nombre: "Sudadera Hoodie", precio: 799, imagen: "https://via.placeholder.com/160/228B22/FFFFFF?text=Hoodie", nuevo: true, estrella: false, descripcion: "Con capucha y bolsillo" },
  { id: "6", nombre: "Cinturón Cuero", precio: 399, imagen: "https://via.placeholder.com/160/8B4513/FFFFFF?text=Cinturón", nuevo: false, estrella: false, descripcion: "Cuero genuino" },
  { id: "7", nombre: "Pantalón Cargo", precio: 949, imagen: "https://via.placeholder.com/160/808080/FFFFFF?text=Cargo", nuevo: false, estrella: true, descripcion: "Múltiples bolsillos" },
  { id: "8", nombre: "Mystery Box", precio: 1499, imagen: "https://via.placeholder.com/160/FFD700/000000?text=MYSTERY", nuevo: true, estrella: true, descripcion: "¡Sorpresa garantizada!" }
];

// === ELEMENTOS DEL DOM ===
const newCarousel = document.getElementById('newCarousel');
const starCarousel = document.getElementById('starCarousel');
const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const closeCart = document.getElementById('closeCart');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const goToPay = document.getElementById('goToPay');
const paypalContainer = document.getElementById('paypal-button-container');
const loginToPay = document.getElementById('loginToPay');

// === CARRITO ===
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// === CARGAR PRODUCTOS (DEMO) ===
function loadProducts() {
  const nuevos = DEMO_PRODUCTS.filter(p => p.nuevo);
  const estrella = DEMO_PRODUCTS.filter(p => p.estrella);

  renderCarousel(newCarousel, nuevos.length > 0 ? nuevos : DEMO_PRODUCTS.slice(0, 4));
  renderCarousel(starCarousel, estrella.length > 0 ? estrella : DEMO_PRODUCTS.slice(0, 4));
  renderProductsGrid(DEMO_PRODUCTS);
  updateCartUI();
}

// === RENDER CARRUSEL INFINITO ===
function renderCarousel(container, items) {
  if (items.length === 0) return;
  const duplicated = [...items, ...items];
  container.innerHTML = '';

  duplicated.forEach(product => {
    const card = createProductCard(product, true);
    container.appendChild(card);
  });

  let scrollAmount = 0;
  const speed = 1;
  function autoScroll() {
    scrollAmount += speed;
    if (scrollAmount >= container.scrollWidth / 2) scrollAmount = 0;
    container.scrollLeft = scrollAmount;
  }
  let interval = setInterval(autoScroll, 30);
  container.addEventListener('mouseenter', () => clearInterval(interval));
  container.addEventListener('mouseleave', () => interval = setInterval(autoScroll, 30));
}

// === RENDER GRID ===
function renderProductsGrid(products) {
  productsGrid.innerHTML = '';
  products.forEach(product => {
    const card = createProductCard(product, false);
    productsGrid.appendChild(card);
  });
}

// === CREAR TARJETA DE PRODUCTO ===
function createProductCard(product, isCarousel = false) {
  const div = document.createElement('div');
  div.className = 'product-card';
  div.style.cssText = `
    min-width: ${isCarousel ? '160px' : 'auto'};
    margin: 0 ${isCarousel ? '10px' : '0'};
    cursor: pointer;
    text-align: center;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    background: white;
    transition: transform 0.2s;
    display: inline-block;
  `;

  div.innerHTML = `
    <img src="${product.imagen}" alt="${product.nombre}" style="width:100%; height:160px; object-fit: cover;">
    <div style="padding:10px;">
      <h4 style="margin:0 0 5px; font-size:0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${product.nombre}</h4>
      <p style="margin:0; color:#000; font-weight:bold;">$${product.precio}</p>
      ${product.nuevo ? '<span style="background:#ff0000; color:white; font-size:0.7rem; padding:2px 6px; border-radius:4px; margin:2px;">NUEVO</span>' : ''}
      ${product.estrella ? '<span style="background:#ffd700; color:#000; font-size:0.7rem; padding:2px 6px; border-radius:4px; margin:2px;">ESTRELLA</span>' : ''}
      <button onclick="event.stopPropagation(); addToCart('${product.id}')" 
              style="margin-top:8px; background:#000; color:white; border:none; padding:8px 12px; border-radius:6px; font-size:0.8rem; cursor:pointer;">
        Añadir
      </button>
    </div>
  `;

  // === REDIRECCIÓN AL TOCAR PRODUCTO ===
  div.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    window.location.href = `product.html?id=${product.id}`;
  });

  div.addEventListener('mouseenter', () => div.style.transform = 'translateY(-4px)');
  div.addEventListener('mouseleave', () => div.style.transform = 'translateY(0)');

  return div;
}

// === AÑADIR AL CARRITO ===
window.addToCart = function(productId) {
  const product = DEMO_PRODUCTS.find(p => p.id === productId);
  if (!product) return showToast("Producto no encontrado");

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.cantidad += 1;
  } else {
    cart.push({ ...product, cantidad: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
  showToast(`${product.nombre} añadido`);
};

// === ACTUALIZAR UI CARRITO ===
function updateCartUI() {
  updateCartBadge();
  renderCartItems();
  updateTotal();
}

function updateCartBadge() {
  const total = cart.reduce((sum, i) => sum + i.cantidad, 0);
  cartBadge.textContent = total > 0 ? total : '';
  cartBadge.style.display = total > 0 ? 'block' : 'none';
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    return;
  }
  cartItems.innerHTML = '';
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; float:left; margin-right:10px;">
      <div style="margin-left:70px; min-height:60px; display:flex; flex-direction:column; justify-content:center;">
        <h4 style="margin:0 0 5px; font-size:0.95rem;">${item.nombre}</h4>
        <p style="margin:0; color:#000; font-weight:bold;">$${item.precio} × ${item.cantidad}</p>
      </div>
      <button onclick="removeFromCart('${item.id}')" style="position:absolute; top:8px; right:8px; background:none; border:none; font-size:1.5rem; cursor:pointer; width:30px; height:30px;">×</button>
    `;
    cartItems.appendChild(div);
  });
}

function updateTotal() {
  const total = cart.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
  cartTotal.textContent = `Total: $${total}`;
}

// === ELIMINAR DEL CARRITO ===
window.removeFromCart = function(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
  showToast("Producto eliminado");
};

// === ABRIR/CERRAR CARRITO ===
cartBtn.onclick = () => {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('show');
  updateCartUI();
};
closeCart.onclick = cartOverlay.onclick = () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('show');
};

// === IR A PAGAR ===
goToPay.onclick = () => {
  if (cart.length === 0) return showToast("Carrito vacío");
  window.location.href = 'pagos.html';
};

// === BOTÓN PAYPAL → REDIRIGE A PAGOS.HTML ===
if (paypalContainer) {
  paypalContainer.innerHTML = `
    <button id="paypalDemoBtn" style="
      background: #003087; color: white; border: none; padding: 12px;
      border-radius: 8px; font-weight: bold; width: 100%; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-size: 1rem; margin-top: 10px;
    ">
      <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x28.jpg" alt="PayPal" style="height:20px;">
      Pagar con PayPal
    </button>
  `;

  document.getElementById('paypalDemoBtn')?.addEventListener('click', () => {
    if (cart.length === 0) return showToast("Agrega productos primero");
    localStorage.setItem('pendingPayment', JSON.stringify(cart));
    window.location.href = 'pagos.html';
  });
}

// === TOAST ===
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// === INICIAR ===
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();

  // Actualizar footer del carrito (login)
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
  if (loginToPay) loginToPay.style.display = isLoggedIn ? 'none' : 'block';
  if (goToPay) goToPay.style.display = isLoggedIn ? 'block' : 'none';
  if (paypalContainer) paypalContainer.style.display = isLoggedIn ? 'block' : 'none';
});
