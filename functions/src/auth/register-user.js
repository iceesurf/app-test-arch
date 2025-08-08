const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore"); // Importar FieldValue

/**
 * @name registerUser
 * @description Callable function to register a new user.
 * @param {object} data - The data sent from the client.
 * @param {string} data.email - The user's email.
 * @param {string} data.password - The user's password.
 * @param {string} [data.displayName] - The user's display name.
 * @param {object} context - The context of the function call.
 */
exports.registerUser = functions.https.onCall(async (data, context) => {
  const {email, password, displayName} = data.data;

  // Basic validation
  if (!email || !password) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Email and password are required.",
    );
  }

  try {
    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName || null,
    });

    // Optionally, save additional user data to Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      email: email,
      displayName: displayName || null,
      createdAt: FieldValue.serverTimestamp(), // Usar FieldValue diretamente
    });

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    };
  } catch (error) {
    // Handle specific Firebase Auth errors
    if (error.code === "auth/email-already-in-use") {
      throw new functions.https.HttpsError(
          "already-exists",
          "The email address is already in use by another account.",
      );
    } else if (error.code === "auth/weak-password") {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "The password is too weak.",
      );
    } else {
      throw new functions.https.HttpsError(
          "internal",
          "An unexpected error occurred during registration.",
          error.message,
      );
    }
  }
});
