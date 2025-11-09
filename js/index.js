// index.js - CARRITO CON ID + IMAGEN + type.anuncio + type.carrusel + type.normal + STOCK
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

// === CARRITO (GUARDADO EN LOCALSTORAGE) ===
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

// === AGREGAR AL CARRITO (CON ID + IMAGEN + PRECIO) ===
window.addToCart = (id) => {
  const product = window.allProducts.find(p => p.id === id);
  if (!product) {
    showToast("Producto no encontrado");
    return;
  }
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      imagen: product.imagen,
      qty: 1
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  showToast('¡Agregado al carrito!');
};

window.removeFromCart = (i) => {
  cart.splice(i, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  showToast('Producto eliminado');
};

goToPay.onclick = () => {
  if (cart.length === 0) return;
  window.location.href = 'pago.html';
};

// === RENDER CARRUSEL ===
function renderCarousel(container, filterFn) {
  container.innerHTML = '';
  const filtered = window.allProducts.filter(filterFn);
 
  if (filtered.length === 0) {
    container.innerHTML = '<p style="color:#999; padding:20px; text-align:center;">No hay productos</p>';
    return;
  }
  // Duplicar para efecto infinito
  [...filtered, ...filtered].forEach(p => {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    const stock = p.disponibles > 0 ? `<p class="stock-info">${p.disponibles} disponibles</p>` : '';
    item.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <h4>${p.nombre}</h4>
      <p>$${p.precio.toLocaleString()}</p>
      ${stock}
    `;
    item.onclick = () => window.location.href = `product.html?id=${p.id}`;
    container.appendChild(item);
  });
}

// === RENDER GRILLA ===
function renderGrid() {
  productsGrid.innerHTML = '';
  const normales = window.allProducts.filter(p => p.type && p.type.normal);
  if (normales.length === 0) {
    productsGrid.innerHTML = '<p style="color:#999; padding:20px; text-align:center;">No hay productos disponibles</p>';
    return;
  }
  normales.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    const stock = p.disponibles > 0 ? `<p class="stock-info">${p.disponibles} disponibles</p>` : '';
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <div class="card-info">
        <h3>${p.nombre}</h3>
        <p class="desc">${p.descripcion || ''}</p>
        ${stock}
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
      type: data.type || { normal: true },
      talla: data.talla || [],
      tipo: data.tipo || '',
      disponibles: data.disponibles || 0  // ← NUEVO
    });
  });
  window.allProducts = allProducts;
  renderCarousel(newCarousel, p => p.type?.carrusel === true);
  renderCarousel(starCarousel, p => p.type?.anuncio === true);
  renderGrid();
});

// === BÚSQUEDA EN TIEMPO REAL ===
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
        div.innerHTML = `
          <strong>${p.nombre}</strong><br>
          <small>${p.descripcion || 'Sin descripción'}</small><br>
          <strong>$${p.precio.toLocaleString()}</strong>
          ${p.disponibles > 0 ? `<br><small style="color:#0a0;">${p.disponibles} disponibles</small>` : ''}
        `;
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

// Cerrar búsqueda al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!searchBarHeader.contains(e.target) && !searchResultsContainer.contains(e.target)) {
    searchResultsContainer.style.display = 'none';
  }
});

// === MENÚ, CARRITO, BÚSQUEDA, AUTH ===
menuBtn.onclick = () => {
  menuOverlay.classList.add('show');
  menuSidebar.classList.add('open');
  updateAuthUI();
};
menuOverlay.onclick = () => {
  menuOverlay.classList.remove('show');
  menuSidebar.classList.remove('open');
};
cartBtn.onclick = () => {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('show');
  updateCart();
};
closeCart.onclick = cartOverlay.onclick = () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('show');
};
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
closeSearchHeader.onclick = headerOverlay.onclick = closeSearch;

// === AUTENTICACIÓN ===
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

// === INICIAR ===
updateCart();
updateAuthUI();
