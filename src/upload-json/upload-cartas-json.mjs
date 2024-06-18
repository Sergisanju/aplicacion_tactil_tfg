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

// Función para normalizar el nombre de archivo (sin acentos y con guiones bajos en lugar de espacios)
const normalizarNombreArchivo = (nombre) => {
  // Eliminar acentos y caracteres especiales
  const nombre_normalizado = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Reemplazar espacios con guiones bajos
  return nombre_normalizado.replace(/ /g, '_').toLowerCase();
};

// Función para subir archivos JSON e imágenes y guardar referencias en Firestore
const subirArchivosJSONEImagenes = async (rutaCarpeta) => {
  try {
    const categorias = fs.readdirSync(rutaCarpeta);

    for (const categoria of categorias) {
      const rutaCategoria = path.join(rutaCarpeta, categoria);
      const archivos = fs.readdirSync(rutaCategoria);

      for (const archivo of archivos) {
        if (path.extname(archivo) === '.json') {
          const rutaArchivo = path.join(rutaCategoria, archivo);
          const bufferArchivo = fs.readFileSync(rutaArchivo);
          const rutaAlmacenamiento = `juegos/cartas_de_memoria/${categoria}/${archivo}`;
          const referenciaArchivo = storage.file(rutaAlmacenamiento);

          await referenciaArchivo.save(bufferArchivo, {
            contentType: 'application/json',
          });

          const [url] = await referenciaArchivo.getSignedUrl({ action: 'read', expires: '03-01-2500' });

          // Leer datos del archivo JSON
          const datosArchivo = JSON.parse(bufferArchivo);

          // Subir imágenes y actualizar el JSON con la URL de la imagen
          const datosArchivoActualizados = await Promise.all(datosArchivo.map(async item => {
            const extensionesImagen = ['.jpg', '.png'];
            for (const ext of extensionesImagen) {
              const rutaImagen = path.join(rutaCategoria, `${normalizarNombreArchivo(item.nombre)}${ext}`);
              if (fs.existsSync(rutaImagen)) {
                const bufferImagen = fs.readFileSync(rutaImagen);
                const rutaAlmacenamientoImagen = `juegos/cartas_de_memoria/${categoria}/${normalizarNombreArchivo(item.nombre)}${ext}`;
                const referenciaImagen = storage.file(rutaAlmacenamientoImagen);

                await referenciaImagen.save(bufferImagen, {
                  contentType: 'image/jpeg', // Cambiar a 'image/png' si es necesario
                });

                const [urlImagen] = await referenciaImagen.getSignedUrl({ action: 'read', expires: '03-01-2500' });
                item.imagenURL = urlImagen;
                break; // Si se encuentra una imagen, salir del bucle
              }
            }
            return item;
          }));

          // Crear un documento para cada archivo JSON y agregar los datos en Firestore
          const referenciaDoc = firestore.collection('juegos').doc('cartas_de_memoria').collection('categorias').doc(categoria);
          await referenciaDoc.set({
            [archivo.replace('.json', '')]: {
              nombre: archivo.replace('.json', ''),
              rutaAlmacenamiento: rutaAlmacenamiento,
              url: url,
              data: datosArchivoActualizados // Guardar los datos del JSON actualizado en Firestore
            }
          }, { merge: true });

          console.log(`Subido y referenciado: ${rutaAlmacenamiento}`);
        }
      }
    }
  } catch (error) {
    console.error('Error subiendo los archivos JSON e imágenes:', error);
  }
};

// Ruta a la carpeta que contiene las subcarpetas de categorías
const rutaCarpeta = 'C:/Users/sergi/OneDrive - Universidade de Santiago de Compostela/USC/4º_Ing_Informatica/TFG/APP/Juegos/cartas_de_memoria/categorias';
subirArchivosJSONEImagenes(rutaCarpeta);
