// Importar las funciones necesarias del SDK de Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBi49isj_vzkCzIyJLxsAQ_4n3_zMu4txs",
  authDomain: "buendiashop-f3dcc.firebaseapp.com",
  projectId: "buendiashop-f3dcc",
  storageBucket: "buendiashop-f3dcc.appspot.com", // ✅ Corrección importante
  messagingSenderId: "181970112547",
  appId: "1:181970112547:web:99072e1c4692bb195e6196",
  measurementId: "G-1Z5CKSCJDZ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializar servicios
const db = getFirestore(app);      // Base de datos Firestore
const storage = getStorage(app);   // Almacenamiento de imágenes
const auth = getAuth(app);         // Autenticación de usuarios

// Exportar para usar en otros archivos
export { db, storage, auth };
