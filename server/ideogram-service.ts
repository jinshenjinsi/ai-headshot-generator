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
  seed?: number; // 随机种子,用于控制生成结果的随机性
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
    
    // Generate random seed if not provided (for retry variation)
    const seed = options.seed || Math.floor(Math.random() * 1000000);
    
    console.log("Using seed:", seed);
    
    // Use predictions.create and wait for completion
    let prediction = await replicate.predictions.create({
      model: "ideogram-ai/ideogram-character",
      input: {
        character_reference_image: options.characterImageUrl,
        prompt: options.prompt,
        rendering_speed: options.renderingSpeed || "Quality",
        style_type: options.styleType || "Realistic",
        aspect_ratio: options.aspectRatio || "3:4", // 使用3:4比例提高清晰度(1152×1536)
        magic_prompt_option: "Off", // 关闭magic prompt以保持prompt精确性
        seed: seed, // 添加随机种子
      },
    });
    
    console.log("Prediction created:", prediction.id, "Status:", prediction.status);
    
    // Wait for completion
    prediction = await replicate.wait(prediction);
    
    console.log("Prediction completed:", prediction.status);

    console.log("Ideogram-character prediction result:", JSON.stringify(prediction, null, 2));
    console.log("Prediction output:", prediction.output);
    
    // Check prediction.output field (standard Replicate response)
    const output = prediction.output;
    
    if (Array.isArray(output) && output.length > 0) {
      console.log("Found image URL:", output[0]);
      return {
        success: true,
        imageUrl: output[0],
      };
    } else if (typeof output === "string") {
      console.log("Found image URL (string):", output);
      return {
        success: true,
        imageUrl: output,
      };
    }

    console.error("No valid image URL found in prediction:", prediction);
    return {
      success: false,
      error: `No image generated. Prediction: ${JSON.stringify(prediction)}`,
    };
  } catch (error) {
    console.error("Ideogram-character API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
