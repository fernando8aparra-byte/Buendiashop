// js/index.js - 100% DINÁMICO + MENÚ + CARRITO + BÚSQUEDA
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmv4Wtlg295lfsWh1vpDtOHkxMD34vmUE",
  authDomain: "boutique-buendia.firebaseapp.com",
  projectId: "boutique-buendia",
  storageBucket: "boutique-buendia.firebasestorage.app",
  messagingSenderId: "430651152709",
  appId: "1:430651152709:web:aaa54eeb8e3ba64c43062c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === DOM ===
const newCarousel = document.getElementById('newCarousel');
const starCarousel = document.getElementById('starCarousel');
const productsGrid = document.getElementById('productsGrid');
const cartBadge = document.getElementById('cartBadge');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const goToPay = document.getElementById('goToPay');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('searchInput');
const searchResultsContainer = document.getElementById('searchResultsContainer');
const searchResults = document.getElementById('searchResults');
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const menuSidebar = document.getElementById('menuSidebar');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartOverlay = document.getElementById('cartOverlay');
const searchBtn = document.getElementById('searchBtn');
const searchBarHeader = document.getElementById('searchBarHeader');
const closeSearchHeader = document.getElementById('closeSearchHeader');
const headerOverlay = document.getElementById('headerOverlay');
const welcomeMsg = document.getElementById('welcomeMsg');
const authBtn = document.getElementById('authBtn');
const helpBtn = document.getElementById('helpBtn');

// === CARRITO ===
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function updateCart() {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.precio * i.qty, 0);

  cartBadge.textContent = totalQty;
  cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';
  cartTotal.textContent = `Total: $${totalPrice.toLocaleString()}`;

  cartItems.innerHTML = '';
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    goToPay.style.display = 'none';
    return;
  }

  goToPay.style.display = 'block';
  cart.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" class="thumb">
      <div>
        <div>${item.nombre}</div>
        <small>x${item.qty} • $${(item.precio * item.qty).toLocaleString()}</small>
      </div>
      <button onclick="removeFromCart(${i})">X</button>
    `;
    cartItems.appendChild(div);
  });
}

window.removeFromCart = (i) => {
  cart.splice(i, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  showToast('Producto eliminado');
};

window.addToCart = (id) => {
  const product = window.allProducts.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  showToast('¡Agregado al carrito!');
};

goToPay.onclick = () => {
  if (cart.length === 0) return;
  localStorage.setItem('pendingPayment', JSON.stringify(cart));
  window.location.href = 'pago.html';
};

// === RENDER ===
function renderCarousel(container, filterFn) {
  container.innerHTML = '';
  const filtered = window.allProducts.filter(filterFn);
  if (filtered.length === 0) {
    container.innerHTML = '<p style="color:#999; padding:20px;">No hay productos</p>';
    return;
  }
  [...filtered, ...filtered].forEach(p => {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.innerHTML = `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy">`;
    item.onclick = () => window.location.href = `product.html?id=${p.id}`;
    container.appendChild(item);
  });
}

