import * as CryptoJS from 'crypto-js';

export const JwtSecret = 'HowCuteMyCheeze';

class Crypto {
  constructor(private uuidSecret) {
    this.uuidSecret = CryptoJS.enc.Utf8.parse(uuidSecret);
  }
  public encrypt(value) {
    const encrypted = CryptoJS.AES.encrypt(value, this.uuidSecret, {
      iv: this.uuidSecret,
    }).toString();
    return encrypted;
  }

  public decrypt(value) {
    const decryptedData = CryptoJS.AES.decrypt(value, this.uuidSecret, {
      iv: this.uuidSecret,
    });
    return decryptedData.toString(CryptoJS.enc.Utf8);
  }
}

export const crypter = new Crypto('2e47f242a46d13eeb22aabc01d5e5d05');
