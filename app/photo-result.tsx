import { ScrollView, Text, View, TouchableOpacity, Platform, Image, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";

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

const PRESET_SIZES = [
  { name: "1寸", width: 25, height: 35, specs: "25×35mm" },
  { name: "2寸", width: 35, height: 53, specs: "35×53mm" },
];

export default function PhotoResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const type = params.type as string;
  const country = params.country as string;

  const [selectedSize, setSelectedSize] = useState(0);
  const [customWidth, setCustomWidth] = useState("25");
  const [customHeight, setCustomHeight] = useState("35");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsDownloading(true);
    try {
      const size = PRESET_SIZES[selectedSize];
      // 获取图片的base64数据
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 创建临时文件
      const fileName = `photo_${size.name}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到相册
      if (Platform.OS !== "web") {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          await MediaLibrary.createAssetAsync(fileUri);
          Alert.alert("成功", `${size.name}尺寸图片已保存到相册`);
        } else {
          Alert.alert("权限不足", "无法访问相册，请在设置中授予权限");
        }
      } else {
        // Web平台：直接下载
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${base64}`;
        link.download = fileName;
        link.click();
        Alert.alert("成功", `${size.name}尺寸图片已下载`);
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
      const size = PRESET_SIZES[selectedSize];
      // 获取图片的base64数据
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 创建临时文件
      const fileName = `photo_hd_${size.name}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到相册
      if (Platform.OS !== "web") {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          await MediaLibrary.createAssetAsync(fileUri);
          Alert.alert("成功", `${size.name}尺寸高清图片已保存到相册（已付费）`);
        } else {
          Alert.alert("权限不足", "无法访问相册，请在设置中授予权限");
        }
      } else {
        // Web平台：直接下载
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${base64}`;
        link.download = fileName;
        link.click();
        Alert.alert("成功", `${size.name}尺寸高清图片已下载（已付费）`);
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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: '600' }}>
                      亮度
                    </Text>
                    <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '600' }}>
                      {brightness}%
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {[70, 85, 100, 115, 130].map((val) => (
                      <TouchableOpacity
                        key={val}
                        onPress={() => setBrightness(val)}
                        style={{
                          flex: 1,
                          paddingVertical: 5,
                          backgroundColor: brightness === val ? COLORS.accent : 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 3,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: COLORS.white, fontSize: 9, fontWeight: '600' }}>
                          {val}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 对比度调整 */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: '600' }}>
                      对比度
                    </Text>
                    <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '600' }}>
                      {contrast}%
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {[70, 85, 100, 115, 130].map((val) => (
                      <TouchableOpacity
                        key={val}
                        onPress={() => setContrast(val)}
                        style={{
                          flex: 1,
                          paddingVertical: 5,
                          backgroundColor: contrast === val ? COLORS.accent : 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 3,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: COLORS.white, fontSize: 9, fontWeight: '600' }}>
                          {val}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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
                用途: {type === 'passport' ? '护照照' : type === 'visa' ? '签证照' : '其他'} | 背景: 白色 | 尺寸: 25×35mm
              </Text>
            </View>
          </View>

          {/* 色彩调整按钮已移除 - 直接在图片上显示调整面板 */}

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
              style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}
            >
              您可以自定义输出尺寸(单位:mm)
            </Text>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1">
                <Text 
                  style={{ color: COLORS.text, fontSize: 12, fontWeight: '600', marginBottom: 4 }}
                >
                  宽度(mm)
                </Text>
                <View 
                  className="rounded-lg px-3 py-2 border"
                  style={{ borderColor: COLORS.border }}
                >
                  <Text 
                    style={{ color: COLORS.text, fontSize: 14 }}
                  >
                    {customWidth}
                  </Text>
                </View>
              </View>
              <View className="flex-1">
                <Text 
                  style={{ color: COLORS.text, fontSize: 12, fontWeight: '600', marginBottom: 4 }}
                >
                  高度(mm)
                </Text>
                <View 
                  className="rounded-lg px-3 py-2 border"
                  style={{ borderColor: COLORS.border }}
                >
                  <Text 
                    style={{ color: COLORS.text, fontSize: 14 }}
                  >
                    {customHeight}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              className="rounded-lg py-3 items-center"
              style={{
                backgroundColor: COLORS.border,
              }}
            >
              <Text 
                style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}
              >
                应用新尺寸
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
              快速下载
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}
            >
              必选：选择一个尺寸
            </Text>
            <View className="gap-2">
              {PRESET_SIZES.map((size, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedSize(index);
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  activeOpacity={0.7}
                  className="rounded-lg p-4 flex-row items-center justify-between"
                  style={{
                    backgroundColor: selectedSize === index ? COLORS.accent + "20" : COLORS.background,
                    borderWidth: 2,
                    borderColor: selectedSize === index ? COLORS.accent : COLORS.border,
                  }}
                >
                  <View className="flex-1">
                    <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600', marginBottom: 2 }}>
                      {size.name}
                    </Text>
                    <Text style={{ color: COLORS.muted, fontSize: 12 }}>
                      {size.specs}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selectedSize === index ? COLORS.accent : COLORS.border,
                      backgroundColor: selectedSize === index ? COLORS.accent : "transparent",
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 12,
                    }}
                  >
                    {selectedSize === index && (
                      <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '700' }}>✓</Text>
                    )}
                  </View>
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
