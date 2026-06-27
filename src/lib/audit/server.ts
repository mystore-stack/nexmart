// src/lib/audit/server.ts
import { prisma } from "@/lib/prisma";
import type {
  AuditEventInput,
  AuditSessionInput,
  AuditAlertInput,
  AuditReplayInput,
  FraudDetectionResult,
  AnomalyDetectionResult,
  AuditEventType,
  AuditAlertType,
  AlertSeverity,
} from "./types";

/**
 * Production-grade Audit SDK (Server-side)
 * 
 * Usage:
 * ```ts
 * import { audit } from "@/lib/audit/server";
 * 
 * // Log an event
 * await audit.event({
 *   eventType: "CHECKOUT_START",
 *   userId: user.id,
 *   organizationId: org.id,
 *   metadata: { cartItems: 5 }
 * });
 * 
 * // Create a session
 * const session = await audit.session.create({
 *   userId: user.id,
 *   organizationId: org.id,
 *   userAgent: req.headers.get("user-agent")
 * });
 * ```
 */

class AuditSDK {
  /**
   * Log an audit event
   */
  async event(input: AuditEventInput & { sessionId?: string }) {
    try {
      // Perform fraud detection
      const fraudResult = await this.detectFraud(input);

      // Perform anomaly detection
      const anomalyResult = await this.detectAnomaly(input);

      const eventData: any = {
        eventType: input.eventType,
        userId: input.userId,
        organizationId: input.organizationId,
        orderId: input.orderId,
        cartSnapshot: input.cartSnapshot,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        fraudScore: fraudResult.score,
        anomalyFlags: anomalyResult.isAnomalous ? [anomalyResult.anomalyType] : [],
      };

      if (input.sessionId) {
        eventData.sessionId = input.sessionId;
      }

      const event = await prisma.auditEvent.create({
        data: eventData,
      });

      // Update session event count
      if (input.sessionId) {
        await prisma.auditSession.update({
          where: { id: input.sessionId },
          data: { eventCount: { increment: 1 } },
        });
      }

      // Create alert if fraud score is high
      if (fraudResult.score >= 70) {
        await this.alert({
          sessionId: input.sessionId,
          userId: input.userId,
          organizationId: input.organizationId,
          alertType: "FRAUD_DETECTED",
          severity: fraudResult.score >= 90 ? "CRITICAL" : "HIGH",
          title: "High fraud risk detected",
          description: `Fraud score: ${fraudResult.score}. Reasons: ${fraudResult.reasons.join(", ")}`,
          metadata: { fraudScore: fraudResult.score, reasons: fraudResult.reasons },
        });
      }

      // Create alert if anomaly detected
      if (anomalyResult.isAnomalous && anomalyResult.confidence >= 0.8) {
        await this.alert({
          sessionId: input.sessionId,
          userId: input.userId,
          organizationId: input.organizationId,
          alertType: "ANOMALY_DETECTED",
          severity: "MEDIUM",
          title: `Anomaly detected: ${anomalyResult.anomalyType}`,
          description: JSON.stringify(anomalyResult.details),
          metadata: anomalyResult,
        });
      }

      return event;
    } catch (error) {
      console.error("[AUDIT] Failed to log event:", error);
      // Don't throw - audit failures shouldn't break the application
      return null;
    }
  }

  /**
   * Session management
   */
  session = {
    async create(input: AuditSessionInput) {
      try {
        return await prisma.auditSession.create({
          data: input,
        });
      } catch (error) {
        console.error("[AUDIT] Failed to create session:", error);
        return null;
      }
    },

    async get(sessionId: string) {
      return prisma.auditSession.findUnique({
        where: { id: sessionId },
        include: { events: { orderBy: { createdAt: "asc" } } },
      });
    },

    async update(sessionId: string, data: Partial<AuditSessionInput>) {
      return prisma.auditSession.update({
        where: { id: sessionId },
        data,
      });
    },

    async complete(sessionId: string, conversionValue?: number) {
      return prisma.auditSession.update({
        where: { id: sessionId },
        data: {
          endTime: new Date(),
          conversionValue,
        },
      });
    },

    async markAbandoned(sessionId: string) {
      return prisma.auditSession.update({
        where: { id: sessionId },
        data: {
          endTime: new Date(),
          abandonedAt: new Date(),
        },
      });
    },
  };

  /**
   * Alert management
   */
  async alert(input: AuditAlertInput) {
    try {
      const alert = await prisma.auditAlert.create({
        data: input,
      });

      // Trigger webhook for n8n automation
      await this.triggerWebhook(alert);

      return alert;
    } catch (error) {
      console.error("[AUDIT] Failed to create alert:", error);
      return null;
    }
  }

