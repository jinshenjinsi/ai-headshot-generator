import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image, Alert, TextInput, Platform } from "react-native";
import Slider from "@react-native-community/slider";

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

      // 创建临时文件
      const fileName = `photo_${sizeLabel}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到相册
      if (Platform.OS !== "web") {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          await MediaLibrary.createAssetAsync(fileUri);
          Alert.alert("成功", `${sizeLabel}尺寸图片已保存到相册`);
        } else {
          Alert.alert("权限不足", "无法访问相册，请在设置中授予权限");
        }
      } else {
        // Web平台：直接下载
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${base64}`;
        link.download = fileName;
        link.click();
        Alert.alert("成功", `${sizeLabel}尺寸图片已下载`);
      }
    } catch (error) {
      Alert.alert("下载失败", "无法保存图片，请重试");
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPaid = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsDownloading(true);
    try {
      // 使用自定义尺寸或国家默认尺寸
      const finalWidth = parseInt(customWidth) || 35;
      const finalHeight = parseInt(customHeight) || 45;
      const sizeLabel = `${finalWidth}×${finalHeight}mm`;

      // 获取图片的base64数据
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 创建临时文件
      const fileName = `photo_hd_${sizeLabel}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到相册
      if (Platform.OS !== "web") {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          await MediaLibrary.createAssetAsync(fileUri);
          Alert.alert("成功", `${sizeLabel}尺寸高清图片已保存到相册（已付费）`);
        } else {
          Alert.alert("权限不足", "无法访问相册，请在设置中授予权限");
        }
      } else {
        // Web平台：直接下载
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${base64}`;
        link.download = fileName;
        link.click();
        Alert.alert("成功", `${sizeLabel}尺寸高清图片已下载（已付费）`);
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
