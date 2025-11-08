import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit
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
const productMain = document.getElementById('productMain');
const relatedGrid = document.getElementById('relatedGrid');
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

window.addToCart = (id) => {
  const product = window.currentProduct || window.allProducts?.find(p => p.id === id);
  if (!product) return showToast("Producto no disponible");

  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ id: product.id, nombre: product.nombre, precio: product.precio, imagen: product.imagen, qty: 1 });

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
  // Agregar producto actual al carrito si no está
  if (window.currentProduct && !cart.some(i => i.id === window.currentProduct.id)) {
    addToCart(window.currentProduct.id);
  }
  window.location.href = 'pago.html';
};

// === CARGAR PRODUCTO POR ID ===
async function loadProduct() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (!productId) {
    productMain.innerHTML = '<p>Producto no encontrado.</p>';
    return;
  }

  try {
    const docRef = doc(db, "productos", productId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      productMain.innerHTML = '<p>Producto no encontrado.</p>';
      return;
    }

    const p = { id: docSnap.id, ...docSnap.data() };
    window.currentProduct = p;

    productMain.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <div class="product-info">
        <h1>${p.nombre}</h1>
        <p class="desc">${p.descripcion || 'Sin descripción'}</p>
        <div class="price">$${p.precio.toLocaleString()}</div>
        <div class="go-to-pay" onclick="addToCart('${p.id}')">Ir a Pagar</div>
      </div>
    `;

    loadRelatedProducts(p);
  } catch (err) {
    console.error(err);
    productMain.innerHTML = '<p>Error al cargar el producto.</p>';
  }
}

// === PRODUCTOS RELACIONADOS (por nombre o tipo) ===
async function loadRelatedProducts(mainProduct) {
  relatedGrid.innerHTML = '<p>Cargando relacionados...</p>';

  const keywords = mainProduct.nombre.toLowerCase().split(' ');
  const tipo = mainProduct.tipo;

  const q = query(
    collection(db, "productos"),
    where("id", "!=", mainProduct.id),
    limit(8)
  );

  try {
    const snapshot = await getDocs(q);
    let related = [];

    snapshot.forEach(doc => {
      const p = { id: doc.id, ...doc.data() };
      const nameMatch = keywords.some(k => p.nombre.toLowerCase().includes(k));
      const typeMatch = tipo && p.tipo === tipo;
      if (nameMatch || typeMatch) related.push(p);
    });

    // Si hay pocos, completar con aleatorios
    if (related.length < 4) {
      const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const extras = all.filter(p => p.id !== mainProduct.id && !related.some(r => r.id === p.id));
      related = [...related, ...extras.slice(0, 4 - related.length)];
    }

    if (related.length === 0) {
      relatedGrid.innerHTML = '<p>No hay productos relacionados.</p>';
      return;
    }

    relatedGrid.innerHTML = '';
    related.forEach(p => {
      const card = document.createElement('div');
      card.className = 'related-card';
      card.onclick = () => window.location.href = `product.html?id=${p.id}`;
      card.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
        <h4>${p.nombre}</h4>
        <div class="price">$${p.precio.toLocaleString()}</div>
      `;
      relatedGrid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    relatedGrid.innerHTML = '<p>Error al cargar relacionados.</p>';
  }
}

// === BÚSQUEDA (igual que index) ===
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
        div.innerHTML = `<strong>${p.nombre}</strong><br><small>$${p.precio.toLocaleString()}</small>`;
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
  if (!searchBarHeader.contains(e.target) && !…searchResultsContainer.contains(e.target)) {
    searchResultsContainer.style.display = 'none';
  }
});

// === MENÚ, CARRITO, etc. (IGUAL) ===
menuBtn.onclick = () => { menuOverlay.classList.add('show'); menuSidebar.classList.add('open'); updateAuthUI(); };
menuOverlay.onclick = () => { menuOverlay.classList.remove('show'); menuSidebar.classList.remove('open'); };
cartBtn.onclick = () => { cartSidebar.classList.add('open'); cartOverlay.classList.add('show'); updateCart(); };
closeCart.onclick = cartOverlay.onclick = () => { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('show'); };
searchBtn.onclick = () => { searchBarHeader.classList.add('active'); headerOverlay.classList.add('show'); searchInput.focus(); };
const closeSearch = () => { searchBarHeader.classList.remove('active'); headerOverlay.classList.remove('show'); searchResultsContainer.style.display = 'none'; };
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
    localStorage.removeItem('loggedIn'); localStorage.removeItem('userName'); isLoggedIn = false; userName = '';
    showToast('Sesión cerrada'); updateAuthUI();
  } else {
    window.location.href = 'login.html';
  }
};
helpBtn.onclick = () => alert('Escríbenos a contacto@efrainshop.com o en Instagram @efrainshop');

// === TOAST ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
// === BOTÓN "INICIO" O "ADMIN" EN MENÚ ===
const homeBtn = document.getElementById('homeBtn');
function updateHomeButton() {
  const isProductPage = window.location.pathname.includes('product.html');
  const isAdminPage = window.location.pathname.includes('admin.html');

  if (isProductPage) {
    homeBtn.textContent = 'Inicio';
    homeBtn.onclick = () => window.location.href = 'index.html';
  } else if (isAdminPage) {
    homeBtn.textContent = 'Admin';
    homeBtn.onclick = () => window.location.href = 'admin.html';
  } else {
    homeBtn.style.display = 'none';
  }
}
// === INICIAR ===
updateCart();
updateAuthUI();
loadProduct();
