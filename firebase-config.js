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

// Referencia al archivo JSON en Firebase Storage
const storageRef = firebase.storage().ref('/cartas_de_memoria/animales');

// Descarga el archivo JSON
storageRef.getDownloadURL().then((url) => {
  // Realiza la petición HTTP para obtener el archivo JSON
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Aquí puedes usar los datos del archivo JSON
      console.log(data);
      // Por ejemplo, para mostrar el nombre de la primera carta
      console.log(data[0].nombre);
    })
    .catch(error => {
      console.error('Error al descargar el archivo JSON:', error);
    });
}).catch((error) => {
  console.error('Error al obtener la URL de descarga:', error);
});