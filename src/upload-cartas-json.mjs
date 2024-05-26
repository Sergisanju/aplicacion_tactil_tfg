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
  storageBucket: 'aplicacion-tactil-tfg.appspot.com'
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
        const storagePath = `juegos/cartas_de_memoria/${category}/${file}`;
        const fileRef = storage.file(storagePath);

        await fileRef.save(fileBuffer, {
          contentType: 'application/json',
        });

        const [url] = await fileRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });

        // Crear un documento para cada categoría y agregar los archivos JSON como campos
        const docRef = firestore.collection('juegos').doc('cartas_de_memoria').collection('categories').doc(category);
        await docRef.set({
          [file.replace('.json', '')]: {
            name: file.replace('.json', ''),
            storagePath: storagePath,
            url: url,
          }
        }, { merge: true });

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
