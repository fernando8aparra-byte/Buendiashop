// --- CONFIGURACIÓN INICIAL ---
import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const grid = document.querySelector(".grid");
const searchInput = document.querySelector("#searchInput");
const cartBtn = document.querySelector("#cartBtn");
const menuBtn = document.querySelector("#menuBtn");
const cartPanel = document.querySelector(".cart-panel");
const cartItems = document.querySelector(".cart-items");
const cartFooter = document.querySelector(".cart-footer");
const cartTotal = document.querySelector(".cart-total");
const toast = document.querySelector(".toast");
const overlay = document.querySelector(".menu-overlay");
const menu = document.querySelector(".menu-dropdown");

// Submenús
const submenuProductos = document.querySelector("#submenu-productos");
const submenuNosotros = document.querySelector("#submenu-nosotros");
const toggleProductos = document.querySelector("#toggle-productos");
const toggleNosotros = document.querySelector("#toggle-nosotros");

// --- VARIABLES GLOBALES ---
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// --- FUNCIONES FIREBASE ---
async function cargarProductos() {
  try {
    const snap = await getDocs(collection(db, "productos"));
    productos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderProductos(productos);
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// --- MOSTRAR PRODUCTOS ---
function renderProductos(lista) {
  grid.innerHTML = "";

  if (lista.length === 0) {
    grid.innerHTML = `<p style="text-align:center;color:#777;">No se encontraron productos.</p>`;
    return;
  }

  lista.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.imagen || "https://via.placeholder.com/150"}" alt="${p.nombre}">
      <div class="meta">
        <div class="title">${p.nombre}</div>
        <div class="price">$${p.precio}</div>
        <button data-id="${p.id}">Agregar al carrito</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// --- CARRITO ---
function renderCarrito() {
  cartItems.innerHTML = "";
  if (carrito.length === 0) {
    cartItems.innerHTML = `<div class="cart-empty">Tu carrito está vacío</div>`;
    cartFooter.classList.remove("show");
    return;
  }

  carrito.forEach((item) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.cantidad}x ${item.nombre}</span>
      <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
      <button data-id="${item.id}">x</button>
    `;
    cartItems.appendChild(div);
  });

  const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  cartFooter.classList.add("show");
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// --- AGREGAR AL CARRITO ---
grid.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const id = e.target.dataset.id;
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    const existente = carrito.find((p) => p.id === id);
    if (existente) {
      existente.cantidad++;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }

    renderCarrito();
    mostrarToast("✅ Producto agregado");
    animarCarrito();
  }
});

// --- ELIMINAR DEL CARRITO ---
cartItems.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const id = e.target.dataset.id;
    carrito = carrito.filter((p) => p.id !== id);
    renderCarrito();
  }
});

// --- BUSCAR PRODUCTOS ---
searchInput.addEventListener("input", (e) => {
  const txt = e.target.value.toLowerCase();
  const filtrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(txt) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(txt))
  );
  renderProductos(filtrados);
});

// --- TOAST DE CONFIRMACIÓN ---
function mostrarToast(texto) {
  toast.textContent = texto;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1500);
}

// --- ANIMAR ICONO DE CARRITO ---
function animarCarrito() {
  cartBtn.classList.add("shake");
  setTimeout(() => cartBtn.classList.remove("shake"), 1000);
}

// --- MENÚ LATERAL ---
menuBtn.addEventListener("click", () => {
  menu.classList.add("open");
  overlay.classList.add("show");
});
overlay.addEventListener("click", cerrarMenu);
document.querySelector(".menu-close").addEventListener("click", cerrarMenu);

function cerrarMenu() {
  menu.classList.remove("open");
  overlay.classList.remove("show");
}

// --- DESPLEGABLES ---
toggleProductos.addEventListener("click", () => {
  submenuProductos.classList.toggle("open");
});
toggleNosotros.addEventListener("click", () => {
  submenuNosotros.classList.toggle("open");
});

// --- PANEL DE CARRITO ---
cartBtn.addEventListener("click", () => {
  cartPanel.classList.toggle("open");
});

// --- INICIO ---
window.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
  renderCarrito();
});
