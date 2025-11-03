
// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// Configuración
const firebaseConfig = {
  apiKey: "AIzaSyBi49isj_vzkCzIyJLxsAQ_4n3_zMu4txs",
  authDomain: "buendiashop-f3dcc.firebaseapp.com",
  projectId: "buendiashop-f3dcc",
  storageBucket: "buendiashop-f3dcc.firebasestorage.app",
  messagingSenderId: "181970112547",
  appId: "1:181970112547:web:99072e1c4692bb195e6196",
  measurementId: "G-1Z5CKSCJDZ"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, collection, getDocs, query, where, onAuthStateChanged };
