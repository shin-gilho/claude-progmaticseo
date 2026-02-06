import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;

if (!SECRET_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('ENCRYPTION_SECRET_KEY is not defined in environment variables');
}

const getSecretKey = () => {
  if (!SECRET_KEY) {
    // Development fallback - DO NOT use in production
    console.warn('Using development fallback encryption key');
    return 'dev-secret-key-do-not-use-in-production';
  }
  return SECRET_KEY;
};

export function encrypt(plaintext: string): string {
  return CryptoJS.AES.encrypt(plaintext, getSecretKey()).toString();
}

export function decrypt(ciphertext: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, getSecretKey());
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
