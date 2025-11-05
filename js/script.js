// js/script.js
import { db, loadConfig } from "./firebase.js"; // Firebase intacto

/* ------------- DOM ------------- */
const welcomeBar = document.getElementById("welcomeBar");
const menuBtn = document.getElementById("menuBtn");
const menuDropdown = document.getElementById("menuDropdown");
const menuOverlay = document.getElementById("menuOverlay");
const menuClose = document.getElementById("menuClose");
const menuCuentaBtn = document.getElementById("menuCuentaBtn");
const submenuCuenta = document.getElementById("submenuCuenta");
const menuProductosBtn = document.getElementById("menuProductosBtn");
const submenuProductos = document.getElementById("submenuProductos");
const menuNosotrosBtn = document.getElementById("menuNosotrosBtn");
const submenuNosotros = document.getElementById("submenuNosotros");
const menuEstadoSesion = document.getElementById("menuEstadoSesion");
const searchInput = document.getElementById("searchInput");
const loginBtn = document.getElementById("loginBtn");
const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const closeCart = document.getElementById("closeCart");
const cartItemsEl = document.getElementById("cartItems");
const cartFooter = document.getElementById("cartFooter");
const cartTotalEl = document.getElementById("cartTotal");
const toastEl = document.getElementById("toast");
const productsGrid = document.getElementById("productsGrid");
const carouselTrack = document.getElementById("carouselTrack");
const starAdsEl = document.getElementById("starAds");

/* ------------- Data (localStorage) ------------- */
const SAMPLE_PRODUCTS = [
  { id: 'p1', nombre: 'Gorra Barbas Hats', descripcion:'Gorra con logo bordado', precio:120, stock:5, categoria:'Gorras', img:'https://i.ibb.co/gJTvCjp/gorra1.jpg', talla:[], estrella:true },
  { id: 'p2', nombre: 'Camiseta Oversize Negra', descripcion:'Camiseta oversize algodón 100%', precio:220, stock:12, categoria:'Camisetas', img:'https://i.ibb.co/DtkLMcy/playera1.jpg', talla:['S','M','L','XL'], estrella:false },
  { id: 'p3', nombre: 'Tenis Runner Pro', descripcion:'Tenis deportivos', precio:1350, stock:4, categoria:'Tenis', img:'https://i.ibb.co/C0cMKC5/tenis1.jpg', talla:['40','41','42','43'], estrella:true },
  { id: 'p4', nombre: 'Pantalón Cargo Verde', descripcion:'Pantalón cargo resistente', precio:450, stock:8, categoria:'Pantalones', img:'https://i.ibb.co/Lp0pKqR/sudadera1.jpg', talla:['M','L','XL'], estrella:false },
  { id: 'p5', nombre: 'Sudadera Logo', descripcion:'Sudadera con capucha', precio:580, stock:7, categoria:'Sudaderas', img:'https://i.ibb.co/Lp0pKqR/sudadera1.jpg', talla:['S','M','L'], estrella:false }
];

function getStoredProducts(){
  const raw = localStorage.getItem('productos');
  if(!raw){ localStorage.setItem('productos', JSON.stringify(SAMPLE_PRODUCTS)); return SAMPLE_PRODUCTS.slice(); }
  try { return JSON.parse(raw); } catch(e){ localStorage.setItem('productos', JSON.stringify(SAMPLE_PRODUCTS)); return SAMPLE_PRODUCTS.slice(); }
}
function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }

