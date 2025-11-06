
// js/script.js - Firebase + Búsqueda + Diseño personalizado + Redirección
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmv4Wtlg295lfsWh1vpDtOHkxMD34vmUE",
  authDomain: "boutique-buendia.firebaseapp.com",
  projectId: "boutique-buendia",
  storageBucket: "boutique-buendia.firebasestorage.app",
  messagingSenderId: "430651152709",
  appId: "1:430651152709:web:aaa54eeb8e3ba64c43062c",
  measurementId: "G-9KJ2330RN7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === DOM ===
const newCarousel = document.getElementById('newCarousel');
const starCarousel = document.getElementById('starCarousel');
const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartOverlay = document.getElementById('cartOverlay');
const goToPay = document.getElementById('goToPay');
const paypalContainer = document.getElementById('paypal-button-container');
const toast = document.getElementById('toast');

// === CARRITO ===
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = [];

// === CARGAR PRODUCTOS DESDE FIREBASE ===
async function loadProducts() {
  try {
    const snapshot = await getDocs(collection(db, "productos"));
    allProducts = [];
    const nuevos = [];
    const estrella = [];

    snapshot.forEach(doc => {
      const p = { id: doc.id, ...doc.data() };
      allProducts.push(p);
      if (p.nuevo) nuevos.push(p);
      if (p.estrella) estrella.push(p);
    });

    renderCarousel(newCarousel, nuevos.length > 0 ? nuevos : allProducts.slice(0, 6));
    renderCarousel(starCarousel, estrella.length > 0 ? estrella : allProducts.slice(0, 6));
    renderProductsGrid(allProducts);
    updateCartUI();
  } catch (error) {
    console.error("Error Firebase:", error);
    showToast("Error al cargar productos");
  }
}

// === RENDER CARRUSEL INFINITO ===
function renderCarousel(container, items) {
  if (items.length === 0) return;
  const duplicated = [...items, ...items];
  container.innerHTML = '';

  duplicated.forEach(p => {
    const item = createProductCard(p, true);
    container.appendChild(item);
  });

  let scroll = 0;
  const speed = 1;
  function autoScroll() {
    scroll += speed;
    if (scroll >= container.scrollWidth / 2) scroll = 0;
    container.scrollLeft = scroll;
  }
  let interval = setInterval(autoScroll, 30);
  container.addEventListener('mouseenter', () => clearInterval(interval));
  container.addEventListener('mouseleave', () => interval = setInterval(autoScroll, 30));
}

// === RENDER GRID ===
function renderProductsGrid(products) {
  productsGrid.innerHTML = '';
  products.forEach(p => {
    const card = createProductCard(p, false);
    productsGrid.appendChild(card);
  });
}

// === CREAR TARJETA DE PRODUCTO ===
function createProductCard(p, isCarousel = false) {
  const div = document.createElement('div');
  div.className = 'product-card';
  div.style.cssText = `
    min-width: ${isCarousel ? '160px' : 'auto'};
    margin: 0 ${isCarousel ? '10px' : '0'};
    cursor: pointer; text-align: center;
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    background: white; transition: transform 0.2s;
  `;

  div.innerHTML = `
    <img src="${p.imagen || 'https://via.placeholder.com/160'}" alt="${p.nombre}" style="width:100%; height:160px; object-fit:cover;">
    <div style="padding:10px;">
      <h4 style="margin:0 0 5px; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        ${p.nombre}
      </h4>
      <p style="margin:0; color:#000; font-weight:bold;">$${p.precio}</p>
      ${p.nuevo ? '<span style="background:#ff0000;color:white;font-size:0.7rem;padding:2px 6px;border-radius:4px;">NUEVO</span>' : ''}
      ${p.estrella ? '<span style="background:#ffd700;color:#000;font-size:0.7rem;padding:2px 6px;border-radius:4px;">ESTRELLA</span>' : ''}
      <button onclick="event.stopPropagation(); addToCart('${p.id}')" 
              style="margin-top:8px; background:#000; color:white; border:none; padding:8px 12px; border-radius:6px; font-size:0.8rem; cursor:pointer;">
        Añadir
      </button>
    </div>
  `;

  // REDIRECCIÓN AL PRODUCTO
  div.addEventListener('click', () => {
    window.location.href = `product.html?id=${p.id}`;
  });

  div.addEventListener('mouseenter', () => div.style.transform = 'translateY(-4px)');
  div.addEventListener('mouseleave', () => div.style.transform = 'translateY(0)');

  return div;
}

