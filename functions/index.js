const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Cargar las credenciales del servicio desde un archivo JSON
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar la aplicación de Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://aplicacion-tactil-tfg-default-rtdb.europe-west1.firebasedatabase.app'
});

// Crear una instancia de Express
const app = express();

// Permitir solicitudes CORS desde cualquier origen
app.use(cors());

// Habilitar el parsing de JSON para solicitudes entrantes
app.use(express.json());

/**
 * Endpoint para cambiar la contraseña de un usuario.
 * Requiere 'uid' y 'newPassword' en el cuerpo de la solicitud.
 */
app.post('/cambiar-contrasena', async (req, res) => {
  const { uid, newPassword } = req.body; // Obtener 'uid' y 'newPassword' del cuerpo de la solicitud
  try {
    await admin.auth().updateUser(uid, { password: newPassword }); // Actualizar la contraseña del usuario
    res.status(200).send('Contraseña actualizada correctamente.'); // Responder con éxito
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    res.status(500).send('Error actualizando contraseña: ' + error.message); // Responder con error
  }
});

/**
 * Endpoint para eliminar un usuario.
 * Requiere 'uid' en el cuerpo de la solicitud.
 */
app.post('/eliminar-usuario', async (req, res) => {
  const { uid } = req.body; // Obtener 'uid' del cuerpo de la solicitud

  // Validar que el 'uid' sea un string no vacío y tenga una longitud adecuada
  if (!uid || typeof uid !== 'string' || uid.length > 128) {
    return res.status(400).send('UID inválido');
  }

  try {
    // Eliminar usuario de la autenticación de Firebase
    await admin.auth().deleteUser(uid);

    // Eliminar usuario de Firestore
    const userDocRef = admin.firestore().collection('users').doc(uid);
    await userDocRef.delete();

    res.status(200).send('Usuario eliminado correctamente'); // Responder con éxito
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).send('Error eliminando usuario: ' + error.message); // Responder con error
  }
});

/**
 * Endpoint para agregar un nuevo usuario.
 * Requiere 'nombre', 'email', 'password', 'tipoUsuario' y 'fechaNacimiento' en el cuerpo de la solicitud.
 */
app.post('/agregar-usuario', async (req, res) => {
  const { nombre, email, password, tipoUsuario, fechaNacimiento } = req.body; // Obtener campos necesarios del cuerpo de la solicitud
  if (!nombre || !email || !password || !tipoUsuario || !fechaNacimiento) {
    return res.status(400).send('Missing fields'); // Validar que todos los campos requeridos estén presentes
  }
  try {
    // Crear el usuario en Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: nombre,
    });

    // Añadir el usuario a Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      nombre,
      email,
      tipoUsuario,
      fechaNacimiento,
    });

    res.status(200).json({ uid: userRecord.uid }); // Responder con el UID del usuario creado
  } catch (error) {
    console.error('Error añadiendo usuario:', error);
    res.status(500).send('Error añadiendo usuario: ' + error.message); // Responder con error
  }
});

// Exportar la aplicación Express como una función HTTPS de Firebase
exports.api = functions.https.onRequest(app);
