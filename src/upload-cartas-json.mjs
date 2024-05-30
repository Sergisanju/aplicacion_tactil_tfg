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

// Función para subir archivos JSON e imágenes y guardar referencias en Firestore
const uploadJSONAndImageFiles = async (folderPath) => {
  try {
    const categories = fs.readdirSync(folderPath);

    for (const category of categories) {
      const categoryPath = path.join(folderPath, category);
      const files = fs.readdirSync(categoryPath);

      for (const file of files) {
        if (path.extname(file) === '.json') {
          const filePath = path.join(categoryPath, file);
          const fileBuffer = fs.readFileSync(filePath);
          const storagePath = `juegos/cartas_de_memoria/${category}/${file}`;
          const fileRef = storage.file(storagePath);

          await fileRef.save(fileBuffer, {
            contentType: 'application/json',
          });

          const [url] = await fileRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });

          // Leer datos del archivo JSON
          const fileData = JSON.parse(fileBuffer);

          // Subir imágenes y actualizar el JSON con la URL de la imagen
          const updatedFileData = await Promise.all(fileData.map(async item => {
            const imagePath = path.join(categoryPath, `${item.nombre.toLowerCase()}.jpg`);
            if (fs.existsSync(imagePath)) {
              const imageBuffer = fs.readFileSync(imagePath);
              const imageStoragePath = `juegos/cartas_de_memoria/${category}/${item.nombre.toLowerCase()}.jpg`;
              const imageRef = storage.file(imageStoragePath);

              await imageRef.save(imageBuffer, {
                contentType: 'image/jpeg',
              });

              const [imageURL] = await imageRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });
              item.imagenURL = imageURL;
            } else {
              console.warn(`Imagen no encontrada para: ${item.nombre}`);
            }
            return item;
          }));

          // Crear un documento para cada archivo JSON y agregar los datos en Firestore
          const docRef = firestore.collection('juegos').doc('cartas_de_memoria').collection('categorias').doc(category);
          await docRef.set({
            [file.replace('.json', '')]: {
              name: file.replace('.json', ''),
              storagePath: storagePath,
              url: url,
              data: updatedFileData // Guardar los datos del JSON actualizado en Firestore
            }
          }, { merge: true });

          console.log(`Subido y referenciado: ${storagePath}`);
        }
      }
    }
  } catch (error) {
    console.error('Error subiendo los archivos JSON e imágenes:', error);
  }
};

// Ruta a la carpeta que contiene las subcarpetas de categorías
const folderPath = 'C:/Users/sergi/OneDrive - Universidade de Santiago de Compostela/USC/4º_Ing_Informatica/TFG/APP/Juegos/cartas_de_memoria/categorias';
uploadJSONAndImageFiles(folderPath);
