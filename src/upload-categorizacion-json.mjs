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
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
          // Si es una subcategoría, procesar recursivamente
          const subcategory = file;
          const subcategoryPath = path.join(categoryPath, subcategory);
          const subcategoryFiles = fs.readdirSync(subcategoryPath);

          for (const subFile of subcategoryFiles) {
            const subFilePath = path.join(subcategoryPath, subFile);
            const subFileBuffer = fs.readFileSync(subFilePath);
            const storagePath = `juegos/categorizacion/${category}/${subcategory}/${subFile}`;
            const subFileRef = storage.file(storagePath);

            await subFileRef.save(subFileBuffer, {
              contentType: 'application/json',
            });

            const [url] = await subFileRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });

            // Crear documento para la subcategoría y archivo JSON como subcampo
            const docRef = firestore.collection('juegos').doc('categorizacion').collection('categories').doc(category).collection('subcategories').doc(subcategory).collection('files').doc(subFile.replace('.json', ''));
            await docRef.set({
              name: subFile.replace('.json', ''),
              storagePath: storagePath,
              url: url,
            });

            console.log(`Subido y referenciado: ${storagePath}`);
          }
        } else {
          // Si es un archivo JSON, procesar normalmente
          const fileBuffer = fs.readFileSync(filePath);
          const storagePath = `juegos/categorizacion/${category}/${file}`;
          const fileRef = storage.file(storagePath);

          await fileRef.save(fileBuffer, {
            contentType: 'application/json',
          });

          const [url] = await fileRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });

          // Crear documento para la categoría y archivo JSON como subcampo
          const docRef = firestore.collection('juegos').doc('categorizacion').collection('categories').doc(category).collection('files').doc(file.replace('.json', ''));
          await docRef.set({
            name: file.replace('.json', ''),
            storagePath: storagePath,
            url: url,
          });

          console.log(`Subido y referenciado: ${storagePath}`);
        }
      }
    }
  } catch (error) {
    console.error('Error subiendo los archivos JSON:', error);
  }
};

// Ruta a la carpeta que contiene las subcarpetas de categorías
const folderPath = 'C:/Users/sergi/OneDrive - Universidade de Santiago de Compostela/USC/4º_Ing_Informatica/TFG/APP/Juegos/categorizacion/categorias';
uploadJSONFiles(folderPath);
