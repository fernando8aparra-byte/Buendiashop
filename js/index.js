import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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
    } catch (e) {
      console.log("Error admin:", e);
    }
  }
});

// === ICONOS NEGROS FORZADOS ===
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

// === CATEGORÍAS ===
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

// === REDES SOCIALES ===
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
  document.getElementById('categoriesSubmenu').classList.toggle('show');
  document.getElementById('categoriesToggle').classList.toggle('active');
};
document.getElementById('contactToggle').onclick = () => {
  document.getElementById('contactDropdown').classList.toggle('show');
  document.getElementById('contactToggle').classList.toggle('active');
};

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

// === CARRUSEL UNIVERSAL MEJORADO ===
function createMobileCarousel(containerId, filterFn, isNewLaunch = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const track = document.createElement('div');
  track.className = 'carousel-track';
  const pagination = isNewLaunch ? document.createElement('div') : null;
  if (pagination) pagination.className = 'pagination';

  container.innerHTML = '';
  container.appendChild(track);
  if (pagination) container.appendChild(pagination);

  const items = allProducts.filter(filterFn);
  if (items.length === 0) {
    track.innerHTML = '<p style="text-align:center; color:#999; padding:40px;">No hay productos</p>';
    return;
  }

  const displayItems = containerId === 'starCarousel' ? [...items, ...items] : items;

  track.innerHTML = displayItems.map((p, i) => `
    <div class="carousel-item" data-id="${p.id}" style="cursor:pointer;">
      <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
    </div>
  `).join('');

  if (isNewLaunch && items.length > 1) {
    pagination.innerHTML = items.map((_, i) => `
      <button class="dot" data-index="${i}" ${i === 0 ? 'class="dot active"' : 'class="dot"'}></button>
    `).join('');
  }

  let startX = 0, currentX = 0, currentTranslate = 0, prevTranslate = 0;
  let isDragging = false;
  let currentIndex = 0;
  const itemCount = items.length;
  const isInfinite = containerId === 'starCarousel';

  const slides = track.querySelectorAll('.carousel-item');

  function setPosition() {
    track.style.transition = isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.22, 0.61, 0.35, 1)';
    track.style.transform = `translateX(${currentTranslate}%)`;
  }

  function updateDots() {
    if (!isNewLaunch || itemCount <= 1) return;
    const dots = pagination.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    if (isInfinite && index >= itemCount) currentIndex = 0;
    if (isInfinite && index < 0) currentIndex = itemCount - 1;
    currentTranslate = -currentIndex * 100;
    setPosition();
    updateDots();
  }

  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    isDragging = true;
    prevTranslate = currentTranslate;
    track.style.transition = 'none';
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const diff = ((currentX - startX) / container.offsetWidth) * 100;
    currentTranslate = prevTranslate + diff;
    setPosition();
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const movedBy = currentX - startX;
    const threshold = container.offsetWidth * 0.15;

    if (Math.abs(movedBy) > threshold) {
      if (movedBy > 0) goToSlide(currentIndex - 1);
      else goToSlide(currentIndex + 1);
    } else {
      goToSlide(currentIndex);
    }
  });

  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      if (Math.abs(currentX - startX) < 10) {
        window.location.href = `product.html?id=${slide.dataset.id}`;
      }
    });
  });

  if (isNewLaunch && pagination) {
    pagination.querySelectorAll('.dot').forEach(dot => {
      dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
    });
  }

  goToSlide(0);
  window.addEventListener('resize', () => goToSlide(currentIndex));
}

// === GRID ===
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

// === BÚSQUEDA INTELIGENTE ===
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const term = searchInput.value.trim();
  if (term.length === 0) {
    searchResultsContainer.style.display = 'none';
    return;
  }
  searchTimeout = setTimeout(() => {
    const normalized = term.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matches = allProducts.filter(p => {
      const nombre = (p.nombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const desc = (p.descripcion || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const tipo = (p.tipo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return nombre.includes(normalized) || desc.includes(normalized) || tipo.includes(normalized);
    });
    searchResults.innerHTML = matches.length === 0
      ? `<p class="no-results">No encontramos nada con "<strong>${term}</strong>"</p>`
      : matches.map(p => `
        <div class="search-result-item" onclick="window.location.href='product.html?id=${p.id}'">
          <img src="${p.imagen}" alt="${p.nombre}">
          <div>
            <strong>${p.nombre}</strong>
            ${p.tipo ? `<small>• ${p.tipo}</small>` : ''}
            <span>$${p.precio.toLocaleString()}</span>
          </div>
        </div>
      `).join('');
    searchResultsContainer.style.display = 'block';
    updateResultsPosition();
  }, 150);
});

function updateResultsPosition() {
  const headerHeight = header.offsetHeight;
  const searchHeight = searchContainer.classList.contains('active') ? searchContainer.offsetHeight : 0;
  searchResultsContainer.style.top = `${headerHeight + searchHeight}px`;
}
window.addEventListener('scroll', updateResultsPosition);
window.addEventListener('resize', updateResultsPosition);

// === INTERACCIONES UI ===
menuBtn.onclick = () => { menuSidebar.classList.add('open'); menuOverlay.classList.add('show'); };
[menuOverlay, closeMenu].forEach(el => el.onclick = () => { menuSidebar.classList.remove('open'); menuOverlay.classList.remove('show'); });
cartBtn.onclick = () => { cartSidebar.classList.add('open'); updateCart(); };
closeCart.onclick = () => cartSidebar.classList.remove('open');
searchBtn.onclick = () => { searchContainer.classList.add('active'); searchInput.focus(); updateResultsPosition(); };
closeSearch.onclick = () => {
  searchContainer.classList.remove('active');
  searchInput.value = '';
  searchResultsContainer.style.display = 'none';
};

// === AUTH ===
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
helpBtn.onclick = () => alert('Escríbenos a contacto@boutique-buendia.com');

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
updateResultsPosition();

// === CARGAR PRODUCTOS Y CARRUSELES ===
onSnapshot(collection(db, "productos"), (snapshot) => {
  allProducts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    type: doc.data().type || { normal: true }
  }));
  window.allProducts = allProducts;

  // CARRUSELES NUEVOS
  createMobileCarousel('newProductsCarousel', p => p.type?.carrusel, true);
  createMobileCarousel('starCarousel', p => p.type?.anuncio, false);

  renderGrid();
});
