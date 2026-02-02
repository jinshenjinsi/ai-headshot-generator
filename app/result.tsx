import { ScrollView, Text, View, TouchableOpacity, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
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
        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = `headshot-${Date.now()}.jpg`;
        link.click();
        Alert.alert("下载成功", "图片已保存");
      } else {
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

  const handleBackHome = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    router.push("/" as any);
  };

  if (!generatedImage) {
    return (
      <ScreenContainer className="p-6 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.muted }}>未找到生成的图片</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-8 py-8 px-6 pb-12">
          {/* Elegant Header */}
          <View className="items-center gap-3">
            <View 
              className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Text className="text-4xl">✨</Text>
            </View>
            
            <Text 
              className="text-4xl font-bold text-center"
              style={{ 
                color: colors.foreground,
                fontWeight: '800',
                letterSpacing: -0.5,
              }}
            >
              生成完成
            </Text>
            <Text 
              className="text-lg text-center"
              style={{ color: colors.muted }}
            >
              您的专业头像已完美呈现
            </Text>
          </View>

          {/* Premium Image Display */}
          <View 
            className="rounded-3xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <Image
              source={{ uri: generatedImage }}
              style={{ width: "100%", aspectRatio: 3/4 }}
              contentFit="cover"
              transition={300}
            />
          </View>

          {/* Premium Info Card */}
          <View 
            className="rounded-3xl p-6"
            style={{ 
              backgroundColor: colors.surface,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="gap-2">
                <Text 
                  className="text-sm font-semibold"
                  style={{ color: colors.muted }}
                >
                  风格场景
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text 
                    className="text-xl font-bold"
                    style={{ color: colors.foreground }}
                  >
                    {selectedStyle?.name || "未知"}
                  </Text>
                  <View 
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: colors.primary + '20' }}
                  >
                    <Text 
                      className="text-xs font-semibold"
                      style={{ color: colors.primary }}
                    >
                      {selectedStyle?.category || ""}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View className="items-end gap-2">
                <Text 
                  className="text-sm font-semibold"
                  style={{ color: colors.muted }}
                >
                  生成时间
                </Text>
                <Text 
                  className="text-xl font-bold"
                  style={{ color: colors.foreground }}
                >
                  {new Date().toLocaleTimeString("zh-CN", { 
                    hour: "2-digit", 
                    minute: "2-digit" 
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Premium Action Buttons */}
          <View className="gap-4">
            {/* Primary Download Button */}
            <TouchableOpacity
              onPress={handleDownload}
              activeOpacity={0.9}
              className="w-full rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View className="w-full px-8 py-5">
                <Text 
                  className="font-bold text-xl text-center"
                  style={{ 
                    color: colors.background,
                    fontWeight: '700',
                  }}
                >
                  下载高清版
                </Text>
              </View>
            </TouchableOpacity>

            {/* Secondary Actions */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={handleRegenerate}
                activeOpacity={0.8}
                className="flex-1 rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 2,
                  borderColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="px-6 py-4">
                  <Text 
                    className="font-semibold text-base text-center"
                    style={{ color: colors.foreground }}
                  >
                    重新生成
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBackHome}
                activeOpacity={0.8}
                className="flex-1 rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 2,
                  borderColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="px-6 py-4">
                  <Text 
                    className="font-semibold text-base text-center"
                    style={{ color: colors.foreground }}
                  >
                    返回首页
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
