import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);
const grid = document.getElementById("productsGrid");
const cartPanel = document.getElementById("cartPanel");
const cartBtn = document.getElementById("cartBtn");
const closeCart = document.getElementById("closeCart");
const toast = document.getElementById("toast");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

let cart = [];

// === Cargar productos desde Firestore ===
async function cargarProductos() {
  const querySnapshot = await getDocs(collection(db, "productos"));
  grid.innerHTML = "";
  querySnapshot.forEach((doc) => {
    const p = doc.data();
    if (p.stock > 0) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <div class="meta">
          <div class="title">${p.nombre}</div>
          <div class="price">$${p.precio.toLocaleString("es-MX")}</div>
          <button class="add-btn">Agregar al carrito</button>
        </div>
      `;
      card.querySelector(".add-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        agregarCarrito(p);
      });
      grid.appendChild(card);
    }
  });
}
cargarProductos();

// === Carrito ===
cartBtn.onclick = () => cartPanel.classList.add("open");
closeCart.onclick = () => cartPanel.classList.remove("open");

function agregarCarrito(p) {
  cart.push(p);
  renderCarrito();
  showToast("Agregado al carrito");
}

function renderCarrito() {
  cartItems.innerHTML = "";
  if (cart.length === 0) {
    cartItems.innerHTML = `<div class="cart-empty">Tu carrito está vacío 🛍️</div>`;
    cartTotal.textContent = "Total: $0";
    return;
  }
  let total = 0;
  cart.forEach((p, i) => {
    const item = document.createElement("div");
    item.className = "cart-item";
    item.innerHTML = `
      <span>${p.nombre}</span>
      <span>$${p.precio.toLocaleString("es-MX")}</span>
      <button onclick="removeItem(${i})">✕</button>
    `;
    cartItems.appendChild(item);
    total += p.precio;
  });
  cartTotal.textContent = "Total: $" + total.toLocaleString("es-MX");
}

window.removeItem = (i) => {
  cart.splice(i, 1);
  renderCarrito();
};

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}
