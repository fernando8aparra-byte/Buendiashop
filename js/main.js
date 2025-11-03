import { db, auth, collection, getDocs, onAuthStateChanged } from "./firebase.js";

const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const closeCart = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const cartTotal = document.getElementById("cart-total");
const paymentOptions = document.getElementById("payment-options");
const cartCount = document.getElementById("cart-count");
const userInfo = document.getElementById("user-info");

// Variables globales
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ------------------------ AUTENTICACIÓN ------------------------
onAuthStateChanged(auth, user => {
  if (user) {
    userInfo.innerHTML = `Bienvenido, ${user.email}`;
    document.getElementById("auth-option").innerHTML = `<button onclick="logout()">Cerrar sesión</button>`;
  } else {
    userInfo.innerHTML = `<a href="login.html">Iniciar sesión / Registrarse</a>`;
    document.getElementById("auth-option").innerHTML = `<a href="login.html">Iniciar sesión / Registrarse</a>`;
  }
});

window.logout = () => {
  auth.signOut();
  location.reload();
};

// ------------------------ CARGAR PRODUCTOS ------------------------
async function cargarProductos() {
  const snapshot = await getDocs(collection(db, "productos"));
  productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  mostrarProductos(productos);
}
cargarProductos();

// ------------------------ MOSTRAR PRODUCTOS ------------------------
function mostrarProductos(lista) {
  productList.innerHTML = "";
  lista.forEach(prod => {
    if (!prod.habilitado) return;
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <h3>${prod.nombre}</h3>
      <p>${prod.descripcion}</p>
      <p><strong>$${Number(prod.precio).toFixed(2)}</strong></p>
      <button class="add-cart" data-id="${prod.id}">Agregar al carrito</button>
    `;
    productList.appendChild(div);
  });
}

// ------------------------ BUSCADOR ------------------------
searchInput.addEventListener("input", e => {
  const text = e.target.value.toLowerCase();
  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(text) ||
    p.descripcion.toLowerCase().includes(text)
  );
  mostrarProductos(filtrados);
});

// ------------------------ CARRITO ------------------------
document.addEventListener("click", e => {
  if (e.target.classList.contains("add-cart")) {
    const id = e.target.dataset.id;
    const prod = productos.find(p => p.id === id);
    const item = carrito.find(i => i.id === id);
    if (item) item.cantidad++;
    else carrito.push({ ...prod, cantidad: 1 });

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarrito();
    animarCarrito();
  }
});

function actualizarCarrito() {
  cartCount.textContent = carrito.reduce((a, b) => a + b.cantidad, 0);
  if (carrito.length === 0) {
    cartEmpty.classList.remove("hidden");
    paymentOptions.classList.add("hidden");
    cartItems.innerHTML = "";
    cartTotal.innerHTML = "";
    return;
  }
  cartEmpty.classList.add("hidden");
  paymentOptions.classList.remove("hidden");
  cartItems.innerHTML = carrito
    .map(p => `<div>${p.cantidad}x ${p.nombre} - $${(p.precio * p.cantidad).toFixed(2)}</div>`)
    .join("");
  const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  cartTotal.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
}
actualizarCarrito();

function animarCarrito() {
  cartBtn.classList.add("shake");
  setTimeout(() => cartBtn.classList.remove("shake"), 1000);
}

// ------------------------ MODAL CARRITO ------------------------
cartBtn.addEventListener("click", () => cartModal.classList.remove("hidden"));
closeCart.addEventListener("click", () => cartModal.classList.add("hidden"));
