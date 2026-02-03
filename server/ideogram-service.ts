import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export interface IdeogramCharacterOptions {
  characterImageUrl: string; // 用户原始照片(作为character reference)
  prompt: string; // 场景描述prompt
  renderingSpeed?: "Turbo" | "Default" | "Quality";
  styleType?: "Auto" | "Fiction" | "Realistic";
  aspectRatio?: "1:1" | "9:16" | "16:9" | "4:3" | "3:4";
}

export interface IdeogramCharacterResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Generate professional headshot using ideogram-character model
 * This model is specifically designed for character consistency
 * 
 * Pricing:
 * - Turbo: $0.10/image (10 images per $1)
 * - Default: $0.15/image (66 images per $10)
 * - Quality: $0.20/image (50 images per $10)
 */
export async function generateIdeogramCharacter(
  options: IdeogramCharacterOptions
): Promise<IdeogramCharacterResult> {
  try {
    console.log("Creating ideogram-character prediction:", options);
    
    const prediction = await replicate.run(
      "ideogram-ai/ideogram-character" as any,
      {
        input: {
          character_reference_image: options.characterImageUrl,
          prompt: options.prompt,
          rendering_speed: options.renderingSpeed || "Quality",
          style_type: options.styleType || "Realistic",
          aspect_ratio: options.aspectRatio || "1:1",
          magic_prompt_option: "Off", // 关闭magic prompt以保持prompt精确性
        },
      }
    );

    console.log("Ideogram-character prediction result:", prediction);

    if (prediction && typeof prediction === "string") {
      return {
        success: true,
        imageUrl: prediction,
      };
    } else if (Array.isArray(prediction) && prediction.length > 0) {
      return {
        success: true,
        imageUrl: prediction[0],
      };
    }

    return {
      success: false,
      error: "No image generated",
    };
  } catch (error) {
    console.error("Ideogram-character API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
