// js/script.js - 100% FUNCIONAL CON INDEX.HTML + REDIRECCIÓN A product.html y pago.html
const products = [
  { id: 1, name: "Gorra GALAXY CT", price: 1800, oldPrice: 2200, desc: "Edición limitada 24K", img: "https://imgfz.com/i/TBumyjZ.webp", star: true },
  { id: 2, name: "Camiseta Oversize Black", price: 850, desc: "Algodón premium", img: "https://imgfz.com/i/rTJ1Xnl.webp", new: true },
  { id: 3, name: "Mystery Box Gold", price: 2500, desc: "3 productos sorpresa", img: "https://imgfz.com/i/8Y5vN2k.webp", star: true },
  { id: 4, name: "Cadena Silver", price: 1200, oldPrice: 1800, desc: "Acero inoxidable", img: "https://imgfz.com/i/3pR8m7L.webp" },
  { id: 5, name: "Gorra BLACKOUT", price: 1600, desc: "Full black edition", img: "https://imgfz.com/i/1kLmPqR.webp", new: true },
  { id: 6, name: "Playera Premium White", price: 950, desc: "Talla única", img: "https://imgfz.com/i/9xV2wZk.webp" },
  { id: 7, name: "Pantalón Cargo Black", price: 2200, desc: "Streetwear", img: "https://imgfz.com/i/cargo-black.jpg" },
  { id: 8, name: "Cinturón Leather Pro", price: 890, desc: "Piel genuina", img: "https://imgfz.com/i/cinto-leather.jpg" },
  { id: 9, name: "Tenis Urban White", price: 3500, desc: "Edición limitada", img: "https://imgfz.com/i/tenis-white.jpg", new: true },
  { id: 10, name: "Sudadera Oversize Gray", price: 1900, desc: "Calidad premium", img: "https://imgfz.com/i/sudadera-gray.jpg", star: true },
  { id: 11, name: "Overcide Hoodie Blue", price: 2100, desc: "Drop exclusivo", img: "https://imgfz.com/i/overcide-blue.jpg" },
  { id: 12, name: "Gorra Snapback Red", price: 1400, oldPrice: 1800, desc: "Ajustable", img: "https://imgfz.com/i/gorra-red.webp" },
  { id: 13, name: "Camiseta Graphic Tee", price: 799, desc: "Estampado único", img: "https://imgfz.com/i/graphic-tee.jpg", new: true },
  { id: 14, name: "Mystery Box Silver", price: 1800, desc: "2 productos sorpresa", img: "https://imgfz.com/i/mystery-silver.jpg", star: true },
  { id: 15, name: "Tenis High Top Black", price: 3900, desc: "Full comfort", img: "https://imgfz.com/i/tenis-high.jpg" },
  { id: 16, name: "Sudadera Zip Black", price: 2200, desc: "Con cierre", img: "https://imgfz.com/i/sudadera-zip.jpg" }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartOverlay = document.getElementById('cartOverlay');
const cartBadge = document.getElementById('cartBadge');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const productsGrid = document.getElementById('productsGrid');
const newCarousel = document.getElementById('newCarousel');
const starCarousel = document.getElementById('starCarousel');
const toast = document.getElementById('toast');

// === RENDER PRODUCTOS Y CARRUSELES ===
function renderProducts() {
  productsGrid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cursor = 'pointer'; // Indicar que es clicable

    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="card-info">
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="price-container">
          ${p.oldPrice ? `<span class="old-price">$${p.oldPrice.toLocaleString()}</span>` : ''}
          <span class="price ${p.oldPrice ? 'offer-price' : ''}">$${p.price.toLocaleString()}</span>
        </div>
        <button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id})">Agregar</button>
      </div>
    `;

    // === REDIRECCIÓN AL TOCAR PRODUCTO ===
    card.addEventListener('click', () => {
      window.location.href = `product.html?id=${p.id}`;
    });

    productsGrid.appendChild(card);
  });
}

function renderCarousel(container, filter) {
  container.innerHTML = '';
  const filtered = products.filter(filter);
  [...filtered, ...filtered].forEach(p => {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.style.cursor = 'pointer';

    item.innerHTML = `
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="item-info">
        <h4>${p.name}</h4>
        <p>$${p.price.toLocaleString()}</p>
      </div>
    `;

    // === REDIRECCIÓN EN CARRUSEL ===
    item.addEventListener('click', () => {
      window.location.href = `product.html?id=${p.id}`;
    });

    container.appendChild(item);
  });
}

// === CARRITO FUNCTIONS ===
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  showToast('¡Agregado al carrito!');
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function getTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateCart() {
  cartItems.innerHTML = '';
  const total = getTotal();
  const qtyTotal = cart.reduce((sum, i) => sum + i.qty, 0);

  // Badge
  cartBadge.textContent = qtyTotal;
  cartBadge.style.display = qtyTotal > 0 ? 'flex' : 'none';

  // Total siempre visible
  cartTotal.textContent = `Total: $${total.toLocaleString()}`;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    document.querySelector('.go-to-pay').style.display = 'none';
    document.getElementById('paypal-button-container').innerHTML = '';
    return;
  }

  document.querySelector('.go-to-pay').style.display = 'block';

  cart.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="thumb">
      <div>
        <div>${item.name}</div>
        <small>x${item.qty} • $${(item.price * item.qty).toLocaleString()}</small>
      </div>
      <button onclick="removeFromCart(${i})">X</button>
    `;
    cartItems.appendChild(div);
  });

  renderPayPalButton(total);
}

// === BOTÓN PAYPAL → REDIRIGE A pago.html ===
function renderPayPalButton(amount) {
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = '';

  if (amount <= 0) return;

  // Guardamos el monto para usarlo en pago.html
  localStorage.setItem('pendingPaymentAmount', amount);

  // Botón simulado que redirige
  container.innerHTML = `
    <button id="paypalRedirectBtn" style="
      background: #003087; color: white; border: none; padding: 14px;
      border-radius: 8px; font-weight: bold; width: 100%; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      font-size: 1rem; margin-top: 10px;
    ">
      <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x28.jpg" alt="PayPal" style="height:22px;">
      Pagar con PayPal
    </button>
  `;

  document.getElementById('paypalRedirectBtn').addEventListener('click', () => {
    if (cart.length === 0) {
      showToast("Carrito vacío");
      return;
    }
    // Guardamos carrito para pago.html
    localStorage.setItem('pendingCart', JSON.stringify(cart));
    window.location.href = 'pago.html';
  });
}

// === TOAST ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// === EVENTOS CARRITO ===
cartBtn.onclick = () => {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('show');
  updateCart();
};

closeCart.onclick = () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('show');
  document.getElementById('paypal-button-container').innerHTML = '';
};

cartOverlay.onclick = () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('show');
  document.getElementById('paypal-button-container').innerHTML = '';
};

// === INICIO ===
renderProducts();
renderCarousel(newCarousel, p => p.new);
renderCarousel(starCarousel, p => p.star);
updateCart();
