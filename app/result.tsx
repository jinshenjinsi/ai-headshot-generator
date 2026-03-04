import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { ImageEditor } from "@/components/image-editor";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { applyFiltersToImage, type ImageFilters } from "@/lib/image-processor";


// 证件照尺寸预设
const PHOTO_SIZES = [
  { name: "1寸", width: 25, height: 35, ratio: 25/35 },
  { name: "2寸", width: 35, height: 53, ratio: 35/53 },
  { name: "护照", width: 35, height: 45, ratio: 35/45 },
  { name: "LinkedIn", width: 400, height: 500, ratio: 400/500 },
  { name: "微信", width: 200, height: 200, ratio: 1 },
  { name: "自定义", width: 0, height: 0, ratio: 0 },
];

export default function ResultScreen() {
  const router = useRouter();
  const colors = useColors();
  const { generatedImage, selectedStyle, originalImageUrl, regenerateCount, setRegenerateCount } = useApp();
  const [downloading, setDownloading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [brightness, setBrightness] = useState(1); // 1 = 正常亮度
  const [contrast, setContrast] = useState(1); // 1 = 正常对比度
  const [saturation, setSaturation] = useState(1); // 1 = 正常饱和度
  const [sharpness, setSharpness] = useState(1); // 1 = 正常锐度
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [customWidth, setCustomWidth] = useState("640");
  const [customHeight, setCustomHeight] = useState("1536");
  const [showSizeEditor, setShowSizeEditor] = useState(false);
  const [showBrightnessEditor, setShowBrightnessEditor] = useState(false);
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const MAX_FREE_REGENERATE = 3;
  const remainingRegenerate = Math.max(0, MAX_FREE_REGENERATE - regenerateCount);

  // 当滤镜改变时,重新处理图片
  useEffect(() => {
    if (Platform.OS === "web" && generatedImage) {
      const updateProcessedImage = async () => {
        setIsProcessing(true);
        try {
          const filters: ImageFilters = {
            brightness,
            contrast,
            saturation,
            sharpness,
          };
          const result = await applyFiltersToImage(generatedImage, filters);
          setProcessedImageUrl(result);
        } catch (error) {
          console.error("Failed to process image:", error);
          setProcessedImageUrl(generatedImage);
        } finally {
          setIsProcessing(false);
        }
      };

      const timer = setTimeout(updateProcessedImage, 300);
      return () => clearTimeout(timer);
    }
  }, [brightness, contrast, saturation, sharpness, generatedImage]);

  // 获取当前选中的尺寸
  const currentSize = PHOTO_SIZES[selectedSizeIndex];
  const screenWidth = Dimensions.get("window").width;
  const imageDisplayWidth = screenWidth - 32; // 减去padding
  const imageDisplayHeight = imageDisplayWidth / currentSize.ratio;

  // 获取显示的图片URL
  const displayImageUrl = Platform.OS === "web" && processedImageUrl ? processedImageUrl : generatedImage;

  // 付费下载高清版(无水印)
  const handleDownloadHD = async () => {
    if (!displayImageUrl || !generatedImage || downloading) return;

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
                const response = await fetch(displayImageUrl);
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
                await FileSystem.downloadAsync(displayImageUrl, fileUri);
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
      <ScreenContainer className="p-6" containerClassName="bg-slate-900">
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.muted }}>未找到生成的图片</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-gradient-to-b from-blue-900 to-blue-800">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6 py-8 px-4 pb-12">
          {/* Header */}
          <View className="items-center gap-3 mb-2">
            <Text 
              className="text-4xl font-bold text-center"
              style={{ color: "#FFFFFF" }}
            >
              ✨ 生成完成
            </Text>
            <Text 
              className="text-base text-center"
              style={{ color: "#E0E7FF" }}
            >
              您的专业头像已完美呈现
            </Text>
          </View>

          {/* Image Display Card - 白色卡片 */}
          <View 
            className="rounded-3xl overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              shadowColor: '#0F172A',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <Image
              source={{ uri: Platform.OS === "web" && processedImageUrl ? processedImageUrl : generatedImage }}
              style={{ 
                width: imageDisplayWidth, 
                height: imageDisplayHeight,
              }}
              contentFit="cover"
              transition={300}
            />
          </View>

          {/* 尺寸调整器 */}
          <View 
            className="rounded-2xl p-5"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.2)" }}
          >
            <Text 
              className="text-base font-bold mb-4"
              style={{ color: "#FFFFFF" }}
            >
              📐 调整尺寸
            </Text>
            
            {/* 尺寸预设按钮 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {PHOTO_SIZES.map((size, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedSizeIndex(index);
                      if (index === PHOTO_SIZES.length - 1) {
                        setShowSizeEditor(true);
                      }
                    }}
                    className="px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: selectedSizeIndex === index ? "#10B981" : "#374151",
                    }}
                  >
                    <Text 
                      className="text-xs font-semibold"
                      style={{ color: selectedSizeIndex === index ? "#FFFFFF" : "#9CA3AF" }}
                    >
                      {size.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* 当前尺寸显示 */}
            <Text 
              className="text-xs"
              style={{ color: "#9CA3AF" }}
            >
              当前尺寸: {currentSize.width > 0 ? `${currentSize.width}×${currentSize.height}mm` : "自定义"}
            </Text>
          </View>

          {/* 亮度调整器 */}
          <View 
            className="rounded-2xl p-5"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.2)" }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text 
                className="text-base font-bold"
                style={{ color: "#FFFFFF" }}
              >
                ☀️ 亮度调整
              </Text>
              <TouchableOpacity
                onPress={() => setBrightness(1)}
                className="px-3 py-1 rounded-lg"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <Text 
                  className="text-xs font-semibold"
                  style={{ color: "#E0E7FF" }}
                >
                  重置
                </Text>
              </TouchableOpacity>
            </View>

            {/* 亮度调整按钮组 */}
            <View className="flex-row gap-2 justify-center">
              <TouchableOpacity
                onPress={() => setBrightness(Math.max(0.5, brightness - 0.1))}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: "#374151" }}
              >
                <Text style={{ color: "#9CA3AF" }}>−</Text>
              </TouchableOpacity>
              <View className="flex-1 h-8 rounded-lg mx-2" style={{ backgroundColor: "#374151" }}>
                <View 
                  className="h-full rounded-lg"
                  style={{ 
                    width: `${((brightness - 0.5) / 1) * 100}%`,
                    backgroundColor: "#10B981"
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={() => setBrightness(Math.min(1.5, brightness + 0.1))}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: "#374151" }}
              >
                <Text style={{ color: "#9CA3AF" }}>+</Text>
              </TouchableOpacity>
            </View>

            {/* 亮度数值显示 */}
            <Text 
              className="text-xs text-center mt-2"
              style={{ color: "#9CA3AF" }}
            >
              {(brightness * 100).toFixed(0)}%
            </Text>

            {/* 高级编辑按钮 */}
            <TouchableOpacity
              onPress={() => setShowAdvancedEditor(!showAdvancedEditor)}
              className="mt-4 px-4 py-3 rounded-xl flex-row items-center justify-center gap-2"
              style={{ backgroundColor: "#3B82F6" }}
            >
              <Text style={{ color: "#FFFFFF" }} className="font-bold">⚙️</Text>
              <Text style={{ color: "#FFFFFF" }} className="text-sm font-semibold">
                {showAdvancedEditor ? "收起高级" : "高级编辑"}
              </Text>
            </TouchableOpacity>

            {/* 高级调整器 */}
            {showAdvancedEditor && (
              <ImageEditor
                contrast={contrast}
                saturation={saturation}
                sharpness={sharpness}
                onContrastChange={setContrast}
                onSaturationChange={setSaturation}
                onSharpnessChange={setSharpness}
                onReset={() => {
                  setContrast(1);
                  setSaturation(1);
                  setSharpness(1);
                }}
              />
            )}
          </View>

          {/* Premium Action Buttons */}
          <View className="gap-4 mt-6">
            {/* Primary HD Download Button - 蓝色 */}
            <TouchableOpacity
              onPress={handleDownloadHD}
              disabled={downloading}
              activeOpacity={0.9}
              className="w-full rounded-2xl overflow-hidden"
              style={{
                backgroundColor: downloading ? "#6B7280" : "#3B82F6",
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: downloading ? 0.2 : 0.5,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View className="w-full px-6 py-5">
                <View className="flex-row items-center justify-center gap-3">
                  <Text 
                    className="font-bold text-lg text-center"
                    style={{ color: "#FFFFFF" }}
                  >
                    {downloading ? "下载中..." : "💫 下载高清版"}
                  </Text>
                  {!downloading && (
                    <View 
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                    >
                      <Text 
                        className="text-sm font-bold"
                        style={{ color: "#FFFFFF" }}
                      >
                        ¥5.6
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Unsatisfied Button */}
            <TouchableOpacity
              onPress={handleRegenerateUnsatisfied}
              disabled={regenerateCount >= MAX_FREE_REGENERATE}
              activeOpacity={0.9}
              className="w-full rounded-2xl overflow-hidden"
              style={{
                backgroundColor: regenerateCount >= MAX_FREE_REGENERATE ? "#4B5563" : "rgba(255, 255, 255, 0.15)",
                borderWidth: 2,
                borderColor: regenerateCount >= MAX_FREE_REGENERATE ? "#6B7280" : "rgba(255, 255, 255, 0.3)",
              }}
            >
              <View className="w-full px-6 py-4">
                <Text 
                  className="font-bold text-base text-center"
                  style={{ 
                    color: regenerateCount >= MAX_FREE_REGENERATE ? "#9CA3AF" : "#E0E7FF",
                  }}
                >
                  {regenerateCount >= MAX_FREE_REGENERATE 
                    ? `免费次数已用完` 
                    : `🔄 不满意，免费重生成`
                  }
                </Text>
                <Text 
                  className="text-xs text-center mt-1"
                  style={{ color: "#9CA3AF" }}
                >
                  {regenerateCount >= MAX_FREE_REGENERATE
                    ? `已使用${MAX_FREE_REGENERATE}次免费机会`
                    : `剩余${remainingRegenerate}次 · 自动调整参数`
                  }
                </Text>
              </View>
            </TouchableOpacity>

            {/* Secondary Actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleRegenerate}
                activeOpacity={0.8}
                className="flex-1 rounded-2xl overflow-hidden py-4"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <Text 
                  className="font-semibold text-center text-sm"
                  style={{ color: "#E0E7FF" }}
                >
                  🎎 重新选择
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBackHome}
                activeOpacity={0.8}
                className="flex-1 rounded-2xl overflow-hidden py-4"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <Text 
                  className="font-semibold text-center text-sm"
                  style={{ color: "#E0E7FF" }}
                >
                  🏠 首页
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
