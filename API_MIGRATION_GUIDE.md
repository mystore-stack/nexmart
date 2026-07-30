# API Migration Guide: Production-Grade Response System

## Overview

This guide explains how to migrate your API routes from the current broken error handling system to the new production-grade unified response system.

## Problem Summary

**Current Issues:**
- Inconsistent responses (some return `{}`, others return proper JSON)
- Missing error messages in catch blocks
- Silent crashes with no proper HTTP response
- Duplicated try/catch in every route
- `handleApiError()` unreliable or missing
- No unified API response structure
- Some thrown errors bypass response system

**Solution:**
- Unified response helpers (`ok()`, `fail()`)
- Global API wrapper (`withApi()`) that catches ALL errors automatically
- Consistent response format: `{ success: true, data }` or `{ success: false, error }`
- Zero silent failures

---

## New Architecture

### 1. Response Helpers (`src/lib/api-response.ts`)

```typescript
import { ok, created, fail, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";

// Success responses
ok(data)                    // 200
created(data)               // 201

// Error responses
fail(message, status)       // Custom status
badRequest(message)         // 400
unauthorized(message)       // 401
forbidden(message)          // 403
notFound(message)           // 404
serverError(message)        // 500
```

### 2. Global Wrapper (`src/lib/withApi.ts`)

```typescript
import { withApi, withAuth, withAdmin } from "@/lib/withApi";

// Public route (no auth required)
export const GET = withApi(async ({ req }) => {
  const data = await someOperation();
  return ok(data);
});

// Authenticated route
export const POST = withAuth(async ({ req }) => {
  const data = await someOperation();
  return ok(data);
});

// Admin route
export const DELETE = withAdmin(async ({ req }) => {
  const data = await someOperation();
  return ok(data);
});
```

### 3. Authentication Helpers (`src/lib/auth-api.ts`)

```typescript
import { requireAuth, requireAdmin, requireSuperAdmin } from "@/lib/auth-api";

// Use inside handlers when NOT using withApi wrapper
const session = await requireAuth();  // Throws 401 if not authenticated
const session = await requireAdmin(); // Throws 403 if not admin
```

---

## Migration Steps

### Step 1: Update Imports

**Before:**
```typescript
import { ok, created, handleApiError, getPaginationParams, buildPaginationMeta } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-redis";
```

**After:**
```typescript
import { ok, created, getPaginationParams, buildPaginationMeta } from "@/lib/api-response";
import { withAdmin } from "@/lib/withApi";
import { requireAdmin } from "@/lib/auth-api";
```

### Step 2: Remove try/catch Blocks

**Before:**
```typescript
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const data = await someOperation();
    return ok(data);
  } catch (err) {
    console.error("[API] Error:", err);
    return handleApiError(err);
  }
}
```

**After:**
```typescript
export const GET = withAdmin(async ({ req }) => {
  const session = await requireAdmin();
  const data = await someOperation();
  return ok(data);
});
```

### Step 3: Convert Function Exports

**Before:**
```typescript
export async function GET(req: NextRequest) { ... }
export async function POST(req: NextRequest) { ... }
```

**After:**
```typescript
export const GET = withApi(async ({ req }) => { ... });
export const POST = withApi(async ({ req }) => { ... });
```

### Step 4: Remove Manual Error Handling

**Before:**
```typescript
try {
  const data = productSchema.parse(body);
  // ...
} catch (err: any) {
  if (err?.code === "P2002") {
    return handleApiError(new Error("A product with this SKU already exists."));
  }
  if (err?.name === "ZodError") {
    const message = err.issues.map((i: any) => i.message).join(" | ");
    return handleApiError(new Error(message));
  }
  return handleApiError(err);
}
```

**After:**
```typescript
// No try/catch needed - withApi handles everything
const data = productSchema.parse(body); // Zod errors are auto-handled
// Prisma P2002 errors are auto-handled
```

### Step 5: Update Response Format

**Before:**
```typescript
return NextResponse.json({ success: true, data });
return NextResponse.json({ error: message }, { status: 400 });
```

**After:**
```typescript
return ok(data);
return fail(message, 400);
```

---

## Complete Migration Example

### Before (Broken System)
```typescript
// src/app/api/admin/products/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-redis";
import { ok, created, handleApiError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const organizationId = session.organizationId;
    
    if (!organizationId) {
      return handleApiError(new Error("No organization found"));
    }
    
    const products = await prisma.product.findMany({
      where: { organizationId }
    });
    
    return ok(products);
  } catch (err) {
    console.error("[API] Error:", err);
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    const body = await req.json();
    const product = await prisma.product.create({
      data: { ...body, organizationId }
    });
    return created(product);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return handleApiError(new Error("Duplicate SKU"));
    }
    return handleApiError(err);
  }
}
```

