import Replicate from "replicate";
import dotenv from "dotenv";

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function testReplicate() {
  try {
    console.log("Testing Replicate API...");
    console.log("API Token:", process.env.REPLICATE_API_TOKEN?.substring(0, 10) + "...");
    
    // Use a sample image URL
    const sampleImageUrl = "https://replicate.delivery/pbxt/KW7Getr2zD5ECxySdBZtLmPa322lNkXrpkMdKcmxeaDmq2b1/MTk4MTczMTkzNzI1Mjg5NjYy.webp";
    
    console.log("\nCalling Replicate API...");
    const output = await replicate.run(
      "flux-kontext-apps/professional-headshot",
      {
        input: {
          input_image: sampleImageUrl,
          background: "neutral",
          gender: "none",
          aspect_ratio: "match_input_image",
          output_format: "jpg",
          safety_tolerance: 2,
        },
      }
    );
    
    console.log("\n=== Replicate Output ===");
    console.log("Type:", typeof output);
    console.log("Is Array:", Array.isArray(output));
    console.log("Value:", JSON.stringify(output, null, 2));
    console.log("========================\n");
    
    if (Array.isArray(output)) {
      console.log("First element:", output[0]);
      console.log("First element type:", typeof output[0]);
    }
    
    console.log("\n✅ Test completed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

testReplicate();