  /**
   * Replay management
   */
  replay = {
    async create(input: AuditReplayInput) {
      try {
        return await prisma.auditReplay.create({
          data: input,
        });
      } catch (error) {
        console.error("[AUDIT] Failed to create replay:", error);
        return null;
      }
    },

    async get(replayId: string) {
      return prisma.auditReplay.findUnique({
        where: { id: replayId },
        include: { session: true },
      });
    },

    async listBySession(sessionId: string) {
      return prisma.auditReplay.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
      });
    },

    async markReplayed(replayId: string, replayedBy: string) {
      return prisma.auditReplay.update({
        where: { id: replayId },
        data: {
          replayedAt: new Date(),
          replayedBy,
        },
      });
    },
  };

  /**
   * Fraud detection engine
   */
  private async detectFraud(input: AuditEventInput): Promise<FraudDetectionResult> {
    const flags: string[] = [];
    const reasons: string[] = [];
    let score = 0;

    // Check for rapid checkout (multiple orders in short time)
    if (input.userId) {
      const recentOrders = await prisma.order.findMany({
        where: {
          userId: input.userId,
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
        },
      });

      if (recentOrders.length >= 3) {
        score += 30;
        flags.push("RAPID_CHECKOUT");
        reasons.push(`${recentOrders.length} orders in last hour`);
      }
    }

    // Check for high value order
    if (input.metadata?.total) {
      const total = input.metadata.total;
      if (total > 10000) { // 10,000 MAD threshold
        score += 20;
        flags.push("HIGH_VALUE_ORDER");
        reasons.push(`High value order: ${total} MAD`);
      }
    }

    // Check for suspicious IP (multiple users from same IP)
    if (input.ipAddress) {
      const recentSessions = await prisma.auditSession.findMany({
        where: {
          ipAddress: input.ipAddress,
          startTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24h
        },
      });

      if (recentSessions.length >= 5) {
        score += 25;
        flags.push("SUSPICIOUS_IP");
        reasons.push(`${recentSessions.length} sessions from same IP in 24h`);
      }
    }

    // Check for coupon abuse
    if (input.eventType === "COUPON_APPLIED") {
      const couponUsage = await prisma.order.count({
        where: {
          userId: input.userId,
          couponId: input.metadata?.couponId,
        },
      });

      if (couponUsage >= 5) {
        score += 15;
        flags.push("COUPON_ABUSE");
        reasons.push(`Coupon used ${couponUsage} times`);
      }
    }

    // Check for payment failures
    if (input.eventType === "PAYMENT_FAILED") {
      const recentFailures = await prisma.auditEvent.count({
        where: {
          userId: input.userId,
          eventType: "PAYMENT_FAILED",
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (recentFailures >= 3) {
        score += 20;
        flags.push("PAYMENT_FAILURE");
        reasons.push(`${recentFailures} payment failures in 24h`);
      }
    }

    return { score: Math.min(score, 100), flags, reasons };
  }

  /**
   * Anomaly detection engine
   */
  private async detectAnomaly(input: AuditEventInput): Promise<AnomalyDetectionResult> {
    // Detect cart abandonment patterns
    if (input.eventType === "CHECKOUT_START") {
      const session = input.sessionId ? await this.session.get(input.sessionId) : null;
      if (session && session.eventCount > 10) {
        return {
          isAnomalous: true,
          anomalyType: "EXCESSIVE_CHECKOUT_ATTEMPTS",
          confidence: 0.9,
          details: { eventCount: session.eventCount },
        };
      }
    }

    // Detect unusual cart behavior
    if (input.eventType === "CART_ITEM_ADDED" && input.cartSnapshot) {
      const itemCount = input.cartSnapshot.items?.length || 0;
      if (itemCount > 20) {
        return {
          isAnomalous: true,
          anomalyType: "EXCESSIVE_CART_ITEMS",
          confidence: 0.85,
          details: { itemCount },
        };
      }
    }

    // Detect rapid cart modifications
    if (input.eventType === "CART_ITEM_UPDATED") {
      const recentUpdates = await prisma.auditEvent.count({
        where: {
          sessionId: input.sessionId,
          eventType: "CART_ITEM_UPDATED",
          createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 min
        },
      });

      if (recentUpdates >= 10) {
        return {
          isAnomalous: true,
          anomalyType: "RAPID_CART_MODIFICATIONS",
          confidence: 0.8,
          details: { updateCount: recentUpdates },
        };
      }
    }

    return {
      isAnomalous: false,
      anomalyType: "NONE",
      confidence: 0,
      details: {},
    };
  }

  /**
   * Trigger webhook for n8n automation
   */
  private async triggerWebhook(alert: any) {
    const webhookUrl = process.env.N8N_AUDIT_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error("[AUDIT] Failed to trigger webhook:", error);
    }
  }

  /**
   * Query events with filters
   */
  async queryEvents(filters: {
    userId?: string;
    organizationId: string;
    sessionId?: string;
    eventType?: AuditEventType;
    orderId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { organizationId: filters.organizationId };

    if (filters.userId) where.userId = filters.userId;
    if (filters.sessionId) where.sessionId = filters.sessionId;
    if (filters.eventType) where.eventType = filters.eventType;
    if (filters.orderId) where.orderId = filters.orderId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters.limit || 100,
      skip: filters.offset || 0,
      include: { session: true },
    });
  }

  /**
   * Get session statistics
   */
  async getSessionStats(organizationId: string, startDate?: Date, endDate?: Date) {
    const where: any = { organizationId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalSessions, completedSessions, abandonedSessions, avgConversionValue] = await Promise.all([
      prisma.auditSession.count({ where }),
      prisma.auditSession.count({ where: { ...where, conversionValue: { not: null } } }),
      prisma.auditSession.count({ where: { ...where, abandonedAt: { not: null } } }),
      prisma.auditSession.aggregate({
        where: { ...where, conversionValue: { not: null } },
        _avg: { conversionValue: true },
      }),
    ]);

    return {
      totalSessions,
      completedSessions,
      abandonedSessions,
      conversionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      avgConversionValue: avgConversionValue._avg.conversionValue || 0,
    };
  }
}

// Singleton instance
export const audit = new AuditSDK();
