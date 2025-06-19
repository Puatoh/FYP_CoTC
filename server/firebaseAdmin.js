const admin = require('firebase-admin');
const path = require('path');

// Ensure you have downloaded your serviceAccountKey.json from Firebase Console
// and placed it in the server/ directory (do NOT commit this file to Git).
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;