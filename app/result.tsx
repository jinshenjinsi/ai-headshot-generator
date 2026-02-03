import { ScrollView, Text, View, TouchableOpacity, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function ResultScreen() {
  const router = useRouter();
  const colors = useColors();
  const { generatedImage, selectedStyle, originalImageUrl, regenerateCount, setRegenerateCount } = useApp();
  const [downloading, setDownloading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  const MAX_FREE_REGENERATE = 3;
  const remainingRegenerate = Math.max(0, MAX_FREE_REGENERATE - regenerateCount);

  // 付费下载高清版(无水印)
  const handleDownloadHD = async () => {
    if (!originalImageUrl || downloading) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // TODO: 集成真实支付流程
    // 目前使用占位提示
    Alert.alert(
      "付费下载",
      "下载高清无水印版需要支付 ¥5.6\n\n支付功能即将开放,敬请期待!",
      [
        { text: "取消", style: "cancel" },
        {
          text: "确认支付",
          onPress: async () => {
            setDownloading(true);
            
            try {
              // TODO: 调用支付API
              // 模拟支付成功
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // 支付成功后下载高清版
              if (Platform.OS === "web") {
                const response = await fetch(originalImageUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = `headshot-hd-${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                
                Alert.alert("下载成功", "高清无水印版已保存");
              } else {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status !== "granted") {
                  Alert.alert("需要权限", "请允许访问相册以保存图片");
                  setDownloading(false);
                  return;
                }

                const fileUri = FileSystem.documentDirectory + `headshot-hd-${Date.now()}.jpg`;
                await FileSystem.downloadAsync(originalImageUrl, fileUri);
                await MediaLibrary.saveToLibraryAsync(fileUri);
                
                Alert.alert("下载成功", "高清无水印版已保存到相册");
              }
            } catch (error) {
              console.error("Download HD error:", error);
              Alert.alert("下载失败", "保存图片时出现问题,请稍后重试");
            } finally {
      setDownloading(false);
            }
          }
        }
      ]
    );
  };

  const handleRegenerate = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // 重新选择风格
    router.push("/style-selection" as any);
  };

  const handleRegenerateUnsatisfied = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // 检查是否超过免费次数
    if (regenerateCount >= MAX_FREE_REGENERATE) {
      Alert.alert(
        "免费次数已用完",
        `您已使用了${MAX_FREE_REGENERATE}次免费重生成机会。\n\n要继续生成新的头像，请返回首页重新开始。`,
        [
          { text: "返回首页", onPress: handleBackHome },
          { text: "取消", style: "cancel" }
        ]
      );
      return;
    }
    
    // 增加重生成计数
    setRegenerateCount(regenerateCount + 1);
    
    // 不满意重生成:保留当前参数但调整随机种子
    // 直接跳转到生成页面,使用相同的照片和风格
    router.push("/generating" as any);
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
            {/* Primary HD Download Button */}
            <TouchableOpacity
              onPress={handleDownloadHD}
              disabled={downloading}
              activeOpacity={0.9}
              className="w-full rounded-2xl overflow-hidden"
              style={{
                backgroundColor: downloading ? colors.muted : colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: downloading ? 0.2 : 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View className="w-full px-8 py-5">
                <View className="flex-row items-center justify-center gap-3">
                  <Text 
                    className="font-bold text-xl text-center"
                    style={{ 
                      color: colors.background,
                      fontWeight: '700',
                    }}
                  >
                    {downloading ? "下载中..." : "下载高清版"}
                  </Text>
                  {!downloading && (
                    <View 
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: colors.background + '30' }}
                    >
                      <Text 
                        className="text-sm font-bold"
                        style={{ color: colors.background }}
                      >
                        ¥5.6
                      </Text>
                    </View>
                  )}
                </View>
                <Text 
                  className="text-xs text-center mt-1"
                  style={{ color: colors.background + 'CC' }}
                >
                  无水印·高清画质
                </Text>
              </View>
            </TouchableOpacity>

            {/* Unsatisfied Button - Primary Secondary Action */}
            <TouchableOpacity
              onPress={handleRegenerateUnsatisfied}
              disabled={regenerateCount >= MAX_FREE_REGENERATE}
              activeOpacity={0.9}
              className="w-full rounded-2xl overflow-hidden"
              style={{
                backgroundColor: regenerateCount >= MAX_FREE_REGENERATE ? colors.muted + '40' : colors.surface,
                borderWidth: 2,
                borderColor: regenerateCount >= MAX_FREE_REGENERATE ? colors.border : colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: regenerateCount >= MAX_FREE_REGENERATE ? 0 : 0.2,
                shadowRadius: 12,
                elevation: regenerateCount >= MAX_FREE_REGENERATE ? 0 : 4,
              }}
            >
              <View className="w-full px-8 py-4">
                <Text 
                  className="font-bold text-lg text-center"
                  style={{ 
                    color: regenerateCount >= MAX_FREE_REGENERATE ? colors.muted : colors.primary,
                    fontWeight: '600',
                  }}
                >
                  {regenerateCount >= MAX_FREE_REGENERATE 
                    ? `免费次数已用完` 
                    : `🔄 不满意，免费重生成`
                  }
                </Text>
                <Text 
                  className="text-xs text-center mt-1"
                  style={{ color: colors.muted }}
                >
                  {regenerateCount >= MAX_FREE_REGENERATE
                    ? `已使用${MAX_FREE_REGENERATE}次免费机会`
                    : `剩余${remainingRegenerate}次免费机会 · 自动调整参数`
                  }
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
                    换个风格
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
