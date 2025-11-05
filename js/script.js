// -----------------------------
// Datos de ejemplo de productos
// -----------------------------
const products = [
  {id:1,name:"Camiseta Negra Oversize", category:"Camisetas", price:250, img:"https://via.placeholder.com/150", talla:"M"},
  {id:2,name:"Gorra del Barbas Hats", category:"Gorras", price:150, img:"https://via.placeholder.com/150"},
  {id:3,name:"Pantalón Jeans", category:"Pantalones", price:350, img:"https://via.placeholder.com/150", talla:"L"},
  {id:4,name:"Sudadera Roja", category:"Sudaderas", price:400, img:"https://via.placeholder.com/150", talla:"XL"},
  {id:5,name:"Tenis Running", category:"Tenis", price:600, img:"https://via.placeholder.com/150"}
];

// -----------------------------
// Variables del DOM
// -----------------------------
const menuBtn = document.querySelector(".menu-btn");
const sideMenu = document.getElementById("sideMenu");
const closeBtn = document.querySelector(".close-btn");
const productsContainer = document.getElementById("productsContainer");
const featuredProducts = document.getElementById("featuredProducts");
const newProductsCarousel = document.getElementById("newProductsCarousel");

const cartContainer = document.getElementById("cartContainer");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartEmpty = document.getElementById("cartEmpty");
const paymentOptions = document.getElementById("paymentOptions");

const searchInput = document.getElementById("searchInput");

// -----------------------------
// Menú lateral
// -----------------------------
menuBtn.onclick = () => sideMenu.classList.add("active");
closeBtn.onclick = () => sideMenu.classList.remove("active");

// -----------------------------
// Render de productos
// -----------------------------
function renderProducts(list) {
  productsContainer.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>$${p.price}</p>
      ${p.talla ? `<p>Talla: ${p.talla}</p>` : ""}
      <button onclick="addToCart(${p.id})">Agregar al carrito</button>
    `;
    productsContainer.appendChild(card);
  });
}

// Carrusel horizontal (nuevos productos)
function renderCarousel(list) {
  newProductsCarousel.innerHTML = "";
  list.forEach(p => {
    const item = document.createElement("div");
    item.className = "carousel-item";
    item.innerHTML = `<img src="${p.img}" alt="${p.name}"><p>${p.name}</p>`;
    newProductsCarousel.appendChild(item);
  });
}

// Productos estrella
function renderFeatured(list) {
  featuredProducts.innerHTML = "";
  list.forEach(p => {
    const item = document.createElement("div");
    item.className = "carousel-item";
    item.innerHTML = `<img src="${p.img}" alt="${p.name}"><p>${p.name}</p>`;
    featuredProducts.appendChild(item);
  });
}

// Render inicial
renderProducts(products);
renderCarousel(products.slice(0,3));
renderFeatured(products.slice(3));

// -----------------------------
// Carrito
// -----------------------------
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCart() {
  cartItems.innerHTML = "";
  if(cart.length === 0){
    cartEmpty.style.display="block";
    paymentOptions.style.display="none";
  } else {
    cartEmpty.style.display="none";
    paymentOptions.style.display="block";
    cart.forEach(item => {
      const p = products.find(pr => pr.id === item.id);
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <img src="${p.img}" alt="${p.name}">
        <span>${item.qty} x ${p.name}</span>
        <span>$${p.price * item.qty}</span>
      `;
      cartItems.appendChild(div);
    });
  }
  cartCount.textContent = cart.reduce((a,b) => a + b.qty, 0);
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Agregar al carrito
function addToCart(id){
  const existing = cart.find(item => item.id === id);
  if(existing) existing.qty += 1;
  else cart.push({id, qty:1});
  updateCart();
  cartContainer.classList.add("cart-shake");
  setTimeout(()=>cartContainer.classList.remove("cart-shake"),500);
  alert("Agregado al carrito");
  cartContainer.style.display="block";
}

// Inicializar carrito
updateCart();

// -----------------------------
// Buscador de productos
// -----------------------------
searchInput.addEventListener("input", ()=>{
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchInput.value.toLowerCase()))
  );
  renderProducts(filtered);
});

// -----------------------------
// Funcionalidad login simple (ejemplo)
// -----------------------------
let userLogged = JSON.parse(localStorage.getItem("user")) || null;
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

function updateLoginUI(){
  if(userLogged){
    loginBtn.style.display="none";
    logoutBtn.style.display="block";
    loginBtn.textContent = `Bienvenido ${userLogged}`;
  } else {
    loginBtn.style.display="block";
    logoutBtn.style.display="none";
  }
}

loginBtn.onclick = () => {
  const name = prompt("Ingresa tu nombre");
  if(name){
    userLogged = name;
    localStorage.setItem("user", JSON.stringify(userLogged));
    updateLoginUI();
  }
}

logoutBtn.onclick = () => {
  userLogged = null;
  localStorage.removeItem("user");
  updateLoginUI();
}

updateLoginUI();
