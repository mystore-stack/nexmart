// src/lib/audit/types.ts
// Note: These types will be replaced by Prisma-generated types after running `prisma generate`

export type AuditEventType =
  | "CHECKOUT_START"
  | "CHECKOUT_STEP_ADDRESS"
  | "CHECKOUT_STEP_PAYMENT"
  | "CHECKOUT_STEP_REVIEW"
  | "CHECKOUT_COMPLETE"
  | "CHECKOUT_ABANDONED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "PAYMENT_RETRY"
  | "CART_VIEWED"
  | "CART_ITEM_ADDED"
  | "CART_ITEM_REMOVED"
  | "CART_ITEM_UPDATED"
  | "CART_CLEARED"
  | "COUPON_APPLIED"
  | "COUPON_REMOVED"
  | "ORDER_CREATED"
  | "ORDER_UPDATED"
  | "ORDER_CANCELLED"
  | "ORDER_REFUNDED"
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_REGISTER"
  | "ADDRESS_ADDED"
  | "ADDRESS_UPDATED"
  | "CHECKOUT_ERROR"
  | "PAYMENT_ERROR"
  | "VALIDATION_ERROR"
  | "SYSTEM_ERROR";

export type AuditAlertType =
  | "FRAUD_DETECTED"
  | "ANOMALY_DETECTED"
  | "HIGH_VALUE_ORDER"
  | "RAPID_CHECKOUT"
  | "PAYMENT_FAILURE"
  | "STOCK_ISSUE"
  | "COUPON_ABUSE"
  | "SUSPICIOUS_ACTIVITY";

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AuditEventInput {
  sessionId?: string;
  eventType: AuditEventType;
  userId?: string;
  organizationId: string;
  orderId?: string;
  cartSnapshot?: any;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditSessionInput {
  userId?: string;
  organizationId: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

export interface AuditAlertInput {
  sessionId?: string;
  userId?: string;
  organizationId: string;
  alertType: AuditAlertType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface AuditReplayInput {
  sessionId: string;
  userId?: string;
  organizationId: string;
  name: string;
  description?: string;
  events: any[];
  cartStates: any[];
  replayData?: Record<string, any>;
}

export interface FraudDetectionResult {
  score: number; // 0-100
  flags: string[];
  reasons: string[];
}

export interface AnomalyDetectionResult {
  isAnomalous: boolean;
  anomalyType: string;
  confidence: number;
  details: Record<string, any>;
}
