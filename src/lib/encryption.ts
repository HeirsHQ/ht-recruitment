import CryptoJS from "crypto-js";

const initializationVector = process.env.NEXT_PUBLIC_INITIALIZATION_VECTOR;
const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

export class Encryption {
  private iv: CryptoJS.lib.WordArray;
  private key: CryptoJS.lib.WordArray;

  constructor() {
    this.iv = CryptoJS.enc.Utf8.parse(initializationVector);
    this.key = CryptoJS.enc.Utf8.parse(secretKey);
  }

  encrypt<T>(data: T): string {
    const json = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(json, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  }

  decrypt<T>(hex: string): T {
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(hex),
    });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)) as T;
  }
}
