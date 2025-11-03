import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// ------------------------------
// VARIABLES Y ELEMENTOS DOM
// ------------------------------
const grid = document.getElementById("productsGrid");
const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const closeCart = document.getElementById("closeCart");
const toast = document.getElementById("toast");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const menuBtn = document.getElementById("menuBtn");
const menuOverlay = document.getElementById("menuOverlay");
const menuDropdown = document.getElementById("menuDropdown");
const menuClose = document.getElementById("menuClose");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ------------------------------
// FUNCIONES FIREBASE
// ------------------------------
async function cargarProductos() {
  grid.innerHTML = "<p style='text-align:center;color:#555;'>Cargando productos...</p>";
  try {
    const querySnapshot = await getDocs(collection(db, "productos"));
    if (querySnapshot.empty) {
      grid.innerHTML = "<p style='text-align:center;color:#777;'>No hay productos disponibles.</p>";
      return;
    }

    grid.innerHTML = "";
    querySnapshot.forEach(doc => {
      const p = doc.data();
      if (p.stock <= 0) return; // Solo mostrar en stock

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.imagen || "https://via.placeholder.com/300"}" alt="${p.nombre}">
        <div class="meta">
          <div class="title">${p.nombre}</div>
          <div class="price">$${p.precio}</div>
          <button data-id="${doc.id}" data-nombre="${p.nombre}" data-precio="${p.precio}" data-imagen="${p.imagen}">Agregar</button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Activar botones
    document.querySelectorAll(".card button").forEach(btn => {
      btn.addEventListener("click", e => {
        const producto = {
          id: e.target.dataset.id,
          nombre: e.target.dataset.nombre,
          precio: parseFloat(e.target.dataset.precio),
          imagen: e.target.dataset.imagen,
          cantidad: 1
        };
        agregarAlCarrito(producto);
      });
    });
  } catch (err) {
    console.error("Error al cargar productos:", err);
    grid.innerHTML = "<p style='text-align:center;color:red;'>Error al cargar productos.</p>";
  }
}

// ------------------------------
// FUNCIONES CARRITO
// ------------------------------
function agregarAlCarrito(prod) {
  const existente = cart.find(item => item.id === prod.id);
  if (existente) {
    existente.cantidad++;
  } else {
    cart.push(prod);
  }
  guardarCarrito();
  mostrarToast("Agregado al carrito");
  actualizarCarrito();
  animarCarrito();
}

function eliminarDelCarrito(id) {
  cart = cart.filter(item => item.id !== id);
  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  cartItems.innerHTML = "";
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty">Tu carrito está vacío 🛍️</div>';
    cartTotal.textContent = "Total: $0";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.cantidad} × ${item.nombre}</span>
      <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
      <button data-id="${item.id}">✕</button>
    `;
    total += item.precio * item.cantidad;
    cartItems.appendChild(div);
  });
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;

  document.querySelectorAll(".cart-item button").forEach(btn => {
    btn.addEventListener("click", e => eliminarDelCarrito(e.target.dataset.id));
  });
}

function guardarCarrito() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function mostrarToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1500);
}

function animarCarrito() {
  cartBtn.classList.add("shake");
  setTimeout(() => cartBtn.classList.remove("shake"), 1000);
}

// ------------------------------
// MENÚ Y CARRITO
// ------------------------------
cartBtn.addEventListener("click", () => {
  cartPanel.classList.toggle("open");
});

closeCart.addEventListener("click", () => {
  cartPanel.classList.remove("open");
});

menuBtn.addEventListener("click", () => {
  menuDropdown.classList.add("open");
  menuOverlay.classList.add("show");
});

menuOverlay.addEventListener("click", cerrarMenu);
menuClose.addEventListener("click", cerrarMenu);

function cerrarMenu() {
  menuDropdown.classList.remove("open");
  menuOverlay.classList.remove("show");
}

// ------------------------------
// INICIO
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarCarrito();
});
