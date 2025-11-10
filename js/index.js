// js/index.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  doc
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
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const menuSidebar = document.getElementById('menuSidebar');
const closeMenu = document.getElementById('closeMenu');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const searchBtn = document.getElementById('searchBtn');
const searchContainer = document.getElementById('searchContainer');
const closeSearch = document.getElementById('closeSearch');
const searchInput = document.getElementById('searchInput');
const searchResultsContainer = document.getElementById('searchResultsContainer');
const searchResults = document.getElementById('searchResults');
const starCarousel = document.getElementById('starCarousel');
const productsGrid = document.getElementById('productsGrid');
const cartBadge = document.getElementById('cartBadge');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const goToPay = document.getElementById('goToPay');
const toast = document.getElementById('toast');
const welcomeMsg = document.getElementById('welcomeMsg');
const authBtn = document.getElementById('authBtn');
const helpBtn = document.getElementById('helpBtn');

// === TÍTULOS DINÁMICOS ===
function loadTitles() {
  onSnapshot(doc(db, "textos", "hero"), (snap) => {
    if (snap.exists()) {
      const { titulo, subtitulo } = snap.data();
      document.getElementById("heroTitle").textContent = titulo || "Asegura tu Mystery Box";
      document.getElementById("heroTag").textContent = subtitulo || "Envío Gratis en compras +$1,500";
    }
  });

  onSnapshot(doc(db, "textos", "secciones"), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      document.getElementById("titleNew").textContent = data.nuevos_lanzamientos || "Nuevos Lanzamientos";
      document.getElementById("titleStar").textContent = data.productos_estrella || "Anuncios";
      document.getElementById("titleAll").textContent = data.todos_productos || "Todos los Productos";
    }
  });
}

// === CARGAR TIPOS DE PRODUCTOS ===
async function loadProductTypes() {
  const submenu = document.getElementById('categoriesSubmenu');
  submenu.innerHTML = '<div class="submenu-item">Cargando...</div>';

  try {
    const snapshot = await getDocs(collection(db, "productos"));
    const tipos = new Set();
    snapshot.forEach(doc => {
      const tipo = doc.data().tipo;
      if (tipo) tipos.add(tipo);
    });

    submenu.innerHTML = '';
    if (tipos.size === 0) {
      submenu.innerHTML = '<div class="submenu-item">No hay categorías</div>';
      return;
    }

    [...tipos].sort().forEach(tipo => {
      const item = document.createElement('div');
      item.className = 'submenu-item';
      item.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      item.onclick = () => window.location.href = `products_tipo.html?tipo=${encodeURIComponent(tipo)}`;
      submenu.appendChild(item);
    });
  } catch (e) {
    submenu.innerHTML = '<div class="submenu-item">Error al cargar</div>';
  }
}

// === CARGAR REDES SOCIALES ===
function loadSocialLinks() {
  const container = document.getElementById('socialLinksContainer');
  onSnapshot(doc(db, "links", "social"), (snap) => {
    container.innerHTML = '';
    if (!snap.exists()) return;
    const data = snap.data();
    const redes = [
      { key: 'instagram', icon: 'https://imgfz.com/i/instagram-logo.png' },
      { key: 'x', icon: 'https://imgfz.com/i/x-logo.png' },
      { key: 'facebook', icon: 'https://imgfz.com/i/facebook-logo.png' },
      { key: 'youtube', icon: 'https://imgfz.com/i/youtube-logo.png' },
      { key: 'tiktok', icon: 'https://imgfz.com/i/tiktok-logo.png' },
      { key: 'whatsapp', icon: 'https://imgfz.com/i/whatsapp-logo.png' }
    ];
    redes.forEach(red => {
      if (data[red.key]) {
        const a = document.createElement('a');
        a.href = data[red.key];
        a.target = '_blank';
        a.innerHTML = `<img src="${red.icon}" alt="${red.key}" style="width:40px;height:40px;">`;
        container.appendChild(a);
      }
    });
  });
}

// === DESPLEGABLES ===
document.getElementById('categoriesToggle').onclick = () => {
  const submenu = document.getElementById('categoriesSubmenu');
  submenu.classList.toggle('show');
  document.getElementById('categoriesToggle').classList.toggle('active');
};

