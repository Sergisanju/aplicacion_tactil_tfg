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

        // Procesar archivos JSON directamente dentro de las categorías
        if (fileStat.isFile() && path.extname(file) === '.json') {
          const fileBuffer = fs.readFileSync(filePath);
          const storagePath = `juegos/categorizacion/categorias/${category}/${file}`;
          const fileRef = storage.file(storagePath);

          await fileRef.save(fileBuffer, {
            contentType: 'application/json',
          });

          const [url] = await fileRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });

          // Leer datos del archivo JSON
          const fileData = JSON.parse(fileBuffer);

          // Crear documento para la categoría y archivo JSON como subcampo en la colección `categorias`
          const docRefCategoria = firestore.collection('juegos').doc('categorizacion').collection('categorias').doc(category);
          await docRefCategoria.set({
            name: file.replace('.json', ''),
            storagePath: storagePath,
            url: url,
            data: fileData, // Guardar los datos del JSON en Firestore
          }, { merge: true });

          console.log(`Subido y referenciado en categorias: ${storagePath}`);
        }

        // Procesar subcategorías si hay una carpeta 'subcategorias'
        if (fileStat.isDirectory() && file === 'subcategorias') {
          const subcategoryPath = path.join(categoryPath, 'subcategorias');
          const subcategoryFiles = fs.readdirSync(subcategoryPath);

          for (const subFile of subcategoryFiles) {
            const subFilePath = path.join(subcategoryPath, subFile);
            const subFileStat = fs.statSync(subFilePath);

            if (subFileStat.isFile() && path.extname(subFile) === '.json') {
              const subFileBuffer = fs.readFileSync(subFilePath);
              const subStoragePath = `juegos/categorizacion/subcategorias/${category}/${subFile}`;
              const subFileRef = storage.file(subStoragePath);

              await subFileRef.save(subFileBuffer, {
                contentType: 'application/json',
              });

              const [subUrl] = await subFileRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });

              // Leer datos del archivo JSON
              const subFileData = JSON.parse(subFileBuffer);

              // Crear documento para la subcategoría y archivo JSON como subcampo en la colección `subcategorias`
              const docRefSubcategoria = firestore.collection('juegos').doc('categorizacion').collection('subcategorias').doc(`${subFile.replace('.json', '')}`);
              await docRefSubcategoria.set({
                name: `${subFile.replace('.json', '')}`,
                storagePath: subStoragePath,
                url: subUrl,
                data: subFileData, // Guardar los datos del JSON en Firestore
              });

              console.log(`Subido y referenciado en subcategorias: ${subStoragePath}`);
            }
          }
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
