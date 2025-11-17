import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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

// Proteger acceso admin
if (!localStorage.getItem('isAdmin')) {
  window.location.href = 'login.html';
}

let orders = [];
let unsubscribe = null;

const ordersRef = collection(db, "orders");
const q = query(ordersRef, orderBy("date", "desc"));

unsubscribe = onSnapshot(q, (snapshot) => {
  orders = [];
  let totalItems = 0;
  let totalRevenue = 0;
  let pending = 0;
  let todayCount = 0;
  const today = new Date().toLocaleDateString('es-MX');

  snapshot.forEach(doc => {
    const data = doc.data();
    const order = { id: doc.id, ...data };
    orders.push(order);

    if (data.products) {
      totalItems += data.products.reduce((sum, p) => sum + (p.qty || 1), 0);
    }

    totalRevenue += Number(data.total || 0);
    if (!data.status || data.status === "pendiente") pending++;

    const orderDate = data.date?.toDate?.() || new Date(data.date);
    if (orderDate.toLocaleDateString('es-MX') === today) todayCount++;
  });

  renderOrders();
  updateStats(totalItems, orders.length, pending, todayCount);
  updateTotalVentas(totalRevenue);
});

function updateStats(items, total, pending, today) {
  document.getElementById('totalItems').textContent = items.toLocaleString();
  document.getElementById('totalOrders').textContent = total;
  document.getElementById('pendingOrders').textContent = pending;
  document.getElementById('todayOrders').textContent = today;
}

function updateTotalVentas(amount) {
  const el = document.getElementById('totalVentas');
  el.textContent = `$${amount.toLocaleString('es-MX')}`;
  el.classList.toggle('negative', amount < 0);
}

function renderOrders() {
  const container = document.getElementById('ordersContainer');
  container.innerHTML = '';

  if (orders.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-shopping-bag"></i><p>No hay compras aún</p></div>`;
    return;
  }

  orders.forEach(order => {
    const date = order.date?.toDate?.() || new Date(order.date);
    const formattedDate = date.toLocaleString('es-MX', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const productsHtml = (order.products || []).map(p => `
      <div class="order-product">
        <span>${p.name} (x${p.qty || 1})</span>
        <span>$${(p.price * (p.qty || 1)).toFixed(2)}</span>
      </div>
    `).join('');

    const address = order.address || {};
    const fullAddress = [address.street, address.colonia, address.cp, address.state].filter(Boolean).join(', ');

    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
      <div class="order-header">
        <i class="fas fa-receipt"></i> Compra #${order.id.slice(0, 8).toUpperCase()}
      </div>
      <div class="order-body">
        <div class="order-total">$${Number(order.total || 0).toLocaleString('es-MX')}</div>
        ${order.paymentId ? `<div class="order-id">ID: ${order.paymentId}</div>` : ''}
        <div class="order-products">${productsHtml}</div>
        <div class="order-address">
          <strong>${address.name || 'Sin nombre'}</strong><br>
          ${fullAddress || 'Sin dirección'}<br>
          Tel: ${address.phone || '—'}
        </div>
        <div class="order-date">${formattedDate}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Búsqueda
document.getElementById('searchInput')?.addEventListener('input', () => {
  const term = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('.order-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(term) ? 'block' : 'none';
  });
});

// Panel estadísticas
document.getElementById('toggleStats')?.addEventListener('click', () => {
  document.getElementById('statsPanel').classList.toggle('open');
});
document.getElementById('closeStats')?.addEventListener('click', () => {
  document.getElementById('statsPanel').classList.remove('open');
});

// Tema oscuro
const toggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', saved);
toggle.innerHTML = saved === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

toggle.addEventListener('click', () => {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  toggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});