### After (Production-Grade System)
```typescript
// src/app/api/admin/products/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/withApi";
import { ok, created } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

export const GET = withAdmin(async ({ req }) => {
  const { organizationId } = await requireAdmin();
  
  if (!organizationId) {
    throw new Error("No organization found");
  }
  
  const products = await prisma.product.findMany({
    where: { organizationId }
  });
  
  return ok(products);
});

export const POST = withAdmin(async ({ req }) => {
  const { organizationId } = await requireAdmin();
  const body = await req.json();
  const product = await prisma.product.create({
    data: { ...body, organizationId }
  });
  return created(product);
});
```

---

## Common Pitfalls After Migration

### 1. Forgetting to Use `withApi` Wrapper

**Problem:**
```typescript
export async function GET(req: NextRequest) {
  // No wrapper - errors won't be caught!
  const data = await someOperation();
  return ok(data);
}
```

**Solution:**
```typescript
export const GET = withApi(async ({ req }) => {
  const data = await someOperation();
  return ok(data);
});
```

### 2. Using Old `handleApiError`

**Problem:**
```typescript
export const GET = withApi(async ({ req }) => {
  try {
    // ...
  } catch (err) {
    return handleApiError(err); // Don't do this!
  }
});
```

**Solution:**
```typescript
export const GET = withApi(async ({ req }) => {
  // No try/catch needed - withApi handles it
  // ...
});
```

### 3. Not Throwing Errors

**Problem:**
```typescript
export const GET = withApi(async ({ req }) => {
  if (!organizationId) {
    return fail("No organization found"); // This works but is not idiomatic
  }
});
```

**Solution:**
```typescript
export const GET = withApi(async ({ req }) => {
  if (!organizationId) {
    throw new Error("No organization found"); // Let withApi handle it
  }
});
```

### 4. Importing from Wrong Files

**Problem:**
```typescript
import { ok } from "@/lib/api"; // Old file
import { requireAdmin } from "@/lib/auth-redis"; // Deprecated
```

**Solution:**
```typescript
import { ok } from "@/lib/api-response"; // New file
import { requireAdmin } from "@/lib/auth-api"; // New file
```

### 5. Missing Return Statements

**Problem:**
```typescript
export const GET = withApi(async ({ req }) => {
  const data = await someOperation();
  // Missing return - will return undefined!
});
```

**Solution:**
```typescript
export const GET = withApi(async ({ req }) => {
  const data = await someOperation();
  return ok(data); // Always return
});
```

### 6. Using `NextResponse.json` Directly

**Problem:**
```typescript
export const GET = withApi(async ({ req }) => {
  return NextResponse.json({ data }); // Bypasses response system
});
```

**Solution:**
```typescript
export const GET = withApi(async ({ req }) => {
  return ok(data); // Use response helpers
});
```

---

## Testing Your Migration

### 1. Test Success Response
```bash
curl -X GET http://localhost:3000/api/admin/products
# Expected: { "success": true, "data": [...] }
```

### 2. Test Authentication Error
```bash
curl -X GET http://localhost:3000/api/admin/products
# Without auth: { "success": false, "error": "Unauthorized", "code": "UNAUTHORIZED" }
```

### 3. Test Validation Error
```bash
curl -X POST http://localhost:3000/api/admin/products -d '{"invalid": "data"}'
# Expected: { "success": false, "error": "Validation failed", "details": [...], "code": "VALIDATION_ERROR" }
```

### 4. Test Server Error
```bash
# Trigger an error (e.g., invalid database state)
# Expected: { "success": false, "error": "Internal server error", "code": "INTERNAL_ERROR" }
```

---

## Rollback Plan

If issues arise, you can rollback by:

1. Revert imports to old files
2. Add back try/catch blocks
3. Use `handleApiError` again

However, the new system is designed to be more stable, so rollback should not be necessary.

---

## Benefits of New System

1. **Zero Silent Failures**: Every error is caught and returned as proper JSON
2. **Consistent Responses**: All APIs follow the same format
3. **Less Code**: No more duplicated try/catch blocks
4. **Better Error Messages**: Automatic error classification and proper HTTP status codes
5. **Type Safety**: Strong TypeScript types for responses
6. **Multi-Tenant Safe**: Preserves organizationId isolation
7. **Production-Grade**: Shopify-level stability

---

## Support

If you encounter issues during migration:

1. Check the console logs for detailed error information
2. Verify all imports are from the new files
3. Ensure `withApi` wrapper is used
4. Test with curl or Postman to verify response format

---

## Next Steps

1. Migrate all admin API routes
2. Migrate all public API routes
3. Update frontend to handle new response format
4. Remove deprecated files (`@/lib/api`, `@/lib/auth-redis`)
5. Update documentation
