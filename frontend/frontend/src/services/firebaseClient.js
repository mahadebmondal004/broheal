import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

let app;
let auth;
let recaptchaInstance;

export function initFirebase(config) {
  if (!app) app = initializeApp(config);
  if (!auth) auth = getAuth(app);
  try {
    const disable = import.meta.env.VITE_FIREBASE_DISABLE_CAPTCHA === 'true';
    if (disable) auth.settings.appVerificationDisabledForTesting = true;
  } catch {}
  return auth;
}

export async function getRecaptchaVerifier(authInstance, containerId = 'recaptcha-container') {
  try {
    if (authInstance.settings?.appVerificationDisabledForTesting) {
      recaptchaInstance = {
        type: 'recaptcha',
        verify: async () => '',
        _reset: () => {}
      };
      return recaptchaInstance;
    }
  } catch {}
  if (recaptchaInstance) return recaptchaInstance;
  if (!document.getElementById(containerId)) {
    const div = document.createElement('div');
    div.id = containerId;
    document.body.appendChild(div);
  }
  recaptchaInstance = new RecaptchaVerifier(authInstance, containerId, { size: 'invisible' });
  try { await recaptchaInstance.render(); } catch {}
  return recaptchaInstance;
}

export function sendPhoneOtp(authInstance, phoneE164, verifier) {
  return signInWithPhoneNumber(authInstance, phoneE164, verifier);
}

export function resetRecaptcha() {
  try {
    if (recaptchaInstance?._reset) recaptchaInstance._reset();
    if (recaptchaInstance?.clear) recaptchaInstance.clear();
  } catch {}
  recaptchaInstance = null;
}
