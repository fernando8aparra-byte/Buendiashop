// firebase.js
// Incluye este archivo con <script src="firebase.js"></script> en cada HTML
// Asegúrate de añadir las libs firebase-app, auth y firestore en cada html.

if (typeof firebase === 'undefined') {
  console.error('Carga primero los scripts de Firebase en tu HTML (firebase-app.js, firebase-auth.js, firebase-firestore.js).');
}

// Config (la que nos diste)
const firebaseConfig = {
  apiKey: "AIzaSyBmv4Wtlg295lfsWh1vpDtOHkxMD34vmUE",
  authDomain: "boutique-buendia.firebaseapp.com",
  projectId: "boutique-buendia",
  storageBucket: "boutique-buendia.firebasestorage.app",
  messagingSenderId: "430651152709",
  appId: "1:430651152709:web:aaa54eeb8e3ba64c43062c",
  measurementId: "G-9KJ2330RN7"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
window.__FB = { auth, db }; // export simple reference para usar en los HTML
