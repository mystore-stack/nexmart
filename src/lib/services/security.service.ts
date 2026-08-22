import { Redis } from 'ioredis';
import crypto from 'crypto';

// Redis client for rate limiting
let redisClient: Redis | null = null;

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix?: string; // Prefix for Redis keys
  skipSuccessfulRequests?: boolean; // Only count failed requests
  skipFailedRequests?: boolean; // Only count successful requests
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

interface CSRFToken {
  token: string;
  expiresAt: number;
}

interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export class SecurityService {
  /**
   * Get Redis client for rate limiting
   */
  private static getRedisClient(): Redis {
    if (!redisClient) {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      redisClient = new Redis(redisUrl);
    }
    return redisClient;
  }

  /**
   * Rate limiting using sliding window algorithm
   */
  static async rateLimit(
    identifier: string,
    options: RateLimitOptions
  ): Promise<RateLimitResult> {
    const redis = this.getRedisClient();
    const { windowMs, maxRequests, keyPrefix = 'ratelimit' } = options;
    const key = `${keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove old entries outside the window
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count current requests in window
    const current = await redis.zcard(key);

    if (current >= maxRequests) {
      // Get oldest request to calculate retry after
      const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const retryAfter = oldest.length > 0 
        ? Math.ceil((parseInt(oldest[1]) + windowMs - now) / 1000)
        : Math.ceil(windowMs / 1000);

      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: now + windowMs,
        retryAfter,
      };
    }

    // Add current request
    await redis.zadd(key, now, `${now}-${crypto.randomBytes(8).toString('hex')}`);
    await redis.expire(key, Math.ceil(windowMs / 1000));

    // Get updated count
    const updated = await redis.zcard(key);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - updated,
      reset: now + windowMs,
    };
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): CSRFToken {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return { token, expiresAt };
  }

  /**
   * Store CSRF token in session
   */
  static async storeCSRFToken(
    sessionId: string,
    token: CSRFToken
  ): Promise<void> {
    const redis = this.getRedisClient();
    const key = `csrf:${sessionId}`;
    
    await redis.setex(
      key,
      Math.ceil((token.expiresAt - Date.now()) / 1000),
      JSON.stringify(token)
    );
  }

  /**
   * Validate CSRF token
   */
  static async validateCSRFToken(
    sessionId: string,
    token: string
  ): Promise<boolean> {
    const redis = this.getRedisClient();
    const key = `csrf:${sessionId}`;
    
    const stored = await redis.get(key);
    if (!stored) return false;

    try {
      const csrfToken: CSRFToken = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() > csrfToken.expiresAt) {
        await redis.del(key);
        return false;
      }

      // Compare tokens (constant-time comparison)
      return crypto.timingSafeEqual(
        Buffer.from(token),
        Buffer.from(csrfToken.token)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Invalidate CSRF token
   */
  static async invalidateCSRFToken(sessionId: string): Promise<void> {
    const redis = this.getRedisClient();
    await redis.del(`csrf:${sessionId}`);
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate URL format
   */
  static validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    valid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    errors: string[];
  } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letters');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain numbers');
    } else {
      score += 1;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Password must contain special characters');
    } else {
      score += 1;
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 2) strength = 'medium';

    return {
      valid: errors.length === 0,
      strength,
      errors,
    };
  }

  /**
   * Validate form data against schema
   */
  static validateFormData<T extends Record<string, any>>(
    data: T,
    schema: Record<keyof T, {
      required?: boolean;
      type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'phone';
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
      pattern?: RegExp;
      enum?: string[];
    }>
  ): ValidationResult {
    const errors: ValidationResult['errors'] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: `${field} is required`,
          code: 'REQUIRED',
        });
        continue;
      }

      // Skip validation if not required and empty
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (rules.type) {
        switch (rules.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push({
                field,
                message: `${field} must be a string`,
                code: 'INVALID_TYPE',
              });
            }
            break;
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push({
                field,
                message: `${field} must be a number`,
                code: 'INVALID_TYPE',
              });
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push({
                field,
                message: `${field} must be a boolean`,
                code: 'INVALID_TYPE',
              });
            }
            break;
          case 'email':
            if (!this.validateEmail(value)) {
              errors.push({
                field,
                message: `${field} must be a valid email`,
                code: 'INVALID_EMAIL',
              });
            }
            break;
          case 'url':
            if (!this.validateURL(value)) {
              errors.push({
                field,
                message: `${field} must be a valid URL`,
                code: 'INVALID_URL',
              });
            }
            break;
          case 'phone':
            if (!this.validatePhone(value)) {
              errors.push({
                field,
                message: `${field} must be a valid phone number`,
                code: 'INVALID_PHONE',
              });
            }
            break;
        }
      }

      // Length validation
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push({
            field,
            message: `${field} must be at least ${rules.minLength} characters`,
            code: 'MIN_LENGTH',
          });
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({
            field,
            message: `${field} must not exceed ${rules.maxLength} characters`,
            code: 'MAX_LENGTH',
          });
        }
      }

      // Range validation
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push({
            field,
            message: `${field} must be at least ${rules.min}`,
            code: 'MIN_VALUE',
          });
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push({
            field,
            message: `${field} must not exceed ${rules.max}`,
            code: 'MAX_VALUE',
          });
        }
      }

      // Pattern validation
      if (rules.pattern && typeof value === 'string') {
        if (!rules.pattern.test(value)) {
          errors.push({
            field,
            message: `${field} format is invalid`,
            code: 'INVALID_PATTERN',
          });
        }
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${rules.enum.join(', ')}`,
          code: 'INVALID_ENUM',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate secure random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash password using bcrypt (placeholder - would use bcrypt in production)
   */
  static async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt with appropriate rounds
    // const salt = await bcrypt.genSalt(10);
    // return bcrypt.hash(password, salt);
    
    // Placeholder implementation
    return crypto
      .createHash('sha256')
      .update(password + process.env.PASSWORD_SALT || 'default_salt')
      .digest('hex');
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    // In production, use bcrypt.compare
    // return bcrypt.compare(password, hash);
    
    // Placeholder implementation
    const computedHash = crypto
      .createHash('sha256')
      .update(password + process.env.PASSWORD_SALT || 'default_salt')
      .digest('hex');
    
    return computedHash === hash;
  }

  /**
   * Detect suspicious activity
   */
  static async detectSuspiciousActivity(
    identifier: string,
    activityType: string
  ): Promise<boolean> {
    const redis = this.getRedisClient();
    const key = `suspicious:${identifier}:${activityType}`;
    
    const count = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour window

    // Threshold for suspicious activity
    const thresholds: Record<string, number> = {
      'failed_login': 5,
      'invalid_csrf': 10,
      'rate_limit_exceeded': 20,
      'invalid_input': 15,
    };

    const threshold = thresholds[activityType] || 10;
    return count >= threshold;
  }

  /**
   * Check IP reputation
   */
  static async checkIPReputation(ip: string): Promise<{
    safe: boolean;
    score: number;
    reasons: string[];
  }> {
    // In production, integrate with IP reputation service
    // For now, return safe
    return {
      safe: true,
      score: 100,
      reasons: [],
    };
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Generate nonce for CSP
   */
  static generateNonce(): string {
    return crypto.randomBytes(16).toString('base64');
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: {
    name: string;
    size: number;
    type: string;
  }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];

    if (file.size > maxSize) {
      errors.push('File size exceeds maximum limit of 10MB');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      errors.push('File extension not allowed');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Rate limit by IP
   */
  static async rateLimitByIP(
    ip: string,
    options: RateLimitOptions
  ): Promise<RateLimitResult> {
    return this.rateLimit(`ip:${ip}`, options);
  }

  /**
   * Rate limit by user
   */
  static async rateLimitByUser(
    userId: string,
    options: RateLimitOptions
  ): Promise<RateLimitResult> {
    return this.rateLimit(`user:${userId}`, options);
  }

  /**
   * Rate limit by endpoint
   */
  static async rateLimitByEndpoint(
    endpoint: string,
    options: RateLimitOptions
  ): Promise<RateLimitResult> {
    return this.rateLimit(`endpoint:${endpoint}`, options);
  }

  /**
   * Clear rate limit for identifier
   */
  static async clearRateLimit(identifier: string): Promise<void> {
    const redis = this.getRedisClient();
    await redis.del(`ratelimit:${identifier}`);
  }

  /**
   * Get rate limit status
   */
  static async getRateLimitStatus(identifier: string): Promise<{
    current: number;
    limit: number;
    reset: number;
  } | null> {
    const redis = this.getRedisClient();
    const key = `ratelimit:${identifier}`;
    
    const exists = await redis.exists(key);
    if (!exists) return null;

    const current = await redis.zcard(key);
    const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
    const reset = oldest.length > 0 ? parseInt(oldest[1]) + 3600000 : Date.now() + 3600000;

    return {
      current,
      limit: 100, // Default limit
      reset,
    };
  }
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMIT_CONFIGS = {
  // API routes
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  // Authentication
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  // Search
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  // File uploads
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
  // General
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
};
