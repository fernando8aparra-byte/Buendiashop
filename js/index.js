import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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
const auth = getAuth(app);

// === ELEMENTOS DOM ===
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
const productsGrid = document.getElementById('productsGrid');
const cartBadge = document.getElementById('cartBadge');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const goToPay = document.getElementById('goToPay');
const toast = document.getElementById('toast');
const welcomeMsg = document.getElementById('welcomeMsg');
const authBtn = document.getElementById('authBtn');
const helpBtn = document.getElementById('helpBtn');
const adminBtn = document.getElementById('adminBtn');
const header = document.querySelector('.header');

// === VARIABLES GLOBALES ===
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let isLoggedIn = localStorage.getItem('loggedIn') === 'true';
let userName = localStorage.getItem('userName') || '';

// === DETECCIÓN DE ADMIN ===
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      if (userDoc.exists() && userDoc.data().isAdmin === true) {
        adminBtn.style.display = "block";
        adminBtn.onclick = () => window.location.href = "admin.html";
      }
    } catch (e) { console.log("Error admin:", e); }
  }
});

// === ICONOS NEGROS ===
document.querySelectorAll('svg, .icon-btn, .menu-close, .cart-close, #closeSearch').forEach(el => {
  el.style.stroke = '#000000';
  el.style.color = '#000000';
  el.style.fill = 'none';
});

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

// === CATEGORÍAS Y REDES ===
async function loadProductTypes() {
  const submenu = document.getElementById('categoriesSubmenu');
  submenu.innerHTML = '<div class="submenu-item">Cargando...</div>';
  try {
    const snapshot = await getDocs(collection(db, "productos"));
    const tipos = new Set();
    snapshot.forEach(doc => { if (doc.data().tipo) tipos.add(doc.data().tipo); });
    submenu.innerHTML = '';
    if (tipos.size === 0) { submenu.innerHTML = '<div class="submenu-item">No hay categorías</div>'; return; }
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

// === DESPLEGABLES CON UN SOLO TRIANGULITO ===
document.getElementById('categoriesToggle').onclick = () => {
  document.getElementById('categoriesSubmenu').classList.toggle('show');
  document.getElementById('categoriesToggle').classList.toggle('active');
};
document.getElementById('contactToggle').onclick = () => {
  document.getElementById('contactDropdown').classList.toggle('show');
  document.getElementById('contactToggle').classList.toggle('active');
};

// === CARRUSEL NUEVOS LANZAMIENTOS (RESPONSIVO + SWIPE) ===
function createNewCarousel() {
  const container = document.getElementById('newProductsCarousel');
  const track = document.getElementById('newCarouselTrack');
  const pagination = document.getElementById('newPagination');
  const items = allProducts.filter(p => p.type?.carrusel);
  
  track.innerHTML = '';
  pagination.innerHTML = '';

  if (items.length === 0) {
    track.innerHTML = '<p style="text-align:center;color:#999;padding:60px;">No hay productos</p>';
    return;
  }

  items.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.innerHTML = `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy" onclick="window.location.href='product.html?id=${p.id}'">`;
    track.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'dot';
    if (i === 0) dot.classList.add('active');
    dot.onclick = () => goToSlide(i);
    pagination.appendChild(dot);
  });

  const dots = pagination.querySelectorAll('.dot');
  let currentIndex = 0;

  function goToSlide(index) {
    currentIndex = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  let startX = 0;
  container.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    track.style.transition = 'none';
  }, { passive: true });

  container.addEventListener('touchmove', e => {
    if (!startX) return;
    const x = e.touches[0].clientX;
    const diff = x - startX;
    const offset = (diff / container.offsetWidth) * 100;
    track.style.transform = `translateX(calc(-${currentIndex * 100}% + ${offset}%))`;
  }, { passive: false });

  container.addEventListener('touchend', () => {
    if (!startX) return;
    const movedBy = parseInt(track.style.transform.match(/calc\(-?\d+% \+ (-?\d+\.?\d*)%\)/)?.[1] || 0);
    if (Math.abs(movedBy) > 20) {
      movedBy > 0 ? goToSlide(currentIndex - 1) : goToSlide(currentIndex + 1);
    } else {
      goToSlide(currentIndex);
    }
    startX = 0;
    track.style.transition = 'transform 0.4s ease';
  });
}

// === CARRUSEL ANUNCIOS (HORIZONTAL DESLIZABLE) ===
function createStarCarousel() {
  const container = document.getElementById('starCarousel');
  const items = allProducts.filter(p => p.type?.anuncio);
  if (items.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No hay productos</p>';
    return;
  }
  container.innerHTML = items.map(p => `
    <div class="carousel-item" onclick="window.location.href='product.html?id=${p.id}'">
      <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
    </div>
  `).join('');
}

// === GRID Y CARRITO (sin cambios) ===
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

// === CARRITO ===
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
  const product = allProducts.find(p => p.id === id);
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

// === UI Y TOAST ===
menuBtn.onclick = () => { menuSidebar.classList.add('open'); menuOverlay.classList.add('show'); };
[menuOverlay, closeMenu].forEach(el => el.onclick = () => { menuSidebar.classList.remove('open'); menuOverlay.classList.remove('show'); });
cartBtn.onclick = () => { cartSidebar.classList.add('open'); updateCart(); };
closeCart.onclick = () => cartSidebar.classList.remove('open');
searchBtn.onclick = () => { searchContainer.classList.add('active'); searchInput.focus(); };
closeSearch.onclick = () => { searchContainer.classList.remove('active'); searchInput.value = ''; searchResultsContainer.style.display = 'none'; };

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// === INICIAR ===
updateCart();
loadTitles();
loadProductTypes();
loadSocialLinks();

// === CARGAR PRODUCTOS ===
onSnapshot(collection(db, "productos"), (snapshot) => {
  allProducts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    type: doc.data().type || { normal: true }
  }));
  createNewCarousel();
  createStarCarousel();
  renderGrid();
});
