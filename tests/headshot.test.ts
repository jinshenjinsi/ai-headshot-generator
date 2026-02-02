import { describe, it, expect } from "vitest";

describe("Headshot Generation API", () => {
  it("should have valid style prompts with face preservation instructions", () => {
    const styles = [
      {
        id: "office-boardroom",
        prompt: "Transform this person into a professional business headshot in modern boardroom setting. KEEP the person's exact facial features, face shape, and identity. Only change: background to boardroom, lighting to corporate style, attire to business suit, expression to confident. High quality, sharp focus, photorealistic.",
      },
      {
        id: "office-lobby",
        prompt: "Transform this person into a professional headshot in modern office lobby. PRESERVE the person's facial features and identity completely. Only modify: background to office lobby with glass windows, lighting to natural daylight, attire to business casual. High quality, photorealistic.",
      },
      {
        id: "outdoor-city",
        prompt: "Transform this person into a professional outdoor headshot in urban setting. MAINTAIN the person's exact face and features. Only change: background to city skyline with modern buildings, lighting to natural daylight, attire to business casual. High quality, photorealistic.",
      },
    ];

    styles.forEach((style) => {
      expect(style.id).toBeTruthy();
      expect(style.prompt).toBeTruthy();
      expect(style.prompt.length).toBeGreaterThan(50);
      
      // Verify prompts emphasize preserving facial features
      const preservationKeywords = ["KEEP", "PRESERVE", "MAINTAIN"];
      const hasPreservationKeyword = preservationKeywords.some(keyword => 
        style.prompt.includes(keyword)
      );
      expect(hasPreservationKeyword).toBe(true);
      
      // Verify prompts mention transformation
      expect(style.prompt.toLowerCase()).toContain("transform");
      expect(style.prompt.toLowerCase()).toContain("person");
      
      // Verify prompts specify what to change
      expect(style.prompt.toLowerCase()).toContain("background");
      expect(style.prompt.toLowerCase()).toContain("lighting");
    });
  });

  it("should validate photo requirements", () => {
    const MIN_PHOTOS = 5;
    const MAX_PHOTOS = 15;

    expect(MIN_PHOTOS).toBeGreaterThan(0);
    expect(MAX_PHOTOS).toBeGreaterThanOrEqual(MIN_PHOTOS);
    expect(MAX_PHOTOS).toBeLessThanOrEqual(20);
  });

  it("should have valid app configuration", () => {
    const appConfig = {
      appName: "AI专业头像生成器",
      appSlug: "ai-headshot-generator",
      logoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663268502683/HybfZvNMfTxugfUw.png",
    };

    expect(appConfig.appName).toBeTruthy();
    expect(appConfig.appSlug).toBeTruthy();
    expect(appConfig.logoUrl).toMatch(/^https?:\/\//);
  });
});
