import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";

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
  {
    id: "professional",
    icon: "👔",
    name: "专业商务",
    desc: "正式、商务感强",
  },
  {
    id: "oil",
    icon: "🎨",
    name: "油画",
    desc: "艺术、高级感",
  },
  {
    id: "watercolor",
    icon: "🌈",
    name: "水彩",
    desc: "柔和、梦幻",
  },
  {
    id: "sketch",
    icon: "✏️",
    name: "素描",
    desc: "经典、优雅",
  },
  {
    id: "cartoon",
    icon: "🎭",
    name: "卡通",
    desc: "可爱、活泼",
  },
  {
    id: "anime",
    icon: "🎬",
    name: "动漫",
    desc: "二次元风格",
  },
  {
    id: "minimal",
    icon: "⚫",
    name: "极简",
    desc: "简洁、现代",
  },
  {
    id: "retro",
    icon: "🕰️",
    name: "复古",
    desc: "怀旧、文艺",
  },
  {
    id: "neon",
    icon: "⚡",
    name: "霓虹",
    desc: "炫彩、科幻",
  },
  {
    id: "art",
    icon: "🎪",
    name: "艺术",
    desc: "创意、独特",
  },
];

export default function StyleChooseScreen() {
  const router = useRouter();
  const { image } = useLocalSearchParams();

  const handleSelectStyle = (styleId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: "/style-edit",
      params: { image, style: styleId },
    } as any);
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
              选择您喜欢的风格，我们会为您生成专业的美照
            </Text>
          </View>

          {/* 风格选择网格 */}
          <View className="gap-3 mb-8">
            {STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                onPress={() => handleSelectStyle(style.id)}
                activeOpacity={0.7}
                className="rounded-2xl p-4 overflow-hidden"
                style={{
                  backgroundColor: COLORS.white,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-4">
                  <View 
                    className="w-16 h-16 rounded-xl items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: COLORS.accent + '15' }}
                  >
                    <Text className="text-3xl">{style.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      style={{ color: COLORS.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 }}
                    >
                      {style.name}
                    </Text>
                    <Text 
                      style={{ color: COLORS.muted, fontSize: 12 }}
                    >
                      {style.desc}
                    </Text>
                  </View>
                  <Text 
                    style={{ color: COLORS.accent, fontSize: 20 }}
                  >
                    →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 底部提示 */}
          <View 
            className="rounded-xl p-4 mb-8"
            style={{ backgroundColor: COLORS.accent + '10', borderLeftWidth: 4, borderLeftColor: COLORS.accent }}
          >
            <Text 
              style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600', marginBottom: 4 }}
            >
              💡 提示
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18 }}
            >
              每种风格都会根据您的照片特征进行个性化调整，生成独一无二的美照。您也可以在下一步进行微调。
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
