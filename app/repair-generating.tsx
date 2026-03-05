import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";
import { ScrollView, Text, View, Platform, Animated, Easing, Alert } from "react-native";

const REPAIR_TIPS = [
  {
    icon: "🔧",
    title: "自动修复",
    description: "AI智能识别并修复图片中的缺陷,如噪点、模糊、色差等"
  },
  {
    icon: "🎨",
    title: "色彩增强",
    description: "自动调整色彩平衡,提升图片的视觉效果和专业度"
  },
  {
    icon: "✨",
    title: "细节优化",
    description: "增强图片细节,提高清晰度和锐度,让图片更生动"
  },
  {
    icon: "🌟",
    title: "超分辨率",
    description: "使用AI技术放大图片,保持清晰度,适合打印和展示"
  },
  {
    icon: "⚡",
    title: "快速处理",
    description: "高效的处理算法,快速生成修复结果,节省您的时间"
  },
  {
    icon: "🎯",
    title: "精准修复",
    description: "针对不同类型的图片缺陷,精准定位并修复,效果显著"
  },
];

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

export default function RepairGeneratingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const scale = params.scale as string || "2x";
  const repairType = (params.repairType as 'upscale' | 'restore') || 'upscale';
  const colors = useColors();

  const [progress, setProgress] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState("准备开始...");

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const uploadMutation = trpc.headshot.uploadPhoto.useMutation();
  const generateMutation = trpc.headshot.generateIdeogram.useMutation();

  useEffect(() => {
    if (!image) {
      setTimeout(() => {
        router.replace("/" as any);
      }, 100);
      return;
    }

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    let tipInterval: ReturnType<typeof setInterval>;
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();

    tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % REPAIR_TIPS.length);
    }, 4000);

    performRepair();

    return () => {
      clearInterval(tipInterval);
    };
  }, []);

  const performRepair = async () => {
    try {
      setProgress(10);
      setStatusMessage("正在读取照片...");

      let base64Data = "";
      if (Platform.OS === "web") {
        base64Data = await blobUrlToBase64(image);
      } else {
        base64Data = await FileSystem.readAsStringAsync(image, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      setProgress(40);
      setStatusMessage("正在上传照片到服务器...");

      const uploadResult = await uploadMutation.mutateAsync({
        photoBase64: `data:image/jpeg;base64,${base64Data}`,
        fileName: `repair-${Date.now()}.jpg`,
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error("照片上传失败");
      }

      setProgress(50);
      setStatusMessage("AI正在分析照片...");

      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(70);
      let statusMsg = '';
      let prompt = '';
      
      if (repairType === 'upscale') {
        const scaleLabel = scale === "4x" ? "4倍" : "2倍";
        statusMsg = `正在进行${scaleLabel}超分辨率处理...`;
        prompt = `修复和增强照片质量。要求:
- 使用${scaleLabel}超分辨率技术
- 自动修复图片缺陷(噪点、模糊等)
- 增强色彩和细节
- 提高清晰度和锐度
- 保持原始内容的真实性
- 输出高质量、高分辨率图片`;
      } else {
        statusMsg = '正在修复老照片...';
        prompt = `修复和恢复老照片。要求:
- 修复褪色和色彩偏差
- 去除划痕、污渍和损伤
- 降低噪点和颗粒感
- 恢复照片原始质感和细节
- 保留历史感和真实性
- 输出高质量、清晰的修复照片`;
      }
      setStatusMessage(statusMsg);

      const result = await generateMutation.mutateAsync({
        imageUrl: uploadResult.url,
        prompt: prompt,
        background: "neutral",
        gender: "none",
      });

      if (!result.success || !result.imageUrl) {
        throw new Error("修复失败");
      }

      setProgress(90);
      setStatusMessage("正在优化图像质量...");

      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);
      setStatusMessage("完成!");

      setTimeout(() => {
        // 使用replace而不是push，以便回退时不会回到这个100%完成页面
        router.replace({
          pathname: "/repair-result",
          params: {
            image: result.imageUrl,
            originalImage: result.originalUrl || result.imageUrl,
            scale,
          },
        } as any);
      }, 500);

    } catch (error) {
      console.error("Repair error:", error);
      setStatusMessage("修复失败,请重试");
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const currentTip = REPAIR_TIPS[currentTipIndex];

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1 items-center justify-center px-6 gap-12">
        <View className="items-center gap-6">
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
                <Text className="text-5xl">🔧</Text>
              </View>
            </Animated.View>
          </View>

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
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center"
                style={{ backgroundColor: colors.primary + "15" }}
              >
                <Text className="text-4xl">{currentTip.icon}</Text>
              </View>

              <Text
                className="text-xl font-bold text-center"
                style={{
                  color: colors.foreground,
                  fontWeight: "700",
                }}
              >
                {currentTip.title}
              </Text>

              <Text
                className="text-base text-center leading-relaxed"
                style={{
                  color: colors.muted,
                  lineHeight: 24,
                }}
              >
                {currentTip.description}
              </Text>

              <View className="flex-row gap-2 mt-2">
                {REPAIR_TIPS.map((_, index) => (
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
