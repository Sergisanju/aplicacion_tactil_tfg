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
    res.status(500).send('Error updating password: ' + error.message);
  }
});

exports.api = functions.https.onRequest(app);
