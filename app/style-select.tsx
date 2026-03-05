import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
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
};

const STYLES = [
  { id: "professional", icon: "👔", name: "专业", desc: "正式、商务感" },
  { id: "oil", icon: "🎨", name: "油画", desc: "艺术、高级感" },
  { id: "watercolor", icon: "🌈", name: "水彩", desc: "柔和、梦幻" },
  { id: "sketch", icon: "✏️", name: "素描", desc: "经典、优雅" },
  { id: "cartoon", icon: "🎭", name: "卡通", desc: "可爱、活泼" },
  { id: "anime", icon: "🎬", name: "动漫", desc: "二次元风格" },
  { id: "minimal", icon: "⚫", name: "极简", desc: "简洁、现代" },
  { id: "retro", icon: "🕰️", name: "复古", desc: "怀旧、文艺" },
  { id: "neon", icon: "⚡", name: "霓虹", desc: "炫彩、科幻" },
  { id: "art", icon: "🎪", name: "艺术", desc: "创意、独特" },
];

export default function StyleSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleSelectStyle = (styleId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedStyle(styleId);

    setTimeout(() => {
      router.push({
        pathname: "/style-edit",
        params: { image, style: styleId },
      } as any);
    }, 300);
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
              选择风格
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              选择您喜欢的AI转换风格
            </Text>
          </View>

          {/* 风格网格 */}
          <View className="gap-3 mb-8">
            {STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                onPress={() => handleSelectStyle(style.id)}
                activeOpacity={0.7}
                className="rounded-2xl p-4 flex-row items-center gap-4"
                style={{
                  backgroundColor: selectedStyle === style.id ? COLORS.accent + '15' : COLORS.white,
                  borderWidth: 2,
                  borderColor: selectedStyle === style.id ? COLORS.accent : COLORS.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 1,
                }}
              >
                <View 
                  className="w-14 h-14 rounded-xl items-center justify-center"
                  style={{ backgroundColor: COLORS.accent + '15' }}
                >
                  <Text className="text-2xl">{style.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text 
                    style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600', marginBottom: 2 }}
                  >
                    {style.name}
                  </Text>
                  <Text 
                    style={{ color: COLORS.muted, fontSize: 12 }}
                  >
                    {style.desc}
                  </Text>
                </View>
                {selectedStyle === style.id && (
                  <Text style={{ fontSize: 20, color: COLORS.accent }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* 底部导航 */}
          <View className="flex-row gap-3">
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
