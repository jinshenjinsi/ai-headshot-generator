import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";
import { ScrollView, Text, View, Platform, Animated, Easing, Alert } from "react-native";
import { usePhotoAndStyleFree } from "@/lib/free-usage-service";

const STYLE_PROMPTS: Record<string, string> = {
  professional: "参考输入图片的风格和特征,生成一张专业的商务头像照片。要求:高清、清晰、正式气质、专业质量、适合商务场景使用",
  oil: "油画风格头像,笔触明显,艺术感强,参考输入图片的人物特征",
  watercolor: "水彩风格头像,柔和色调,艺术气息,参考输入图片的人物特征",
  sketch: "素描风格头像,线条流畅,黑白风格,参考输入图片的人物特征",
  cartoon: "卡通风格头像,色彩鲜艳,可爱风格,参考输入图片的人物特征",
  anime: "二次元动漫风格头像,大眼睛,可爱表情,参考输入图片的人物特征",
  minimal: "极简风格头像,简洁干净,现代感,参考输入图片的人物特征",
  retro: "复古风格头像,怀旧色调,文艺气息,参考输入图片的人物特征",
  neon: "霓虹灯风格头像,炫彩色彩,科技感,参考输入图片的人物特征",
  art: "艺术风格头像,创意独特,画廊级别,参考输入图片的人物特征",
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
      const styleLabel: Record<string, string> = {
        professional: "专业商务",
        oil: "油画",
        watercolor: "水彩",
        sketch: "素描",
        cartoon: "卡通",
        anime: "动漫",
        minimal: "极简",
        retro: "复古",
        neon: "霓虹",
        art: "艺术",
      };
      setStatusMessage(`正在生成${styleLabel[style] || style}风格美照...`);

      const prompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.professional;

      const result = await generateMutation.mutateAsync({
        imageUrl: uploadResult.url,
        prompt: prompt,
        background: "neutral",
        gender: "none",
      });

      if (!result.success || !result.imageUrl) {
        console.error('[Generation] Generation failed:', result);
        throw new Error("生成失败：" + (result.error || "未知错误"));
      }

      // 验证生成的图像URL是否有效
      console.log('[Generation] Generated image URL:', result.imageUrl);
      
      setProgress(90);
      setStatusMessage("正在优化图像质量...");

      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);
      setStatusMessage("完成!");

      // 只有生成成功才扣除免费次数
      console.log('[Generation] Deducting free usage count...');
      await usePhotoAndStyleFree();
      console.log('[Generation] Free usage count deducted successfully');

      setTimeout(() => {
        router.replace({
          pathname: "/style-result",
          params: {
            image: result.imageUrl,
            originalImage: result.originalUrl || result.imageUrl,
            style,
          },
        } as any);
      }, 500);

    } catch (error) {
      console.error("[Generation] Generation error:", error);
      console.log('[Generation] Generation failed - free usage count NOT deducted');
      
      const errorMessage = error instanceof Error ? error.message : "生成失败,请重试";
      setStatusMessage(errorMessage);
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
