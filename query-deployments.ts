/**
 * Query available deployment models from Bailian API
 * Uses the deployments endpoint to get available models
 */

import axios from "axios";

const apiKey = process.env.ALIYUN_BAILIAN_API_KEY;

if (!apiKey) {
  console.error("❌ ALIYUN_BAILIAN_API_KEY not set");
  process.exit(1);
}

async function queryDeployments() {
  console.log("🔍 Querying Bailian deployment models...\n");

  try {
    const response = await axios.get(
      "https://dashscope.aliyuncs.com/api/v1/deployments/models",
      {
        params: {
          page_no: 1,
          page_size: 100,
        },
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Query successful (Status: ${response.status})\n`);

    if (response.data.output?.models) {
      const models = response.data.output.models;
      console.log(`📊 Total models available: ${response.data.output.total}`);
      console.log(`📄 Showing ${models.length} models on this page\n`);

      // Filter for relevant models
      const portraitModels = models.filter((m: any) => 
        m.model_name?.includes("portrait") || 
        m.model_name?.includes("headshot") ||
        m.model_name?.includes("wanx") ||
        m.model_name?.includes("emo")
      );

      if (portraitModels.length > 0) {
        console.log("🎨 Portrait/Generation related models:");
        portraitModels.forEach((m: any) => {
          console.log(`   - ${m.model_name} (base_capacity: ${m.base_capacity})`);
        });
        console.log();
      }

      // Show all models
      console.log("📋 All available models:");
      models.forEach((m: any) => {
        console.log(`   - ${m.model_name} (base_capacity: ${m.base_capacity})`);
      });

      // Check for specific models we're interested in
      console.log("\n🔍 Checking for specific models:");
      const checkModels = [
        "wanx-v1-0521",
        "wanx-v1",
        "portrait-generation",
        "emo",
        "qwen-plus",
        "qwen-vl",
      ];

      checkModels.forEach((modelName) => {
        const found = models.find((m: any) => m.model_name?.includes(modelName));
        if (found) {
          console.log(`   ✅ ${modelName}: Found as "${found.model_name}"`);
        } else {
          console.log(`   ❌ ${modelName}: Not found`);
        }
      });
    } else {
      console.log("⚠️  No models in response");
      console.log("📊 Full response:", JSON.stringify(response.data, null, 2));
    }
  } catch (error: any) {
    console.error("❌ Query failed");

    if (axios.isAxiosError(error)) {
      console.error(`📊 HTTP Status: ${error.response?.status}`);
      console.error(`📋 Error Response:`, error.response?.data);
    } else {
      console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    process.exit(1);
  }
}

queryDeployments();
