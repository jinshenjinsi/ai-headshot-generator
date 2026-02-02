import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export interface HeadshotGenerationOptions {
  imageUrl: string;
  background?: "white" | "black" | "neutral" | "gray" | "office";
  gender?: "none" | "male" | "female";
  aspectRatio?: "match_input_image" | "1:1" | "16:9" | "9:16" | "4:3";
}

export interface HeadshotGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Generate professional headshot using Replicate's flux-kontext-apps/professional-headshot model
 */
export async function generateProfessionalHeadshot(
  options: HeadshotGenerationOptions
): Promise<HeadshotGenerationResult> {
  try {
    const output = await replicate.run(
      "flux-kontext-apps/professional-headshot",
      {
        input: {
          input_image: options.imageUrl,
          background: options.background || "neutral",
          gender: options.gender || "none",
          aspect_ratio: options.aspectRatio || "match_input_image",
          output_format: "jpg",
          safety_tolerance: 2,
        },
      }
    );

    // Output is a URL string or array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (typeof imageUrl === "string") {
      return {
        success: true,
        imageUrl,
      };
    }

    return {
      success: false,
      error: "Invalid output format from Replicate API",
    };
  } catch (error) {
    console.error("Replicate API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Test Replicate API connection
 */
export async function testReplicateConnection(): Promise<boolean> {
  try {
    // Simple test: list available models (lightweight operation)
    const models = await replicate.models.list();
    return true;
  } catch (error) {
    console.error("Replicate connection test failed:", error);
    return false;
  }
}
