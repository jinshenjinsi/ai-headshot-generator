/**
 * Query Bailian API endpoints and available models
 * Helps identify the correct API endpoint and model for portrait generation
 */

import axios from "axios";

const apiKey = process.env.ALIYUN_BAILIAN_API_KEY;

if (!apiKey) {
  console.error("❌ ALIYUN_BAILIAN_API_KEY not set");
  process.exit(1);
}

async function queryEndpoints() {
  console.log("🔍 Querying Bailian API endpoints...\n");

  // Common Bailian API endpoints for image generation
  const endpoints = [
    {
      name: "portrait-generation (官方人物生成)",
      url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/portrait-generation/generate",
      model: "wanx-v1-0521",
    },
    {
      name: "wanx image-synthesis (通用图像合成)",
      url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/wanx/image-synthesis",
      model: "wanx-v1-0521",
    },
    {
      name: "image-synthesis (旧版图像合成)",
      url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/image-synthesis/generate",
      model: "wanx-v1-0521",
    },
    {
      name: "text2image (文本到图像)",
      url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/generate",
      model: "wanx-v1-0521",
    },
  ];

  // Test image URL
  const testImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop";

  for (const endpoint of endpoints) {
    console.log(`\n📍 Testing: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);

    try {
      let payload: any;

      // Adjust payload based on endpoint type
      if (endpoint.name.includes("portrait-generation")) {
        payload = {
          model: endpoint.model,
          input: {
            image_url: testImageUrl,
          },
          parameters: {
            style: "professional",
            prompt: "professional headshot",
          },
        };
      } else if (endpoint.name.includes("wanx")) {
        payload = {
          model: endpoint.model,
          input: {
            prompt: "professional headshot photo",
            image_url: testImageUrl,
          },
          parameters: {
            size: "1024x1024",
            n: 1,
          },
        };
      } else if (endpoint.name.includes("image-synthesis")) {
        payload = {
          model: endpoint.model,
          input: {
            prompt: "professional headshot photo",
            image_url: testImageUrl,
          },
          parameters: {
            size: "1024x1024",
            n: 1,
          },
        };
      } else {
        payload = {
          model: endpoint.model,
          input: {
            prompt: "professional headshot photo",
          },
          parameters: {
            size: "1024x1024",
            n: 1,
          },
        };
      }

      const response = await axios.post(endpoint.url, payload, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-DashScope-Async": "enable",
        },
        timeout: 10000,
      });

      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Response keys: ${Object.keys(response.data).join(", ")}`);

      if (response.data.output) {
        console.log(`   📋 Output keys: ${Object.keys(response.data.output).join(", ")}`);
      }

      if (response.data.request_id) {
        console.log(`   📌 Request ID: ${response.data.request_id}`);
      }

      if (response.data.output?.image_url) {
        console.log(`   🖼️  Image URL: ${response.data.output.image_url.substring(0, 50)}...`);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.log(`   ❌ Status: ${error.response?.status}`);
        console.log(`   📋 Error: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
        console.log(`   📊 Error code: ${error.response?.data?.code}`);
      } else {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // Also try to query available models
  console.log("\n\n📚 Querying available models...\n");

  try {
    const response = await axios.get("https://dashscope.aliyuncs.com/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      timeout: 10000,
    });

    if (response.data.data && Array.isArray(response.data.data)) {
      console.log(`✅ Found ${response.data.data.length} models`);
      
      // Filter for wanx models
      const wanxModels = response.data.data.filter((m: any) => m.model_id?.includes("wanx"));
      console.log(`\n🎨 Wanx models (${wanxModels.length}):`);
      wanxModels.forEach((m: any) => {
        console.log(`   - ${m.model_id}`);
      });

      // Filter for portrait models
      const portraitModels = response.data.data.filter((m: any) => 
        m.model_id?.includes("portrait") || m.model_id?.includes("headshot")
      );
      if (portraitModels.length > 0) {
        console.log(`\n👤 Portrait/Headshot models (${portraitModels.length}):`);
        portraitModels.forEach((m: any) => {
          console.log(`   - ${m.model_id}`);
        });
      }

      // Show all image generation models
      const imageModels = response.data.data.filter((m: any) => 
        m.model_id?.includes("image") || m.model_id?.includes("text2image")
      );
      if (imageModels.length > 0) {
        console.log(`\n🖼️  Image generation models (${imageModels.length}):`);
        imageModels.slice(0, 10).forEach((m: any) => {
          console.log(`   - ${m.model_id}`);
        });
        if (imageModels.length > 10) {
          console.log(`   ... and ${imageModels.length - 10} more`);
        }
      }
    }
  } catch (error) {
    console.log("❌ Failed to query models");
    if (axios.isAxiosError(error)) {
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
  }
}

queryEndpoints();
