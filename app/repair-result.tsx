import { ScrollView, Text, View, TouchableOpacity, Platform, Image, Alert, Modal, Pressable, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import { Share } from "react-native";
import { shareToEmail, shareToSMS, shareToWeChat, shareViaBluetooth } from "@/lib/share-utils";

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

export default function RepairResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const originalImage = params.originalImage as string;
  const repairType = params.repairType as string;

  const [selectedScale, setSelectedScale] = useState("2x");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedQuickSize, setSelectedQuickSize] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isPaidVersion, setIsPaidVersion] = useState(false);

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

      // 创建临时文件
      const fileName = `repair_${selectedScale}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 保存到相册
      if (Platform.OS !== "web") {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          await MediaLibrary.createAssetAsync(fileUri);
          Alert.alert("成功", `图片已保存到相册（${selectedScale}倍）`);
        } else {
          Alert.alert("权限不足", "无法访问相册，请在设置中授予权限");
        }
      } else {
        // Web平台：直接下载
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${base64}`;
        link.download = fileName;
        link.click();
        Alert.alert("成功", `图片已下载（${selectedScale}倍）`);
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
    
    // 设置为付费版本，分享按钮将被禁用
    setIsPaidVersion(true);
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

      // 保存到相册
      if (Platform.OS !== "web") {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          await MediaLibrary.createAssetAsync(fileUri);
          Alert.alert("成功", `高清图片已保存到相册（${selectedScale}倍，已付费）`);
        } else {
          Alert.alert("权限不足", "无法访问相册，请在设置中授予权限");
        }
      } else {
        // Web平台：直接下载
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${base64}`;
        link.download = fileName;
        link.click();
        Alert.alert("成功", `高清图片已下载（${selectedScale}倍，已付费）`);
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

    // 应用亮度滤镜
    // 亮度范围：70-130
    // 正确方向：70为暗，100为正常，130为亮
    // 映射到 0.7-1.3的亮度倍数
    const brightnessValue = (brightness - 100) / 100 + 1; // 70->0.7, 100->1.0, 130->1.3
    
    if (Platform.OS === "web") {
      // Web：直接使用brightness filter
      baseStyle.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    } else {
      // React Native：使用opacity模拟亮度
      // brightness 70 -> opacity 0.7 (暗)
      // brightness 100 -> opacity 1.0 (正常)
      // brightness 130 -> opacity 1.0 (正常，因为opacity最大值是1)
      baseStyle.opacity = Math.min(1, brightnessValue);
    }

    // 对比度：在React Native上不模拟，仅在web上应用
    // 原因：tintColor在React Native上的行为不可预测，容易导致图像消失
    // 对比度调整已在web上通过filter实现

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
              {/* 邮件 */}
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  shareToEmail(
                    "元一图灵-照片修复",
                    "💷 我用「元一图灵」修复了一张旧照片，效果真的不错！😎\n\n旧照片修复、模糊照片修复、照片超分，一键帮你撕救珍贵回忆。"
                  );
                }}
                disabled={isPaidVersion}
                activeOpacity={0.7}
                className="rounded-lg py-2 items-center"
                style={{ backgroundColor: "#0A66C2", opacity: isPaidVersion ? 0.5 : 1 }}
              >
                <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: "600" }}>📧 邮件{isPaidVersion ? ' (需付费)' : ''}</Text>
              </TouchableOpacity>

              {/* 信息 */}
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  shareToSMS("📷 我用「元一图灵」修复了一张旧照片，效果真的不错！😎 旧照片修复、模糊照片修复、照片超分。");
                }}
                disabled={isPaidVersion}
                activeOpacity={0.7}
                className="rounded-lg py-2 items-center"
                style={{ backgroundColor: "#34C759", opacity: isPaidVersion ? 0.5 : 1 }}
              >
                <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: "600" }}>💬 信息{isPaidVersion ? ' (需付费)' : ''}</Text>
              </TouchableOpacity>

              {/* 微信 */}
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  shareToWeChat("📷 我用「元一图灵」修复了一张旧照片，效果真的不错！😎");
                }}
                disabled={isPaidVersion}
                activeOpacity={0.7}
                className="rounded-lg py-2 items-center"
                style={{ backgroundColor: "#09B83E", opacity: isPaidVersion ? 0.5 : 1 }}
              >
                <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: "600" }}>💚 微信{isPaidVersion ? ' (需付费)' : ''}</Text>
              </TouchableOpacity>

              {/* 蓝牙 */}
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  shareViaBluetooth("📷 我用「元一图灵」修复了一张旧照片，效果真的不错！😎");
                }}
                disabled={isPaidVersion}
                activeOpacity={0.7}
                className="rounded-lg py-2 items-center"
                style={{ backgroundColor: "#007AFF", opacity: isPaidVersion ? 0.5 : 1 }}
              >
                <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: "600" }}>🔵 蓝牙{isPaidVersion ? ' (需付费)' : ''}</Text>
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
            }}
          />
          <Text style={{ color: COLORS.white, fontSize: 12, marginTop: 16, fontWeight: '600' }}>
            点击关闭预览
          </Text>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
