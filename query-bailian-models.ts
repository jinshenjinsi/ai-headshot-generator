import axios from "axios";

async function queryAvailableModels() {
  const apiKey = process.env.ALIYUN_BAILIAN_API_KEY;

  if (!apiKey) {
    console.log("❌ ALIYUN_BAILIAN_API_KEY 未设置");
    return;
  }

  try {
    console.log("🔍 查询可用的部署模型...\n");

    const response = await axios.get(
      "https://dashscope.aliyuncs.com/api/v1/deployments/models",
      {
        params: {
          page_no: 1,
          page_size: 100,
        },
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (response.data.output && response.data.output.models) {
      const models = response.data.output.models;
      console.log(`✅ 成功获取 ${models.length} 个可用模型\n`);
      console.log("=== 可用模型列表 ===\n");

      models.forEach((model: any, index: number) => {
        console.log(`${index + 1}. ${model.model_name}`);
        console.log(`   基础容量: ${model.base_capacity}`);
        console.log("");
      });

      // 查找与头像/图像生成相关的模型
      const relevantModels = models.filter((m: any) =>
        m.model_name.toLowerCase().includes("portrait") ||
        m.model_name.toLowerCase().includes("image") ||
        m.model_name.toLowerCase().includes("style") ||
        m.model_name.toLowerCase().includes("restyle") ||
        m.model_name.toLowerCase().includes("qwen") ||
        m.model_name.toLowerCase().includes("flux")
      );

      if (relevantModels.length > 0) {
        console.log("\n=== 推荐用于头像生成的模型 ===\n");
        relevantModels.forEach((model: any) => {
          console.log(`✨ ${model.model_name}`);
        });
      }

      console.log("\n=== 分页信息 ===");
      console.log(`当前页: ${response.data.output.page_no}`);
      console.log(`页大小: ${response.data.output.page_size}`);
      console.log(`总数: ${response.data.output.total}`);
    } else {
      console.log("❌ 响应格式错误");
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error: any) {
    console.log("❌ 查询失败");
    console.log("错误:", error.response?.data || error.message);
  }
}

queryAvailableModels();
