// js/script.js
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const db = getFirestore();

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
const messageDiv = document.getElementById('message');

// === CARRITO EN LOCALSTORAGE ===
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// === CARGAR PRODUCTOS ===
async function loadProducts() {
  try {
    const snapshot = await getDocs(collection(db, "productos"));
    const products = [];
    const newProducts = [];
    const starProducts = [];

    snapshot.forEach(doc => {
      const p = { id: doc.id, ...doc.data() };
      products.push(p);
      if (p.nuevo) newProducts.push(p);
      if (p.estrella) starProducts.push(p);
    });

    renderCarousel(newCarousel, newProducts.length > 0 ? newProducts : products.slice(0, 6));
    renderCarousel(starCarousel, starProducts.length > 0 ? starProducts : products.slice(0, 6));
    renderProductsGrid(products);
    updateCartUI();
  } catch (error) {
    console.error("Error cargando productos:", error);
    showToast("Error al cargar productos");
  }
}

// === RENDER CARRUSEL INFINITO ===
function renderCarousel(container, items) {
  if (items.length === 0) return;

  // Duplicar para efecto infinito
  const duplicated = [...items, ...items];
  container.innerHTML = '';

  duplicated.forEach(product => {
    const item = createProductCard(product);
    container.appendChild(item);
  });

  // Auto-scroll infinito
  let scrollAmount = 0;
  const speed = 1;
  const itemWidth = 180; // Ancho aproximado de cada card

  function autoScroll() {
    scrollAmount += speed;
    if (scrollAmount >= container.scrollWidth / 2) {
      scrollAmount = 0;
    }
    container.scrollLeft = scrollAmount;
  }

  let scrollInterval = setInterval(autoScroll, 30);

  // Pausar al hover
  container.addEventListener('mouseenter', () => clearInterval(scrollInterval));
  container.addEventListener('mouseleave', () => scrollInterval = setInterval(autoScroll, 30));
}

// === RENDER GRID DE PRODUCTOS ===
function renderProductsGrid(products) {
  productsGrid.innerHTML = '';
  products.forEach(product => {
    const card = createProductCard(product);
    productsGrid.appendChild(card);
  });
}

// === CREAR TARJETA DE PRODUCTO (reusable) ===
function createProductCard(product) {
  const div = document.createElement('div');
  div.className = 'product-card';
  div.style.cssText = `
    min-width: 160px; margin: 0 10px; cursor: pointer; text-align: center;
    border-radius: 12px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    background: white; transition: transform 0.2s;
  `;
  div.innerHTML = `
    <img src="${product.imagen || 'https://via.placeholder.com/160'}" alt="${product.nombre}" style="width:100%; height:160px; object-fit: cover;">
    <div style="padding:10px;">
      <h4 style="margin:0 0 5px; font-size:0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${product.nombre}</h4>
      <p style="margin:0; color:#000; font-weight:bold;">$${product.precio}</p>
      ${product.nuevo ? '<span style="background:#ff0000; color:white; font-size:0.7rem; padding:2px 6px; border-radius:4px;">NUEVO</span>' : ''}
      ${product.estrella ? '<span style="background:#ffd700; color:#000; font-size:0.7rem; padding:2px 6px; border-radius:4px;">★ ESTRELLA</span>' : ''}
    </div>
  `;

  // === REDIRECCIÓN AL TOCAR PRODUCTO ===
  div.addEventListener('click', () => {
    window.location.href = `product.html?id=${product.id}`;
  });

  div.addEventListener('mouseenter', () => div.style.transform = 'translateY(-4px)');
  div.addEventListener('mouseleave', () => div.style.transform = 'translateY(0)');

  return div;
}

// === CARRITO: AÑADIR PRODUCTO ===
window.addToCart = async function(productId) {
  try {
    const docRef = doc(db, "productos", productId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      showToast("Producto no encontrado");
      return;
    }

    const product = { id: docSnap.id, ...docSnap.data() };
    const existing = cart.find(item => item.id === productId);

    if (existing) {
      existing.cantidad += 1;
    } else {
      cart.push({ ...product, cantidad: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showToast(`${product.nombre} añadido al carrito`);
  } catch (error) {
    console.error("Error añadiendo al carrito:", error);
  }
};

// === ACTUALIZAR UI DEL CARRITO ===
function updateCartUI() {
  updateCartBadge();
  renderCartItems();
  updateTotal();
  updatePaypalButton();
}

function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
  cartBadge.textContent = totalItems > 0 ? totalItems : '';
  cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
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
      <img src="${item.imagen || 'https://via.placeholder.com/60'}" alt="${item.nombre}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; float:left; margin-right:10px;">
      <div style="margin-left:70px;">
        <h4 style="margin:0 0 5px; font-size:0.95rem;">${item.nombre}</h4>
        <p style="margin:0; color:#000; font-weight:bold;">$${item.precio} x ${item.cantidad}</p>
      </div>
      <button onclick="removeFromCart('${item.id}')">×</button>
    `;
    cartItems.appendChild(div);
  });
}

function updateTotal() {
  const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

// === REMOVER DEL CARRITO ===
window.removeFromCart = function(productId) {
  cart = cart.filter(item => item.id !== productId);
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

closeCart.onclick = () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('show');
};

cartOverlay.onclick = () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('show');
};

// === IR A PAGAR ===
goToPay.onclick = () => {
  if (cart.length === 0) {
    showToast("Tu carrito está vacío");
    return;
  }
  window.location.href = 'checkout.html';
};

// === PAYPAL BUTTON ===
function updatePaypalButton() {
  if (typeof paypal === 'undefined' || cart.length === 0) return;

  paypalContainer.innerHTML = '';
  paypal.Buttons({
    createOrder: (data, actions) => {
      const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      return actions.order.create({
        purchase_units: [{
          amount: { value: total.toFixed(2), currency_code: 'MXN' }
        }]
      });
    },
    onApprove: (data, actions) => {
      return actions.order.capture().then(details => {
        showToast('¡Pago exitoso! Gracias ' + details.payer.name.given_name);
        cart = [];
        localStorage.removeItem('cart');
        updateCartUI();
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('show');
      });
    },
    onError: (err) => {
      console.error(err);
      showToast('Error en el pago');
    }
  }).render('#paypal-button-container');
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

  // Exponer función global para botones en HTML si los usas
  window.addToCart = window.addToCart;
  window.removeFromCart = window.removeFromCart;
});
