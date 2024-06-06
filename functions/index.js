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

app.post('/change-password', async (req, res) => {
  const { uid, newPassword } = req.body;
  try {
    await admin.auth().updateUser(uid, { password: newPassword });
    res.status(200).send('Password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send('Error updating password: ' + error.message);
  }
});

app.post('/delete-user', async (req, res) => {
  const { uid } = req.body;
  if (!uid || typeof uid !== 'string' || uid.length > 128) {
    return res.status(400).send('Invalid UID');
  }
  try {
    console.log('Deleting user with UID:', uid); // Debugging line
    await admin.auth().deleteUser(uid);
    res.status(200).send('User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Error deleting user: ' + error.message);
  }
});

app.post('/add-user', async (req, res) => {
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
    console.error('Error adding user:', error);
    res.status(500).send('Error adding user: ' + error.message);
  }
});

exports.api = functions.https.onRequest(app);
