// Conectar Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBi49isj_vzkCzIyJLxsAQ_4n3_zMu4txs",
  authDomain: "buendiashop-f3dcc.firebaseapp.com",
  projectId: "buendiashop-f3dcc",
  storageBucket: "buendiashop-f3dcc.appspot.com",
  messagingSenderId: "181970112547",
  appId: "1:181970112547:web:5b5372bdb58033ba5e6196",
  measurementId: "G-MKP6G4V2KW"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();
