const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://aplicacion-tactil-tfg-default-rtdb.europe-west1.firebasedatabase.app'
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/cambiar-contrasena', async (req, res) => {
  const { uid, newPassword } = req.body;
  try {
    await admin.auth().updateUser(uid, { password: newPassword });
    res.status(200).send('Contraseña actualizada correctamente.');
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    res.status(500).send('Error actualizando contraseña: ' + error.message);
  }
});

// Función en la nube para eliminar un usuario
app.post('/eliminar-usuario', async (req, res) => {
  const { uid } = req.body;

  // Validación del UID
  if (!uid || typeof uid !== 'string' || uid.length > 128) {
    return res.status(400).send('UID inválido');
  }

  try {
    // Eliminar usuario de la autenticación de Firebase
    await admin.auth().deleteUser(uid);

    // Eliminar usuario de Firestore
    const userDocRef = admin.firestore().collection('users').doc(uid);
    await userDocRef.delete();

    res.status(200).send('Usuario eliminado correctamente');
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).send('Error eliminando usuario: ' + error.message);
  }
});


app.post('/agregar-usuario', async (req, res) => {
  const { nombre, email, password, tipoUsuario, fechaNacimiento } = req.body;
  if (!nombre || !email || !password || !tipoUsuario || !fechaNacimiento) {
    return res.status(400).send('Missing fields');
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

    res.status(200).json({ uid: userRecord.uid });
  } catch (error) {
    console.error('Error añadiendo usuario:', error);
    res.status(500).send('Error añadiendo usuario: ' + error.message);
  }
});

exports.api = functions.https.onRequest(app);
