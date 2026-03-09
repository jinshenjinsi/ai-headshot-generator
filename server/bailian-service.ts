/**
 * Alibaba Cloud Bailian API Service
 * Uses wan2.6-image model for professional headshot generation
 * Cost: ¥0.2/image (vs ¥1.45 for Ideogram)
 */

import axios from "axios";

interface GenerateHeadshotParams {
  imageUrl: string;
  style: string;
  prompt?: string;
  regenerateCount?: number; // 0 = 第一次生成，1-3 = 重新生成次数
}

interface GenerateHeadshotResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

const BAILIAN_API_KEY = process.env.ALIYUN_BAILIAN_API_KEY;
const BAILIAN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

console.log("[Bailian Init] API Key exists:", !!BAILIAN_API_KEY);
if (BAILIAN_API_KEY) {
  console.log("[Bailian Init] API Key prefix:", BAILIAN_API_KEY.substring(0, 10) + "...");
}

/**
 * Generate professional headshot using Alibaba Cloud Bailian wan2.6-image
 * Supports image editing and style transformation
 */
export async function generateHeadshotWithBailian(
  params: GenerateHeadshotParams
): Promise<GenerateHeadshotResult> {
  if (!BAILIAN_API_KEY) {
    return {
      success: false,
      error: "ALIYUN_BAILIAN_API_KEY not configured",
    };
  }

  try {
    console.log("[Bailian] === 开始生成头像 ===");
    console.log("[Bailian] API Key configured:", !!BAILIAN_API_KEY);
    console.log(`[Bailian] 风格: ${params.style}`);
    console.log(`[Bailian] 输入图片URL: ${params.imageUrl}`);

    // 构建风格提示词
    const stylePrompts: Record<string, string> = {
      cartoon: "卡通风格头像,色彩鲜艳,可爱风格",
      "oil-painting": "油画风格头像,笔触明显,艺术感强",
      "3d": "3D渲染头像,高清质感,专业级别",
      watercolor: "水彩风格头像,柔和色调,艺术气息",
      sketch: "素描风格头像,线条流畅,黑白风格",
      anime: "二次元动漫风格头像,大眼睛,可爱表情",
      "professional": "参考输入图片的风格和特征,生成一张专业的商务头像照片。要求:高清、清晰、正式气质、专业质量、适合商务场景使用",
      "minimalist": "极简风格头像,简洁干净,现代感",
      "vintage": "复古风格头像,怀旧色调,文艺气息",
      "neon": "霓虹灯风格头像,炫彩色彩,科技感",
    };

    const stylePrompt = stylePrompts[params.style] || params.style;
    
    // 根据regenerateCount调整提示词，提示大模型使用不同的底片
    let finalPrompt = params.prompt || stylePrompt;
    if (params.regenerateCount && params.regenerateCount > 0) {
      const regenerateHints = [
        "使用不同的背景色和光线效果",
        "使用不同的构图和角度",
        "使用不同的表情和姿态",
      ];
      const hint = regenerateHints[params.regenerateCount - 1] || regenerateHints[2];
      finalPrompt = `${stylePrompt}。${hint}。`;
    }

    // 调用wan2.6-image模型
    console.log("[Bailian] 调用wan2.6-image API...");
    console.log("[Bailian] API URL:", BAILIAN_API_URL);

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
                  text: finalPrompt,
                },
                {
                  image: params.imageUrl,
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

    console.log("[Bailian] API响应状态:", response.status);

    // 处理响应 - wan2.6-image的响应格式
    if (response.data.output?.choices?.[0]?.message?.content?.[0]?.image) {
      const imageUrl = response.data.output.choices[0].message.content[0].image;
      console.log("[Bailian] ✅ 生成成功");
      console.log("[Bailian] 输出图片URL:", imageUrl);

      return {
        success: true,
        imageUrl,
      };
    }

    // 备用响应格式检查
    if (response.data.output?.results?.[0]?.image_url) {
      const imageUrl = response.data.output.results[0].image_url;
      console.log("[Bailian] ✅ 生成成功(results格式)");
      console.log("[Bailian] 输出图片URL:", imageUrl);

      return {
        success: true,
        imageUrl,
      };
    }

    if (response.data.output?.image_url) {
      const imageUrl = response.data.output.image_url;
      console.log("[Bailian] ✅ 生成成功(image_url格式)");
      console.log("[Bailian] 输出图片URL:", imageUrl);

      return {
        success: true,
        imageUrl,
      };
    }

    console.log("[Bailian] ❌ 响应格式错误");
    console.log("[Bailian] 完整响应:", JSON.stringify(response.data, null, 2));

    return {
      success: false,
      error: "Invalid response format from Bailian API",
    };
  } catch (error: any) {
    console.error("[Bailian] ❌ 生成失败");

    if (axios.isAxiosError(error)) {
      console.error("[Bailian] HTTP状态码:", error.response?.status);
      console.error("[Bailian] 错误响应:", error.response?.data);

      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      return {
        success: false,
        error: `Bailian API error: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 获取支持的风格列表
 */
export function getSupportedStyles(): string[] {
  return [
    "cartoon",
    "oil-painting",
    "3d",
    "watercolor",
    "sketch",
    "anime",
    "professional",
    "minimalist",
    "vintage",
    "neon",
  ];
}