document.getElementById('contactToggle').onclick = () => {
  const submenu = document.getElementById('contactDropdown');
  submenu.classList.toggle('show');
  document.getElementById('contactToggle').classList.toggle('active');
};

// === CARRITO ===
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
function updateCart() {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.precio * i.qty, 0);
  cartBadge.textContent = totalQty;
  cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';
  cartTotal.textContent = `Total: $${totalPrice.toLocaleString()}`;
  cartItems.innerHTML = cart.length === 0
    ? '<p class="empty-cart">Tu carrito está vacío</p>'
    : cart.map((item, i) => `
      <div class="cart-item">
        <img src="${item.imagen}" alt="${item.nombre}" class="thumb">
        <div>
          <div>${item.nombre}</div>
          <small>x${item.qty} • $${(item.precio * item.qty).toLocaleString()}</small>
        </div>
        <button onclick="removeFromCart(${i})">×</button>
      </div>
    `).join('');
  goToPay.style.display = cart.length > 0 ? 'block' : 'none';
}

window.addToCart = (id) => {
  const product = window.allProducts.find(p => p.id === id);
  if (!product) return showToast("Producto no encontrado");
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

goToPay.onclick = () => window.location.href = 'pago.html';

// === PRODUCTOS ===
let allProducts = [];
onSnapshot(collection(db, "productos"), (snapshot) => {
  allProducts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    type: doc.data().type || { normal: true }
  }));
  window.allProducts = allProducts;

  // Carrusel anuncios (infinito)
  renderCarousel(starCarousel, p => p.type?.anuncio);

  // Carrusel nuevos (stacked)
  const newCarouselSection = document.querySelector('.infinite-carousel-section');
  createStackedCarousel(newCarouselSection, p => p.type?.carrusel);

  renderGrid();
});

function renderCarousel(container, filterFn) {
  const filtered = allProducts.filter(filterFn);
  const displayItems = filtered.length >= 5 ? [...filtered, ...filtered] : filtered;

  container.innerHTML = displayItems.length === 0
    ? '<p style="color:#999; text-align:center; padding:40px;">No hay productos</p>'
    : displayItems.map(p => `
      <div class="carousel-item" onclick="window.location.href='product.html?id=${p.id}'">
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      </div>
    `).join('');

  container.style.animation = filtered.length >= 5 ? 'scroll 30s linear infinite' : 'none';
}

function renderGrid() {
  const normales = allProducts.filter(p => p.type?.normal);
  productsGrid.innerHTML = normales.map(p => `
    <div class="product-card" onclick="window.location.href='product.html?id=${p.id}'">
      <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <div class="card-info">
        <h3>${p.nombre}</h3>
        <p class="desc">${p.descripcion || ''}</p>
        <div class="price-container">
          ${p.precioAntiguo ? `<span class="old-price">$${p.precioAntiguo.toLocaleString()}</span>` : ''}
          <span class="price ${p.precioAntiguo ? 'offer-price' : ''}">$${p.precio.toLocaleString()}</span>
        </div>
        <button class="add-btn" onclick="event.stopPropagation(); addToCart('${p.id}')">Agregar</button>
      </div>
    </div>
  `).join('');
}

