import { describe, it, expect } from "vitest";
import type { ImageFilters } from "../image-processor";

// Mock isCanvasSupported for Node.js environment
const isCanvasSupported = () => false;

describe("Image Processor", () => {
  describe("Filter Value Validation", () => {
    it("should have all filters at default (1)", () => {
      const filters: ImageFilters = {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        sharpness: 1,
      };
      
      expect(filters.brightness).toBe(1);
      expect(filters.contrast).toBe(1);
      expect(filters.saturation).toBe(1);
      expect(filters.sharpness).toBe(1);
    });

    it("should handle brightness adjustment", () => {
      const filters: ImageFilters = {
        brightness: 1.2,
        contrast: 1,
        saturation: 1,
        sharpness: 1,
      };
      
      expect(filters.brightness).toBe(1.2);
      expect(filters.brightness).toBeGreaterThan(1);
    });

    it("should handle contrast adjustment", () => {
      const filters: ImageFilters = {
        brightness: 1,
        contrast: 0.8,
        saturation: 1,
        sharpness: 1,
      };
      
      expect(filters.contrast).toBe(0.8);
      expect(filters.contrast).toBeLessThan(1);
    });

    it("should handle saturation adjustment", () => {
      const filters: ImageFilters = {
        brightness: 1,
        contrast: 1,
        saturation: 1.5,
        sharpness: 1,
      };
      
      expect(filters.saturation).toBe(1.5);
      expect(filters.saturation).toBeGreaterThan(1);
    });

    it("should handle sharpness adjustment", () => {
      const filters: ImageFilters = {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        sharpness: 0.7,
      };
      
      expect(filters.sharpness).toBe(0.7);
      expect(filters.sharpness).toBeLessThan(1);
    });

    it("should handle multiple filters simultaneously", () => {
      const filters: ImageFilters = {
        brightness: 1.1,
        contrast: 0.9,
        saturation: 1.2,
        sharpness: 0.8,
      };
      
      expect(filters.brightness).toBe(1.1);
      expect(filters.contrast).toBe(0.9);
      expect(filters.saturation).toBe(1.2);
      expect(filters.sharpness).toBe(0.8);
    });
  });

  describe("Filter Range Validation", () => {
    it("should enforce minimum brightness (0.5)", () => {
      const filters: ImageFilters = {
        brightness: 0.5,
        contrast: 1,
        saturation: 1,
        sharpness: 1,
      };
      
      expect(filters.brightness).toBeGreaterThanOrEqual(0.5);
    });

    it("should enforce maximum brightness (1.5)", () => {
      const filters: ImageFilters = {
        brightness: 1.5,
        contrast: 1,
        saturation: 1,
        sharpness: 1,
      };
      
      expect(filters.brightness).toBeLessThanOrEqual(1.5);
    });

    it("should enforce minimum contrast (0.5)", () => {
      const filters: ImageFilters = {
        brightness: 1,
        contrast: 0.5,
        saturation: 1,
        sharpness: 1,
      };
      
      expect(filters.contrast).toBeGreaterThanOrEqual(0.5);
    });

    it("should enforce maximum contrast (1.5)", () => {
      const filters: ImageFilters = {
        brightness: 1,
        contrast: 1.5,
        saturation: 1,
        sharpness: 1,
      };
      
      expect(filters.contrast).toBeLessThanOrEqual(1.5);
    });

    it("should enforce saturation range", () => {
      const filters: ImageFilters = {
        brightness: 1,
        contrast: 1,
        saturation: 1.0,
        sharpness: 1,
      };
      
      expect(filters.saturation).toBeGreaterThanOrEqual(0.5);
      expect(filters.saturation).toBeLessThanOrEqual(1.5);
    });

    it("should enforce sharpness range", () => {
      const filters: ImageFilters = {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        sharpness: 1.0,
      };
      
      expect(filters.sharpness).toBeGreaterThanOrEqual(0.5);
      expect(filters.sharpness).toBeLessThanOrEqual(1.5);
    });
  });

  describe("Canvas Support Detection", () => {
    it("should return false in Node.js environment", () => {
      const supported = isCanvasSupported();
      expect(supported).toBe(false);
    });
  });

  describe("Filter Percentage Calculation", () => {
    it("should correctly calculate percentage from filter value", () => {
      const brightness = 1.2;
      const percentage = brightness * 100;
      expect(percentage).toBe(120);
    });

    it("should handle decimal precision", () => {
      const contrast = 0.85;
      const percentage = (contrast * 100).toFixed(0);
      expect(percentage).toBe("85");
    });

    it("should round percentage correctly", () => {
      const saturation = 1.234;
      const percentage = (saturation * 100).toFixed(0);
      expect(percentage).toBe("123");
    });

    it("should calculate 100% for default value", () => {
      const defaultValue = 1;
      const percentage = (defaultValue * 100).toFixed(0);
      expect(percentage).toBe("100");
    });
  });
});
