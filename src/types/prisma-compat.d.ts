declare module "@prisma/client" {
  export const JobStatus: {
    PENDING: 'PENDING';
    WAITING: 'WAITING';
    PROCESSING: 'PROCESSING';
    ACTIVE: 'ACTIVE';
    COMPLETED: 'COMPLETED';
    FAILED: 'FAILED';
    RETRYING: 'RETRYING';
    CANCELLED: 'CANCELLED';
    DELAYED: 'DELAYED';
  };
  export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

  export const AutomationType: {
    ABANDONED_CART_RECOVERY: 'ABANDONED_CART_RECOVERY';
    ORDER_CONFIRMATION: 'ORDER_CONFIRMATION';
    SHIPPING_UPDATE: 'SHIPPING_UPDATE';
    CUSTOMER_WINBACK: 'CUSTOMER_WINBACK';
    VIP_CUSTOMER: 'VIP_CUSTOMER';
    PRODUCT_REVIEW: 'PRODUCT_REVIEW';
    LOW_STOCK_ALERT: 'LOW_STOCK_ALERT';
    FACEBOOK_CONVERSION: 'FACEBOOK_CONVERSION';
    GOOGLE_SHEETS_SYNC: 'GOOGLE_SHEETS_SYNC';
    AI_MARKETING: 'AI_MARKETING';
    DAILY_REPORT: 'DAILY_REPORT';
    WEEKLY_REPORT: 'WEEKLY_REPORT';
  };
  export type AutomationType = (typeof AutomationType)[keyof typeof AutomationType];

  export const AutomationStatus: {
    ACTIVE: 'ACTIVE';
    PAUSED: 'PAUSED';
    DISABLED: 'DISABLED';
    ERROR: 'ERROR';
    COMPLETED: 'COMPLETED';
    PENDING: 'PENDING';
    RUNNING: 'RUNNING';
    FAILED: 'FAILED';
  };
  export type AutomationStatus = (typeof AutomationStatus)[keyof typeof AutomationStatus];

  export const HomepageSectionType: {
    HERO: 'HERO';
    FEATURED_PRODUCTS: 'FEATURED_PRODUCTS';
    CATEGORIES: 'CATEGORIES';
    BANNER: 'BANNER';
    EDITORS_CHOICE: 'EDITORS_CHOICE';
    NEW_ARRIVALS: 'NEW_ARRIVALS';
    BEST_SELLERS: 'BEST_SELLERS';
    CUSTOM: 'CUSTOM';
  };
  export type HomepageSectionType = (typeof HomepageSectionType)[keyof typeof HomepageSectionType];

  export const OrderStatus: {
    PENDING: 'PENDING';
    CONFIRMED: 'CONFIRMED';
    PROCESSING: 'PROCESSING';
    SHIPPED: 'SHIPPED';
    DELIVERED: 'DELIVERED';
    CANCELLED: 'CANCELLED';
    REFUNDED: 'REFUNDED';
  };
  export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

  export const EmailType: {
    WELCOME: 'WELCOME';
    PRODUCT_RECOMMENDATION: 'PRODUCT_RECOMMENDATION';
    NEWSLETTER: 'NEWSLETTER';
    PROMO: 'PROMO';
  };
  export type EmailType = (typeof EmailType)[keyof typeof EmailType];

  export const CMSContentStatus: {
    DRAFT: 'DRAFT';
    PUBLISHED: 'PUBLISHED';
    ARCHIVED: 'ARCHIVED';
  };
  export type CMSContentStatus = (typeof CMSContentStatus)[keyof typeof CMSContentStatus];

  export const Role: {
    USER: 'USER';
    ADMIN: 'ADMIN';
    SUPER_ADMIN: 'SUPER_ADMIN';
  };
  export type Role = (typeof Role)[keyof typeof Role];

  export const PlanTier: {
    STARTER: 'STARTER';
    BUSINESS: 'BUSINESS';
    PREMIUM: 'PREMIUM';
    ENTERPRISE: 'ENTERPRISE';
  };
  export type PlanTier = (typeof PlanTier)[keyof typeof PlanTier];

  export const PaymentStatus: {
    UNPAID: 'UNPAID';
    PENDING: 'PENDING';
    PAID: 'PAID';
    FAILED: 'FAILED';
    REFUNDED: 'REFUNDED';
  };
  export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

  export const ThemeVersion: {
    V1: 'V1';
    V2: 'V2';
  };
  export type ThemeVersion = (typeof ThemeVersion)[keyof typeof ThemeVersion];

  export const AiMessageRole: {
    USER: 'USER';
    ASSISTANT: 'ASSISTANT';
    SYSTEM: 'SYSTEM';
  };
  export type AiMessageRole = (typeof AiMessageRole)[keyof typeof AiMessageRole];

  export const LocaleCode: {
    fr: 'fr';
    ar: 'ar';
    darija: 'darija';
  };
  export type LocaleCode = (typeof LocaleCode)[keyof typeof LocaleCode];

  namespace Prisma {
    export type InputJsonValue = any;
    export type JsonValue = any;
    export type JsonObject = any;
    export type JsonArray = any;
    export type TransactionClient = any;
  }

  interface PrismaClient {
    emailLog?: any;
    emailCampaign?: any;
    emailTracking?: any;
    stockAlertLog?: any;
    welcomeSeries?: any;
    homePageSection?: any;
  }

  interface User {
    emailLogs?: any;
    Order?: any;
    Membership?: any;
  }

  interface Product {
    items?: any;
    orderItems?: any;
  }

  interface Experiment {
    variants?: any;
    status?: any;
    totalExposures?: any;
  }

  interface ExperimentVariant {
    exposures?: any;
  }
}
