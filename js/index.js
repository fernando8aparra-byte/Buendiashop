// index.js - ACTUALIZADO: CARRUSEL 1x1 + SCROLL INTELIGENTE
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

// === CARRITO ===
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// === FUNCIÓN: CREAR ITEM CARRUSEL ===
function createCarouselItem(product) {
  const item = document.createElement('div');
  item.className = 'carousel-item';
  item.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h4>${product.name}</h4>
    <p>$${product.price}</p>
  `;
  item.onclick = () => addToCart(product);
  return item;
}

// === FUNCIÓN: SETUP CARRUSEL (1 POR VEZ) ===
function setupCarousel(trackElement, products) {
  if (!trackElement || !products.length) return;

  trackElement.innerHTML = '';
  products.forEach(p => trackElement.appendChild(createCarouselItem(p)));

  const container = trackElement.parentElement;
  const items = trackElement.children;
  let currentIndex = 0;

  const prevBtn = container.querySelector('.carousel-btn.prev');
  const nextBtn = container.querySelector('.carousel-btn.next');

  function updateButtons() {
    const totalWidth = trackElement.scrollWidth;
    const containerWidth = container.clientWidth;

    if (totalWidth <= containerWidth + 50) {
      prevBtn.classList.add('hidden');
      nextBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
      nextBtn.classList.remove('hidden');
    }

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= items.length - 1;
  }

  function moveTo(index) {
    const itemWidth = items[0].offsetWidth + 16;
    trackElement.style.transform = `translateX(-${index * itemWidth}px)`;
    currentIndex = index;
    updateButtons();
  }

  nextBtn.onclick = () => currentIndex < items.length - 1 && moveTo(currentIndex + 1);
  prevBtn.onclick = () => currentIndex > 0 && moveTo(currentIndex - 1);

  // Inicializar
  updateButtons();
  window.addEventListener('resize', updateButtons);
}

// === CARGAR PRODUCTOS ===
async function loadProducts() {
  const q = query(collection(db, "products"));
  onSnapshot(q, (snapshot) => {
    const nuevos = [];
    const anuncios = [];
    const todos = [];

    snapshot.forEach(doc => {
      const p = { id: doc.id, ...doc.data() };
      todos.push(p);

      if (p.type === 'carrusel') nuevos.push(p);
      if (p.type === 'anuncio') anuncios.push(p);
    });

    // Carruseles
    setupCarousel(newCarousel, nuevos);
    setupCarousel(starCarousel, anuncios);

    // Grid
    productsGrid.innerHTML = '';
    todos.filter(p => p.type === 'normal').forEach(p => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>$${p.price}</p>
        <button class="add-to-cart">Agregar</button>
      `;
      div.querySelector('.add-to-cart').onclick = () => addToCart(p);
      productsGrid.appendChild(div);
    });

    updateCart();
  });
}

// === CARRITO ===
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  showToast('Agregado al carrito');
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  cartBadge.textContent = cart.reduce((sum, i) => sum + i.quantity, 0) || '';
  cartBadge.style.display = cart.length ? 'block' : 'none';

  cartItems.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
  } else {
    cart.forEach(item => {
      total += item.price * item.quantity;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;">
        <div style="flex:1;margin-left:10px;">
          <h4 style="margin:0;font-size:0.95rem;">${item.name}</h4>
          <p style="margin:5px 0;color:#666;">$${item.price} x ${item.quantity}</p>
        </div>
        <button>X</button>
      `;
      div.querySelector('button').onclick = () => removeFromCart(item.id);
      cartItems.appendChild(div);
    });
  }

  cartTotal.textContent = `Total: $${total}`;
  goToPay.style.display = cart.length ? 'block' : 'none';
}

// === TOAST ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// === BÚSQUEDA ===
searchInput.addEventListener('input', async () => {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    searchResultsContainer.style.display = 'none';
    return;
  }

  const q = query(collection(db, "products"), where("keywords", "array-contains", term));
  const snapshot = await getDocs(q);
  searchResults.innerHTML = '';

  if (snapshot.empty) {
    searchResults.innerHTML = '<p class="no-results">No se encontraron productos</p>';
  } else {
    snapshot.forEach(doc => {
      const p = doc.data();
      const div = document.createElement('div');
      div.style = 'padding:10px;border-bottom:1px solid #eee;cursor:pointer;display:flex;gap:10px;align-items:center;';
      div.innerHTML = `<img src="${p.image}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;">
                       <div><strong>${p.name}</strong><br>$${p.price}</div>`;
      div.onclick = () => {
        addToCart({ id: doc.id, ...p });
        searchInput.value = '';
        searchResultsContainer.style.display = 'none';
      };
      searchResults.appendChild(div);
    });
  }
  searchResultsContainer.style.display = 'block';
});

// === INICIAR ===
loadProducts();
