import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Configuración de Firebase Admin
const rutaCuentaServicio = 'C:/Users/sergi/OneDrive - Universidade de Santiago de Compostela/USC/4º_Ing_Informatica/TFG/APP/aplicacion-tactil-tfg-firebase-adminsdk-cypc7-42ce36c220.json';
const cuentaServicio = JSON.parse(fs.readFileSync(rutaCuentaServicio, 'utf8'));

initializeApp({
  credential: cert(cuentaServicio),
  storageBucket: 'aplicacion-tactil-tfg.appspot.com'
});

const firestore = getFirestore();
const storage = getStorage().bucket();

// Función para subir archivos JSON y guardar referencias en Firestore
const subirArchivosJSON = async (rutaCarpeta) => {
  try {
    const categorias = fs.readdirSync(rutaCarpeta);

    for (const categoria of categorias) {
      const rutaCategoria = path.join(rutaCarpeta, categoria);
      const archivos = fs.readdirSync(rutaCategoria);

      for (const archivo of archivos) {
        const rutaArchivo = path.join(rutaCategoria, archivo);
        const estadisticasArchivo = fs.statSync(rutaArchivo);

        // Procesar archivos JSON directamente dentro de las categorías
        if (estadisticasArchivo.isFile() && path.extname(archivo) === '.json') {
          const bufferArchivo = fs.readFileSync(rutaArchivo);
          const rutaAlmacenamiento = `juegos/categorizacion/categorias/${categoria}/${archivo}`;
          const referenciaArchivo = storage.file(rutaAlmacenamiento);

          await referenciaArchivo.save(bufferArchivo, {
            contentType: 'application/json',
          });

          const [url] = await referenciaArchivo.getSignedUrl({ action: 'read', expires: '03-01-2500' });

          // Leer datos del archivo JSON
          const datosArchivo = JSON.parse(bufferArchivo);

          // Crear documento para la categoría y archivo JSON como subcampo en la colección `categorias`
          const referenciaDocCategoria = firestore.collection('juegos').doc('categorizacion').collection('categorias').doc(categoria);
          await referenciaDocCategoria.set({
            nombre: archivo.replace('.json', ''),
            rutaAlmacenamiento: rutaAlmacenamiento,
            url: url,
            data: datosArchivo, // Guardar los datos del JSON en Firestore
          }, { merge: true });

          console.log(`Subido y referenciado en categorias: ${rutaAlmacenamiento}`);
        }

        // Procesar subcategorías si hay una carpeta 'subcategorias'
        if (estadisticasArchivo.isDirectory() && archivo === 'subcategorias') {
          const rutaSubcategoria = path.join(rutaCategoria, 'subcategorias');
          const archivosSubcategoria = fs.readdirSync(rutaSubcategoria);

          for (const archivoSub of archivosSubcategoria) {
            const rutaArchivoSub = path.join(rutaSubcategoria, archivoSub);
            const estadisticasArchivoSub = fs.statSync(rutaArchivoSub);

            if (estadisticasArchivoSub.isFile() && path.extname(archivoSub) === '.json') {
              const bufferArchivoSub = fs.readFileSync(rutaArchivoSub);
              const rutaAlmacenamientoSub = `juegos/categorizacion/subcategorias/${categoria}/${archivoSub}`;
              const referenciaArchivoSub = storage.file(rutaAlmacenamientoSub);

              await referenciaArchivoSub.save(bufferArchivoSub, {
                contentType: 'application/json',
              });

              const [urlSub] = await referenciaArchivoSub.getSignedUrl({ action: 'read', expires: '03-01-2500' });

              // Leer datos del archivo JSON
              const datosArchivoSub = JSON.parse(bufferArchivoSub);

              // Crear documento para la subcategoría y archivo JSON como subcampo en la colección `subcategorias`
              const referenciaDocSubcategoria = firestore.collection('juegos').doc('categorizacion').collection('subcategorias').doc(`${archivoSub.replace('.json', '')}`);
              await referenciaDocSubcategoria.set({
                nombre: `${archivoSub.replace('.json', '')}`,
                rutaAlmacenamiento: rutaAlmacenamientoSub,
                url: urlSub,
                data: datosArchivoSub, // Guardar los datos del JSON en Firestore
              });

              console.log(`Subido y referenciado en subcategorias: ${rutaAlmacenamientoSub}`);
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
const rutaCarpeta = 'C:/Users/sergi/OneDrive - Universidade de Santiago de Compostela/USC/4º_Ing_Informatica/TFG/APP/Juegos/categorizacion/categorias';
subirArchivosJSON(rutaCarpeta);
