import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Numa aplicação real, esta chave viria do process.env.SECRET_KEY
const SECRET_KEY = process.env.SECRET_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; // 32 caracteres

export const encryptString = (text: string): string => {
  if (!text) return text;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Guardamos no formato iv:authTag:encryptedData para poder desencriptar depois
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

export const decryptString = (encryptedText: string): string => {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText; // Não está no formato esperado

    const [ivHex, authTagHex, encryptedHex] = parts;
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("Erro ao desencriptar:", error);
    return "ERRO_DE_ENCRIPTACAO";
  }
};