// === CARRUSEL STACKED (NUEVOS LANZAMIENTOS) ===
function createStackedCarousel(section, filterFn) {
  const carousel = section.querySelector('.carousel');
  const slidesContainer = carousel.querySelector('.slides');
  const pagination = carousel.querySelector('.pagination');
  const prevBtn = carousel.querySelector('.prev');
  const nextBtn = carousel.querySelector('.next');
  const playPauseBtn = carousel.querySelector('#playPauseBtn');
  const playIcon = playPauseBtn.querySelector('.play');
  const pauseIcon = playPauseBtn.querySelector('.pause');

  let items = allProducts.filter(filterFn);
  if (items.length === 0) {
    slidesContainer.innerHTML = '<p style="text-align:center; color:#999; padding:60px;">No hay productos</p>';
    return;
  }

  let activeIndex = 0;
  let isPlaying = true;
  let autoplayInterval;

  slidesContainer.innerHTML = items.map((p, i) => `
    <div class="slide" data-index="${i}">
      <img src="${p.imagen}" alt="${p.nombre}" class="slide-img" loading="lazy">
    </div>
  `).join('');

  pagination.innerHTML = `
    <div class="indicator"></div>
    ${items.map((_, i) => `<button class="dot" aria-label="Ir al producto ${i+1}" ${i===0?'aria-current="true"':''}></button>`).join('')}
  `;

  const slides = slidesContainer.querySelectorAll('.slide');
  const dots = pagination.querySelectorAll('.dot');
  const indicator = pagination.querySelector('.indicator');

  function update() {
    slides.forEach((slide, i) => {
      slide.classList.remove('is-active', 'is-prev', 'is-next');
      if (i === activeIndex) slide.classList.add('is-active');
      else if (i === (activeIndex - 1 + items.length) % items.length) slide.classList.add('is-prev');
      else if (i === (activeIndex + 1) % items.length) slide.classList.add('is-next');
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
      dot.setAttribute('aria-current', i === activeIndex);
    });

    const activeDot = dots[activeIndex];
    indicator.style.transform = `translateX(${activeDot.offsetLeft - 10}px)`;
  }

  function next() { activeIndex = (activeIndex + 1) % items.length; update(); }
  function prev() { activeIndex = (activeIndex - 1 + items.length) % items.length; update(); }
  function goTo(index) { activeIndex = index; update(); }

  function togglePlay() {
    isPlaying = !isPlaying;
    playIcon.style.display = isPlaying ? 'none' : 'block';
    pauseIcon.style.display = isPlaying ? 'block' : 'none';
    isPlaying ? startAutoplay() : stopAutoplay();
  }

  function startAutoplay() { stopAutoplay(); autoplayInterval = setInterval(next, 4000); }
  function stopAutoplay() { clearInterval(autoplayInterval); }

  nextBtn.onclick = next;
  prevBtn.onclick = prev;
  playPauseBtn.onclick = togglePlay;
  dots.forEach((dot, i) => dot.onclick = () => goTo(i));
  update();
  startAutoplay();

  let touchStartX = 0;
  slidesContainer.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
  slidesContainer.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  });

  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
  });

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', () => isPlaying && startAutoplay());
}

// === BÚSQUEDA ===
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const term = searchInput.value.trim().toLowerCase();
  if (term.length < 2) {
    searchResultsContainer.style.display = 'none';
    return;
  }
  searchTimeout = setTimeout(async () => {
    const q = query(collection(db, "productos"), where("nombre", ">=", term), where("nombre", "<=", term + '\uf8ff'));
    const snapshot = await getDocs(q);
    searchResults.innerHTML = snapshot.empty
      ? '<p class="no-results">No se encontraron productos.</p>'
      : snapshot.docs.map(doc => {
          const p = doc.data();
          return `<div style="padding:12px 0; border-bottom:1px solid #eee; cursor:pointer;" onclick="window.location.href='product.html?id=${doc.id}'">
            <strong>${p.nombre}</strong><br>
            <small>${p.descripcion || 'Sin descripción'}</small><br>
            <strong>$${p.precio.toLocaleString()}</strong>
          </div>`;
        }).join('');
    searchResultsContainer.style.display = 'block';
  }, 300);
});

// === UI ===
menuBtn.onclick = () => { menuSidebar.classList.add('open'); menuOverlay.classList.add('show'); };
[menuOverlay, closeMenu].forEach(el => el.onclick = () => { menuSidebar.classList.remove('open'); menuOverlay.classList.remove('show'); });
cartBtn.onclick = () => { cartSidebar.classList.add('open'); updateCart(); };
closeCart.onclick = () => cartSidebar.classList.remove('open');
searchBtn.onclick = () => searchContainer.classList.add('active');
closeSearch.onclick = () => searchContainer.classList.remove('active');
document.addEventListener('click', e => {
  if (!searchContainer.contains(e.target) && !searchBtn.contains(e.target)) {
    searchContainer.classList.remove('active');
    searchResultsContainer.style.display = 'none';
  }
});

// === AUTH ===
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
    isLoggedIn = false; userName = '';
    showToast('Sesión cerrada');
    updateAuthUI();
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

// === INICIAR ===
updateCart();
updateAuthUI();
loadTitles();
loadProductTypes();
loadSocialLinks();
