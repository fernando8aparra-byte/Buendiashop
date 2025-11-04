// js/script.js
import { db } from "./firebase.js"; // db is optional for admin/config

// DOM
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const menuClose = document.getElementById("menuClose");
const menuOverlay = document.getElementById("menuOverlay");
const cuentaBtn = document.getElementById("cuentaBtn");
const submenuCuenta = document.getElementById("submenuCuenta");
const estadoSesion = document.getElementById("estadoSesion");
const loginBtn = document.getElementById("loginBtn");

const searchInput = document.getElementById("search");
const productsGrid = document.getElementById("productsGrid");
const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const cartItemsEl = document.getElementById("cartItems");
const cartFooter = document.getElementById("cartFooter");
const cartTotalEl = document.getElementById("cartTotal");
const toast = document.getElementById("toast");
const carouselInner = document.getElementById("carouselInner");
const carouselWrap = document.getElementById("carouselWrap");
const starAdsEl = document.getElementById("starAds");
const welcomeBadge = document.getElementById("welcomeBadge");
const welcomeText = document.getElementById("welcomeText");

// sample products — stored in localStorage
const SAMPLE_PRODUCTS = [
  { id: 'p1', nombre: 'Gorra Barbas Hats', descripcion:'Gorra con logo bordado', precio:120, stock:5, categoria:'Gorras', img:'https://images.unsplash.com/photo-1520975918143-3a0c87a1e0b7?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=75f8f0bdea6b0af2a2a7a0f8a8b5a8e3', talla:[], estrella:true },
  { id: 'p2', nombre: 'Camiseta Oversize Negra', descripcion:'Camiseta oversize algodón 100%', precio:220, stock:12, categoria:'Camisetas', img:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=4f0e1f6c7a0ecf3ee2b8b2f9f6f6e8b2', talla:['S','M','L','XL'], estrella:false },
  { id: 'p3', nombre: 'Tenis Runner Pro', descripcion:'Tenis deportivos para correr', precio:1350, stock:4, categoria:'Tenis', img:'https://images.unsplash.com/photo-1528701800489-2c34b0a2f8e3?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=7a3c2b1d3e5f6a7b8c9d0e1f2a3b4c5d', talla:['40','41','42','43'], estrella:true },
  { id: 'p4', nombre: 'Pantalón Cargo Verde', descripcion:'Pantalón cargo resistente', precio:450, stock:8, categoria:'Pantalones', img:'https://images.unsplash.com/photo-1578894386599-1b073cbd3d14?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=abcd1234abcd1234abcd1234abcd1234', talla:['M','L','XL'], estrella:false },
  { id: 'p5', nombre: 'Sudadera Logo', descripcion:'Sudadera con capucha y logo', precio:580, stock:7, categoria:'Sudaderas', img:'https://images.unsplash.com/photo-1520975918143-3a0c87a1e0b7?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=75f8f0bdea6b0af2a2a7a0f8a8b5a8e3', talla:['S','M','L'], estrella:false }
];

function getStoredProducts(){
  const raw = localStorage.getItem('productos');
  if(!raw){ localStorage.setItem('productos', JSON.stringify(SAMPLE_PRODUCTS)); return SAMPLE_PRODUCTS.slice(); }
  try { return JSON.parse(raw); } catch(e){ localStorage.setItem('productos', JSON.stringify(SAMPLE_PRODUCTS)); return SAMPLE_PRODUCTS.slice(); }
}
function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }

