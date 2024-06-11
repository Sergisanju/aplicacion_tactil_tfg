const express = require('express');
const cors = require('cors');
const admin = require('./firebase-config'); // Importa la configuración de Firebase Admin

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
