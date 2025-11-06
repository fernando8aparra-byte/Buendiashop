// js/script.js - SCRIPT COMPLETO Y FUNCIONAL (Menú + Búsqueda + Carrito + PayPal + Carrusel Infinito)
const products = [
  { id: 1, name: "Gorra GALAXY CT", price: 18000, oldPrice: 22000, desc: "Edición limitada 24K", img: "https://imgfz.com/i/TBumyjZ.webp", star: true },
  { id: 2, name: "Camiseta Oversize", price: 850, desc: "Algodón premium", img: "https://imgfz.com/i/rTJ1Xnl.webp", new: true },
  { id: 3, name: "Mystery Box Gold", price: 2500, desc: "3 productos sorpresa", img: "https://imgfz.com/i/8Y5vN2k.webp", star: true },
  { id: 4, name: "Cadena Silver", price: 1200, oldPrice: 1800, desc: "Acero inoxidable", img: "https://imgfz.com/i/3pR8m7L.webp" },
  { id: 5, name: "Gorra BLACKOUT", price: 1600, desc: "Full black edition", img: "https://imgfz.com/i/1kLmPqR.webp", new: true },
  { id: 6, name: "Playera Premium", price: 950, desc: "Talla única", img: "https://imgfz.com/i/9xV2wZk.webp" }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// === ELEMENTOS DOM ===
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const menuSidebar = document.getElementById('menuSidebar');
const menuClose = document.getElementById('menuClose');
const dropdownToggle = document.querySelector('.dropdown-toggle');
const submenu = document.querySelector('.submenu');

const searchBtn = document.getElementById('searchBtn');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const closeSearch = document.getElementById('closeSearch');

const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartBadge = document.getElementById('cartBadge');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

const productsGrid = document.getElementById('productsGrid');
const newCarousel = document.getElementById('newCarousel');
const starCarousel = document.getElementById('starCarousel');
const toast = document.getElementById('toast');

// === MENÚ LATERAL ===
menuBtn.onclick = () => {
  menuOverlay.classList.add('show');
  menuSidebar.classList.add('open');
};

menuOverlay.onclick = menuClose.onclick = () => {
  menuOverlay.classList.remove('show');
  menuSidebar.classList.remove('open');
};

dropdownToggle.onclick = () => {
  dropdownToggle.classList.toggle('active');
  submenu.classList.toggle('show');
};

// === BÚSQUEDA ===
searchBtn.onclick = () => searchContainer.classList.add('active');
closeSearch.onclick = () => searchContainer.classList.remove('active');

// === CARRUSEL INFINITO ===
function renderCarousel(container, filter) {
  container.innerHTML = '';
  const filtered = products.filter(filter);
  filtered.forEach(p => {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.innerHTML = `
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="item-info">
        <h4>${p.name}</h4>
        <p>$${p.price.toLocaleString()}</p>
      </div>
    `;
    container.appendChild(item);
  });
  container.innerHTML += container.innerHTML; // infinito
}

renderCarousel(newCarousel, p => p.new);
renderCarousel(starCarousel, p => p.star);

// === PRODUCTOS GRID ===
function renderProducts() {
  productsGrid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="card-info">
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="price-container">
          ${p.oldPrice ? `<span class="old-price">$${p.oldPrice.toLocaleString()}</span>` : ''}
          <span class="price ${p.oldPrice ? 'offer-price' : ''}">$${p.price.toLocaleString()}</span>
        </div>
        <button class="add-btn" onclick="addToCart(${p.id})">Agregar</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// === CARRITO ===
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

function updateCart() {
  cartItems.innerHTML = '';
  let total = 0;
  const qtyTotal = cart.reduce((sum, i) => sum + i.qty, 0);
  cartBadge.textContent = qtyTotal;
  cartBadge.style.display = qtyTotal > 0 ? 'flex' : 'none';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    document.querySelector('.go-to-pay').style.display = 'none';
    document.getElementById('paypal-button-container').innerHTML = '';
    return;
  }
  document.querySelector('.go-to-pay').style.display = 'block';

  cart.forEach((item, i) => {
    total += item.price * item.qty;
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

  cartTotal.textContent = `Total: $${total.toLocaleString()}`;
  renderPayPalButton(total);
}

// === PAYPAL OFICIAL (SANDBOX) ===
function renderPayPalButton(amount) {
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = '';
  paypal.Buttons({
    createOrder: () => actions.order.create({
      purchase_units: [{ amount: { value: (amount / 100).toFixed(2) } }]
    }),
    onApprove: (data, actions) => actions.order.capture().then(details => {
      document.getElementById('message').innerHTML = `
        ¡Pago exitoso! Orden: ${details.id}<br>
        Gracias, ${details.payer.name.given_name}
      `;
      document.getElementById('message').className = 'success';
      cart = [];
      localStorage.setItem('cart', '[]');
      updateCart();
      cartSidebar.classList.remove('open');
    }),
    onCancel: () => {
      document.getElementById('message').innerHTML = 'Pago cancelado.';
      document.getElementById('message').className = 'cancel';
    },
    onError: err => {
      document.getElementById('message').innerHTML = 'Error: ' + err;
      document.getElementById('message').className = 'error';
    }
  }).render('#paypal-button-container');
}

// === TOAST ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// === EVENTOS ===
cartBtn.onclick = () => cartSidebar.classList.add('open');
closeCart.onclick = () => cartSidebar.classList.remove('open');

// === INICIO ===
renderProducts();
updateCart();
