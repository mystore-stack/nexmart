import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";

describe("Reviews API", () => {
  let testUserId: string;
  let testProductId: string;
  let testOrderId: string;
  let testReviewId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
        password: "hashedpassword",
      },
    });
    testUserId = user.id;

    // Create test organization
    const organization = await prisma.organization.create({
      data: {
        name: "Test Organization",
        slug: `test-org-${Date.now()}`,
        ownerId: testUserId,
      },
    });

    // Create test product
    const product = await prisma.product.create({
      data: {
        name: "Test Product",
        slug: `test-product-${Date.now()}`,
        description: "Test description",
        price: 100,
        sku: `TEST-${Date.now()}`,
        organizationId: organization.id,
        categoryId: "", // Would need a real category
      },
    });
    testProductId = product.id;

    // Create test order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        userId: testUserId,
        organizationId: organization.id,
        addressId: "", // Would need a real address
        paymentMethod: "CASH_ON_DELIVERY",
        subtotal: 100,
        shipping: 10,
        tax: 0,
        total: 110,
        items: {
          create: [
            {
              name: "Test Item",
              image: "https://example.com/image.jpg",
              price: 100,
              quantity: 1,
              productId: testProductId,
            },
          ],
        },
      },
    });
    testOrderId = order.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.review.deleteMany({ where: { userId: testUserId } });
    await prisma.order.deleteMany({ where: { userId: testUserId } });
    await prisma.product.deleteMany({ where: { id: testProductId } });
    await prisma.organization.deleteMany({ where: { ownerId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  describe("POST /api/reviews", () => {
    it("should create a new review", async () => {
      const response = await fetch("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testUserId}`, // Would need real auth
        },
        body: JSON.stringify({
          productId: testProductId,
          orderId: testOrderId,
          rating: 5,
          title: "Great product",
          body: "This is an excellent product!",
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.review.rating).toBe(5);
      expect(data.review.verifiedPurchase).toBe(true);

      testReviewId = data.review.id;
    });

    it("should prevent duplicate reviews", async () => {
      // Create first review
      await prisma.review.create({
        data: {
          userId: testUserId,
          productId: testProductId,
          orderId: testOrderId,
          rating: 4,
          body: "First review",
        },
      });

      // Try to create second review
      const response = await fetch("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testUserId}`,
        },
        body: JSON.stringify({
          productId: testProductId,
          rating: 5,
          body: "Second review",
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should validate rating range", async () => {
      const response = await fetch("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testUserId}`,
        },
        body: JSON.stringify({
          productId: testProductId,
          rating: 6, // Invalid rating
          body: "Test review",
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/reviews/[id]", () => {
    beforeEach(async () => {
      const review = await prisma.review.create({
        data: {
          userId: testUserId,
          productId: testProductId,
          orderId: testOrderId,
          rating: 4,
          body: "Original review",
        },
      });
      testReviewId = review.id;
    });

    it("should update review within 7 days", async () => {
      const response = await fetch(`http://localhost:3000/api/reviews/${testReviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testUserId}`,
        },
        body: JSON.stringify({
          rating: 5,
          body: "Updated review",
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.review.rating).toBe(5);
      expect(data.review.body).toBe("Updated review");
    });

    it("should prevent updates after 7 days", async () => {
      // Update review createdAt to 8 days ago
      await prisma.review.update({
        where: { id: testReviewId },
        data: { createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      });

      const response = await fetch(`http://localhost:3000/api/reviews/${testReviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testUserId}`,
        },
        body: JSON.stringify({
          rating: 5,
          body: "Updated review",
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should prevent unauthorized updates", async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@example.com`,
          name: "Other User",
          password: "hashedpassword",
        },
      });

      const response = await fetch(`http://localhost:3000/api/reviews/${testReviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${otherUser.id}`,
        },
        body: JSON.stringify({
          rating: 5,
          body: "Updated review",
        }),
      });

      expect(response.status).toBe(403);

      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });

  describe("DELETE /api/reviews/[id]", () => {
    beforeEach(async () => {
      const review = await prisma.review.create({
        data: {
          userId: testUserId,
          productId: testProductId,
          orderId: testOrderId,
          rating: 4,
          body: "Test review",
        },
      });
      testReviewId = review.id;
    });

    it("should delete own review", async () => {
      const response = await fetch(`http://localhost:3000/api/reviews/${testReviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${testUserId}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const deletedReview = await prisma.review.findUnique({
        where: { id: testReviewId },
      });
      expect(deletedReview).toBeNull();
    });

    it("should prevent unauthorized deletion", async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@example.com`,
          name: "Other User",
          password: "hashedpassword",
        },
      });

      const response = await fetch(`http://localhost:3000/api/reviews/${testReviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${otherUser.id}`,
        },
      });

      expect(response.status).toBe(403);

      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });
});
