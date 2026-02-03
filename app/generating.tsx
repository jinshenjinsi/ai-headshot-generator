import { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, Alert, Platform } from "react-native";
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

// Helper function to convert blob URL to base64 (Web only)
async function blobUrlToBase64(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data:image/...;base64, prefix
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
  const { selectedStyle, photos, setGeneratedImage } = useApp();
  const [currentTip, setCurrentTip] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [statusMessage, setStatusMessage] = useState("初始化中...");

  const uploadMutation = trpc.headshot.uploadPhoto.useMutation({
    onSuccess: (data) => {
      console.log("Upload success:", data);
      if (data.success && data.url) {
        setUploadedPhotoUrl(data.url);
        setProgress(30);
        setUploadComplete(true);
        setStatusMessage("照片上传成功");
      } else {
        console.error("Upload returned success but no URL");
        Alert.alert(
          "上传异常",
          "照片上传返回异常,请重试",
          [{ text: "返回", onPress: () => router.back() }]
        );
      }
    },
    onError: (error) => {
      console.error("Upload error:", error);
      setStatusMessage("上传失败");
      Alert.alert(
        "上传失败",
        `照片上传遇到问题: ${error.message}`,
        [{ text: "返回", onPress: () => router.back() }]
      );
    },
  });

  const generateMutation = trpc.headshot.generate.useMutation({
    onSuccess: (data) => {
      console.log("Generation success:", data);
      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setProgress(100);
        setStatusMessage("生成完成!");
        setTimeout(() => {
          router.push("/result" as any);
        }, 500);
      } else {
        console.error("Generation returned success but no imageUrl");
        Alert.alert(
          "生成异常",
          "头像生成返回异常,请重试",
          [{ text: "返回", onPress: () => router.back() }]
        );
      }
    },
    onError: (error) => {
      console.error("Generation error:", error);
      setStatusMessage("生成失败");
      Alert.alert(
        "生成失败",
        `头像生成遇到问题: ${error.message}`,
        [{ text: "返回", onPress: () => router.back() }]
      );
    },
  });

  useEffect(() => {
    console.log("GeneratingScreen mounted");
    console.log("Platform:", Platform.OS);
    console.log("Selected style:", selectedStyle);
    console.log("Photos:", photos);

    if (!selectedStyle) {
      console.log("No selected style, redirecting to home");
      // Use setTimeout to avoid navigation before mounting
      setTimeout(() => {
        router.replace("/(tabs)" as any);
      }, 0);
      return;
    }

    // Step 1: Upload first photo if available
    if (photos.length > 0) {
      const uploadPhoto = async () => {
        try {
          setStatusMessage("正在读取照片...");
          setProgress(5);
          
          const photoUri = photos[0];
          console.log("Reading photo from URI:", photoUri);
          
          let base64: string;
          
          // Use different methods for Web vs Native
          if (Platform.OS === 'web') {
            console.log("Using Web API to read blob URL");
            base64 = await blobUrlToBase64(photoUri);
          } else {
            console.log("Using FileSystem API to read file");
            base64 = await FileSystem.readAsStringAsync(photoUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
          }
          
          console.log("Photo read successfully, base64 length:", base64.length);
          setStatusMessage("正在上传照片...");
          setProgress(10);
          
          uploadMutation.mutate({
            photoBase64: `data:image/jpeg;base64,${base64}`,
            fileName: `photo-${Date.now()}.jpg`,
          });
        } catch (error) {
          console.error("Failed to read photo:", error);
          setStatusMessage("读取照片失败");
          Alert.alert(
            "读取照片失败",
            `无法读取您的照片: ${error instanceof Error ? error.message : String(error)}`,
            [{ text: "返回", onPress: () => router.back() }]
          );
        }
      };
      
      uploadPhoto();
    } else {
      console.log("No photos available");
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
    console.log("Upload status changed:", { uploadComplete, uploadedPhotoUrl });
    
    if (uploadComplete && uploadedPhotoUrl && !generateMutation.isPending && !generateMutation.isSuccess) {
      console.log("Starting generation with:", {
        imageUrl: uploadedPhotoUrl,
        background: selectedStyle!.background,
        gender: selectedStyle!.gender,
      });
      
      setStatusMessage("正在生成头像...");
      
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
            className="text-sm text-center mt-2 font-medium"
            style={{ color: colors.primary }}
          >
            {statusMessage}
          </Text>
          <Text 
            className="text-xs text-center mt-1 opacity-60"
            style={{ color: colors.muted }}
          >
            预计需要30-60秒
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
