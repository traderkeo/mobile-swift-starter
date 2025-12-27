/**
 * Hash a password using Web Crypto API (available in Cloudflare Workers)
 * Uses PBKDF2 with SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashArray = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const encoder = new TextEncoder();

  // Decode the stored hash
  const combined = new Uint8Array(
    atob(storedHash)
      .split('')
      .map((c) => c.charCodeAt(0))
  );

  // Extract salt and hash
  const salt = combined.slice(0, 16);
  const storedHashBytes = combined.slice(16);

  // Derive the hash from the provided password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const derivedHashBytes = new Uint8Array(derivedBits);

  // Constant-time comparison
  if (storedHashBytes.length !== derivedHashBytes.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < storedHashBytes.length; i++) {
    result |= storedHashBytes[i] ^ derivedHashBytes[i];
  }

  return result === 0;
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
