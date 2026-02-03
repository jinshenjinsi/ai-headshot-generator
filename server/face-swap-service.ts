import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export interface FaceSwapOptions {
  targetImageUrl: string; // 专业背景图
  sourceImageUrl: string; // 用户原始照片(提取面部)
}

export interface FaceSwapResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Swap face from source image to target image using codeplugtech/face-swap
 * Cost: ~$0.0027 per image (370 images per $1)
 */
export async function swapFace(
  options: FaceSwapOptions
): Promise<FaceSwapResult> {
  try {
    console.log("Creating face-swap prediction:", options);
    
    const prediction = await replicate.predictions.create({
      model: "codeplugtech/face-swap",
      input: {
        input_image: options.targetImageUrl,  // 目标图(专业背景)
        swap_image: options.sourceImageUrl,   // 源图(用户面部)
      },
    });

    console.log("Face-swap prediction created:", prediction.id);

    // Wait for completion
    let finalPrediction = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout

    while (
      (finalPrediction.status === "starting" || finalPrediction.status === "processing") &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      finalPrediction = await replicate.predictions.get(prediction.id);
      console.log("Face-swap status:", finalPrediction.status);
      attempts++;
    }

    console.log("Final face-swap status:", finalPrediction.status);
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
      error: (finalPrediction.error as string) || `Face-swap failed with status: ${finalPrediction.status}`,
    };
  } catch (error) {
    console.error("Face-swap API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
