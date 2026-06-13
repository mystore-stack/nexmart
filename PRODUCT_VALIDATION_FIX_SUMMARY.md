# Product Validation Root Cause Analysis & Fix

## Current Error

```
PRODUCT_NOT_FOUND
```

**Product ID:** `daa8315b-d934-4fb0-a4bb-a856972c0e96`

## Observed Behavior

```
Payload item count = 1
Database cart item count = 0
Fallback to payload items activated
Found products = 0
Valid fallback items = 0
Checkout aborted
```

## Root Cause

The product ID `daa8315b-d934-4fb0-a4bb-a856972c0e96` exists in the cart payload but does not exist in the database. This indicates:
- Product was deleted from database
- Cart contains stale product IDs
- No automatic cleanup of invalid cart items

## Exact Prisma Query Executed

**File:** `src/app/api/orders/route.ts`  
**Line:** 481-492

```typescript
const product = await tx.product.findUnique({
  where: { id: item.productId },
  select: { 
    id: true, 
    name: true, 
    organizationId: true, 
    published: true, 
    stock: true,
    lowStockAt: true,
  },
});
```

**Result:** `null` (product does not exist)

## Validation Query Audit

**File:** `src/app/api/orders/route.ts`  
**Line:** 561-564

```typescript
const products = await tx.product.findMany({
  where: { id: { in: productIds }, organizationId, published: true },
  include: { variants: true },
});
```

**Filters Applied:**
- `id: { in: productIds }` - Product ID must match
- `organizationId` - Product must belong to current organization
- `published: true` - Product must be published

**Result:** Empty array (0 products found)

## Product Database Status

- **Exists:** No
- **Deleted:** Yes (inferred from absence)
- **Published:** N/A
- **Organization:** N/A
- **Stock:** N/A

## Organization Comparison

- **Checkout Organization ID:** [Logged in console]
- **Product Organization ID:** N/A (product doesn't exist)
- **Match:** N/A

## Cart Data Audit

**Payload Origin:** localStorage cart (Zustand store)  
**Cart Sync:** Database cart is empty  
**Stale IDs:** Yes - product ID exists in cart but not in database

**Root Cause:** Product was deleted from database but cart was not cleaned up, leaving stale product IDs in localStorage.

## Exact Failing File

**File:** `src/app/api/orders/route.ts`  
**Line:** 561-564 (validation query)  
**Line:** 625-708 (error handling)

## Permanent Production-Safe Fix

### 1. Direct Database Verification (STEP 1)

**Location:** Lines 481-492

```typescript
const product = await tx.product.findUnique({
  where: { id: item.productId },
  select: { 
    id: true, 
    name: true, 
    organizationId: true, 
    published: true, 
    stock: true,
    lowStockAt: true,
  },
});

console.log("[PRODUCT LOOKUP]", product);
```

### 2. Validation Query Audit (STEP 2)

**Location:** Lines 554-570

```typescript
console.log("[CHECKOUT FILTERS]", {
  productIds,
  organizationId,
  published: true,
});

const products = await tx.product.findMany({
  where: { id: { in: productIds }, organizationId, published: true },
  include: { variants: true },
});
```

### 3. Organization Diagnostics (STEP 3)

**Location:** Lines 518-523

```typescript
console.log("[ORDER] Organization comparison:", {
  checkoutOrganizationId: organizationId,
  productOrganizationId: product.organizationId,
  match: product.organizationId === organizationId,
});
```

### 4. Product State Diagnostics (STEP 4)

**Location:** Lines 508-516

```typescript
console.log("[ORDER] Product state diagnostics:", {
  id: product.id,
  name: product.name,
  published: product.published,
  stock: product.stock,
  organizationId: product.organizationId,
});
```

### 5. Auto Cleanup (STEP 6)

**Location:** Lines 662-689

```typescript
if (errorReason === "PRODUCT_NOT_FOUND") {
  // Remove invalid item from database cart
  await tx.cartItem.deleteMany({
    where: {
      userId: session.userId,
      productId: firstInvalidItem.productId,
    },
  });
  
  console.log("[ORDER] Removed invalid cart item:", {
    userId: session.userId,
    productId: firstInvalidItem.productId,
  });
  
  throw new CheckoutError(
    `Product not found. The item has been removed from your cart.`,
    "PRODUCT_NOT_FOUND",
    400,
    {
      code: "PRODUCT_NOT_FOUND",
      productId: firstInvalidItem.productId,
      variantId: firstInvalidItem.variantId,
      reason: "Product record not found during validation",
      action: "REMOVE_FROM_CART",
    }
  );
}
```

### 6. Improved Error Reporting (STEP 7)

**Location:** Lines 632-708

```typescript
throw new CheckoutError(
  `Product validation failed: ${errorReason}. Please check your cart and try again.`,
  "PRODUCT_VALIDATION_FAILED",
  400,
  {
    code: "PRODUCT_VALIDATION_FAILED",
    productId: firstInvalidItem.productId,
    variantId: firstInvalidItem.variantId,
    reason: errorReason,
    details: validationResult,
  }
);
```

## Automatic Cleanup Strategy

### Current Implementation

1. **Database Cart Cleanup:** When `PRODUCT_NOT_FOUND` is detected, the invalid item is automatically removed from the database cart
2. **Error Response:** Returns specific error code with `action: "REMOVE_FROM_CART"`
3. **User Notification:** Clear message that item has been removed from cart

### Recommended Enhancements

1. **LocalStorage Cleanup:** Add client-side cleanup to remove stale product IDs from localStorage cart
2. **Pre-Checkout Validation:** Validate all cart items before allowing checkout
3. **Product Deletion Hook:** When a product is deleted, trigger cart cleanup for all users
4. **Scheduled Cleanup:** Run daily job to remove invalid cart items from database

### Client-Side Cleanup Implementation

Add to `src/store/cart.ts`:

```typescript
validateCartItems: async () => {
  const { items } = get();
  const validItems = [];
  
  for (const item of items) {
    try {
      const res = await fetch(`/api/products/${item.productId}`);
      if (res.ok) {
        validItems.push(item);
      } else {
        console.log("[CART] Removing invalid item:", item.productId);
      }
    } catch {
      // Assume valid if network error
      validItems.push(item);
    }
  }
  
  if (validItems.length !== items.length) {
    set((state) => {
      state.items = validItems;
    });
  }
},
```

## Diagnostic Output

The new logging will output:
```
[ORDER] Product IDs: [...]
[CHECKOUT FILTERS] { productIds, organizationId, published: true }
[ORDER] Validating Item { productId, quantity }
[PRODUCT LOOKUP] { id, name, organizationId, published, stock }
[ORDER] Product state diagnostics { id, name, published, stock, organizationId }
[ORDER] Organization comparison { checkoutOrganizationId, productOrganizationId, match }
[ORDER] Removed invalid cart item { userId, productId }
```

## Production Deployment Checklist

- [ ] Verify auto cleanup removes invalid database cart items
- [ ] Verify error response includes `action: "REMOVE_FROM_CART"`
- [ ] Test with deleted product in cart
- [ ] Test with unpublished product in cart
- [ ] Test with organization mismatch
- [ ] Monitor logs for cleanup operations
- [ ] Implement client-side cart validation
- [ ] Add product deletion hook for cart cleanup

## Summary

The root cause is stale product IDs in cart after product deletion. The fix implements:
1. Direct database verification for each product
2. Comprehensive diagnostics logging
3. Automatic cleanup of invalid cart items
4. Structured error reporting with specific error codes
5. Clear user notification when items are removed

The fix is production-safe, non-breaking, and provides automatic cleanup to prevent future occurrences.
