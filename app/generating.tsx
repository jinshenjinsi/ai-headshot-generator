import { View, Text, Platform, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";

// 专业头像拍摄技巧
const PHOTOGRAPHY_TIPS = [
  {
    icon: "💡",
    title: "光线是关键",
    description: "自然光最佳,避免顶光和逆光,45度侧光能塑造立体感"
  },
  {
    icon: "👔",
    title: "着装要得体",
    description: "纯色衣服更专业,避免复杂图案,颜色与背景形成对比"
  },
  {
    icon: "😊",
    title: "表情要自然",
    description: "微笑露出上排牙齿,眼神坚定有神,展现自信和亲和力"
  },
  {
    icon: "📐",
    title: "构图要规范",
    description: "头部占画面1/3,眼睛在上1/3处,保持肩膀水平"
  },
  {
    icon: "🎨",
    title: "背景要简洁",
    description: "纯色背景最专业,避免杂乱元素,突出人物主体"
  },
  {
    icon: "📸",
    title: "角度要合适",
    description: "相机略高于眼睛,微微俯拍显脸小,正面或3/4侧面最佳"
  },
];

// Helper function to convert blob URL to base64 (Web only)
async function blobUrlToBase64(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function GeneratingScreen() {
  const router = useRouter();
  const colors = useColors();
  const { photos, selectedStyle, setGeneratedImage } = useApp();
  const [progress, setProgress] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState("准备开始...");

  // 动画值
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const uploadMutation = trpc.headshot.uploadPhoto.useMutation();
  const generateMutation = trpc.headshot.generateIdeogram.useMutation(); // 使用ideogram-character API

  useEffect(() => {
    // 检查必要数据
    if (!photos || photos.length === 0 || !selectedStyle) {
      console.log("Missing required data, redirecting...");
      setTimeout(() => {
        router.replace("/" as any);
      }, 100);
      return;
    }

    // 启动旋转动画
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 启动脉冲动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 开始生成流程
    startGeneration();
  }, []);

  // 技巧轮播
  useEffect(() => {
    const interval = setInterval(() => {
      // 淡出
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // 切换技巧
        setCurrentTipIndex((prev) => (prev + 1) % PHOTOGRAPHY_TIPS.length);
        // 淡入
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const startGeneration = async () => {
    try {
      setProgress(10);
      setStatusMessage("正在准备照片...");

      // 选择第一张照片
      const firstPhoto = photos[0];
      console.log("Selected photo URI:", firstPhoto);

      setProgress(20);
      setStatusMessage("正在读取照片数据...");

      // 读取照片数据
      let base64Data: string;
      
      if (Platform.OS === "web") {
        console.log("Platform: web, using Web API to read blob URL");
        base64Data = await blobUrlToBase64(firstPhoto);
      } else {
        console.log("Platform: native, using FileSystem API");
        base64Data = await FileSystem.readAsStringAsync(firstPhoto, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      console.log("Photo read successfully, base64 length:", base64Data.length);

      setProgress(40);
      setStatusMessage("正在上传照片到服务器...");

      // 上传照片
      const uploadResult = await uploadMutation.mutateAsync({
        photoBase64: `data:image/jpeg;base64,${base64Data}`,
        fileName: `photo-${Date.now()}.jpg`,
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error("照片上传失败");
      }

      console.log("Upload success:", uploadResult.url);

      setProgress(50);
      setStatusMessage("AI正在分析您的面部特征...");

      // 等待一下让用户看到进度
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(70);
      setStatusMessage("正在生成专业头像...(Quality模式)");

      // 调用生成API,传递完整prompt
      const result = await generateMutation.mutateAsync({
        imageUrl: uploadResult.url,
        prompt: selectedStyle!.prompt, // 使用风格的详细prompt
        background: selectedStyle!.background,
        gender: selectedStyle!.gender || "none",
      });

      if (!result.success || !result.imageUrl) {
        throw new Error("生成失败");
      }

      console.log("Generation success:", result.imageUrl);

      setProgress(90);
      setStatusMessage("正在优化图像质量...");

      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);
      setStatusMessage("完成!");

      // 保存生成的图片
      setGeneratedImage(result.imageUrl);

      // 跳转到结果页面
      setTimeout(() => {
        router.push("/result" as any);
      }, 500);

    } catch (error) {
      console.error("Generation error:", error);
      setStatusMessage("生成失败,请重试");
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const currentTip = PHOTOGRAPHY_TIPS[currentTipIndex];

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1 items-center justify-center px-6 gap-12">
        {/* 动画区域 */}
        <View className="items-center gap-6">
          {/* 外圈旋转光环 */}
          <View className="relative items-center justify-center">
            <Animated.View
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                borderWidth: 3,
                borderColor: colors.primary,
                borderStyle: "dashed",
                transform: [{ rotate: spin }],
                opacity: 0.3,
              }}
            />
            
            {/* 中间相机图标 */}
            <Animated.View
              style={{
                position: "absolute",
                transform: [{ scale: pulseAnim }],
              }}
            >
              <View
                className="w-24 h-24 rounded-full items-center justify-center"
                style={{
                  backgroundColor: colors.primary + "20",
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                }}
              >
                <Text className="text-5xl">📸</Text>
              </View>
            </Animated.View>
          </View>

          {/* 进度文字 */}
          <View className="items-center gap-2">
            <Text
              className="text-3xl font-bold"
              style={{
                color: colors.foreground,
                fontWeight: "800",
              }}
            >
              {progress}%
            </Text>
            <Text
              className="text-lg"
              style={{ color: colors.muted }}
            >
              {statusMessage}
            </Text>
          </View>

          {/* 进度条 */}
          <View
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: colors.surface }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
              }}
            />
          </View>
        </View>

        {/* 技巧展示卡片 */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            width: "100%",
          }}
        >
          <View
            className="rounded-3xl p-6"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="items-center gap-4">
              {/* 图标 */}
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center"
                style={{ backgroundColor: colors.primary + "15" }}
              >
                <Text className="text-4xl">{currentTip.icon}</Text>
              </View>

              {/* 标题 */}
              <Text
                className="text-xl font-bold text-center"
                style={{
                  color: colors.foreground,
                  fontWeight: "700",
                }}
              >
                {currentTip.title}
              </Text>

              {/* 描述 */}
              <Text
                className="text-base text-center leading-relaxed"
                style={{
                  color: colors.muted,
                  lineHeight: 24,
                }}
              >
                {currentTip.description}
              </Text>

              {/* 指示器 */}
              <View className="flex-row gap-2 mt-2">
                {PHOTOGRAPHY_TIPS.map((_, index) => (
                  <View
                    key={index}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        index === currentTipIndex
                          ? colors.primary
                          : colors.border,
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
