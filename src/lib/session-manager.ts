// src/lib/session-manager.ts
// Enterprise-grade Redis-based session management
import { randomUUID } from "crypto";
import redis from "./redis";

export interface SessionData {
  sessionId: string;
  userId: string;
  organizationId: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  email: string;
  deviceId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
}

export interface CreateSessionOptions {
  userId: string;
  organizationId: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  email: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  ttl?: number; // Time to live in seconds (default: 7 days)
}

const SESSION_PREFIX = "session:";
const USER_SESSIONS_PREFIX = "user_sessions:";
const DEFAULT_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export class SessionManager {
  /**
   * Create a new session in Redis
   */
  static async createSession(options: CreateSessionOptions): Promise<SessionData> {
    const sessionId = randomUUID();
    const deviceId = options.deviceId || randomUUID();
    const now = Date.now();
    const ttl = options.ttl || DEFAULT_TTL;

    const sessionData: SessionData = {
      sessionId,
      userId: options.userId,
      organizationId: options.organizationId,
      role: options.role,
      email: options.email,
      deviceId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      createdAt: now,
      expiresAt: now + ttl * 1000,
      lastActivityAt: now,
    };

    // Store session in Redis
    const sessionKey = `${SESSION_PREFIX}${sessionId}`;
    await redis.set(sessionKey, JSON.stringify(sessionData), "EX", ttl);

    // Add session to user's session list
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${options.userId}`;
    await redis.sadd(userSessionsKey, sessionId);
    await redis.expire(userSessionsKey, ttl);

    console.log("[SESSION] Created session:", {
      sessionId,
      userId: options.userId,
      organizationId: options.organizationId,
      role: options.role,
      expiresAt: new Date(sessionData.expiresAt).toISOString(),
    });

    return sessionData;
  }

  /**
   * Validate and retrieve a session from Redis
   */
  static async getSession(sessionId: string): Promise<SessionData | null> {
    console.log("[SESSION] Validating session:", sessionId);

    const sessionKey = `${SESSION_PREFIX}${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      console.log("[SESSION] Session not found:", sessionId);
      return null;
    }

    const session: SessionData = JSON.parse(sessionData);

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      console.log("[SESSION] Session expired:", sessionId);
      await this.deleteSession(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivityAt = Date.now();
    await redis.set(sessionKey, JSON.stringify(session), "EX", Math.floor((session.expiresAt - Date.now()) / 1000));

    console.log("[SESSION] Session validated:", {
      sessionId,
      userId: session.userId,
      organizationId: session.organizationId,
      role: session.role,
    });

    return session;
  }

  /**
   * Delete a session from Redis
   */
  static async deleteSession(sessionId: string): Promise<void> {
    console.log("[SESSION] Deleting session:", sessionId);

    const sessionKey = `${SESSION_PREFIX}${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (sessionData) {
      const session: SessionData = JSON.parse(sessionData);
      
      // Remove from user's session list
      const userSessionsKey = `${USER_SESSIONS_PREFIX}${session.userId}`;
      await redis.srem(userSessionsKey, sessionId);
    }

    await redis.del(sessionKey);
  }

  /**
   * Delete all sessions for a user
   */
  static async deleteUserSessions(userId: string): Promise<void> {
    console.log("[SESSION] Deleting all sessions for user:", userId);

    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;
    const sessionIds = await redis.smembers(userSessionsKey);

    if (sessionIds.length > 0) {
      // Delete all sessions
      const deletePromises = sessionIds.map((sessionId) => {
        const sessionKey = `${SESSION_PREFIX}${sessionId}`;
        return redis.del(sessionKey);
      });
      await Promise.all(deletePromises);
    }

    // Delete user session list
    await redis.del(userSessionsKey);
  }

  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(userId: string): Promise<SessionData[]> {
    console.log("[SESSION] Getting user sessions:", userId);

    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;
    const sessionIds = await redis.smembers(userSessionsKey);

    if (sessionIds.length === 0) {
      return [];
    }

    const sessionPromises = sessionIds.map(async (sessionId) => {
      const sessionKey = `${SESSION_PREFIX}${sessionId}`;
      const sessionData = await redis.get(sessionKey);
      if (sessionData) {
        const session: SessionData = JSON.parse(sessionData);
        // Filter expired sessions
        if (Date.now() <= session.expiresAt) {
          return session;
        } else {
          // Clean up expired session
          await this.deleteSession(sessionId);
          return null;
        }
      }
      return null;
    });

    const sessions = await Promise.all(sessionPromises);
    return sessions.filter((s): s is SessionData => s !== null);
  }

  /**
   * Rotate session (create new session, delete old one)
   */
  static async rotateSession(
    oldSessionId: string,
    options: Partial<CreateSessionOptions>
  ): Promise<SessionData | null> {
    console.log("[SESSION] Rotating session:", oldSessionId);

    const oldSession = await this.getSession(oldSessionId);
    if (!oldSession) {
      return null;
    }

    // Create new session with same data
    const newSession = await this.createSession({
      userId: oldSession.userId,
      organizationId: oldSession.organizationId,
      role: oldSession.role,
      email: oldSession.email,
      deviceId: oldSession.deviceId,
      ipAddress: options.ipAddress || oldSession.ipAddress,
      userAgent: options.userAgent || oldSession.userAgent,
      ttl: options.ttl,
    });

    // Delete old session
    await this.deleteSession(oldSessionId);

    console.log("[SESSION] Session rotated:", {
      oldSessionId,
      newSessionId: newSession.sessionId,
    });

    return newSession;
  }

  /**
   * Clean up expired sessions (maintenance function)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    console.log("[SESSION] Cleaning up expired sessions");
    
    // This would typically be run by a background job
    // For now, sessions auto-expire via Redis TTL
    // This function can be used for manual cleanup if needed
    
    return 0;
  }
}
