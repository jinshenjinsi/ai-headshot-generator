import { describe, it, expect } from "vitest";
import { generateProfessionalHeadshot } from "../server/replicate-service";

describe("Replicate Professional Headshot Integration", () => {
  it("should generate headshot with valid image URL", async () => {
    // Use a public test image URL
    const testImageUrl = "https://replicate.delivery/pbxt/KW7Getr2zD5ECxySdBZtLmPa322lNkXrpkMdKcmxeaDmq2b1/MTk4MTczMTkzNzI1Mjg5NjYy.webp";
    
    const result = await generateProfessionalHeadshot({
      imageUrl: testImageUrl,
      background: "neutral",
      gender: "none",
    });

    expect(result.success).toBe(true);
    expect(result.imageUrl).toBeDefined();
    expect(result.imageUrl).toMatch(/^https?:\/\//);
  }, 120000); // 2 minute timeout for API generation

  it("should handle different background options", async () => {
    const testImageUrl = "https://replicate.delivery/pbxt/KW7Getr2zD5ECxySdBZtLmPa322lNkXrpkMdKcmxeaDmq2b1/MTk4MTczMTkzNzI1Mjg5NjYy.webp";
    
    const result = await generateProfessionalHeadshot({
      imageUrl: testImageUrl,
      background: "white",
      gender: "female",
    });

    expect(result.success).toBe(true);
    expect(result.imageUrl).toBeDefined();
  }, 120000);
});
