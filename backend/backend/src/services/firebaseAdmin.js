let admin;
try {
  admin = require('firebase-admin');
} catch (e) {
  admin = null;
}

const Setting = require('../models/Setting');

let initialized = false;

async function initAdmin() {
  if (!admin || initialized) return initialized;

  // Try from Settings first
  let serviceAccountJson = null;
  try {
    const setting = await Setting.findOne({ key: 'firebaseServiceAccountKey' });
    if (setting && setting.value) {
      serviceAccountJson = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    }
  } catch {}

  // Fallback to env
  if (!serviceAccountJson) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (raw) serviceAccountJson = JSON.parse(raw);
    } catch {}
  }

  if (!serviceAccountJson) {
    return false;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson)
    });
    initialized = true;
    return true;
  } catch (e) {
    return false;
  }
}

async function verifyIdToken(idToken) {
  if (!admin) throw new Error('firebase-admin not installed');
  const ok = await initAdmin();
  if (!ok) throw new Error('Firebase admin not configured');
  return admin.auth().verifyIdToken(idToken);
}

module.exports = { initAdmin, verifyIdToken };
