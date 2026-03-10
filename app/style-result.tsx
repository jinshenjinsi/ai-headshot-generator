import { ScrollView, Text, View, TouchableOpacity, Platform, Image, Alert, Linking, Share } from "react-native";
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

export default function StyleResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const generateMutation = trpc.headshot.generateBailian.useMutation();

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedQuickSize, setSelectedQuickSize] = useState<number | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const MAX_REGENERATE = 3;

  const QUICK_SIZES = [
    { width: 25, height: 35, name: "1寸" },
    { width: 35, height: 53, name: "2寸" },
    { width: 50, height: 75, name: "5寸" },
    { width: 60, height: 90, name: "6寸" },
    { width: 100, height: 150, name: "10寸" },
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
      const fileName = `style_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, compressedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到手机图库
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await MediaLibrary.createAssetAsync(fileUri);
        Alert.alert("成功", "图片已保存到手机图库");
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
        style: 'artistic',
        regenerateCount: newCount,
      });
      
      if (result.success && result.imageUrl) {
        router.replace({
          pathname: '/style-result',
          params: {
            image: result.imageUrl,
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
      const fileName = `style_hd_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到手机图库
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await MediaLibrary.createAssetAsync(fileUri);
        Alert.alert("成功", "高清图片已保存到手机图库（已付费）");
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

  // 获取图片的显示效果
  const getImageStyle = () => {
    const baseStyle: any = {
      width: "100%",
      height: 400,
      resizeMode: "cover",
    };

    if (Platform.OS === "web") {
      // Web：直接使用brightness filter
      baseStyle.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    } else {
      // React Native：使用tintColor模拟亮度和对比度
      baseStyle.tintColor = brightness > 100 ? '#ffffff' : '#000000';
      baseStyle.opacity = 0.7 + (Math.abs(brightness - 100) / 100) * 0.3;
    }

    return baseStyle;
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 py-6 px-4">
          {/* 返回按钮 */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6"
            activeOpacity={0.7}
          >
            <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600' }}>
              ← 返回
            </Text>
          </TouchableOpacity>

          {/* 页面标题 */}
          <View className="mb-8">
            <Text 
              style={{ color: COLORS.primary, fontSize: 28, fontWeight: '800', marginBottom: 8 }}
            >
              美照生成完成
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              您的美照已生成,可以下载保留
            </Text>
          </View>

          {/* 生成结果 */}
          <View 
            className="rounded-2xl mb-8 overflow-hidden"
            style={{
              backgroundColor: COLORS.white,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View style={{ position: 'relative', width: '100%', height: 400 }}>
              <Image
                source={{ uri: image }}
                style={getImageStyle()}
              />
              {/* 色彩调整面板 - 覆盖在图片上方 */}
              <View 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  gap: 8,
                }}
              >
                {/* 亮度调整 */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: '600' }}>
                      亮度
                    </Text>
                    <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '600' }}>
                      {brightness}%
                    </Text>
                  </View>
                  <Slider
                    style={{ height: 30 }}
                    minimumValue={70}
                    maximumValue={130}
                    value={brightness}
                    onValueChange={(val) => setBrightness(Math.round(val))}
                    minimumTrackTintColor={COLORS.accent}
                    maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    thumbTintColor={COLORS.accent}
                  />
                </View>

                {/* 对比度调整 */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: '600' }}>
                      对比度
                    </Text>
                    <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '600' }}>
                      {contrast}%
                    </Text>
                  </View>
                  <Slider
                    style={{ height: 30 }}
                    minimumValue={70}
                    maximumValue={130}
                    value={contrast}
                    onValueChange={(val) => setContrast(Math.round(val))}
                    minimumTrackTintColor={COLORS.accent}
                    maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    thumbTintColor={COLORS.accent}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* 固定尺寸 */}
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
              固定尺寸
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}>
              推荐尺寸（可选）
            </Text>

            <View className="gap-2">
              {QUICK_SIZES.map((size, index) => {
                const isSelected = selectedQuickSize === index;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedQuickSize(index);
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    activeOpacity={0.7}
                    disabled={isDownloading}
                    className="rounded-lg py-3 px-4 items-center flex-row justify-between"
                    style={{
                      backgroundColor: isSelected ? "#10B981" : COLORS.primary,
                      opacity: isDownloading ? 0.6 : 1,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: isSelected ? COLORS.accent : "transparent",
                    }}
                  >
                    <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '600', flex: 1 }}>
                      {isDownloading ? "下载中..." : `${size.name}(${size.width}×${size.height}mm)`}
                    </Text>
                    {isSelected && (
                      <Text style={{ color: COLORS.white, fontSize: 16, marginLeft: 8 }}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 下载选项 */}
          <View 
            className="rounded-2xl p-6 mb-8"
            style={{
              backgroundColor: COLORS.white,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text 
              style={{ color: COLORS.primary, fontSize: 18, fontWeight: '700', marginBottom: 4 }}
            >
              下载图片
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}
            >
              选择您喜欢的版本下载保留
            </Text>

            <View className="gap-2">
              {/* 一键分享 */}
              <TouchableOpacity
                onPress={() => {
                  try {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    showShareMenu(
                      "✨ 我用「元一图灵」生成了一张专业美照，效果真的不错！😎\n\n创意头像生成器，一键转换为你喜欢的艺术风格。油画、水彩、素描、漫画等风格任选。",
                      "元一图灵-专业美照"
                    );
                  } catch (error) {
                    console.error('Share error:', error);
                    Alert.alert('分享失败', '请稍后重试');
                  }
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
                  <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>
                    ⭐ 下载高清版
                  </Text>
                  <Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '500', opacity: 0.8 }}>
                    ￥1.99
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
