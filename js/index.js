      <div>
        <div>${item.nombre}</div>
        <small>x${item.qty} • $${(item.precio * item.qty).toLocaleString()}</small>
      </div>
      <button onclick="removeFromCart(${i})">X</button>
    `;
    cartItems.appendChild(div);
  });
}

window.removeFromCart = (i) => {
  cart.splice(i, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  showToast('Producto eliminado');
};

window.addToCart = (id) => {
  const product = window.allProducts.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  showToast('¡Agregado al carrito!');
};

goToPay.onclick = () => {
  if (cart.length === 0) return;
  localStorage.setItem('pendingPayment', JSON.stringify(cart));
  window.location.href = 'pago.html';
};

// === CARGA EN TIEMPO REAL ===
let allProducts = [];

function renderCarousel(container, filterFn) {
  container.innerHTML = '';
  const filtered = allProducts.filter(filterFn);
  [...filtered, ...filtered].forEach(p => {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.innerHTML = `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy">`;
    item.onclick = () => window.location.href = `product.html?id=${p.id}`;
    container.appendChild(item);
  });
}

function renderGrid() {
  productsGrid.innerHTML = '';
  allProducts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
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
    `;
    card.onclick = () => window.location.href = `product.html?id=${p.id}`;
    productsGrid.appendChild(card);
  });
}

// === ESCUCHAR CAMBIOS EN FIRESTORE ===
const productosRef = collection(db, "productos");
onSnapshot(productosRef, (snapshot) => {
  allProducts = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    allProducts.push({
      id: doc.id,
      nombre: data.nombre,
      precio: data.precio,
      precioAntiguo: data.precioAntiguo || null,
      descripcion: data.descripcion || '',
      imagen: data.imagen,
      nuevo: data.nuevo || false,
      estrella: data.estrella || false
    });
  });

  renderCarousel(newCarousel, p => p.nuevo);
  renderCarousel(starCarousel, p => p.estrella);
  renderGrid();
  window.allProducts = allProducts;
});

// === TOAST ===
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// === INICIO ===
updateCart();

// === BÚSQUEDA (ya tienes en index.html, no tocar) ===
