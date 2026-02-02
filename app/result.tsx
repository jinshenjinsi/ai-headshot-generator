import { ScrollView, Text, View, TouchableOpacity, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";

export default function ResultScreen() {
  const router = useRouter();
  const colors = useColors();
  const { generatedImage, selectedStyle } = useApp();

  const handleDownload = async () => {
    if (!generatedImage) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      if (Platform.OS === "web") {
        // Web: trigger download
        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = `headshot-${Date.now()}.jpg`;
        link.click();
        Alert.alert("下载成功", "图片已保存");
      } else {
        // Mobile: save to gallery
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("需要权限", "请允许访问相册以保存图片");
          return;
        }

        const fileUri = FileSystem.documentDirectory + `headshot-${Date.now()}.jpg`;
        await FileSystem.downloadAsync(generatedImage, fileUri);
        await MediaLibrary.saveToLibraryAsync(fileUri);
        
        Alert.alert("下载成功", "高清头像已保存到相册");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("下载失败", "保存图片时出现问题");
    }
  };

  const handleRegenerate = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    router.push("/style-selection" as any);
  };

  const handleShare = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Alert.alert(
      "分享",
      "分享功能开发中...",
      [{ text: "确定" }]
    );
  };

  const handleBackHome = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    router.push("/" as any);
  };

  if (!generatedImage) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">未找到生成的图片</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6 pb-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">生成完成</Text>
            <Text className="text-base text-muted mt-2">
              您的专业头像已生成
            </Text>
          </View>

          {/* Image Display */}
          <View className="bg-surface rounded-3xl overflow-hidden">
            <Image
              source={{ uri: generatedImage }}
              style={{ width: "100%", aspectRatio: 3/4 }}
              contentFit="cover"
              transition={300}
            />
          </View>

          {/* Info */}
          <View className="bg-surface rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-muted">风格</Text>
                <Text className="text-base font-semibold text-foreground mt-1">
                  {selectedStyle?.name || "未知"} · {selectedStyle?.category || ""}
                </Text>
              </View>
              <View>
                <Text className="text-sm text-muted">生成时间</Text>
                <Text className="text-base font-semibold text-foreground mt-1">
                  {new Date().toLocaleTimeString("zh-CN", { 
                    hour: "2-digit", 
                    minute: "2-digit" 
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleDownload}
              activeOpacity={0.9}
              className="w-full bg-primary px-8 py-4 rounded-2xl shadow-lg"
            >
              <Text className="text-background font-bold text-lg text-center">
                下载高清版
              </Text>
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleRegenerate}
                activeOpacity={0.7}
                className="flex-1 bg-surface px-6 py-4 rounded-2xl border border-border"
              >
                <Text className="text-foreground font-semibold text-base text-center">
                  重新生成
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.7}
                className="bg-surface px-6 py-4 rounded-2xl border border-border"
              >
                <IconSymbol size={24} name="paperplane.fill" color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleBackHome}
              activeOpacity={0.7}
              className="w-full px-8 py-3 rounded-2xl"
            >
              <Text className="text-muted font-semibold text-base text-center">
                返回首页
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
