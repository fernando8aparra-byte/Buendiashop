// main.js
import { db, auth } from "./firebase.js";
import {
  collection, query, where, orderBy, getDocs, onSnapshot, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// UI refs
const openMenuBtn = document.getElementById('open-menu');
const closeMenuBtn = document.getElementById('close-menu');
const sideMenu = document.getElementById('side-menu');
const menuBackdrop = document.getElementById('menu-backdrop');
const searchInput = document.getElementById('search-input');
const productList = document.getElementById('product-list');
const cartBtn = document.getElementById('open-cart');
const cartCountEl = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsEl = document.getElementById('cart-items');
const cartEmptyEl = document.getElementById('cart-empty');
const cartTotalEl = document.getElementById('cart-total');
const paymentOptionsEl = document.getElementById('payment-options');
const toastEl = document.getElementById('toast');
const animationArea = document.getElementById('animation-area');
const viewAnimationSelect = document.getElementById('view-animation');
const siteTitleEl = document.getElementById('site-title');
const userArea = document.getElementById('user-area');
const menuUser = document.getElementById('menu-user');
const authActions = document.getElementById('auth-actions');
const socialLinks = document.getElementById('social-links');

let productos = [];
let carrito = JSON.parse(localStorage.getItem('efrain_carrito') || '[]');

// UTIL: actualiza UI de carrito
function actualizarCarritoUI(){
  const totalItems = carrito.reduce((s,i)=> s + i.cantidad, 0);
  cartCountEl.textContent = totalItems;
  localStorage.setItem('efrain_carrito', JSON.stringify(carrito));

  if(carrito.length === 0){
    cartEmptyEl.classList.remove('hidden');
    cartItemsEl.innerHTML = '';
    cartTotalEl.innerHTML = '';
    paymentOptionsEl.classList.add('hidden');
    return;
  }

  cartEmptyEl.classList.add('hidden');
  paymentOptionsEl.classList.remove('hidden');
  cartItemsEl.innerHTML = carrito.map(it => `
    <div>
      <img src="${it.imagenUrl}" alt="${it.nombre}">
      <div style="flex:1">
        <div>${it.cantidad}x ${it.nombre}</div>
        <div style="font-weight:700">$${(it.precio*it.cantidad).toFixed(2)}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button data-id="${it.id}" class="plus">+</button>
        <button data-id="${it.id}" class="minus">-</button>
      </div>
    </div>
  `).join('');
  const total = carrito.reduce((s,i) => s + i.precio*i.cantidad, 0);
  cartTotalEl.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
}
actualizarCarritoUI();

// CARRITO - agregar y animar
function agregarAlCarrito(product){
  const idx = carrito.findIndex(i => i.id === product.id);
  if(idx > -1) carrito[idx].cantidad += 1;
  else carrito.push({ id: product.id, nombre: product.nombre, precio: product.precio, imagenUrl: product.imagenUrl, cantidad: 1 });
  actualizarCarritoUI();
  // animación carrito
  cartBtn.classList.add('shake');
  toastEl.classList.remove('hidden');
  setTimeout(()=>{ cartBtn.classList.remove('shake'); toastEl.classList.add('hidden'); }, 1000);
}

// manejadores +/-
document.addEventListener('click', (e)=>{
  if(e.target.classList.contains('plus')){
    const id = e.target.dataset.id;
    carrito = carrito.map(i => i.id===id ? {...i, cantidad: i.cantidad+1} : i);
    actualizarCarritoUI();
  }
  if(e.target.classList.contains('minus')){
    const id = e.target.dataset.id;
    carrito = carrito.map(i => i.id===id ? {...i, cantidad: i.cantidad-1} : i).filter(i => i.cantidad>0);
    actualizarCarritoUI();
  }
});

// abrir/cerrar menú
openMenuBtn.addEventListener('click', ()=>{ sideMenu.classList.add('open'); menuBackdrop.classList.add('show'); });
menuBackdrop.addEventListener('click', ()=>{ sideMenu.classList.remove('open'); menuBackdrop.classList.remove('show'); });
if(closeMenuBtn) closeMenuBtn.addEventListener('click', ()=>{ sideMenu.classList.remove('open'); menuBackdrop.classList.remove('show'); });

// abrir/cerrar carrito
cartBtn.addEventListener('click', ()=> cartModal.classList.remove('hidden'));
closeCartBtn.addEventListener('click', ()=> cartModal.classList.add('hidden'));

// buscar
searchInput.addEventListener('input', (e)=>{
  const text = e.target.value.trim().toLowerCase();
  if(!text){ renderProductos(productos); return; }
  const filtrados = productos.filter(p =>
    (p.nombre || '').toLowerCase().includes(text) ||
    (p.descripcion || '').toLowerCase().includes(text) ||
    (p.talla || '').toLowerCase().includes(text)
  );
  renderProductos(filtrados);
});

// renderiza productos en grid
function renderProductos(list){
  productList.innerHTML = '';
  if(!list.length){ productList.innerHTML = '<div style="padding:20px;color:#666">No hay productos</div>'; return; }
  list.forEach(p => {
    if(!p.habilitado) return;
    const div = document.createElement('article');
    div.className = 'product';
    div.innerHTML = `
      <img src="${p.imagenUrl}" alt="${p.nombre}" loading="lazy">
      <h3>${p.nombre}</h3>
      <p>${p.descripcion || ''}</p>
      <div class="price-row"><div class="price price-el">$${Number(p.precio).toFixed(2)}</div></div>
      <button class="add-cart-btn" data-id="${p.id}">Agregar</button>
    `;
    // click en producto -> product.html?id=
    div.querySelector('img').addEventListener('click', ()=> window.location.href = `product.html?id=${p.id}`);
    div.querySelector('h3').addEventListener('click', ()=> window.location.href = `product.html?id=${p.id}`);
    div.querySelector('.add-cart-btn').addEventListener('click', (ev)=>{
      ev.stopPropagation();
      agregarAlCarrito(p);
    });
    productList.appendChild(div);
  });
}

// Cargar productos desde Firestore (escucha en tiempo real)
async function startListeningProductos(){
  const col = collection(db, 'productos');
  // usar onSnapshot para reflejar cambios en tiempo real
  const q = query(col, orderBy('fechaCreacion', 'desc'));
  onSnapshot(q, (snap) => {
    productos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderProductos(productos);
    renderAnimations(productos);
  }, err => console.error(err));
}
startListeningProductos();

// Renderizar área de animaciones según productos y settings
let currentSettings = { animation: 'none', siteEnabled: true, siteTitle: 'Página web Efraín', social: {} };
async function loadSettings(){
  try{
    const ref = doc(db, 'settings', 'site');
    const snap = await getDoc(ref);
    if(snap.exists()){
      currentSettings = { ...currentSettings, ...snap.data() };
    }
  }catch(e){ console.warn(e); }
  applySettings();
}
loadSettings();

function applySettings(){
  // Site title
  if(currentSettings.siteTitle) siteTitleEl.textContent = currentSettings.siteTitle;
  // Site enabled
  if(currentSettings.siteEnabled === false){
    productList.innerHTML = '<div style="padding:40px;text-align:center;font-size:18px;color:#666">Página en mantenimiento</div>';
  }
  // social links
  socialLinks.innerHTML = '';
  if(currentSettings.social){
    const keys = Object.keys(currentSettings.social);
    keys.forEach(k=>{
      const url = currentSettings.social[k];
      if(url) socialLinks.innerHTML += `<a class="menu-item" target="_blank" href="${url}">${k}</a>`;
    });
  }
  // animation selector reflect
  if(viewAnimationSelect) viewAnimationSelect.value = currentSettings.animation || 'none';
}
viewAnimationSelect?.addEventListener('change', (e)=>{
  // solo vista local (admin puede forzar desde settings)
  renderAnimations(productos, e.target.value);
});

// render animations (carousel or featured)
function renderAnimations(products, overrideAnimation){
  const anim = overrideAnimation || currentSettings.animation || 'none';
  animationArea.innerHTML = '';
  if(anim === 'carousel'){
    // take newest with tipo === 'carrusel' OR newest items
    const track = document.createElement('div');
    track.className = 'carousel';
    const items = products.filter(p=>p.habilitado && (p.tipo === 'carrusel' || true)).slice(0,10);
    const trackInner = document.createElement('div'); trackInner.className = 'carousel-track';
    // duplicate items to create infinite feeling
    const combined = [...items, ...items];
    combined.forEach(it => {
      const item = document.createElement('div'); item.className='carousel-item';
      item.innerHTML = `<img src="${it.imagenUrl}" alt="${it.nombre}" style="width:100%;height:100px;object-fit:cover;border-radius:6px"><div style="padding:6px;font-size:13px">${it.nombre}</div>`;
      item.addEventListener('click', ()=> window.location.href = `product.html?id=${it.id}`);
      trackInner.appendChild(item);
    });
    // set animation duration based on width
    trackInner.style.animationDuration = `${Math.max(12, items.length * 3)}s`;
    track.appendChild(trackInner);
    animationArea.appendChild(track);
  } else if(anim === 'featured'){
    const list = document.createElement('div'); list.className='featured-list';
    const featured = products.filter(p=>p.habilitado && p.tipo === 'estrella');
    featured.forEach(f=>{
      const el = document.createElement('div'); el.className='featured-item';
      el.innerHTML = `<img src="${f.imagenUrl}" alt="${f.nombre}" style="width:70px;height:70px;object-fit:cover;border-radius:6px"><div style="font-size:13px">${f.nombre}</div>`;
      el.addEventListener('click', ()=> window.location.href = `product.html?id=${f.id}`);
      list.appendChild(el);
    });
    animationArea.appendChild(list);
  }
}

// AUTH: mostrar usuario o link login
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
onAuthStateChanged(auth, user=>{
  if(user){
    userArea.innerHTML = `<span>Bienvenido, ${user.displayName || user.email}</span>`;
    menuUser.innerHTML = `<div style="padding:8px;color:#fff">Bienvenido<br>${user.email}</div><button class="menu-item" id="logout-btn">Cerrar sesión</button>`;
    document.getElementById('logout-btn').addEventListener('click', ()=> { auth.signOut(); location.reload(); });
  } else {
    userArea.innerHTML = `<a href="login.html">Iniciar sesión</a>`;
    menuUser.innerHTML = `<a href="login.html" class="menu-item">Iniciar sesión / Registrarse</a>`;
  }
});

// payment options click -> open form (simple)
paymentOptionsEl?.addEventListener('click', (e)=>{
  if(e.target.classList.contains('pay-btn')){
    const metodo = e.target.dataset.pay;
    // abrir formulario simplificado
    const nombre = prompt('Nombre completo:');
    if(!nombre) return alert('Cancelado');
    const direccion = prompt('Dirección o ciudad:');
    if(!direccion) return alert('Cancelado');
    // aquí guardar compra en Firestore - ejemplo mínimo
    // guardado de compra no implementado aquí para que admin valide (se puede agregar)
    alert(`Se seleccionó ${metodo}. A continuación se completará el pago en la pasarela.`);
  }
});

// inicializaciones finales
(function init(){
  // close menu btn might not exist in some DOM orders
  const c = document.getElementById('close-menu');
  c?.addEventListener('click', ()=>{ sideMenu.classList.remove('open'); menuBackdrop.classList.remove('show'); });
})();
