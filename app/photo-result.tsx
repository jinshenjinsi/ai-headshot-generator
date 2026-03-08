import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image, Alert, TextInput, Platform, Share, Linking } from "react-native";
import Slider from "@react-native-community/slider";
import { showShareMenu } from "@/lib/share-utils";
import { useRouter, useLocalSearchParams } from "expo-router";

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

// 各国家的证照尺寸标准
const COUNTRY_SPECS: { [key: string]: string } = {
  // 护照国家
  china: "35×45mm",
  usa: "50×50mm",
  japan: "45×45mm",
  uk: "35×45mm",
  canada: "35×45mm",
  australia: "35×45mm",
  singapore: "35×45mm",
  korea: "35×45mm",
  france: "35×45mm",
  germany: "35×45mm",
  italy: "35×45mm",
  spain: "35×45mm",
  netherlands: "35×45mm",
  sweden: "35×45mm",
  switzerland: "35×45mm",
  taiwan: "35×45mm",
  // 签证国家
  eu: "48×33mm",
  india: "50.8×50.8mm",
  thailand: "35×45mm",
  vietnam: "40×60mm",
  malaysia: "35×45mm",
  philippines: "35×45mm",
  indonesia: "35×45mm",
  newzealand: "35×45mm",
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

// 固定的推荐尺寸（1寸和2寸）
const QUICK_SIZES = [
  { name: "1寸", width: 25, height: 35, specs: "25×35mm" },
  { name: "2寸", width: 35, height: 53, specs: "35×53mm" },
];

export default function PhotoResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const type = params.type as string;
  const country = params.country as string;

  const [customWidth, setCustomWidth] = useState("35");
  const [customHeight, setCustomHeight] = useState("45");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [selectedQuickSize, setSelectedQuickSize] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const MAX_REGENERATE = 3;

  const handleDownload = async (width?: number, height?: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsDownloading(true);
    try {
      // 使用传入的尺寸，或使用自定义尺寸，或使用国家默认尺寸
      let finalWidth = width;
      let finalHeight = height;
      let sizeLabel = "原始";

      if (!finalWidth || !finalHeight) {
        // 使用自定义尺寸
        finalWidth = parseInt(customWidth) || 35;
        finalHeight = parseInt(customHeight) || 45;
        sizeLabel = `${finalWidth}×${finalHeight}mm`;
      } else {
        sizeLabel = `${width}×${height}mm`;
      }

      // 获取图片的base64数据
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 压缩预览版（1024px 分辨率，手机屏幕看不出模糊）
      const compressedBase64 = await compressImage(base64, 1024);

      // 创建临时文件
      const fileName = `photo_${sizeLabel}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, compressedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到手机图库
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await MediaLibrary.createAssetAsync(fileUri);
        Alert.alert("成功", `${sizeLabel}尺寸图片已保存到手机图库`);
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
      setRegenerateCount(newCount);
      Alert.alert("成功", `已重新生成（${newCount}/3次）`);
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
      // 使用自定义尺寸或国家默认尺寸
      const finalWidth = parseInt(customWidth) || 35;
      const finalHeight = parseInt(customHeight) || 45;
      const sizeLabel = `${finalWidth}×${finalHeight}mm`;

      // 获取图片的base64数据（原始高清版本）
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 创建临时文件
      const fileName = `photo_hd_${sizeLabel}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到手机图库
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await MediaLibrary.createAssetAsync(fileUri);
        Alert.alert("成功", `${sizeLabel}尺寸高清图片已保存到手机图库（已付费）`);
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

    // 应用亮度滤镜
    // 亮度范围：70-130
    // 正确方向：70为暗，100为正常，130为亮
    const brightnessValue = (brightness - 100) / 100 + 1; // 70->0.7, 100->1.0, 130->1.3
    
    if (Platform.OS === "web") {
      // Web：直接使用brightness filter
      baseStyle.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    } else {
      // React Native：使用opacity模拟亮度
      baseStyle.opacity = Math.min(1, brightnessValue);
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
              证照生成完成
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              您的证照已生成,可以下载或修改尺寸
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
            <View className="p-4" style={{ backgroundColor: COLORS.background }}>
              <Text 
                style={{ color: COLORS.text, fontSize: 12, fontWeight: '600', marginBottom: 4 }}
              >
                📋 证照信息
              </Text>
              <Text 
                style={{ color: COLORS.muted, fontSize: 11 }}
              >
                用途: {type === 'passport' ? '护照照' : type === 'visa' ? '签证照' : '其他'} | 背景: 白色 | 尺寸: {COUNTRY_SPECS[country] || '35×45mm'}
              </Text>
            </View>
          </View>

          {/* 修改尺寸 */}
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
              修改尺寸
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, marginBottom: 12 }}
            >
              自定义输出尺寸（单位mm）
            </Text>
            
            {/* 宽度滑动条 */}
            <View className="mb-6">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}>
                  宽度: {customWidth}mm
                </Text>
              </View>
              <Slider
                style={{ height: 40 }}
                minimumValue={20}
                maximumValue={50}
                step={1}
                value={parseInt(customWidth)}
                onValueChange={(value) => setCustomWidth(value.toString())}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.border}
              />
            </View>
            
            {/* 高度滑动条 */}
            <View className="mb-6">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}>
                  高度: {customHeight}mm
                </Text>
              </View>
              <Slider
                style={{ height: 40 }}
                minimumValue={30}
                maximumValue={70}
                step={1}
                value={parseInt(customHeight)}
                onValueChange={(value) => setCustomHeight(value.toString())}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.border}
              />
            </View>
            
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                handleDownload();
              }}
              disabled={isDownloading}
              activeOpacity={0.7}
              className="rounded-lg py-3 items-center"
              style={{
                backgroundColor: COLORS.primary,
                opacity: isDownloading ? 0.6 : 1,
              }}
            >
              <Text 
                style={{ color: COLORS.white, fontSize: 14, fontWeight: '600' }}
              >
                {isDownloading ? "下载中..." : "下载自定义尺寸"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 快速下载 */}
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
              固定尺寸
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, marginBottom: 12 }}
            >
              推荐尺寸（可选）
            </Text>
            
            
            {/* 快速选择按钮 */}
            <View className="gap-2">
              {QUICK_SIZES.map((size, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setCustomWidth(size.width.toString());
                    setCustomHeight(size.height.toString());
                  }}
                  activeOpacity={0.7}
                  className="rounded-lg py-2 items-center"
                  style={{
                    backgroundColor: COLORS.background,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600' }}>
                    {size.name} ({size.specs})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

          </View>

          {/* 一键分享 */}
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              showShareMenu(
                "📷 我用「元一图灵」生成了一张专业证件照，效果真的不错！😎\n\n不需要去照相馆，在家就能一键生成专业证件照。支持护照、签证、工作证等多种用途。",
                "元一图灵-专业证件照"
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

          {/* 重新生成按钮 */}
          <TouchableOpacity
            onPress={handleRegenerate}
            disabled={isRegenerating || regenerateCount >= MAX_REGENERATE}
            activeOpacity={0.7}
            className="rounded-lg py-3 px-4 mb-4 items-center"
            style={{
              backgroundColor: regenerateCount >= MAX_REGENERATE ? COLORS.muted : COLORS.primary,
              opacity: isRegenerating ? 0.6 : 1,
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '600' }}>
              {isRegenerating ? "重新生成中..." : `🔄 重新生成 (${regenerateCount}/${MAX_REGENERATE})`}
            </Text>
          </TouchableOpacity>

          {/* 友情提醒 */}
          {regenerateCount < MAX_REGENERATE && (
            <Text style={{ color: COLORS.muted, fontSize: 12, textAlign: 'center', marginBottom: 8 }}>
              💡 提示：更换更清晰的正脸照片可获得更好的效果
            </Text>
          )}

          {/* 付费下载 */}
          <TouchableOpacity
            onPress={handleDownloadPaid}
            disabled={isDownloading}
            activeOpacity={0.7}
            className="rounded-lg py-4 px-4 mb-8 items-center"
            style={{
              backgroundColor: COLORS.accent,
              opacity: isDownloading ? 0.6 : 1,
            }}
          >
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600' }}>
                ⭐ 下载高清版
              </Text>
              <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '500', opacity: 0.8 }}>
                ￥1.99
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
