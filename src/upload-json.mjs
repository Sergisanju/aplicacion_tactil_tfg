import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Configuración de Firebase Admin
const serviceAccountPath = 'C:/Users/sergi/OneDrive - Universidade de Santiago de Compostela/USC/4º_Ing_Informatica/TFG/APP/aplicacion-tactil-tfg-firebase-adminsdk-cypc7-42ce36c220.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'your-project-id.appspot.com'  // Reemplaza 'your-project-id' con tu ID de proyecto real
});

const firestore = getFirestore();
const storage = getStorage().bucket();

// Función para subir archivos JSON y guardar referencias en Firestore
const uploadJSONFiles = async (folderPath) => {
  try {
    const categories = fs.readdirSync(folderPath);

    for (const category of categories) {
      const categoryPath = path.join(folderPath, category);
      const files = fs.readdirSync(categoryPath);

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const fileBuffer = fs.readFileSync(filePath);
        const storagePath = `${category}/${file}`;
        const fileRef = storage.file(storagePath);

        await fileRef.save(fileBuffer, {
          contentType: 'application/json',
        });

        const url = await fileRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });

        const docRef = firestore.collection('categories').doc(category).collection('files').doc(file.replace('.json', ''));
        await docRef.set({
          name: file.replace('.json', ''),
          storagePath: storagePath,
          url: url[0],
        });

        console.log(`Subido y referenciado: ${storagePath}`);
      }
    }
  } catch (error) {
    console.error('Error subiendo los archivos JSON:', error);
  }
};

// Ruta a la carpeta que contiene las subcarpetas de categorías
const folderPath = 'C:/Users/sergi/OneDrive - Universidade de Santiago de Compostela/USC/4º_Ing_Informatica/TFG/APP/Juegos/cartas_de_memoria/categorias';
uploadJSONFiles(folderPath);
