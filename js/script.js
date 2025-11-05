// js/script.js
import { db, loadConfig } from "./firebase.js";

const DOM = {
  welcomeBar: document.getElementById("welcomeBar"),
  menuBtn: document.getElementById("menuBtn"),
  menuDropdown: document.getElementById("menuDropdown"),
  menuOverlay: document.getElementById("menuOverlay"),
  menuClose: document.getElementById("menuClose"),
  menuCuentaBtn: document.getElementById("menuCuentaBtn"),
  submenuCuenta: document.getElementById("submenuCuenta"),
  menuProductosBtn: document.getElementById("menuProductosBtn"),
  submenuProductos: document.getElementById("submenuProductos"),
  menuNosotrosBtn: document.getElementById("menuNosotrosBtn"),
  submenuNosotros: document.getElementById("submenuNosotros"),
  menuEstadoSesion: document.getElementById("menuEstadoSesion"),
  searchBtn: document.getElementById("searchBtn"),
  searchInput: document.getElementById("searchInput"),
  cartBtn: document.getElementById("cartBtn"),
  cartPanel: document.getElementById("cartPanel"),
  closeCart: document.getElementById("closeCart"),
  cartItemsEl: document.getElementById("cartItems"),
  cartFooter: document.getElementById("cartFooter"),
  cartTotalEl: document.getElementById("cartTotal"),
  toastEl: document.getElementById("toast"),
  productsGrid: document.getElementById("productsGrid"),
  carouselTrack: document.getElementById("carouselTrack"),
  starAdsEl: document.getElementById("starAds"),
  logoCenter: document.getElementById("logoCenter"),
  modal: document.getElementById("productModal"),
  modalBody: document.getElementById("modalBody"),
  modalClose: document.getElementById("modalClose"),
  filters: document.getElementById("filters")
};

let products = [];
let currentFilter = 'all';

// === LOCALSTORAGE ===
const getProducts = () => JSON.parse(localStorage.getItem("productos") || "[]");
const saveProducts = (p) => localStorage.setItem("productos", JSON.stringify(p));
const getCart = () => JSON.parse(localStorage.getItem("cart") || "[]");
const saveCart = (c) => localStorage.setItem("cart", JSON.stringify(c));

// === INIT SAMPLE DATA ===
if (!getProducts().length) {
  const SAMPLE = [/* tus productos */];
  saveProducts(SAMPLE);
}

// === RENDER ===
function renderProducts(list) {
  DOM.productsGrid.innerHTML = list.length ? "" : '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">No hay productos</p>';
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
      <div class="meta">
        <div class="title">${p.nombre}</div>
        <div class="price">$${p.precio}</div>
        <div class="small-muted">${p.categoria} • Stock ${p.stock}</div>
        <div style="margin-top:8px;display:flex;gap:8px;">
          <button class="addBtn" data-id="${p.id}" ${!p.talla?.length ? '' : 'disabled'}>Agregar</button>
          <button class="viewBtn" data-id="${p.id}">Ver</button>
        </div>
      </div>
    `;
    DOM.productsGrid.appendChild(card);
  });
}

// === CARRUSEL (duplicado infinito) ===
function setupCarousel(items) {
  if (!items.length) return DOM.carouselWrap.style.display = "none";
  const dup = [...items, ...items];
  DOM.carouselTrack.innerHTML = dup.map(p => `
    <div class="carousel-item">
      <img src="${p.img}" alt="${p.nombre}">
      <div><strong>${p.nombre}</strong><div style="color:var(--text-muted)">$${p.precio}</div></div>
    </div>
  `).join('');
  DOM.carouselTrack.onmouseenter = () => DOM.carouselTrack.classList.add('paused');
  DOM.carouselTrack.onmouseleave = () => DOM.carouselTrack.classList.remove('paused');
}

// === MODAL ===
function openModal(product) {
  DOM.modalBody.innerHTML = `
    <img src="${product.img}" alt="${product.nombre}">
    <div class="modal-info">
      <h2>${product.nombre}</h2>
      <p>${product.descripcion}</p>
      <div class="price">$${product.precio}</div>
      ${product.talla?.length ? `
        <div style="margin:16px 0;">
          <strong>Talla:</strong><br>
          ${product.talla.map(t => `<button class="talla-btn" data-talla="${t}">${t}</button>`).join('')}
        </div>
        <button id="addToCartModal" class="addBtn" style="width:100%;padding:12px;margin-top:8px;" disabled>Agregar al carrito</button>
      ` : `<button id="addToCartModal" class="addBtn" style="width:100%;padding:12px;margin-top:8px;">Agregar al carrito</button>`}
    </div>
  `;
  DOM.modal.classList.add("open");
  let selectedTalla = null;

  DOM.modalBody.querySelectorAll(".talla-btn").forEach(btn => {
    btn.onclick = () => {
      DOM.modalBody.querySelectorAll(".talla-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedTalla = btn.dataset.talla;
      DOM.modalBody.querySelector("#addToCartModal").disabled = false;
    };
  });

  DOM.modalBody.querySelector("#addToCartModal").onclick = () => {
    addToCart(product.id, selectedTalla);
    closeModal();
  };
}

function closeModal() {
  DOM.modal.classList.remove("open");
}

// === CARRITO ===
function renderCart() {
  const cart = getCart();
  DOM.cartItemsEl.innerHTML = cart.length ? "" : '<div class="cart-empty">Tu carrito está vacío</div>';
  if (!cart.length) {
    DOM.cartFooter.style.display = "none";
    DOM.cartCount.textContent = "0";
    return;
  }
  DOM.cartFooter.style.display = "block";
  let total = 0;
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <button class="remove-btn" data-id="${item.id}">✕</button>
      <img src="${p.img}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;">
      <div style="flex:1"><div style="font-weight:700">${p.nombre}</div>${item.talla ? `<div style="color:var(--text-muted)">Talla: ${item.talla}</div>` : ''}<div style="color:var(--text-muted)">x${item.qty}</div></div>
      <div style="font-weight:800">$${p.precio * item.qty}</div>
    `;
    DOM.cartItemsEl.appendChild(div);
    total += p.precio * item.qty;
  });
  DOM.cartCount.textContent = cart.reduce((a,c) => a + c.qty, 0);
  DOM.cartTotalEl.textContent = `$${total}`;
}

