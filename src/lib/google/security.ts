import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

export class GoogleCredentialSecurity {
  private static getEncryptionKey(): Buffer {
    const secret = process.env.GOOGLE_CREDENTIALS_SECRET;
    if (!secret) {
      throw new Error("GOOGLE_CREDENTIALS_SECRET not configured");
    }
    return crypto.scryptSync(secret, "google-credentials", KEY_LENGTH);
  }

  static encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = this.getEncryptionKey();

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
  }

  static decrypt(encryptedText: string): string {
    const buffer = Buffer.from(encryptedText, "base64");
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = buffer.subarray(ENCRYPTED_POSITION);

    const key = this.getEncryptionKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted) + decipher.final("utf8");
  }

  static validateApiKey(apiKey: string, service: string): { valid: boolean; error?: string } {
    if (!apiKey || apiKey.length < 10) {
      return { valid: false, error: "API key too short" };
    }

    const patterns: Record<string, RegExp> = {
      ANALYTICS: /^G-[A-Z0-9]{10}$/,
      TAG_MANAGER: /^GTM-[A-Z0-9]{6}$/,
      MAPS: /^AIza[A-Za-z0-9_-]{35}$/,
      RECAPTCHA: /^6L[a-zA-Z0-9_-]{33}$|^6Le[a-zA-Z0-9_-]{33}$/,
    };

    if (patterns[service] && !patterns[service].test(apiKey)) {
      return { valid: false, error: `Invalid ${service} API key format` };
    }

    return { valid: true };
  }

  static maskCredential(credential: string, visibleChars: number = 4): string {
    if (!credential) return "";
    if (credential.length <= visibleChars * 2) return "*".repeat(credential.length);
    return (
      credential.substring(0, visibleChars) +
      "*".repeat(credential.length - visibleChars * 2) +
      credential.substring(credential.length - visibleChars)
    );
  }

  static hashCredential(credential: string): string {
    return crypto.createHash("sha256").update(credential).digest("hex");
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static verifyToken(token: string, hash: string): boolean {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    return tokenHash === hash;
  }

  static sanitizeConfig(config: Record<string, any>): Record<string, any> {
    const sensitiveKeys = [
      "apiKey",
      "apiSecret",
      "clientSecret",
      "secretKey",
      "accessToken",
      "refreshToken",
      "password",
      "token",
    ];

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(config)) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        sanitized[key] = this.maskCredential(String(value));
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  static validateOAuthCredentials(
    clientId: string,
    clientSecret: string
  ): { valid: boolean; error?: string } {
    if (!clientId || clientId.length < 10) {
      return { valid: false, error: "Invalid client ID" };
    }

    if (!clientSecret || clientSecret.length < 10) {
      return { valid: false, error: "Invalid client secret" };
    }

    if (!clientId.includes(".googleusercontent.com")) {
      return { valid: false, error: "Invalid Google OAuth client ID format" };
    }

    return { valid: true };
  }

  static rateLimitCheck(
    userId: string,
    action: string,
    maxRequests: number = 10,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number } {
    const key = `rate_limit:${userId}:${action}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    return { allowed: true, remaining: maxRequests };
  }

  static auditLog(
    userId: string,
    action: string,
    service: string,
    details: Record<string, any>
  ): void {
    console.log({
      timestamp: new Date().toISOString(),
      userId,
      action,
      service,
      details: this.sanitizeConfig(details),
    });
  }
}
