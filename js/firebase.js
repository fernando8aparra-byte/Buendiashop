// Importar SDKs necesarios desde Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-storage.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBi49isj_vzkCzIyJLxsAQ_4n3_zMu4txs",
  authDomain: "buendiashop-f3dcc.firebaseapp.com",
  projectId: "buendiashop-f3dcc",
  storageBucket: "buendiashop-f3dcc.appspot.com",
  messagingSenderId: "181970112547",
  appId: "1:181970112547:web:99072e1c4692bb195e6196",
  measurementId: "G-1Z5CKSCJDZ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios para usarlos en otros archivos
export const db = getFirestore(app);
export const storage = getStorage(app);
