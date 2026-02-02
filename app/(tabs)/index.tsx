import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";

import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();

  const handleStartCreating = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/upload" as any);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-between py-12 px-6">
          {/* Hero Section with Gradient */}
          <View className="items-center gap-8 flex-1 justify-center">
            {/* Premium Logo with Gradient Border */}
            <View className="relative">
              <View 
                className="w-32 h-32 rounded-3xl items-center justify-center"
                style={{
                  backgroundColor: colors.surface,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 24,
                  elevation: 12,
                }}
              >
                <View 
                  className="w-28 h-28 rounded-3xl items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-5xl">📸</Text>
                </View>
              </View>
              {/* Glow Effect */}
              <View 
                className="absolute inset-0 rounded-3xl opacity-20 blur-xl"
                style={{ backgroundColor: colors.primary }}
              />
            </View>
            
            {/* Title with Elegant Typography */}
            <View className="items-center gap-4">
              <Text 
                className="text-5xl font-bold text-center tracking-tight"
                style={{ 
                  color: colors.foreground,
                  fontWeight: '800',
                  letterSpacing: -1,
                }}
              >
                AI专业头像
              </Text>
              <Text 
                className="text-xl text-center px-8 leading-relaxed"
                style={{ 
                  color: colors.muted,
                  fontWeight: '400',
                }}
              >
                顶级AI技术 · 专业摄影品质{"\n"}
                让每一张照片都成为艺术
              </Text>
            </View>

            {/* Premium Features */}
            <View className="w-full gap-5 mt-8">
              {[
                { icon: "⚡", title: "极速生成", desc: "30秒即可完成" },
                { icon: "✨", title: "专业品质", desc: "媲美顶级摄影师" },
                { icon: "🎨", title: "多样风格", desc: "6种精选场景" },
              ].map((feature, index) => (
                <View 
                  key={index}
                  className="flex-row items-center gap-4 px-6 py-4 rounded-2xl"
                  style={{ 
                    backgroundColor: colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View 
                    className="w-14 h-14 rounded-xl items-center justify-center"
                    style={{ backgroundColor: colors.primary + '15' }}
                  >
                    <Text className="text-3xl">{feature.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="text-lg font-bold"
                      style={{ color: colors.foreground }}
                    >
                      {feature.title}
                    </Text>
                    <Text 
                      className="text-sm mt-1"
                      style={{ color: colors.muted }}
                    >
                      {feature.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Premium CTA Button */}
          <View className="items-center gap-6 mt-8">
            <TouchableOpacity
              onPress={handleStartCreating}
              activeOpacity={0.9}
              className="w-full rounded-2xl overflow-hidden"
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View 
                className="w-full px-8 py-5"
                style={{ backgroundColor: colors.primary }}
              >
                <Text 
                  className="font-bold text-xl text-center tracking-wide"
                  style={{ 
                    color: colors.background,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                  }}
                >
                  开始创建专业头像
                </Text>
              </View>
            </TouchableOpacity>

            <Text 
              className="text-sm text-center"
              style={{ color: colors.muted }}
            >
              无需注册 · 即刻体验 · 专业品质
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
