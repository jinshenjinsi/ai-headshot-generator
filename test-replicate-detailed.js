import Replicate from "replicate";
import dotenv from "dotenv";

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function testReplicateDetailed() {
  try {
    console.log("=== Testing Replicate Account ===\n");
    
    // Test 1: Check account
    console.log("1. Checking account...");
    try {
      const account = await replicate.accounts.current();
      console.log("✅ Account:", JSON.stringify(account, null, 2));
    } catch (error) {
      console.log("❌ Account check failed:", error.message);
    }
    
    // Test 2: Test with predictions.create (more explicit)
    console.log("\n2. Testing predictions.create...");
    const sampleImageUrl = "https://replicate.delivery/pbxt/KW7Getr2zD5ECxySdBZtLmPa322lNkXrpkMdKcmxeaDmq2b1/MTk4MTczMTkzNzI1Mjg5NjYy.webp";
    
    try {
      const prediction = await replicate.predictions.create({
        model: "flux-kontext-apps/professional-headshot",
        input: {
          input_image: sampleImageUrl,
          background: "neutral",
          gender: "none",
          aspect_ratio: "match_input_image",
          output_format: "jpg",
          safety_tolerance: 2,
        },
      });
      
      console.log("Prediction created:");
      console.log("  ID:", prediction.id);
      console.log("  Status:", prediction.status);
      console.log("  Full response:", JSON.stringify(prediction, null, 2));
      
      // Wait for completion
      console.log("\n3. Waiting for prediction to complete...");
      let finalPrediction = prediction;
      while (finalPrediction.status === "starting" || finalPrediction.status === "processing") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        finalPrediction = await replicate.predictions.get(prediction.id);
        console.log("  Status:", finalPrediction.status);
      }
      
      console.log("\n4. Final result:");
      console.log("  Status:", finalPrediction.status);
      console.log("  Output:", JSON.stringify(finalPrediction.output, null, 2));
      console.log("  Error:", finalPrediction.error);
      
    } catch (error) {
      console.log("❌ Prediction failed:");
      console.log("  Error:", error.message);
      if (error.response) {
        console.log("  Status:", error.response.status);
        console.log("  Data:", JSON.stringify(error.response.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  }
}

testReplicateDetailed();
