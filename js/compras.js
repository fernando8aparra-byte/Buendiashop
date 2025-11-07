// js/compras.js
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

// === CARGAR COMPRAS EN TIEMPO REAL ===
const ordersRef = collection(db, "orders");
let unsubscribe = null;

function loadOrders(order = 'desc') {
  const q = query(ordersRef, orderBy("date", order));
  unsubscribe = onSnapshot(q, (snapshot) => {
    orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    renderOrders();
    updateTotal();
    updateNotifications();
  });
}

loadOrders('desc');

// === RENDERIZAR COMPRAS ===
function renderOrders() {
  const container = document.getElementById('ordersContainer');
  container.innerHTML = '';

  if (orders.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#666;">No hay compras aún.</p>';
    return;
  }

  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';

    const date = order.date?.toDate?.() || new Date(order.date);
    const formattedDate = date.toLocaleString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const productsHtml = order.products.map(p => `
      <div class="order-product">
        • ${p.name} (x${p.qty}) - $${p.price * p.qty}
      </div>
    `).join('');

    const address = `${order.address.street}, ${order.address.colonia}, ${order.address.cp}, ${order.address.state}`;

    card.innerHTML = `
      <div class="order-header">Compra #${order.id.slice(0, 8)}</div>
      <div class="order-id">ID: ${order.paymentId}</div>
      <div class="order-total">Total: $${order.total}</div>
      <div class="order-products">${productsHtml}</div>
      <div class="order-address">
        <strong>${order.address.name}</strong><br>
        ${address}<br>
        Tel: ${order.address.phone}
      </div>
      <div style="font-size:0.8rem; color:#666; margin-top:8px;">
        ${formattedDate}
      </div>
    `;

    container.appendChild(card);
  });
}

// === TOTAL DE COMPRAS ===
function updateTotal() {
  document.getElementById('totalCompras').textContent = `Total: ${orders.length} compra${orders.length !== 1 ? 's' : ''}`;
}

// === NOTIFICACIONES (ÚLTIMAS 5) ===
function updateNotifications() {
  const notif = document.getElementById('notifications');
  notif.innerHTML = '';

  const recent = orders.slice(0, 5);
  if (recent.length === 0) {
    notif.innerHTML = '<div class="notification-item">No hay compras recientes.</div>';
    return;
  }

  recent.forEach(order => {
    const date = order.date?.toDate?.() || new Date(order.date);
    const time = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const item = document.createElement('div');
    item.className = 'notification-item';
    item.innerHTML = `
      <strong>Nueva compra</strong><br>
      ${order.address.name} - $${order.total}<br>
      <span class="notification-time">${time}</span>
    `;
    notif.appendChild(item);
  });

  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 5000);
}

// === ORDENAR ===
document.getElementById('sortBtn').onclick = () => {
  sortAsc = !sortAsc;
  const order = sortAsc ? 'asc' : 'desc';
  document.getElementById('sortBtn').innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" fill="currentColor"/><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>
    ${sortAsc ? 'Antiguas primero' : 'Recientes primero'}
  `;
  if (unsubscribe) unsubscribe();
  loadOrders(order);
};

// === CERRAR SESIÓN ===
document.getElementById('logoutBtn').onclick = () => {
  if (confirm("¿Cerrar sesión?")) {
    localStorage.removeItem('isAdmin');
    window.location.href = 'login.html';
  }
};

// === ENGRANAJE ===
document.getElementById('adminGear').onclick = e => {
  e.stopPropagation();
  document.getElementById('adminDropdown').classList.toggle('show');
};
document.addEventListener('click', () => {
  document.getElementById('adminDropdown').classList.remove('show');
});
