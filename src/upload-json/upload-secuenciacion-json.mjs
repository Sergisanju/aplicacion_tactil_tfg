import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Configuración de Firebase Admin
const rutaCuentaServicio = 'C:/Users/sergi/OneDrive - Universidade de Santiago de Compostela/USC/4º_Ing_Informatica/TFG/APP/aplicacion-tactil-tfg-firebase-adminsdk-cypc7-440047711d.json';
const cuentaServicio = JSON.parse(fs.readFileSync(rutaCuentaServicio, 'utf8'));

initializeApp({
  credential: cert(cuentaServicio),
  storageBucket: 'aplicacion-tactil-tfg.appspot.com'
});

const firestore = getFirestore();
const storage = getStorage().bucket();

// Función para subir archivos JSON y guardar referencias en Firestore
const subirArchivosJSON = async (rutaCarpeta, juego) => {
  try {
    const categorias = fs.readdirSync(rutaCarpeta);

    for (const categoria of categorias) {
      const rutaCategoria = path.join(rutaCarpeta, categoria);
      const archivos = fs.readdirSync(rutaCategoria);

      for (const archivo of archivos) {
        const rutaArchivo = path.join(rutaCategoria, archivo);
        const bufferArchivo = fs.readFileSync(rutaArchivo);
        const rutaAlmacenamiento = `juegos/${juego}/${categoria}/${archivo}`;
        const referenciaArchivo = storage.file(rutaAlmacenamiento);

        await referenciaArchivo.save(bufferArchivo, {
          contentType: 'application/json',
        });

        const [url] = await referenciaArchivo.getSignedUrl({ action: 'read', expires: '03-01-2500' });

        // Leer datos del archivo JSON
        const datosArchivo = JSON.parse(bufferArchivo);

        // Crear un documento para cada archivo JSON dentro de la subcolección 'archivos' de cada categoría
        const referenciaDoc = firestore.collection('juegos').doc(juego).collection('categorias').doc(categoria);
        await referenciaDoc.set({
          [archivo.replace('.json', '')]: {
            nombre: archivo.replace('.json', ''),
            rutaAlmacenamiento: rutaAlmacenamiento,
            url: url,
            data: datosArchivo, // Guardar los datos del JSON en Firestore
          }
        }, { merge: true });

        console.log(`Subido y referenciado: ${rutaAlmacenamiento}`);
      }
    }
  } catch (error) {
    console.error('Error subiendo los archivos JSON:', error);
  }
};

// Ruta a la carpeta que contiene las subcarpetas de categorías
const rutaCarpeta = 'C:/Users/sergi/OneDrive - Universidade de Santiago de Compostela/USC/4º_Ing_Informatica/TFG/APP/Juegos/secuenciacion/variaciones';
const juego = 'secuenciacion';
subirArchivosJSON(rutaCarpeta, juego);