function renderGrid() {
  productsGrid.innerHTML = '';
  window.allProducts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <div class="card-info">
        <h3>${p.nombre}</h3>
        <p class="desc">${p.descripcion || ''}</p>
        <div class="price-container">
          ${p.precioAntiguo ? `<span class="old-price">$${p.precioAntiguo.toLocaleString()}</span>` : ''}
          <span class="price ${p.precioAntiguo ? 'offer-price' : ''}">$${p.precio.toLocaleString()}</span>
        </div>
        <button class="add-btn" onclick="event.stopPropagation(); addToCart('${p.id}')">Agregar</button>
      </div>
    `;
    card.onclick = () => window.location.href = `product.html?id=${p.id}`;
    productsGrid.appendChild(card);
  });
}

// === FIRESTORE EN TIEMPO REAL ===
let allProducts = [];
const productosRef = collection(db, "productos");
onSnapshot(productosRef, (snapshot) => {
  allProducts = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    allProducts.push({
      id: doc.id,
      nombre: data.nombre || '',
      precio: data.precio || 0,
      precioAntiguo: data.precioAntiguo || null,
      descripcion: data.descripcion || '',
      imagen: data.imagen || '',
      nuevo: data.nuevo === true,
      estrella: data.estrella === true
    });
  });

  window.allProducts = allProducts;
  renderCarousel(newCarousel, p => p.nuevo);
  renderCarousel(starCarousel, p => p.estrella);
  renderGrid();
});

// === BÚSQUEDA ===
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const term = searchInput.value.trim().toLowerCase();
  if (term.length < 2) {
    searchResultsContainer.style.display = 'none';
    return;
  }

  searchTimeout = setTimeout(async () => {
    const q = query(
      collection(db, "productos"),
      where("nombre", ">=", term),
      where("nombre", "<=", term + '\uf8ff')
    );
    const snapshot = await getDocs(q);
    searchResults.innerHTML = '';
    if (snapshot.empty) {
      searchResults.innerHTML = '<p class="no-results">No se encontraron productos.</p>';
    } else {
      snapshot.forEach(doc => {
        const p = doc.data();
        const div = document.createElement('div');
        div.innerHTML = `<strong>${p.nombre}</strong><br><small>${p.descripcion}</small><br><strong>$${p.precio}</strong>`;
        div.style.padding = '10px 0';
        div.style.borderBottom = '1px solid #eee';
        div.style.cursor = 'pointer';
        div.onclick = () => window.location.href = `product.html?id=${doc.id}`;
        searchResults.appendChild(div);
      });
    }
    searchResultsContainer.style.display = 'block';
  }, 300);
});

document.addEventListener('click', (e) => {
  if (!searchBarHeader.contains(e.target) && !searchResultsContainer.contains(e.target)) {
    searchResultsContainer.style.display = 'none';
  }
});

// === MENÚ HAMBURGUESA ===
menuBtn.onclick = () => {
  menuOverlay.classList.add('show');
  menuSidebar.classList.add('open');
  updateAuthUI();
};

menuOverlay.onclick = () => {
  menuOverlay.classList.remove('show');
  menuSidebar.classList.remove('open');
};

// === CARRITO LATERAL ===
cartBtn.onclick = () => {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('show');
  updateCart();
};

closeCart.onclick = () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('show');
};

cartOverlay.onclick = () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('show');
};

// === BÚSQUEDA HEADER ===
searchBtn.onclick = () => {
  searchBarHeader.classList.add('active');
  headerOverlay.classList.add('show');
  searchInput.focus();
};

const closeSearch = () => {
  searchBarHeader.classList.remove('active');
  headerOverlay.classList.remove('show');
  searchResultsContainer.style.display = 'none';
};
closeSearchHeader.onclick = closeSearch;
headerOverlay.onclick = closeSearch;

// === AUTH ===
let isLoggedIn = localStorage.getItem('loggedIn') === 'true';
let userName = localStorage.getItem('userName') || '';

function updateAuthUI() {
  if (isLoggedIn && userName) {
    welcomeMsg.textContent = `¡Hola, ${userName}!`;
    authBtn.textContent = 'Cerrar sesión';
    authBtn.classList.add('logout-btn');
  } else {
    welcomeMsg.textContent = '';
    authBtn.textContent = 'Inicia sesión o regístrate';
    authBtn.classList.remove('logout-btn');
  }
}

authBtn.onclick = () => {
  if (isLoggedIn) {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAdmin');
    isLoggedIn = false;
    userName = '';
    showToast('Sesión cerrada');
    updateAuthUI();
  } else {
    window.location.href = 'login.html';
  }
};

helpBtn.onclick = () => {
  alert('Escríbenos a contacto@efrainshop.com o en Instagram @efrainshop');
};

// === TOAST ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// === INICIO ===
updateCart();
updateAuthUI();
