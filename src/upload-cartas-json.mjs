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

// Función para normalizar el nombre de archivo (sin acentos y con guiones bajos en lugar de espacios)
const normalizeFilename = (name) => {
  // Eliminar acentos y caracteres especiales
  const normalized_name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Reemplazar espacios con guiones bajos
  return normalized_name.replace(/ /g, '_').toLowerCase();
};

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
            const imageExtensions = ['.jpg', '.png'];
            for (const ext of imageExtensions) {
              const imagePath = path.join(categoryPath, `${normalizeFilename(item.nombre)}${ext}`);
              if (fs.existsSync(imagePath)) {
                const imageBuffer = fs.readFileSync(imagePath);
                const imageStoragePath = `juegos/cartas_de_memoria/${category}/${normalizeFilename(item.nombre)}${ext}`;
                const imageRef = storage.file(imageStoragePath);

                await imageRef.save(imageBuffer, {
                  contentType: 'image/jpeg', // Cambiar a 'image/png' si es necesario
                });

                const [imageURL] = await imageRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });
                item.imagenURL = imageURL;
                break; // Si se encuentra una imagen, salir del bucle
              }
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