// RENDER PRODUCTS
function renderProducts(list){
  productsGrid.innerHTML = '';
  if(!list.length){ productsGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#777">No hay productos que coincidan</p>'; return; }
  list.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
      <div class="meta">
        <div class="title">${p.nombre}</div>
        <div class="price">$${p.precio}</div>
        <div class="small-muted">${p.categoria} • Stock ${p.stock}</div>
        <div style="margin-top:8px;display:flex;gap:8px;">
          <button class="addBtn" data-id="${p.id}">Agregar</button>
          <button class="viewBtn" data-id="${p.id}">Ver</button>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// CAROUSEL & STAR-ADS
function setupCarousel(products){
  const items = products.filter(p=>p.estrella);
  if(!items.length){ carouselWrap.style.display='none'; return; }
  // duplicate to give illusion
  const itemsDup = items.concat(items);
  carouselInner.innerHTML = '';
  itemsDup.forEach(p=>{
    const it = document.createElement('div');
    it.className = 'item';
    it.innerHTML = `<img src="${p.img}" alt=""><div><strong>${p.nombre}</strong><div class="small-muted">$${p.precio}</div></div>`;
    carouselInner.appendChild(it);
  });
}

function setupStarAds(products){
  const ads = products.filter(p=>p.estrella);
  if(!ads.length){ starAdsEl.style.display='none'; return; }
  starAdsEl.innerHTML = '';
  ads.forEach(p=>{
    const a = document.createElement('div');
    a.className='ad';
    a.innerHTML = `<img src="${p.img}" alt=""><div><strong style="font-size:14px">${p.nombre}</strong><div class="small-muted">$${p.precio}</div></div>`;
    a.addEventListener('click', ()=> openProduct(p.id));
    starAdsEl.appendChild(a);
  });
}

// SEARCH (tokens must be all present)
function searchProducts(q){
  q = q.trim().toLowerCase();
  const products = getStoredProducts();
  if(!q) return products;
  const tokens = q.split(/\s+/).filter(Boolean);
  return products.filter(p=>{
    const hay = (p.nombre + ' ' + (p.descripcion||'')).toLowerCase();
    return tokens.every(tok => hay.includes(tok));
  });
}

// CART UI
function renderCart(){
  const cart = getCart();
  cartItemsEl.innerHTML = '';
  if(!cart.length){ cartItemsEl.innerHTML = '<div class="cart-empty">Tu carrito está vacío 🛍️</div>'; cartFooter.style.display='none'; return; }
  cartFooter.style.display='block';
  cart.forEach(item=>{
    const p = getStoredProducts().find(x=>x.id===item.id);
    const div = document.createElement('div');
    div.style.display='flex'; div.style.gap='10px'; div.style.alignItems='center'; div.style.marginBottom='10px';
    div.innerHTML = `<img src="${p.img}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;"><div style="flex:1"><div style="font-weight:700">${p.nombre}</div><div class="small-muted">x${item.qty}</div></div><div style="font-weight:800">$${p.precio*item.qty}</div>`;
    cartItemsEl.appendChild(div);
  });
  const total = cart.reduce((s,i)=>{ const p = getStoredProducts().find(x=>x.id===i.id); return s + (p ? p.precio * i.qty : 0); },0);
  cartTotalEl.textContent = `Total: $${total}`;
}

function addToCart(id){
  const p = getStoredProducts().find(x=>x.id===id);
  if(!p) return;
  const cart = getCart();
  const idx = cart.findIndex(c=>c.id===id);
  if(idx>=0) cart[idx].qty += 1; else cart.push({id, qty:1});
  saveCart(cart);
  // animate cart
  cartBtn.classList.add('cart-shake');
  setTimeout(()=>cartBtn.classList.remove('cart-shake'), 1000);
  showToast('Agregado al carrito','green');
  renderCart();
}

function showToast(text, color='green'){
  toast.textContent = text;
  toast.style.background = color==='green' ? 'var(--accent,#7c4dff)' : '#e53935';
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 1600);
}

function openProduct(id){ window.location.href = `product.html?id=${id}`; }

// Modal placeholders (payment)
document.getElementById('paypalBtn')?.addEventListener('click', ()=> alert('Abrir PayPal (placeholder)'));
document.getElementById('cardBtn')?.addEventListener('click', ()=> alert('Abrir formulario tarjeta (placeholder)'));
document.getElementById('oxxoBtn')?.addEventListener('click', ()=> alert('Abrir OXXO (placeholder)'));

// MENU interactions
menuBtn.onclick = ()=> { menu.classList.add('open'); document.querySelector('.menu-overlay').classList.add('show'); };
menuClose.onclick = ()=> { menu.classList.remove('open'); document.querySelector('.menu-overlay').classList.remove('show'); };
document.querySelector('.menu-overlay').onclick = ()=> { menu.classList.remove('open'); document.querySelector('.menu-overlay').classList.remove('show'); };

cuentaBtn.onclick = ()=> submenuCuenta.classList.toggle('active');

// delegated product buttons
productsGrid.addEventListener('click', (ev)=>{
  const add = ev.target.closest('.addBtn');
  const view = ev.target.closest('.viewBtn');
  if(add){ addToCart(add.dataset.id); return; }
  if(view){ openProduct(view.dataset.id); return; }
});

// Search input
searchInput.addEventListener('input', (e)=> renderProducts(searchProducts(e.target.value)));

// Cart open/close
cartBtn.onclick = ()=> cartPanel.classList.toggle('open');
document.getElementById('closeCart').onclick = ()=> cartPanel.classList.remove('open');

// SESSION handling & welcome badge behavior
function updateSessionUI(){
  const user = localStorage.getItem('usuarioActivo');
  const estado = document.getElementById('estadoSesion');
  if(user){
    // show welcome badge for 3s, hide search meanwhile
    welcomeText.textContent = `Bienvenido, ${user}`;
    welcomeBadge.style.display = 'flex';
    welcomeBadge.classList.add('show');
    searchInput.style.display = 'none';
    loginBtn.textContent = `Hola, ${user}`;
    estado.textContent = 'Cerrar sesión';
    setTimeout(()=> {
      // hide welcome and show search
      welcomeBadge.classList.remove('show');
      setTimeout(()=> { welcomeBadge.style.display='none'; }, 300);
      searchInput.style.display = ''; // restore
    }, 3000);
  } else {
    estado.textContent = 'Iniciar sesión';
    loginBtn.textContent = 'Iniciar sesión';
    welcomeBadge.style.display = 'none';
    searchInput.style.display = '';
  }
}
updateSessionUI();

estadoSesion.addEventListener('click', ()=>{
  const user = localStorage.getItem('usuarioActivo');
  if(user){
    localStorage.removeItem('usuarioActivo');
    alert('Sesión cerrada');
    location.reload();
  } else {
    window.location.href = 'login.html';
  }
});
loginBtn.addEventListener('click', ()=>{
  const user = localStorage.getItem('usuarioActivo');
  if(user) alert('Ya tienes sesión iniciada');
  else window.location.href = 'login.html';
});

// INIT: load data
const products = getStoredProducts();
renderProducts(products);
setupCarousel(products);
setupStarAds(products);
renderCart();

// optional: read config from Firestore to enable/disable features
(async function loadConfig(){
  try {
    const cfgRef = db ? (await import('https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js')).doc(db, 'config', 'main') : null;
    // For now we ignore config load failure; admin panel will write config if needed.
  } catch(e){}
})();
