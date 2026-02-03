import { generateProfessionalHeadshot, type HeadshotGenerationOptions } from "./replicate-service";
import { swapFace } from "./face-swap-service";

export interface TwoStepHeadshotOptions {
  userImageUrl: string; // 用户原始照片
  background?: "white" | "black" | "neutral" | "gray" | "office";
  gender?: "none" | "male" | "female";
  aspectRatio?: "match_input_image" | "1:1" | "16:9" | "9:16" | "4:3";
}

export interface TwoStepHeadshotResult {
  success: boolean;
  finalImageUrl?: string;
  backgroundImageUrl?: string; // 中间步骤的背景图
  error?: string;
  step?: "background" | "face-swap"; // 失败在哪一步
}

/**
 * Two-step headshot generation:
 * Step 1: Generate professional background using user's photo
 * Step 2: Swap user's face onto the generated background
 * 
 * Total cost: ~$0.043 per image ($0.04 + $0.0027)
 * Total time: ~20-40 seconds
 */
export async function generateHeadshotTwoStep(
  options: TwoStepHeadshotOptions
): Promise<TwoStepHeadshotResult> {
  try {
    console.log("=== Two-Step Headshot Generation Started ===");
    console.log("Step 1: Generating professional background...");

    // Step 1: Generate professional background
    const backgroundResult = await generateProfessionalHeadshot({
      imageUrl: options.userImageUrl,
      background: options.background,
      gender: options.gender,
      aspectRatio: options.aspectRatio,
    });

    if (!backgroundResult.success || !backgroundResult.imageUrl) {
      console.error("Step 1 failed:", backgroundResult.error);
      return {
        success: false,
        error: `Background generation failed: ${backgroundResult.error}`,
        step: "background",
      };
    }

    console.log("Step 1 completed:", backgroundResult.imageUrl);
    console.log("Step 2: Swapping face...");

    // Step 2: Swap user's face onto the background
    const faceSwapResult = await swapFace({
      targetImageUrl: backgroundResult.imageUrl, // 生成的专业背景
      sourceImageUrl: options.userImageUrl,      // 用户原始照片
    });

    if (!faceSwapResult.success || !faceSwapResult.imageUrl) {
      console.error("Step 2 failed:", faceSwapResult.error);
      return {
        success: false,
        backgroundImageUrl: backgroundResult.imageUrl,
        error: `Face swap failed: ${faceSwapResult.error}`,
        step: "face-swap",
      };
    }

    console.log("Step 2 completed:", faceSwapResult.imageUrl);
    console.log("=== Two-Step Headshot Generation Completed ===");

    return {
      success: true,
      finalImageUrl: faceSwapResult.imageUrl,
      backgroundImageUrl: backgroundResult.imageUrl,
    };
  } catch (error) {
    console.error("Two-step generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
