// src/lib/audit/replay.ts
import { prisma } from "@/lib/prisma";
import type { AuditEventType } from "./types";

/**
 * Replay Engine - Reconstruct user sessions step-by-step
 * 
 * This engine allows you to replay a full user session to debug issues,
 * understand user behavior, and identify race conditions.
 */

export interface ReplayStep {
  step: number;
  eventType: AuditEventType;
  timestamp: Date;
  cartState?: any;
  metadata?: any;
  fraudScore?: number;
}

export interface ReplaySession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  steps: ReplayStep[];
  summary: {
    totalSteps: number;
    duration: number;
    conversionValue?: number;
    fraudScore: number;
    anomalies: string[];
  };
}

class ReplayEngine {
  /**
   * Reconstruct a full session from audit events
   */
  async reconstructSession(sessionId: string): Promise<ReplaySession> {
    const session = await prisma.auditSession.findUnique({
      where: { id: sessionId },
      include: {
        events: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    const steps: ReplayStep[] = session.events.map((event, index) => ({
      step: index + 1,
      eventType: event.eventType as AuditEventType,
      timestamp: event.createdAt,
      cartState: event.cartSnapshot,
      metadata: event.metadata,
      fraudScore: event.fraudScore || 0,
    }));

    const duration = session.endTime
      ? new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
      : Date.now() - new Date(session.startTime).getTime();

    const anomalies = session.events
      .filter((e) => e.anomalyFlags && e.anomalyFlags.length > 0)
      .flatMap((e) => e.anomalyFlags);

    const maxFraudScore = Math.max(...session.events.map((e) => e.fraudScore || 0));

    return {
      sessionId: session.id,
      userId: session.userId || undefined,
      startTime: session.startTime,
      endTime: session.endTime || undefined,
      steps,
      summary: {
        totalSteps: steps.length,
        duration,
        conversionValue: session.conversionValue || undefined,
        fraudScore: maxFraudScore,
        anomalies: [...new Set(anomalies)],
      },
    };
  }

  /**
   * Replay a session step by step
   */
  async replayStep(sessionId: string, stepNumber: number): Promise<ReplayStep> {
    const replaySession = await this.reconstructSession(sessionId);
    const step = replaySession.steps.find((s) => s.step === stepNumber);

    if (!step) {
      throw new Error(`Step ${stepNumber} not found`);
    }

    return step;
  }

  /**
   * Create a saved replay for later analysis
   */
  async createReplay(sessionId: string, name: string, userId?: string, description?: string) {
    const replaySession = await this.reconstructSession(sessionId);

    const replay = await prisma.auditReplay.create({
      data: {
        sessionId,
        userId,
        organizationId: replaySession.userId ? (await prisma.auditSession.findUnique({ where: { id: sessionId } }))?.organizationId || "" : "",
        name,
        description,
        events: replaySession.steps,
        cartStates: replaySession.steps.map((s) => s.cartState),
      },
    });

    return replay;
  }

  /**
   * Analyze session for patterns and issues
   */
  async analyzeSession(sessionId: string) {
    const replaySession = await this.reconstructSession(sessionId);
    const analysis = {
      checkoutFlow: this.analyzeCheckoutFlow(replaySession.steps),
      paymentBehavior: this.analyzePaymentBehavior(replaySession.steps),
      cartBehavior: this.analyzeCartBehavior(replaySession.steps),
      timing: this.analyzeTiming(replaySession.steps),
    };

    return {
      session: replaySession,
      analysis,
    };
  }

  /**
   * Analyze checkout flow patterns
   */
  private analyzeCheckoutFlow(steps: ReplayStep[]) {
    const checkoutSteps = steps.filter((s) => s.eventType.startsWith("CHECKOUT"));
    const completedSteps = steps.filter((s) => s.eventType === "CHECKOUT_COMPLETE").length;
    const abandonedSteps = steps.filter((s) => s.eventType === "CHECKOUT_ABANDONED").length;

    return {
      totalCheckoutEvents: checkoutSteps.length,
      completed: completedSteps > 0,
      abandoned: abandonedSteps > 0,
      stepSequence: checkoutSteps.map((s) => s.eventType),
    };
  }

  /**
   * Analyze payment behavior
   */
  private analyzePaymentBehavior(steps: ReplayStep[]) {
    const paymentEvents = steps.filter((s) => s.eventType.startsWith("PAYMENT"));
    const successes = steps.filter((s) => s.eventType === "PAYMENT_SUCCESS").length;
    const failures = steps.filter((s) => s.eventType === "PAYMENT_FAILED").length;
    const retries = steps.filter((s) => s.eventType === "PAYMENT_RETRY").length;

    return {
      totalPaymentEvents: paymentEvents.length,
      successes,
      failures,
      retries,
      successRate: paymentEvents.length > 0 ? (successes / paymentEvents.length) * 100 : 0,
    };
  }

  /**
   * Analyze cart behavior
   */
  private analyzeCartBehavior(steps: ReplayStep[]) {
    const cartEvents = steps.filter((s) => s.eventType.startsWith("CART"));
    const additions = steps.filter((s) => s.eventType === "CART_ITEM_ADDED").length;
    const removals = steps.filter((s) => s.eventType === "CART_ITEM_REMOVED").length;
    const updates = steps.filter((s) => s.eventType === "CART_ITEM_UPDATED").length;
    const clears = steps.filter((s) => s.eventType === "CART_CLEARED").length;

    return {
      totalCartEvents: cartEvents.length,
      additions,
      removals,
      updates,
      clears,
      netChange: additions - removals,
    };
  }

  /**
   * Analyze timing patterns
   */
  private analyzeTiming(steps: ReplayStep[]) {
    if (steps.length < 2) {
      return { avgTimeBetweenSteps: 0, totalDuration: 0, fastestStep: null, slowestStep: null };
    }

    const timeDiffs = [];
    for (let i = 1; i < steps.length; i++) {
      timeDiffs.push(steps[i].timestamp.getTime() - steps[i - 1].timestamp.getTime());
    }

    const avgTimeBetweenSteps = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    const totalDuration = steps[steps.length - 1].timestamp.getTime() - steps[0].timestamp.getTime();

    const stepDurations = steps.map((step, i) => ({
      step: step.eventType,
      duration: i > 0 ? step.timestamp.getTime() - steps[i - 1].timestamp.getTime() : 0,
    }));

    const fastestStep = stepDurations.reduce((min, curr) => (curr.duration < min.duration ? curr : min));
    const slowestStep = stepDurations.reduce((max, curr) => (curr.duration > max.duration ? curr : max));

    return {
      avgTimeBetweenSteps,
      totalDuration,
      fastestStep: fastestStep.step,
      slowestStep: slowestStep.step,
      stepDurations,
    };
  }

  /**
   * Detect race conditions in session
   */
  async detectRaceConditions(sessionId: string) {
    const replaySession = await this.reconstructSession(sessionId);
    const raceConditions = [];

    // Check for rapid cart modifications
    const cartUpdates = replaySession.steps.filter((s) => s.eventType === "CART_ITEM_UPDATED");
    for (let i = 1; i < cartUpdates.length; i++) {
      const timeDiff = cartUpdates[i].timestamp.getTime() - cartUpdates[i - 1].timestamp.getTime();
      if (timeDiff < 1000) { // Less than 1 second
        raceConditions.push({
          type: "RAPID_CART_UPDATE",
          steps: [cartUpdates[i - 1].step, cartUpdates[i].step],
          timeDiff,
        });
      }
    }

    // Check for payment attempts during checkout
    const paymentEvents = replaySession.steps.filter((s) => s.eventType.startsWith("PAYMENT"));
    const checkoutEvents = replaySession.steps.filter((s) => s.eventType.startsWith("CHECKOUT") && !s.eventType.includes("COMPLETE"));

    for (const payment of paymentEvents) {
      const concurrentCheckout = checkoutEvents.find(
        (c) => Math.abs(payment.timestamp.getTime() - c.timestamp.getTime()) < 2000
      );
      if (concurrentCheckout) {
        raceConditions.push({
          type: "PAYMENT_DURING_CHECKOUT",
          paymentStep: payment.step,
          checkoutStep: concurrent.step,
          timeDiff: Math.abs(payment.timestamp.getTime() - concurrent.timestamp.getTime()),
        });
      }
    }

    return raceConditions;
  }
}

export const replayEngine = new ReplayEngine();
