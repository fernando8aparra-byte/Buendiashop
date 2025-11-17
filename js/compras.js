import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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

// === PROTEGER ADMIN ===
if (!localStorage.getItem('isAdmin')) {
  window.location.href = 'login.html';
}

// === VARIABLES ===
let orders = [];
let sortAsc = false;
let unsubscribe = null;

// === CARGAR COMPRAS ===
const ordersRef = collection(db, "orders");

function loadOrders(order = 'desc') {
  const q = query(ordersRef, orderBy("date", order));
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

      // Contar productos vendidos
      if (data.products && Array.isArray(data.products)) {
        totalItems += data.products.reduce((sum, p) => sum + (p.qty || 1), 0);
      }

      // Sumar total de ventas
      totalRevenue += Number(data.total || 0);

      // Contar pendientes
      if (!data.status || data.status === "pendiente") pending++;

      // Órdenes de hoy
      const orderDate = data.date?.toDate?.() || new Date(data.date);
      if (orderDate.toLocaleDateString('es-MX') === today) todayCount++;
    });

    renderOrders();
    updateTotalVentas(totalRevenue);
    updateStats(totalItems, orders.length, pending, todayCount);
    updateNotifications(); // Mantengo tus notificaciones originales
  });
}

loadOrders('desc');

// === RENDERIZAR COMPRAS ===
function renderOrders() {
  const container = document.getElementById('ordersContainer');
  container.innerHTML = '';

  if (orders.length === 0) {
    container.innerHTML = '<div class="empty-state"><p style="text-align:center; color:#666; padding:80px 0; font-size:1.3rem;">No hay compras aún.</p></div>';
    return;
  }

  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';

    const date = order.date?.toDate?.() || new Date(order.date);
    const formattedDate = date.toLocaleString('es-MX', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const productsHtml = (order.products || []).map(p => `
      <div class="order-product">
        <span>${p.name} (x${p.qty || 1})</span>
        <span>$${(p.price * (p.qty || 1)).toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
      </div>
    `).join('');

    const address = order.address || {};
    const fullAddress = [address.street, address.colonia, address.cp, address.state]
      .filter(Boolean).join(', ');

    card.innerHTML = `
      <div class="order-header">
        Compra #${order.id.slice(0, 8).toUpperCase()}
      </div>
      <div class="order-body">
        <div class="order-total">$${Number(order.total || 0).toLocaleString('es-MX')}</div>
        ${order.paymentId ? `<div class="order-id">ID de pago: ${order.paymentId}</div>` : ''}
        <div class="order-products">${productsHtml}</div>
        <div class="order-address">
          <strong>${address.name || 'Sin nombre'}</strong><br>
          ${fullAddress || 'Sin dirección'}<br>
          Tel: ${address.phone || '—'}<br>
          Cliente: ${order.userId || 'Anónimo'}
        </div>
        <div class="order-date">${formattedDate}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

// === ACTUALIZAR TOTAL EN HEADER (solo con $) ===
function updateTotalVentas(amount) {
  const el = document.getElementById('totalVentas');
  if (el) {
    el.textContent = `$${amount.toLocaleString('es-MX')}`;
    el.classList.toggle('negative', amount < 0);
  }
}

// === ACTUALIZAR ESTADÍSTICAS DEL PANEL ===
function updateStats(items, total, pending, today) {
  const els = {
    totalItems: document.getElementById('totalItems'),
    totalOrders: document.getElementById('totalOrders'),
    pendingOrders: document.getElementById('pendingOrders'),
    todayOrders: document.getElementById('todayOrders')
  };

  if (els.totalItems) els.totalItems.textContent = items.toLocaleString();
  if (els.totalOrders) els.totalOrders.textContent = total;
  if (els.pendingOrders) els.pendingOrders.textContent = pending;
  if (els.todayOrders) els.todayOrders.textContent = today;
}

// === NOTIFICACIONES (mantengo tu sistema original) ===
function updateNotifications() {
  const notif = document.getElementById('notifications');
  if (!notif) return;

  notif.innerHTML = '';
  const recent = orders.slice(0, 5);

  if (recent.length === 0) {
    notif.innerHTML = '<div class="notification-item">No hay compras recientes.</div>';
    return;
  }

  recent.forEach(order => {
    const date = order.date?.toDate?.() || new Date(order.date);
    const time = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const address = order.address || {};

    const item = document.createElement('div');
    item.className = 'notification-item';
    item.innerHTML = `
      <strong>Nueva compra</strong><br>
      ${address.name || 'Cliente'} - $${Number(order.total || 0).toLocaleString()}<br>
      <span class="notification-time">${time}</span>
    `;
    notif.appendChild(item);
  });

  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 6000);
}

// === ORDENAR POR FECHA ===
document.getElementById('sortBtn')?.addEventListener('click', () => {
  sortAsc = !sortAsc;
  const order = sortAsc ? 'asc' : 'desc';
  
  const btn = document.getElementById('sortBtn');
  if (btn) {
    btn.innerHTML = `
      ${sortAsc ? 'Antiguas primero' : 'Recientes primero'}
    `;
  }

  if (unsubscribe) unsubscribe();
  loadOrders(order);
});

// === PANEL ESTADÍSTICAS (deslizable) ===
document.getElementById('toggleStats') 可以.addEventListener('click', () => {
  document.getElementById('statsPanel').classList.toggle('open');
});

document.getElementById('closeStats')?.addEventListener('click', () => {
  document.getElementById('statsPanel').classList.remove('open');
});

// === TEMA OSCURO ===
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', saved);
  themeToggle.innerHTML = saved === 'dark' ? '' : '';

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '' : '';
  });
}

// === BÚSQUEDA ===
document.getElementById('searchInput')?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll('.order-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(term) ? 'block' : 'none';
  });
});
