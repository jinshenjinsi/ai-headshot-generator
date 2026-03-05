import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";
import { ScrollView, Text, View, Platform, Animated, Easing, Alert } from "react-native";

const STYLE_PROMPTS: Record<string, string> = {
  professional: "Professional corporate headshot photo. Character: this person with their exact face. Setting: modern office background. Attire: business suit. Lighting: bright professional lighting. Expression: confident and authoritative. Camera: 85mm lens, f/2.8, sharp focus on face. Style: corporate executive portrait, formal and powerful.",
  oil: "Oil painting style portrait. Character: this person with their exact face. Style: impressionist oil painting with visible brushstrokes, warm color palette, artistic and elegant.",
  watercolor: "Watercolor style portrait. Character: this person with their exact face. Style: soft watercolor painting, dreamy and ethereal, pastel colors, artistic and romantic.",
  sketch: "Pencil sketch style portrait. Character: this person with their exact face. Style: detailed pencil sketch, classic and elegant, fine line work, artistic rendering.",
  cartoon: "Cartoon style portrait. Character: this person with their exact face. Style: cute cartoon illustration, vibrant colors, playful and friendly, animated style.",
  anime: "Anime style portrait. Character: this person with their exact face. Style: Japanese anime art style, expressive eyes, detailed hair, vibrant colors, 2D animation style.",
  minimal: "Minimalist style portrait. Character: this person with their exact face. Style: minimalist art, simple geometric shapes, limited color palette, modern and clean.",
  retro: "Retro vintage style portrait. Character: this person with their exact face. Style: 1970s retro aesthetic, warm vintage colors, nostalgic and artistic.",
  neon: "Neon cyberpunk style portrait. Character: this person with their exact face. Style: neon glow effect, cyberpunk aesthetic, vibrant neon colors, futuristic.",
  art: "Fine art style portrait. Character: this person with their exact face. Style: contemporary fine art, mixed media, creative and unique, gallery-worthy.",
};

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

export default function GeneratingStyleScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const style = params.style as string;

  const [progress, setProgress] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState("准备开始...");

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const uploadMutation = trpc.headshot.uploadPhoto.useMutation();
  const generateMutation = trpc.headshot.generateIdeogram.useMutation();

  useEffect(() => {
    if (!image || !style) {
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

    startGeneration();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentTipIndex((prev) => (prev + 1) % PHOTOGRAPHY_TIPS.length);
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

      let base64Data: string;
      
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
        fileName: `style-${Date.now()}.jpg`,
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error("照片上传失败");
      }

      setProgress(50);
      setStatusMessage("AI正在分析您的面部特征...");

      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(70);
      setStatusMessage(`正在生成${style}风格美照...`);

      const prompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.professional;

      const result = await generateMutation.mutateAsync({
        imageUrl: uploadResult.url,
        prompt: prompt,
        background: "neutral",
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
          pathname: "/style-result",
          params: {
            image: result.imageUrl,
            originalImage: result.originalUrl || result.imageUrl,
            style,
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
                <Text className="text-5xl">✨</Text>
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
        </View>

        <ScrollView 
          className="w-full max-w-md"
          scrollEnabled={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View 
              className="rounded-2xl p-6"
              style={{
                backgroundColor: colors.primary + "10",
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
              }}
            >
              <Text 
                className="text-2xl mb-2"
              >
                {currentTip.icon}
              </Text>
              <Text 
                className="text-lg font-bold mb-2"
                style={{ color: colors.foreground }}
              >
                {currentTip.title}
              </Text>
              <Text 
                className="text-sm leading-relaxed"
                style={{ color: colors.muted }}
              >
                {currentTip.description}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
