import { ScrollView, Text, View, TouchableOpacity, Platform, Image, Alert, Modal, Pressable, Linking, Share } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import { showShareMenu } from "@/lib/share-utils";
import { trpc } from "@/lib/trpc";

const COLORS = {
  primary: "#1A365D",
  accent: "#D4AF37",
  background: "#F5F7FA",
  white: "#FFFFFF",
  text: "#2D3748",
  muted: "#718096",
  border: "#E2E8F0",
  success: "#10B981",
};

// 压缩图片到指定最大尺寸
const compressImage = async (base64: string, maxSize: number): Promise<string> => {
  try {
    // 在Web环境中使用Canvas压缩
    if (Platform.OS === 'web') {
      const canvas = document.createElement('canvas') as any;
      const ctx = canvas.getContext('2d');
      if (!ctx) return base64;

      const img = new (window as any).Image();
      img.src = `data:image/png;base64,${base64}`;
      
      return new Promise((resolve) => {
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          // 计算缩放比例
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/png').split(',')[1];
          resolve(compressedBase64);
        };
      });
    }
    
    // 在React Native中，直接返回原始base64
    return base64;
  } catch (error) {
    console.error('Image compression error:', error);
    return base64;
  }
};

export default function RepairResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const originalImage = params.originalImage as string;
  const repairType = params.repairType as string;
  const generateMutation = trpc.headshot.generateBailian.useMutation();

  const [selectedScale, setSelectedScale] = useState("2x");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sharpness, setSharpness] = useState(100);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedQuickSize, setSelectedQuickSize] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const MAX_REGENERATE = 3;

  const QUICK_SIZES = [
    { width: 50, height: 75, name: "5寸" },
    { width: 60, height: 90, name: "6寸" },
    { width: 70, height: 105, name: "7寸" },
    { width: 100, height: 150, name: "10寸" },
    { width: 120, height: 180, name: "12寸" },
    { width: 160, height: 240, name: "16寸" },
  ];

  const handleDownload = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsDownloading(true);
    try {
      // 获取图片的base64数据
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 压缩预览版（1024px 分辨率，手机屏幕看不出模糊）
      const compressedBase64 = await compressImage(base64, 1024);

      // 创建临时文件
      const fileName = `repair_${selectedScale}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, compressedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到手机图库
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await MediaLibrary.createAssetAsync(fileUri);
        Alert.alert("成功", `图片已保存到手机图库（${selectedScale}倍）`);
      } else {
        Alert.alert("权限不足", "无法访问相册，请在设置中授予权限");
      }
    } catch (error) {
      Alert.alert("下载失败", "无法保存图片，请重试");
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };


  const handleRegenerate = async () => {
    if (regenerateCount >= MAX_REGENERATE) {
      Alert.alert("已达上限", "该照片已达到最大重新生成次数（3次），请更换原片重新生成");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsRegenerating(true);
    try {
      const newCount = regenerateCount + 1;
      
      // 调用API重新生成（使用tRPC）
      const result = await generateMutation.mutateAsync({
        imageUrl: image,
        style: 'repair',
        regenerateCount: newCount,
      });
      
      if (result.success && result.imageUrl) {
        router.replace({
          pathname: '/repair-result',
          params: {
            image: result.imageUrl,
            originalImage: originalImage,
            repairType: repairType,
          },
        });
        setRegenerateCount(newCount);
        Alert.alert("成功", `已重新生成（${newCount}/3次）`);
      } else {
        Alert.alert("重新生成失败", "请重试");
      }
    } catch (error) {
      Alert.alert("重新生成失败", "请重试");
      console.error("Regenerate error:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadPaid = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // 设置为已付费，分享和下载都将可用
    setIsPaid(true);
    setIsDownloading(true);
    try {
      // 获取图片的base64数据
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 创建临时文件
      const fileName = `repair_hd_${selectedScale}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到手机图库
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await MediaLibrary.createAssetAsync(fileUri);
        Alert.alert("成功", `高清图片已保存到手机图库（${selectedScale}倍，已付费）`);
      } else {
        Alert.alert("权限不足", "无法访问相册，请在设置中授予权限");
      }
    } catch (error) {
      Alert.alert("下载失败", "无法保存图片，请重试");
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // 获取修复后图片的显示效果
  const getImageStyle = () => {
    const baseStyle: any = {
      width: "100%",
      height: 200,
      resizeMode: "contain",
    };

    // 应用颜色滤镜（Web和React Native都支持）
    if (Platform.OS === "web") {
      // Web：使用CSS filter应用所有调整
      baseStyle.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${100 - sharpness}%)`;
    } else {
      // React Native：使用tintColor模拟色彩调整
      // 亮度：通过opacity实现
      const brightnessValue = brightness / 100;
      baseStyle.opacity = brightnessValue;
      
      // 对比度、饱和度、锐度：通过tintColor实现
      // 这是一个简化的实现，实际效果可能有限
      if (contrast !== 100 || saturation !== 100) {
        baseStyle.tintColor = `rgba(255, 255, 255, ${(saturation - 100) / 100 * 0.2})`;
      }
    }

    // 如果是老照片修复，不添加底色
    if (repairType === "enhance") {
      // 不添加任何额外效果
    }

    return baseStyle;
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 py-6 px-4">
          {/* 返回按钮 */}
          <TouchableOpacity
            onPress={() => {
              router.replace({
                pathname: "/repair-upload",
              } as any);
            }}
            className="mb-6"
            activeOpacity={0.7}
          >
            <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: "600" }}>
              ← 上一步
            </Text>
          </TouchableOpacity>

          {/* 页面标题 */}
          <View className="mb-8">
            <Text
              style={{ color: COLORS.primary, fontSize: 28, fontWeight: "800", marginBottom: 8 }}
            >
              照片修复完成
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 14 }}>
              您的照片已修复，可以选择倍数并下载
            </Text>
          </View>

          {/* 修复后照片 - 仅显示修复后的照片 */}
          <View
            className="rounded-2xl mb-8 overflow-hidden"
            style={{
              backgroundColor: COLORS.white,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Pressable 
              onPress={() => setShowPreview(true)}
              className="items-center justify-center p-6"
            >
              <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: "600", marginBottom: 12 }}>
                修复后 ({selectedScale})
              </Text>
              <View
                style={{
                  width: "100%",
                  height: 250,
                  position: "relative",
                  overflow: "hidden",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image source={{ uri: image }} style={getImageStyle()} />

                {/* 色彩调整面板 - 覆盖在图片下方 */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    gap: 8,
                  }}
                >
                  {/* 亮度调整 */}
                  <View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: "600" }}>
                        亮度
                      </Text>
                      <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: "600" }}>
                        {brightness}%
                      </Text>
                    </View>
                    <Slider
                      style={{ height: 30 }}
                      minimumValue={70}
                      maximumValue={130}
                      step={5}
                      value={brightness}
                      onValueChange={setBrightness}
                      minimumTrackTintColor={COLORS.accent}
                      maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    />
                  </View>

                  {/* 对比度调整 */}
                  <View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: "600" }}>
                        对比度
                      </Text>
                      <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: "600" }}>
                        {contrast}%
                      </Text>
                    </View>
                    <Slider
                      style={{ height: 30 }}
                      minimumValue={70}
                      maximumValue={130}
                      step={5}
                      value={contrast}
                      onValueChange={setContrast}
                      minimumTrackTintColor={COLORS.accent}
                      maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    />
                  </View>

                  {/* 饱和度调整 */}
                  <View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: "600" }}>
                        饱和度
                      </Text>
                      <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: "600" }}>
                        {saturation}%
                      </Text>
                    </View>
                    <Slider
                      style={{ height: 30 }}
                      minimumValue={50}
                      maximumValue={150}
                      step={5}
                      value={saturation}
                      onValueChange={setSaturation}
                      minimumTrackTintColor={COLORS.accent}
                      maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    />
                  </View>

                  {/* 锐度调整 */}
                  <View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: "600" }}>
                        锐度
                      </Text>
                      <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: "600" }}>
                        {sharpness}%
                      </Text>
                    </View>
                    <Slider
                      style={{ height: 30 }}
                      minimumValue={50}
                      maximumValue={150}
                      step={5}
                      value={sharpness}
                      onValueChange={setSharpness}
                      minimumTrackTintColor={COLORS.accent}
                      maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          </View>



          {/* 推荐尺寸 */}
          <View
            className="rounded-2xl p-6 mb-8"
            style={{
              backgroundColor: COLORS.white,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: "600", marginBottom: 12 }}>
              推荐尺寸（可选）
            </Text>

            <View style={{ gap: 8 }}>
              {QUICK_SIZES.map((size, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedQuickSize(index)}
                  activeOpacity={0.7}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    backgroundColor: selectedQuickSize === index ? COLORS.accent + "20" : COLORS.background,
                    borderWidth: 1,
                    borderColor: selectedQuickSize === index ? COLORS.accent : COLORS.border,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: selectedQuickSize === index ? COLORS.accent : COLORS.border,
                        backgroundColor: selectedQuickSize === index ? COLORS.accent : "transparent",
                      }}
                    />
                    <View>
                      <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: "600" }}>
                        {size.name}
                      </Text>
                      <Text style={{ color: COLORS.muted, fontSize: 10 }}>
                        {size.width}×{size.height}mm
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 快速下载 */}
          <View
            className="rounded-2xl p-6 mb-8"
            style={{
              backgroundColor: COLORS.white,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text style={{ color: COLORS.primary, fontSize: 18, fontWeight: "700", marginBottom: 4 }}>
              下载
            </Text>

            <View className="gap-2">
              {/* 一键分享 */}
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  showShareMenu(
                    "📷 我用「元一图灵」修复了一张旧照片，效果真的不错！😎\n\n旧照片修复、模糊照片修复、照片超分，一键帮你撕救珍贵回忆。",
                    "元一图灵-照片修复"
                  );
                }}
                activeOpacity={0.7}
            className="rounded-lg py-3 px-4 mb-4 items-center"
            style={{
              backgroundColor: "#34C759",
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '600' }}>
              🔗 分享
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDownloadPaid}
                disabled={isDownloading}
                activeOpacity={0.7}
                className="rounded-lg py-3 items-center"
                style={{
                  backgroundColor: COLORS.accent,
                  opacity: isDownloading ? 0.6 : 1,
                }}
              >
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: "600" }}>
                    ⭐ 下载高清版
                  </Text>
                  <Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: "500", opacity: 0.8 }}>
                    ￥5.99
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 全屏预览模态框 */}
      <Modal
        visible={showPreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}
      >
        <Pressable
          onPress={() => setShowPreview(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={{ uri: image }}
            style={{
              width: '90%',
              height: '80%',
              resizeMode: 'contain',
              ...(Platform.OS === 'web' && { filter: `brightness(${brightness}%) contrast(${contrast}%)` }),
            } as any}
          />
          <Text style={{ color: COLORS.white, fontSize: 12, marginTop: 16, fontWeight: '600' }}>
            点击关闭预览
          </Text>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
