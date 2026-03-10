import { describe, it, expect, beforeAll } from "vitest";
import axios from "axios";

describe("Bailian API Integration", () => {
  const BAILIAN_API_KEY = process.env.ALIYUN_BAILIAN_API_KEY;
  const BAILIAN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

  beforeAll(() => {
    console.log("[Test] ALIYUN_BAILIAN_API_KEY configured:", !!BAILIAN_API_KEY);
    if (BAILIAN_API_KEY) {
      console.log("[Test] API Key prefix:", BAILIAN_API_KEY.substring(0, 10) + "...");
    }
  });

  it("should have ALIYUN_BAILIAN_API_KEY configured", () => {
    expect(BAILIAN_API_KEY).toBeDefined();
    expect(BAILIAN_API_KEY?.length).toBeGreaterThan(0);
  });

  it("should successfully call Bailian API with valid credentials", async () => {
    if (!BAILIAN_API_KEY) {
      console.log("[Test] Skipping API call test - no API key");
      return;
    }

    try {
      // 使用一个简单的测试提示词和公开的图片URL
      const response = await axios.post(
        BAILIAN_API_URL,
        {
          model: "wan2.6-image",
          input: {
            messages: [
              {
                role: "user",
                content: [
                  {
                    text: "生成一个简单的蓝色圆形",
                  },
                  {
                    image: "https://img.alicdn.com/imgextra/i1/O1CN01Z5paLz1O0zuCC7_M2_!!6000000001630-2-tps-500-500.png",
                  },
                ],
              },
            ],
          },
          parameters: {
            prompt_extend: true,
            watermark: false,
            n: 1,
            enable_interleave: false,
            size: "1024*1024",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${BAILIAN_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 120000,
        }
      );

      console.log("[Test] API Response Status:", response.status);
      console.log("[Test] API Response Data:", JSON.stringify(response.data, null, 2));

      // 验证响应格式
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      // 检查是否有图片输出
      const hasImageOutput =
        response.data.output?.choices?.[0]?.message?.content?.[0]?.image ||
        response.data.output?.results?.[0]?.image_url ||
        response.data.output?.image_url;

      if (hasImageOutput) {
        console.log("[Test] ✅ Image generated successfully");
        expect(hasImageOutput).toBeDefined();
      } else {
        console.log("[Test] ⚠️ No image in response, but API call succeeded");
        console.log("[Test] Response structure:", JSON.stringify(response.data, null, 2));
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("[Test] HTTP Error:", error.response?.status);
        console.error("[Test] Error Response:", error.response?.data);
        throw new Error(`Bailian API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }, 180000); // 3 minute timeout for API call
});
