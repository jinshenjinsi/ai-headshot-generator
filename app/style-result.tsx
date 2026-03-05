import { ScrollView, Text, View, TouchableOpacity, Platform, Image, Pressable, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
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

const STYLE_NAMES: Record<string, string> = {
  professional: "专业",
  oil: "油画",
  watercolor: "水彩",
  sketch: "素描",
  cartoon: "卡通",
  anime: "动漫",
  minimal: "极简",
  retro: "复古",
  neon: "霓虹",
  art: "艺术",
};

export default function StyleResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const style = params.style as string;

  const [selectedFormat, setSelectedFormat] = useState("png");
  const [downloading, setDownloading] = useState(false);
  const originalImage = params.originalImage as string;
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showAdjustments, setShowAdjustments] = useState(false);

  const handleDownload = async () => {
    if (!image || downloading) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setDownloading(true);
    try {
      if (Platform.OS === "web") {
        const response = await fetch(image);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `style-preview-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        
        Alert.alert("下载成功", "预览版已保存");
      } else {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("需要权限", "请允许访问相册以保存图片");
          setDownloading(false);
          return;
        }

        const fileUri = FileSystem.documentDirectory + `style-preview-${Date.now()}.jpg`;
        await FileSystem.downloadAsync(image, fileUri);
        await MediaLibrary.saveToLibraryAsync(fileUri);
        
        Alert.alert("下载成功", "预览版已保存到相册");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("下载失败", "保存图片时出现问题,请稍后重试");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPaid = async () => {
    if (!originalImage || downloading) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      "付费下载",
      "下载高清无水印版需要支付 ¥3.9\n\n支付功能即将开放,敬请期待!",
      [
        { text: "取消", style: "cancel" },
        {
          text: "确认支付",
          onPress: async () => {
            setDownloading(true);
            try {
              if (Platform.OS === "web") {
                const response = await fetch(originalImage);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = `style-hd-${Date.now()}.jpg`;
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

                const fileUri = FileSystem.documentDirectory + `style-hd-${Date.now()}.jpg`;
                await FileSystem.downloadAsync(originalImage, fileUri);
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
    // 回到编辑页面而不是生成页面
    router.replace({
      pathname: "/style-edit",
      params: { image: params.image, style },
    } as any);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 py-6 px-4">
          {/* 返回按钮 */}
          <TouchableOpacity
            onPress={() => {
              // 回到编辑页面而不是生成页面
              router.replace({
                pathname: "/style-edit",
                params: { image: params.image, style },
              } as any);
            }}
            className="mb-6"
            activeOpacity={0.7}
          >
            <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600' }}>
              ← 上一步
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
              您的美照已生成,可以下载或继续编辑
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
            <Image
              source={{ uri: image }}
              style={{ 
                width: '100%', 
                height: 400, 
                resizeMode: 'cover',
                opacity: 1,
              }}
            />
            {showAdjustments && (
              <View 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                }}
              >
                {/* 亮度调整 */}
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '600' }}>
                      亮度
                    </Text>
                    <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: '600' }}>
                      {brightness}%
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      const locationX = (e.nativeEvent as any).locationX || 0;
                      const trackWidth = 280;
                      const percentage = Math.max(0, Math.min(200, Math.round((locationX / trackWidth) * 200)));
                      setBrightness(percentage);
                    }}
                    activeOpacity={0.8}
                    style={{
                      height: 32,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 16,
                      justifyContent: 'center',
                      paddingHorizontal: 2,
                    }}
                  >
                    <View 
                      style={{
                        height: '100%',
                        width: `${(brightness / 200) * 100}%`,
                        backgroundColor: COLORS.accent,
                        borderRadius: 14,
                      }}
                    />
                  </TouchableOpacity>
                </View>

                {/* 对比度调整 */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '600' }}>
                      对比度
                    </Text>
                    <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: '600' }}>
                      {contrast}%
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      const locationX = (e.nativeEvent as any).locationX || 0;
                      const trackWidth = 280;
                      const percentage = Math.max(0, Math.min(200, Math.round((locationX / trackWidth) * 200)));
                      setContrast(percentage);
                    }}
                    activeOpacity={0.8}
                    style={{
                      height: 32,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 16,
                      justifyContent: 'center',
                      paddingHorizontal: 2,
                    }}
                  >
                    <View 
                      style={{
                        height: '100%',
                        width: `${(contrast / 200) * 100}%`,
                        backgroundColor: COLORS.accent,
                        borderRadius: 14,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View className="p-4" style={{ backgroundColor: COLORS.background }}>
              <Text 
                style={{ color: COLORS.text, fontSize: 12, fontWeight: '600', marginBottom: 4 }}
              >
                🎨 生成信息
              </Text>
              <Text 
                style={{ color: COLORS.muted, fontSize: 11 }}
              >
                风格: {STYLE_NAMES[style] || style} | 分辨率: 1024×1024 | 格式: PNG
              </Text>
            </View>
          </View>

          {/* 色彩调整 */}
          <TouchableOpacity
            onPress={() => setShowAdjustments(!showAdjustments)}
            activeOpacity={0.7}
            className="rounded-lg py-3 px-4 mb-6 items-center flex-row justify-center gap-2"
            style={{
              backgroundColor: showAdjustments ? COLORS.accent : COLORS.primary,
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}>
              {showAdjustments ? '✓ 色彩调整中' : '🎨 色彩调整'}
            </Text>
          </TouchableOpacity>

          {/* 其他风格预览 */}
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
              尝试其他风格
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}
            >
              同一张照片,10种风格任意转换
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {["professional", "oil", "watercolor", "sketch", "cartoon", "anime", "minimal", "retro", "neon", "art"].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    router.push({
                      pathname: "/style-edit",
                      params: { image: params.image, style: s },
                    } as any);
                  }}
                  activeOpacity={0.7}
                  className="rounded-lg px-3 py-2"
                  style={{
                    backgroundColor: s === style ? COLORS.accent : COLORS.border,
                  }}
                >
                  <Text 
                    style={{ 
                      color: s === style ? COLORS.white : COLORS.text, 
                      fontSize: 12, 
                      fontWeight: '600' 
                    }}
                  >
                    {STYLE_NAMES[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 导出格式 */}
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
              导出格式
            </Text>
            <View className="gap-2">
              {[
                { id: "png", name: "PNG (无损)" },
                { id: "jpg", name: "JPG (压缩)" },
                { id: "webp", name: "WebP (最优)" },
              ].map((format) => (
                <TouchableOpacity
                  key={format.id}
                  onPress={() => setSelectedFormat(format.id)}
                  activeOpacity={0.7}
                  className="rounded-lg p-3 flex-row items-center justify-between"
                  style={{
                    backgroundColor: selectedFormat === format.id ? COLORS.accent + '15' : COLORS.background,
                    borderWidth: 1,
                    borderColor: selectedFormat === format.id ? COLORS.accent : COLORS.border,
                  }}
                >
                  <Text 
                    style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}
                  >
                    {format.name}
                  </Text>
                  {selectedFormat === format.id && (
                    <Text style={{ fontSize: 18, color: COLORS.accent }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 底部操作 */}
          <View className="gap-3 mb-8">
            <TouchableOpacity
              onPress={handleDownload}
              activeOpacity={0.7}
              disabled={downloading}
              className="rounded-xl py-4 items-center"
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 2,
                borderColor: COLORS.accent,
                opacity: downloading ? 0.6 : 1,
              }}
            >
              <Text 
                style={{ color: COLORS.accent, fontSize: 16, fontWeight: '600' }}
              >
                {downloading ? "下载中..." : "📥 下载预览版(免费)"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDownloadPaid}
              activeOpacity={0.7}
              disabled={downloading}
              className="rounded-xl py-4 items-center"
              style={{
                backgroundColor: COLORS.success,
                opacity: downloading ? 0.6 : 1,
              }}
            >
              <Text 
                style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}
              >
                💾 下载高清版 ¥3.9
              </Text>
            </TouchableOpacity>
          </View>

          {/* 底部导航 */}
          <View className="flex-row gap-3 mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="flex-1 rounded-xl py-4 items-center"
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Text 
                style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}
              >
                上一步
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/" as any)}
              activeOpacity={0.7}
              className="flex-1 rounded-xl py-4 items-center"
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Text 
                style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}
              >
                返回首页
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