function addToCart(id, talla = null) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const cart = getCart();
  const key = talla ? `${id}-${talla}` : id;
  const idx = cart.findIndex(c => (talla ? c.talla === talla && c.id === id : !c.talla && c.id === id));
  if (idx >= 0) cart[idx].qty += 1;
  else cart.push({ id, qty: 1, talla });
  saveCart(cart);
  DOM.cartBtn.classList.add("cart-shake");
  setTimeout(() => DOM.cartBtn.classList.remove("cart-shake"), 1000);
  showToast(talla ? `Agregado talla ${talla}` : "Agregado al carrito");
  renderCart();
}

function removeFromCart(id, talla) {
  let cart = getCart().filter(c => !(c.id === id && c.talla === talla));
  saveCart(cart);
  renderCart();
  showToast("Eliminado");
}

// === FILTROS ===
DOM.filters.addEventListener("click", e => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  DOM.filters.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter;
  filterProducts();
});

function filterProducts() {
  let list = [...products];
  const q = DOM.searchInput.value.trim().toLowerCase();
  if (q) list = list.filter(p => (p.nombre + " " + (p.descripcion || "")).toLowerCase().includes(q));
  if (currentFilter === "precio-asc") list.sort((a,b) => a.precio - b.precio);
  if (currentFilter === "precio-desc") list.sort((a,b) => b.precio - a.precio);
  renderProducts(list);
}

// === EVENTOS ===
DOM.menuBtn.onclick = () => { DOM.menuDropdown.classList.add("open"); DOM.menuOverlay.classList.add("show"); };
DOM.menuClose.onclick = DOM.menuOverlay.onclick = () => { DOM.menuDropdown.classList.remove("open"); DOM.menuOverlay.classList.remove("show"); };
DOM.cartBtn.onclick = () => DOM.cartPanel.classList.toggle("open");
DOM.closeCart.onclick = () => DOM.cartPanel.classList.remove("open");
DOM.modalClose.onclick = closeModal;
DOM.modal.onclick = e => e.target === DOM.modal && closeModal();

DOM.productsGrid.addEventListener("click", e => {
  const view = e.target.closest(".viewBtn");
  const add = e.target.closest(".addBtn");
  if (view) { openModal(products.find(p => p.id === view.dataset.id)); }
  if (add && !add.disabled) { addToCart(add.dataset.id); }
});

DOM.cartItemsEl.addEventListener("click", e => {
  const remove = e.target.closest(".remove-btn");
  if (remove) {
    const item = getCart().find(c => c.id === remove.dataset.id);
    removeFromCart(item.id, item.talla);
  }
});

DOM.searchBtn.onclick = (e) => {
  e.stopPropagation();
  DOM.searchBtn.style.display = "none";
  DOM.logoCenter.style.opacity = "0";
  DOM.searchInput.style.display = "block";
  setTimeout(() => DOM.searchInput.classList.add("centered"), 10);
  DOM.searchInput.focus();
};

DOM.searchInput.addEventListener("input", () => filterProducts());
DOM.searchInput.addEventListener("click", e => e.stopPropagation());

document.addEventListener("click", e => {
  if (DOM.searchInput.classList.contains("centered") && !DOM.searchInput.contains(e.target) && !DOM.searchBtn.contains(e.target)) {
    DOM.searchInput.classList.remove("centered");
    setTimeout(() => {
      DOM.searchInput.style.display = "none";
      DOM.searchBtn.style.display = "flex";
      DOM.logoCenter.style.opacity = "1";
    }, 300);
  }
  if (DOM.cartPanel.classList.contains("open") && !DOM.cartPanel.contains(e.target) && !DOM.cartBtn.contains(e.target)) {
    DOM.cartPanel.classList.remove("open");
  }
});

// === INIT ===
(async () => {
  products = getProducts();
  renderProducts(products);
  setupCarousel(products.filter(p => p.estrella));
  renderCart();
  updateSessionUI();
})();
