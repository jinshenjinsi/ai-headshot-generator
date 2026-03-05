import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";
import { ScrollView, Text, View, Platform, Animated, Easing, Alert } from "react-native";

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

export default function PhotoGeneratingScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const type = params.type as string;
  const background = params.background as string;

  const [progress, setProgress] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState("准备开始...");

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const uploadMutation = trpc.headshot.uploadPhoto.useMutation();
  const generateMutation = trpc.headshot.generateIdeogram.useMutation();

  useEffect(() => {
    if (!image || !type) {
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
      setCurrentTipIndex((prev) => (prev + 1) % PHOTOGRAPHY_TIPS.length);
    }, 4000);

    performGeneration();

    return () => {
      clearInterval(tipInterval);
    };
  }, []);

  const performGeneration = async () => {
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
        fileName: `photo-${Date.now()}.jpg`,
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error("照片上传失败");
      }

      setProgress(50);
      setStatusMessage("AI正在分析您的面部特征...");

      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(70);
      const typeLabel: Record<string, string> = {
        passport: "护照",
        visa: "签证",
        work: "工作证",
        resume: "简历照",
        student: "学生证",
        social: "社交头像",
      };
      setStatusMessage(`正在生成${typeLabel[type] || type}证照...`);

      const prompt = `生成一张高质量的${typeLabel[type] || type}证照照片。要求:
- 背景颜色: ${background === 'white' ? '白色' : background === 'blue' ? '蓝色' : background === 'red' ? '红色' : '灰色'}
- 参考输入图片的人物特征
- 正式、专业、清晰
- 符合${typeLabel[type] || type}的标准要求
- 高分辨率、高质量`;

      let bgColor: 'white' | 'black' | 'neutral' | 'gray' | 'office' | undefined = 'neutral';
      if (background === 'white') bgColor = 'white';
      else if (background === 'gray') bgColor = 'gray';
      else if (background === 'blue' || background === 'red') bgColor = 'neutral';

      const result = await generateMutation.mutateAsync({
        imageUrl: uploadResult.url,
        prompt: prompt,
        background: bgColor,
        gender: "none",
      });

      if (!result.success || !result.imageUrl) {
        throw new Error("生成失败");
      }

      setProgress(90);
      setStatusMessage("正在优化图像质量...");

      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);
      setStatusMessage("完成!");

      setTimeout(() => {
        router.push({
          pathname: "/photo-result",
          params: {
            image: result.imageUrl,
            originalImage: result.originalUrl || result.imageUrl,
            type,
            background,
          },
        } as any);
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
                <Text className="text-5xl">📸</Text>
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
