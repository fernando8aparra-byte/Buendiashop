// Productos demo
const demoProducts = [
  { id: 1, nombre: "Gorra Oversize", precio: 450, categoria: "Gorras", img: "https://i.ibb.co/4p4J0kJ/gorra.jpg", tipo: "carrusel" },
  { id: 2, nombre: "Camiseta Premium", precio: 680, categoria: "Camisetas", img: "https://i.ibb.co/5x5Y5Y5/camiseta.jpg", tipo: "carrusel" },
  { id: 3, nombre: "Cinto Cuero", precio: 320, categoria: "Cintos", img: "https://i.ibb.co/5x5Y5Y5/cinto.jpg", tipo: "normal" },
  { id: 4, nombre: "Sudadera Negra", precio: 890, categoria: "Sudaderas", img: "https://i.ibb.co/5x5Y5Y5/sudadera.jpg", tipo: "principal" },
  // + más...
];

const DOM = {
  menuBtn: document.getElementById("menuBtn"),
  menuDropdown: document.getElementById("menuDropdown"),
  menuOverlay: document.getElementById("menuOverlay"),
  menuClose: document.getElementById("menuClose"),
  searchBtn: document.getElementById("searchBtn"),
  searchInput: document.getElementById("searchInput"),
  cartBtn: document.getElementById("cartBtn"),
  cartPanel: document.getElementById("cartPanel"),
  closeCart: document.getElementById("closeCart"),
  cartCount: document.getElementById("cartCount"),
  carouselGrid: document.getElementById("carouselGrid"),
  productsGrid: document.getElementById("productsGrid"),
  filters: document.getElementById("filters")
};

let cart = [], currentFilter = 'all';

// === MENU ===
DOM.menuBtn.onclick = () => {
  DOM.menuDropdown.classList.add('open');
  DOM.menuOverlay.classList.add('show');
};
DOM.menuClose.onclick = DOM.menuOverlay.onclick = () => {
  DOM.menuDropdown.classList.remove('open');
  DOM.menuOverlay.classList.remove('show');
};

// Submenús
document.querySelectorAll('.menu-header').forEach(h => {
  h.onclick = () => h.nextElementSibling.classList.toggle('open');
});

// === RENDER ===
function render() {
  // Carrusel
  const destacados = demoProducts.filter(p => p.tipo === 'carrusel' || p.tipo === 'principal');
  DOM.carouselGrid.innerHTML = destacados.map(p => `
    <div class="carousel-item">
      <img src="${p.img}" alt="${p.nombre}">
      <div><strong>${p.nombre}</strong><div>$${p.precio.toLocaleString()}</div></div>
    </div>
  `).join('');

  // Productos
  let list = demoProducts.filter(p => currentFilter === 'all' || p.categoria === currentFilter);
  DOM.productsGrid.innerHTML = list.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${p.nombre}">
      <div class="meta">
        <div class="title">${p.nombre}</div>
        <div class="price">$${p.precio.toLocaleString()}</div>
        <button class="addBtn" onclick="addToCart(${p.id})">Agregar</button>
      </div>
    </div>
  `).join('');
}

function addToCart(id) {
  const p = demoProducts.find(x => x.id === id);
  cart.push(p);
  DOM.cartCount.textContent = cart.length;
  showToast("¡Agregado al carrito!");
}

// === FILTROS ===
DOM.filters.onclick = e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  DOM.filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter === 'all' ? 'all' : btn.dataset.filter === 'precio-asc' ? 'asc' : 'desc';
  render();
};

// === INIT ===
render();
