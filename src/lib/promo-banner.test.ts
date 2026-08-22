import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPromoBannerPayload } from "./promo-banner";

describe("buildPromoBannerPayload", () => {
  it("creates a fallback payload for an empty promo configuration", () => {
    const payload = buildPromoBannerPayload(null, null, [], { isDemo: true });

    assert.ok(payload.promo.title);
    assert.equal(payload.section.sectionKey, "megaPromo");
    assert.equal(payload.countdown.isExpired, false);
    assert.equal(payload.products.length, 0);
  });
});
