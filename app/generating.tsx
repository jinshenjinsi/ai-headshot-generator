import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";

const TIPS = [
  "正在分析您的面部特征...",
  "正在应用专业光线效果...",
  "正在优化背景场景...",
  "正在生成高质量头像...",
  "即将完成...",
];

export default function GeneratingScreen() {
  const router = useRouter();
  const colors = useColors();
  const { selectedStyle, photos, setGeneratedImage } = useApp();
  const [currentTip, setCurrentTip] = useState(0);
  const [progress, setProgress] = useState(0);

  const generateMutation = trpc.headshot.generate.useMutation({
    onSuccess: (data) => {
      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setProgress(100);
        setTimeout(() => {
          router.push("/result" as any);
        }, 500);
      }
    },
    onError: (error) => {
      console.error("Generation error:", error);
      Alert.alert(
        "生成失败",
        "头像生成遇到问题,请稍后重试",
        [
          {
            text: "返回",
            onPress: () => router.back(),
          },
        ]
      );
    },
  });

  useEffect(() => {
    if (!selectedStyle) {
      router.back();
      return;
    }

    // Start generation immediately
    generateMutation.mutate({
      stylePrompt: selectedStyle.prompt,
      referenceImageUrl: photos.length > 0 ? photos[0] : undefined,
    });

    // Simulate progress for UI feedback
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95; // Cap at 95% until real generation completes
        }
        return prev + 3;
      });
    }, 500);

    // Rotate tips every 5 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, []);

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center p-8 gap-8">
        {/* Progress Indicator */}
        <View className="items-center gap-6">
          <View className="relative w-24 h-24 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>

          {/* Progress Bar */}
          <View className="w-64 h-2 bg-surface rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          
          <Text className="text-base font-semibold text-primary">
            {progress}%
          </Text>
        </View>

        {/* Title */}
        <View className="items-center gap-3">
          <Text className="text-2xl font-bold text-foreground text-center">
            AI正在生成您的专业头像
          </Text>
          <Text className="text-base text-muted text-center">
            预计需要30-60秒...
          </Text>
        </View>

        {/* Rotating Tips */}
        <View className="items-center">
          <Text className="text-base text-muted text-center">
            {TIPS[currentTip]}
          </Text>
        </View>

        {/* Progress Steps */}
        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-1 bg-primary rounded-full" />
          <View className="flex-1 h-1 bg-primary rounded-full" />
          <View className="flex-1 h-1 bg-primary rounded-full" />
        </View>
      </View>
    </ScreenContainer>
  );
}
