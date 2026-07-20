import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret || secret.length !== 32) throw new Error("ENCRYPTION_KEY must be exactly 32 chars");
  return Buffer.from(secret, 'utf8');
}

export const CryptoUtils = {
  encrypt(plainText: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return {
      encryptedPassword: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag
    };
  },

  decrypt(encryptedPassword: string, ivHex: string, authTagHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getMasterKey(), iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
};
