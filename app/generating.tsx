import { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";

const TIPS = [
  "正在上传您的照片...",
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
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const uploadMutation = trpc.headshot.uploadPhoto.useMutation({
    onSuccess: (data) => {
      if (data.success && data.url) {
        setUploadedPhotoUrl(data.url);
        setProgress(30);
        setUploadComplete(true);
      }
    },
    onError: (error) => {
      console.error("Upload error:", error);
      Alert.alert(
        "上传失败",
        "照片上传遇到问题,请稍后重试",
        [{ text: "返回", onPress: () => router.back() }]
      );
    },
  });

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
        [{ text: "返回", onPress: () => router.back() }]
      );
    },
  });

  useEffect(() => {
    if (!selectedStyle) {
      router.back();
      return;
    }

    // Step 1: Upload first photo if available
    if (photos.length > 0) {
      const uploadPhoto = async () => {
        try {
          const photoUri = photos[0];
          const base64 = await FileSystem.readAsStringAsync(photoUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          uploadMutation.mutate({
            photoBase64: `data:image/jpeg;base64,${base64}`,
            fileName: `photo-${Date.now()}.jpg`,
          });
        } catch (error) {
          console.error("Failed to read photo:", error);
          Alert.alert(
            "读取照片失败",
            "无法读取您的照片,请重新选择",
            [{ text: "返回", onPress: () => router.back() }]
          );
        }
      };
      
      uploadPhoto();
    } else {
      Alert.alert(
        "没有照片",
        "请先上传照片",
        [{ text: "返回", onPress: () => router.back() }]
      );
    }

    // Rotate tips every 5 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 5000);

    return () => {
      clearInterval(tipInterval);
    };
  }, []);

  // Step 2: Generate when photo is uploaded
  useEffect(() => {
    if (uploadComplete && uploadedPhotoUrl && !generateMutation.isPending && !generateMutation.isSuccess) {
      generateMutation.mutate({
        imageUrl: uploadedPhotoUrl,
        background: selectedStyle!.background,
        gender: selectedStyle!.gender,
      });
      
      // Simulate progress for UI feedback
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 2;
        });
      }, 800);

      return () => clearInterval(progressInterval);
    }
  }, [uploadComplete, uploadedPhotoUrl]);

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1 items-center justify-center px-8">
        {/* Elegant Loading Animation */}
        <View className="items-center gap-8 mb-12">
          <View 
            className="w-32 h-32 rounded-full items-center justify-center"
            style={{
              backgroundColor: colors.primary + '10',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>

          {/* Progress Bar */}
          <View className="w-full max-w-xs">
            <View 
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.border }}
            >
              <View 
                className="h-full rounded-full"
                style={{
                  backgroundColor: colors.primary,
                  width: `${progress}%`,
                }}
              />
            </View>
            <Text 
              className="text-center mt-3 text-sm font-semibold"
              style={{ color: colors.primary }}
            >
              {progress}%
            </Text>
          </View>
        </View>

        {/* Dynamic Tips */}
        <View className="items-center gap-4">
          <Text 
            className="text-2xl font-bold text-center"
            style={{ 
              color: colors.foreground,
              fontWeight: '800',
            }}
          >
            AI正在创作中
          </Text>
          <Text 
            className="text-base text-center leading-relaxed"
            style={{ color: colors.muted }}
          >
            {TIPS[currentTip]}
          </Text>
          <Text 
            className="text-sm text-center mt-2"
            style={{ color: colors.muted }}
          >
            预计需要30-60秒
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
