import * as CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

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

const crypter = new Crypto('CreamIsPig');

const txt = uuidv4();
console.log('plain is', txt);
const tst = crypter.encrypt(txt);
console.log('enc is', tst);
console.log('dec is', crypter.decrypt(tst));
