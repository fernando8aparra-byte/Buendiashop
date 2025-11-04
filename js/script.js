// === ELEMENTOS DEL DOM ===
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose = document.getElementById('menuClose');

const cartBtn = document.getElementById('cartBtn');
const cartPanel = document.getElementById('cartPanel');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const toast = document.getElementById('toast');

// === BOTÓN DE LOGIN ===
const loginBtn = document.getElementById('loginBtn');

// === CARRITO LOCAL ===
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// === EVENTOS ===

// Menú desplegable
menuBtn.onclick = () => {
  menuDropdown.classList.add('open');
  menuOverlay.classList.add('show');
};

menuOverlay.onclick = closeMenu;
menuClose.onclick = closeMenu;

function closeMenu() {
  menuDropdown.classList.remove('open');
  menuOverlay.classList.remove('show');
}

// Carrito
cartBtn.onclick = () => cartPanel.classList.add('open');
closeCart.onclick = () => cartPanel.classList.remove('open');

// Botón de inicio de sesión
if (loginBtn) {
  loginBtn.onclick = () => {
    window.location.href = "login.html";
  };
}

// === FUNCIONES DE CARRITO ===

function addToCart(product) {
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  showToast("Producto agregado al carrito");
  shakeCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty">Tu carrito está vacío 🛍️</div>';
    cartTotal.textContent = "Total: $0";
    return;
  }

  let total = 0;
  cart.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <span>${p.name}</span>
      <span>$${p.price.toLocaleString('es-MX')}</span>
      <button onclick="removeItem(${i})">✕</button>
    `;
    cartItems.appendChild(item);
    total += p.price;
  });

  cartTotal.textContent = "Total: $" + total.toLocaleString('es-MX');
}

// === ANIMACIONES ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function shakeCart() {
  cartBtn.classList.add('shake');
  setTimeout(() => cartBtn.classList.remove('shake'), 1000);
}

// === INICIALIZACIÓN ===
renderCart();
