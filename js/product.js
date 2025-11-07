// js/product.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "boutique-buendia.firebaseapp.com",
  projectId: "boutique-buendia",
  storageBucket: "boutique-buendia.firebasestorage.app",
  messagingSenderId: "430651152709",
  appId: "1:430651152709:web:aaa54eeb8e3ba64c43062c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === OBTENER ID DEL PRODUCTO DESDE URL ===
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

if (!productId) {
  document.body.innerHTML = '<h1 style="text-align:center; padding:50px;">Producto no encontrado</h1>';
}

// === CARGAR PRODUCTO ===
async function loadProduct() {
  const docRef = doc(db, "productos", productId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    document.body.innerHTML = '<h1 style="text-align:center; padding:50px;">Producto no encontrado</h1>';
    return;
  }

  const p = docSnap.data();

  document.getElementById('productImage').src = p.imagen;
  document.getElementById('productName').textContent = p.nombre;
  document.getElementById('productPrice').textContent = `$${p.precio.toLocaleString()}`;
  document.getElementById('productDesc').textContent = p.descripcion || 'Sin descripción.';

  // TALLAS
  const sizesContainer = document.getElementById('sizesContainer');
  sizesContainer.innerHTML = '';
  (p.talla || ['Única']).forEach(size => {
    const btn = document.createElement('div');
    btn.className = 'size-btn';
    btn.textContent = size;
    btn.onclick = () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = size;
    };
    sizesContainer.appendChild(btn);
  });

  window.currentProduct = { id: productId, ...p };
}

let selectedSize = 'Única';

// === AGREGAR AL CARRITO ===
document.getElementById('addToCartBtn').onclick = () => {
  if (!window.currentProduct) return;

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const item = {
    id: window.currentProduct.id,
    nombre: window.currentProduct.nombre,
    precio: window.currentProduct.precio,
    imagen: window.currentProduct.imagen,
    talla: selectedSize,
    qty: 1
  };

  const existing = cart.find(i => i.id === item.id && i.talla === item.talla);
  if (existing) {
    existing.qty++;
  } else {
    cart.push(item);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showToast("¡Agregado al carrito!");
};

// === ACTUALIZAR BADGE ===
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartBadge').textContent = total;
  document.getElementById('cartBadge').style.display = total > 0 ? 'flex' : 'none';
}

// === MENÚ LATERAL ===
document.getElementById('menuBtn').onclick = () => {
  document.getElementById('menuSidebar').classList.add('open');
  document.getElementById('menuOverlay').classList.add('show');
};
document.getElementById('menuOverlay').onclick = () => {
  document.getElementById('menuSidebar').classList.remove('open');
  document.getElementById('menuOverlay').classList.remove('show');
};

// === TOAST ===
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// === INICIAR ===
loadProduct();
updateCartBadge();
