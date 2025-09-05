import CryptoJS from "crypto-js";

// Use a passphrase (in dev you can store it in AsyncStorage). For production, manage keys properly.
export function encryptText(plaintext, passphrase) {
  const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes = 128 bits
  const encrypted = CryptoJS.AES.encrypt(plaintext, CryptoJS.enc.Utf8.parse(passphrase), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  // Save iv as hex and ciphertext as base64
  return {
    ciphertext: encrypted.toString(),          // base64 string
    iv: iv.toString(CryptoJS.enc.Hex)          // hex string
  };
}

export function decryptText(ciphertext, ivHex, passphrase) {
  try {
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const bytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(passphrase), {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
  } catch (e) {
    console.warn("decrypt error", e);
    return null;
  }
}