// === AÑADIR AL CARRITO ===
window.addToCart = async function(id) {
  try {
    const docRef = doc(db, "productos", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return showToast("Producto no encontrado");

    const product = { id, ...docSnap.data() };
    const existing = cart.find(i => i.id === id);
    if (existing) existing.cantidad++;
    else cart.push({ ...product, cantidad: 1 });

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showToast(`${product.nombre} añadido`);
  } catch (error) {
    console.error(error);
  }
};

// === ACTUALIZAR CARRITO ===
function updateCartUI() {
  updateBadge();
  renderCartItems();
  updateTotal();
  updatePayButtons();
}

function updateBadge() {
  const total = cart.reduce((s, i) => s + i.cantidad, 0);
  cartBadge.textContent = total > 0 ? total : '';
  cartBadge.style.display = total > 0 ? 'block' : 'none';
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    return;
  }
  cartItems.innerHTML = '';
  cart.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;float:left;margin-right:10px;">
      <div style="margin-left:70px;">
        <h4 style="margin:0 0 5px;font-size:0.95rem;">${item.nombre}</h4>
        <p style="margin:0;color:#000;font-weight:bold;">$${item.precio} × ${item.cantidad}</p>
      </div>
      <button onclick="removeFromCart('${item.id}')" style="position:absolute;top:8px;right:8px;background:none;border:none;font-size:1.5rem;cursor:pointer;">×</button>
    `;
    cartItems.appendChild(div);
  });
}

function updateTotal() {
  const total = cart.reduce((s, i) => s + (i.precio * i.cantidad), 0);
  cartTotal.textContent = `Total: $${total}`;
}

// === ELIMINAR ===
window.removeFromCart = function(id) {
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
  showToast("Producto eliminado");
};

// === BOTONES DE PAGO ===
function updatePayButtons() {
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

  // "Ir a Pagar" → texto simple
  if (goToPay) {
    goToPay.style.display = isLoggedIn && cart.length > 0 ? 'block' : 'none';
    goToPay.style.cssText = `
      background: none !important;
      color: #000 !important;
      padding: 12px !important;
      font-size: 0.9rem !important;
      font-weight: normal !important;
      text-decoration: underline !important;
      border: none !important;
      box-shadow: none !important;
      cursor: pointer !important;
      text-align: center !important;
    `;
    goToPay.onclick = () => {
      localStorage.setItem('pendingCart', JSON.stringify(cart));
      window.location.href = 'pago.html';
    };
  }

  // PayPal → diseño original + redirección
  if (paypalContainer) {
    paypalContainer.style.display = isLoggedIn && cart.length > 0 ? 'block' : 'none';
    paypalContainer.innerHTML = `
      <button id="paypalBtn" style="
        background: #003087; color: white; border: none; padding: 14px;
        border-radius: 8px; font-weight: bold; width: 100%; cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 10px;
        font-size: 1rem; margin-top: 10px;
      ">
        <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x28.jpg" alt="PayPal" style="height:22px;">
        Pagar con PayPal
      </button>
    `;
    document.getElementById('paypalBtn')?.addEventListener('click', () => {
      localStorage.setItem('pendingCart', JSON.stringify(cart));
      window.location.href = 'pago.html';
    });
  }
}

// === CARRITO ABRIR/CERRAR ===
cartBtn.onclick = () => {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('show');
  updateCartUI();
};
closeCart.onclick = cartOverlay.onclick = () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('show');
};

// === TOAST ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// === INICIO ===
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();

  // Actualizar login
  window.addEventListener('storage', () => {
    updatePayButtons();
  });
});
