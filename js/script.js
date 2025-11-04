// === Inicializar Firebase ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBi49isj_vzkCzIyJLxsAQ_4n3_zMu4txs",
  authDomain: "buendiashop-f3dcc.firebaseapp.com",
  projectId: "buendiashop-f3dcc",
  storageBucket: "buendiashop-f3dcc.appspot.com",
  messagingSenderId: "181970112547",
  appId: "1:181970112547:web:99072e1c4692bb195e6196",
  measurementId: "G-1Z5CKSCJDZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === Referencias DOM ===
const menuBtn = document.getElementById("menuBtn");
const menu = document.querySelector(".menu-dropdown");
const overlay = document.querySelector(".menu-overlay");
const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.querySelector(".cart-panel");
const closeCartBtn = document.getElementById("closeCart");
const productsGrid = document.querySelector(".grid");
const searchInput = document.getElementById("search");
const toast = document.querySelector(".toast");
const cartItemsContainer = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartEmpty = document.querySelector(".cart-empty");
const payBtns = document.querySelector(".payment-options");

let cart = [];
let products = [];

// === FUNCIONES ===

// Mostrar mensaje flotante
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// Mostrar productos
function renderProducts(filter = "") {
  productsGrid.innerHTML = "";
  const filtered = products.filter(p =>
    p.nombre.toLowerCase().includes(filter.toLowerCase())
  );

  filtered.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}" alt="${p.nombre}">
      <div class="meta">
        <div class="title">${p.nombre}</div>
        <div class="price">$${p.precio}</div>
        <button data-id="${p.id}">Agregar</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// Cargar productos desde Firebase
async function loadProducts() {
  const querySnapshot = await getDocs(collection(db, "productos"));
  products = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  renderProducts();
}

loadProducts();

// === MENÚ LATERAL ===
menuBtn.addEventListener("click", () => {
  menu.classList.toggle("open");
  overlay.classList.toggle("show");
});

overlay.addEventListener("click", () => {
  menu.classList.remove("open");
  overlay.classList.remove("show");
});

// Submenús desplegables
document.querySelectorAll(".menu-item").forEach((item) => {
  item.addEventListener("click", () => {
    const submenu = item.nextElementSibling;
    if (submenu && submenu.classList.contains("submenu")) {
      submenu.classList.toggle("show");
    }
  });
});

// === CARRITO ===
cartBtn.addEventListener("click", () => {
  cartPanel.classList.add("open");
});

closeCartBtn.addEventListener("click", () => {
  cartPanel.classList.remove("open");
});

document.addEventListener("click", (e) => {
  if (e.target.matches(".card button")) {
    const id = e.target.dataset.id;
    const product = products.find(p => p.id === id);
    addToCart(product);
  }
});

function addToCart(product) {
  const existing = cart.find(p => p.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
  showToast("Producto agregado al carrito 🛒");
}

function renderCart() {
  cartItemsContainer.innerHTML = "";
  if (cart.length === 0) {
    cartEmpty.style.display = "block";
    payBtns.style.display = "none";
    cartTotal.textContent = "";
    return;
  }
  cartEmpty.style.display = "none";
  payBtns.style.display = "flex";

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <span>${item.nombre} x${item.qty}</span>
      <span>$${item.precio * item.qty}</span>
      <button data-id="${item.id}">✕</button>
    `;
    cartItemsContainer.appendChild(row);
  });

  const total = cart.reduce((sum, p) => sum + p.precio * p.qty, 0);
  cartTotal.textContent = `Total: $${total}`;
}

cartItemsContainer.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const id = e.target.dataset.id;
    cart = cart.filter(p => p.id !== id);
    renderCart();
  }
});

// === BÚSQUEDA ===
searchInput.addEventListener("input", (e) => {
  renderProducts(e.target.value);
});

// === LOGIN ===
document.querySelector(".login-btn").addEventListener("click", () => {
  window.location.href = "login.html";
});