/* ------------- Render products ------------- */
function renderProducts(list){
  productsGrid.innerHTML = '';
  if(!list.length){ productsGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">No hay productos que coincidan</p>'; return; }
  list.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
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

/* ------------- Carousel & star-ads ------------- */
function setupCarousel(products){
  const items = products.filter(p=>p.estrella);
  if(!items.length){ document.getElementById('carouselWrap').style.display='none'; return; }
  const dup = items.concat(items);
  carouselTrack.innerHTML = '';
  dup.forEach(p=>{
    const it = document.createElement('div');
    it.className = 'carousel-item';
    it.innerHTML = `<img src="${p.img}" alt="${p.nombre}"><div><strong>${p.nombre}</strong><div style="color:var(--text-muted)">$${p.precio}</div></div>`;
    carouselTrack.appendChild(it);
  });
}
function setupStarAds(products){
  const ads = products.filter(p=>p.estrella);
  if(!ads.length){ starAdsEl.style.display='none'; return; }
  starAdsEl.innerHTML='';
  ads.forEach(p=>{
    const a = document.createElement('div');
    a.className='ad';
    a.innerHTML = `<img src="${p.img}" alt="${p.nombre}" style="width:60px;height:60px;object-fit:cover;margin-right:10px;"><div><strong>${p.nombre}</strong><div style="color:var(--text-muted)">$${p.precio} - ¡Oferta limitada!</div></div>`;
    a.addEventListener('click', ()=> openProduct(p.id));
    starAdsEl.appendChild(a);
  });
}

/* ------------- Search ------------- */
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

/* ------------- Cart functions ------------- */
function renderCart(){
  const cart = getCart();
  cartItemsEl.innerHTML = '';
  if(!cart.length){ cartItemsEl.innerHTML = '<div class="cart-empty">Tu carrito está vacío 🛍️</div>'; cartFooter.style.display='none'; document.getElementById('cartCount').textContent = '0'; return; }
  cartFooter.style.display = 'block';
  let totalItems = 0;
  let total = 0;
  cart.forEach(item=>{
    const p = getStoredProducts().find(x=>x.id===item.id);
    if(!p) return;
    const div = document.createElement('div');
    div.style = 'display:flex; gap:12px; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:12px;';
    div.innerHTML = `<img src="${p.img}" style="width:60px;height:60px;object-fit:cover;"><div style="flex:1"><div style="font-weight:700">${p.nombre}</div><div style="color:var(--text-muted)">x${item.qty}</div></div><div style="font-weight:800">$${p.precio*item.qty}</div>`;
    cartItemsEl.appendChild(div);
    totalItems += item.qty;
    total += p.precio * item.qty;
  });
  document.getElementById('cartCount').textContent = totalItems;
  cartTotalEl.textContent = `$${total}`;
}
function addToCart(id){
  const p = getStoredProducts().find(x=>x.id===id);
  if(!p) return;
  const cart = getCart();
  const idx = cart.findIndex(c=>c.id===id);
  if(idx>=0) cart[idx].qty += 1; else cart.push({id, qty:1});
  saveCart(cart);
  cartBtn.classList.add('cart-shake');
  setTimeout(()=>cartBtn.classList.remove('cart-shake'), 1000);
  showToast('Agregado al carrito');
  renderCart();
}
function showToast(text){
  toastEl.textContent = text;
  toastEl.classList.add('show');
  setTimeout(()=> toastEl.classList.remove('show'), 2000);
}
function openProduct(id){ window.location.href = `product.html?id=${id}`; }

/* ------------- UI events ------------- */
menuBtn.onclick = ()=> { menuDropdown.classList.add('open'); menuOverlay.classList.add('show'); };
menuClose.onclick = ()=> { menuDropdown.classList.remove('open'); menuOverlay.classList.remove('show'); };
menuOverlay.onclick = ()=> { menuDropdown.classList.remove('open'); menuOverlay.classList.remove('show'); };

menuCuentaBtn.onclick = ()=> submenuCuenta.classList.toggle('open');
menuProductosBtn.onclick = ()=> submenuProductos.classList.toggle('open');
menuNosotrosBtn.onclick = ()=> submenuNosotros.classList.toggle('open');

/* product buttons (delegation) */
productsGrid.addEventListener('click', (e)=>{
  const add = e.target.closest('.addBtn');
  const view = e.target.closest('.viewBtn');
  if(add){ addToCart(add.dataset.id); return; }
  if(view){ openProduct(view.dataset.id); return; }
});

/* search */
searchInput.addEventListener('input', (e)=> renderProducts(searchProducts(e.target.value)));

/* cart open/close */
cartBtn.addEventListener('click', ()=> cartPanel.classList.toggle('open'));
closeCart?.addEventListener('click', ()=> cartPanel.classList.remove('open'));

/* menu social links */
document.querySelectorAll('.menu-dropdown .social').forEach(el=>{
  el.addEventListener('click', ()=> {
    const url = el.dataset.url;
    if(url) window.open(url, '_blank');
  });
});

/* login / session handling */
function updateSessionUI(){
  const user = localStorage.getItem('usuarioActivo');
  if(user){
    welcomeBar.textContent = `Hola, ${user} 👋`;
    welcomeBar.classList.remove('hidden');
    welcomeBar.classList.add('visible');
    loginBtn.textContent = `Hola, ${user}`;
    menuEstadoSesion.textContent = 'Cerrar sesión';
    menuEstadoSesion.onclick = ()=> {
      localStorage.removeItem('usuarioActivo');
      location.reload();
    };
    setTimeout(()=> {
      welcomeBar.classList.remove('visible');
      welcomeBar.classList.add('hide');
      setTimeout(()=> welcomeBar.classList.add('hidden'), 500);
    }, 5000);
  } else {
    menuEstadoSesion.textContent = 'Iniciar sesión / Registrarse';
    menuEstadoSesion.onclick = ()=> location.href = 'login.html';
    loginBtn.textContent = 'Iniciar sesión';
    welcomeBar.classList.add('hidden');
  }
}
/* hook login button */
loginBtn.addEventListener('click', ()=> {
  const user = localStorage.getItem('usuarioActivo');
  if(user) alert('Ya tienes sesión iniciada.');
  else location.href = 'login.html';
});

/* ---------- Init app ---------- */
(async function init(){
  // Firebase config (intacto)
  try {
    const cfg = await loadConfig();
    if(cfg){
      if(cfg.carouselEnabled === false) document.getElementById('carouselWrap').style.display='none';
      if(cfg.starAdsEnabled === false) document.getElementById('starAds').style.display='none';
    }
  } catch(e){ /* ignore */ }

  const products = getStoredProducts();
  renderProducts(products);
  setupCarousel(products);
  setupStarAds(products);
  renderCart();
  updateSessionUI();
})();
