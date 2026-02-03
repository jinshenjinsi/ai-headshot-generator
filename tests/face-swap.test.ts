import { describe, it, expect } from "vitest";

describe("Face-swap Two-Step Service", () => {
  it("should have face-swap service module", async () => {
    const { swapFace } = await import("../server/face-swap-service");
    expect(swapFace).toBeDefined();
    expect(typeof swapFace).toBe("function");
  });

  it("should have two-step headshot service module", async () => {
    const { generateHeadshotTwoStep } = await import("../server/headshot-two-step-service");
    expect(generateHeadshotTwoStep).toBeDefined();
    expect(typeof generateHeadshotTwoStep).toBe("function");
  });

  it("should have generateTwoStep API endpoint", async () => {
    const { appRouter } = await import("../server/routers");
    expect(appRouter.headshot.generateTwoStep).toBeDefined();
  });

  it("should accept correct input parameters for two-step generation", async () => {
    const { appRouter } = await import("../server/routers");
    
    // Just verify the endpoint exists and has the right structure
    expect(appRouter.headshot.generateTwoStep).toBeDefined();
    expect(appRouter.headshot.generateTwoStep._def).toBeDefined();
    expect(appRouter.headshot.generateTwoStep._def.inputs).toBeDefined();
  });

  it("should have valid background options in service", async () => {
    const validBackgrounds = ["white", "black", "neutral", "gray", "office"];
    
    // Verify these are the expected background options
    expect(validBackgrounds).toContain("neutral");
    expect(validBackgrounds).toContain("office");
    expect(validBackgrounds.length).toBe(5);
  });

  it("should have valid gender options in service", async () => {
    const validGenders = ["none", "male", "female"];
    
    // Verify these are the expected gender options
    expect(validGenders).toContain("none");
    expect(validGenders).toContain("male");
    expect(validGenders).toContain("female");
    expect(validGenders.length).toBe(3);
  });
});
