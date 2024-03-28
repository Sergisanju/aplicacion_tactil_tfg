// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2pTtM4aLBR_e29OcKb0pTpf3wEXTM5Tc",
  authDomain: "aplicacion-tactil-tfg.firebaseapp.com",
  databaseURL: "https://aplicacion-tactil-tfg-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aplicacion-tactil-tfg",
  storageBucket: "aplicacion-tactil-tfg.appspot.com",
  messagingSenderId: "978499274838",
  appId: "1:978499274838:web:ac5fda7b3e65cd11ba53f7",
  measurementId: "G-W41KBQQCWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

