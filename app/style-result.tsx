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

export default function StyleResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedQuickSize, setSelectedQuickSize] = useState<number | null>(null);

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

      // 创建临时文件
      const fileName = `style_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到相册
      if (Platform.OS !== "web") {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          await MediaLibrary.createAssetAsync(fileUri);
          Alert.alert("成功", "图片已保存到相册");
        } else {
          Alert.alert("权限不足", "无法访问相册，请在设置中授予权限");
        }
      } else {
        // Web平台：直接下载
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${base64}`;
        link.download = fileName;
        link.click();
        Alert.alert("成功", "图片已下载");
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

      // 保存到相册
      if (Platform.OS !== "web") {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          await MediaLibrary.createAssetAsync(fileUri);
          Alert.alert("成功", "高清图片已保存到相册（已付费）");
        } else {
          Alert.alert("权限不足", "无法访问相册，请在设置中授予权限");
        }
      } else {
        // Web平台：直接下载
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${base64}`;
        link.download = fileName;
        link.click();
        Alert.alert("成功", "高清图片已下载（已付费）");
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
                        }}
                      >
                        <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: '600' }}>
                          {val === 70 ? '暗' : val === 130 ? '亮' : val}
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
                        <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: '600' }}>
                          {val === 70 ? '弱' : val === 130 ? '强' : val}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {QUICK_SIZES.map((size, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedQuickSize(index)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    minWidth: '30%',
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    backgroundColor: selectedQuickSize === index ? COLORS.accent + "20" : COLORS.background,
                    borderWidth: 1,
                    borderColor: selectedQuickSize === index ? COLORS.accent : COLORS.border,
                    borderRadius: 8,
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
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
                  <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: "600" }}>
                    {size.name}
                  </Text>
                  <Text style={{ color: COLORS.muted, fontSize: 10 }}>
                    {size.width}×{size.height}mm
                  </Text>
                </TouchableOpacity>
              ))}
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

            <View className="gap-3">
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
