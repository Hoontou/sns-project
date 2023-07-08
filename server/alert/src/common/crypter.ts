import * as CryptoJS from 'crypto-js';

class Crypto {
  constructor(private secret) {
    this.secret = CryptoJS.enc.Utf8.parse(secret);
  }
  public encrypt(value: string | number): string {
    if (Number.isNaN(Number(value))) {
      console.log('Already encrypted value');
      return String(value);
    }

    const encrypted = CryptoJS.AES.encrypt(String(value), this.secret, {
      iv: this.secret,
    }).toString();
    return encrypted;
  }

  public decrypt(value: string | number): string {
    if (!Number.isNaN(Number(value))) {
      console.log('Already decrypted value');
      return String(value);
    }

    const decrypted = CryptoJS.AES.decrypt(String(value), this.secret, {
      iv: this.secret,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

export const crypter = new Crypto('2e47f242a46d13eeb22aabc01d5e5d05');
