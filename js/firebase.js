// js/firebase.js
// Inicializa Firestore por si quieres leer config/admin desde Firestore.
// Si no lo usas ahora, lo dejamos listo para opciones admin.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmv4Wtlg295lfsWh1vpDtOHkxMD34vmUE",
  authDomain: "boutique-buendia.firebaseapp.com",
  projectId: "boutique-buendia",
  storageBucket: "boutique-buendia.firebasestorage.app",
  messagingSenderId: "430651152709",
  appId: "1:430651152709:web:aaa54eeb8e3ba64c43062c",
  measurementId: "G-9KJ2330RN7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// función opcional: leer config (si pones doc config/main en Firestore)
export async function loadConfig() {
  try {
    const cfgRef = doc(db, "config", "main");
    const snap = await getDoc(cfgRef);
    if (!snap.exists()) return null;
    return snap.data();
  } catch (e) {
    console.warn("No se pudo leer config:", e.message);
    return null;
  }
}
