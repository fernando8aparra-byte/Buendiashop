// [Todo el código original] + NUEVAS FUNCIONES

const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const logoCenter = document.getElementById('logoCenter');

// Búsqueda expansiva
searchBtn.onclick = () => {
  searchInput.classList.toggle('active');
  logoCenter.style.opacity = searchInput.classList.contains('active') ? '0' : '1';
  if (searchInput.classList.contains('active')) searchInput.focus();
};
searchInput.onblur = () => {
  if (!searchInput.value) {
    searchInput.classList.remove('active');
    logoCenter.style.opacity = '1';
  }
};

// Contador carrito
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = total;
}
function addToCart(id) {
  // ... lógica original ...
  updateCartCount();
  renderCart();
}
function renderCart() {
  // ... lógica original ...
  updateCartCount();
}

// Bienvenida
function updateSessionUI() {
  const user = localStorage.getItem('usuarioActivo');
  const welcomeBar = document.getElementById('welcomeBar');
  const welcomeName = document.getElementById('welcomeName');
  if (user) {
    welcomeName.textContent = user;
    welcomeBar.classList.remove('hidden');
    welcomeBar.classList.add('visible');
    setTimeout(() => {
      welcomeBar.classList.remove('visible');
      setTimeout(() => welcomeBar.classList.add('hidden'), 500);
    }, 5000);
  }
}
