const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.eliminarUsuario = functions.https.onCall(async (data, context) => {
  const uid = data.uid;

  // Verificar si el usuario está autenticado y es administrador
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Debes ser un usuario administrativo para eliminar."
    );
  }

  try {
    await admin.auth().deleteUser(uid);
    return {
      message: `Usuario con UID: ${uid} eliminado correctamente.`,
    };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});
