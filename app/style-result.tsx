import { ScrollView, Text, View, TouchableOpacity, Platform, Image, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
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

const STYLE_CATEGORIES = [
  { id: "oil", name: "油画", emoji: "🎨" },
  { id: "watercolor", name: "水彩", emoji: "🌊" },
  { id: "anime", name: "动漫", emoji: "✨" },
  { id: "sketch", name: "素描", emoji: "✏️" },
  { id: "cartoon", name: "卡通", emoji: "🎭" },
  { id: "vintage", name: "复古", emoji: "📷" },
];

export default function StyleResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const style = params.style as string;

  const [selectedStyle, setSelectedStyle] = useState(style || "oil");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const handleDownload = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    alert("下载功能将在后续实现");
  };

  const handleDownloadPaid = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    alert("付费下载功能将在后续实现");
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

  const currentStyleName = STYLE_CATEGORIES.find(s => s.id === selectedStyle)?.name || "油画";
  const currentStyleEmoji = STYLE_CATEGORIES.find(s => s.id === selectedStyle)?.emoji || "🎨";

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
              您的美照已生成,可以下载或更换风格
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
                {currentStyleEmoji} 风格: {currentStyleName}
              </Text>
              <Text 
                style={{ color: COLORS.muted, fontSize: 11 }}
              >
                您可以下载或更换风格重新生成
              </Text>
            </View>
          </View>

          {/* 更换风格 */}
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
              更换风格
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}
            >
              选择您喜欢的风格,重新生成美照
            </Text>

            <View style={{ gap: 8 }}>
              {STYLE_CATEGORIES.map((styleItem) => (
                <TouchableOpacity
                  key={styleItem.id}
                  onPress={() => setSelectedStyle(styleItem.id)}
                  activeOpacity={0.7}
                  className="rounded-lg p-3 flex-row items-center justify-between"
                  style={{
                    backgroundColor: selectedStyle === styleItem.id ? COLORS.accent + "15" : COLORS.background,
                    borderWidth: selectedStyle === styleItem.id ? 2 : 0,
                    borderColor: selectedStyle === styleItem.id ? COLORS.accent : "transparent",
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 20 }}>
                      {styleItem.emoji}
                    </Text>
                    <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>
                      {styleItem.name}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: selectedStyle === styleItem.id ? COLORS.accent : COLORS.border,
                      backgroundColor: selectedStyle === styleItem.id ? COLORS.accent : "transparent",
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>
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
            <View className="gap-2">
              <TouchableOpacity
                onPress={handleDownload}
                activeOpacity={0.7}
                className="rounded-lg py-3 items-center"
                style={{
                  backgroundColor: COLORS.success,
                }}
              >
                <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '600' }}>
                  💚 免费预览版
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDownloadPaid}
                activeOpacity={0.7}
                className="rounded-lg py-3 items-center"
                style={{
                  backgroundColor: COLORS.accent,
                }}
              >
                <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>
                  ⭐ 付费高清版
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
