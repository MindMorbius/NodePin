import crypto from 'crypto';
import { generate } from 'random-words';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-min-32-chars!!';
const IV_LENGTH = 16;

function normalizeKey(key: string): Buffer {
  if (key.length < 32) {
    return Buffer.from(key.padEnd(32, key[0]));
  }
  if (key.length > 32) {
    return Buffer.from(key.slice(0, 32));
  }
  return Buffer.from(key);
}

export async function encrypt(text: string): Promise<string> {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    normalizeKey(ENCRYPTION_KEY),
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export async function decrypt(text: string): Promise<string> {
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      normalizeKey(ENCRYPTION_KEY),
      iv
    );
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt');
  }
}

export function generateShortToken(): string {
  // 生成2个简短的单词
  const words = generate({
    exactly: 2,
    maxLength: 8,
    join: '-'
  });
  
  // 添加2位随机数字作为后缀
  const numbers = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  return `${words}-${numbers}`;
} 