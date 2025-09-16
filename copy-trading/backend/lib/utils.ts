import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import crypto from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a crypto hash using the specified algorithm (default: sha256)
 * @param content The content to hash
 * @param secret The secret key for HMAC
 * @param algorithm The hashing algorithm to use
 * @returns The hex-encoded hash
 */
export function createCryptoHash(content: string, secret: string, algorithm = 'sha256'): string {
  return crypto.createHmac(algorithm, secret).update(content).digest('hex')
}
