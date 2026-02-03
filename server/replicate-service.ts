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
    console.log("Creating prediction with options:", options);
    
    // Create prediction
    const prediction = await replicate.predictions.create({
      model: "flux-kontext-apps/professional-headshot",
      input: {
        input_image: options.imageUrl,
        background: options.background || "neutral",
        gender: options.gender || "none",
        aspect_ratio: options.aspectRatio || "match_input_image",
        output_format: "jpg",
        safety_tolerance: 2,
      },
    });

    console.log("Prediction created:", prediction.id, "Status:", prediction.status);

    // Wait for prediction to complete
    let finalPrediction = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout

    while (
      (finalPrediction.status === "starting" || finalPrediction.status === "processing") &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      finalPrediction = await replicate.predictions.get(prediction.id);
      console.log("Prediction status:", finalPrediction.status);
      attempts++;
    }

    console.log("Final prediction status:", finalPrediction.status);
    console.log("Output:", finalPrediction.output);

    if (finalPrediction.status === "succeeded" && finalPrediction.output) {
      const imageUrl = typeof finalPrediction.output === "string" 
        ? finalPrediction.output 
        : Array.isArray(finalPrediction.output) 
        ? finalPrediction.output[0] 
        : null;

      if (imageUrl && typeof imageUrl === "string") {
        return {
          success: true,
          imageUrl,
        };
      }
    }

    return {
      success: false,
      error: (finalPrediction.error as string) || `Generation failed with status: ${finalPrediction.status}`,
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
    // Simple test: get account info
    const account = await replicate.accounts.current() as any;
    console.log("Replicate account:", account?.username || "unknown");
    return true;
  } catch (error) {
    console.error("Replicate connection test failed:", error);
    return false;
  }
}
