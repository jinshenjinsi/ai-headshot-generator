import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const EXAMPLE_IMAGES = [
  require("@/assets/images/example-boardroom.jpg"),
  require("@/assets/images/example-city.jpg"),
  require("@/assets/images/example-park.jpg"),
];

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
          {/* Hero Section */}
          <View className="items-center gap-8 flex-1 justify-center">
            {/* Premium Logo */}
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
              <View 
                className="absolute inset-0 rounded-3xl opacity-20 blur-xl"
                style={{ backgroundColor: colors.primary }}
              />
            </View>
            
            {/* Title */}
            <View className="items-center gap-4">
              <Text 
                className="text-5xl font-bold text-center tracking-tight"
                style={{ 
                  color: colors.foreground,
                  fontWeight: '800',
                  letterSpacing: -1,
                }}
              >
                AI证件照生成
              </Text>
              <Text 
                className="text-xl text-center px-8 leading-relaxed"
                style={{ 
                  color: colors.muted,
                  fontWeight: '400',
                }}
              >
                工作证 · 简历照 · 签证照{"\n"}
                一键生成专业证件照
              </Text>
            </View>

            {/* Example Images Gallery */}
            <View className="w-full mt-6">
              <Text 
                className="text-sm font-semibold text-center mb-4"
                style={{ color: colors.muted }}
              >
                真实案例展示
              </Text>
              <View className="flex-row justify-center gap-3">
                {EXAMPLE_IMAGES.map((image, index) => (
                  <View
                    key={index}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      width: "29%",
                      aspectRatio: 3/4,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Image
                      source={image}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Premium Features */}
            <View className="w-full gap-5 mt-8">
              {[
                { icon: "⚡", title: "极速生成", desc: "30秒即可完成" },
                { icon: "💼", title: "证件照专用", desc: "符合各类证件要求" },
                { icon: "🎯", title: "多种场景", desc: "办公室·白底·灰底" },
              ].map((feature, index) => (
                <View 
                  key={index}
                  className="flex-row items-center gap-5 rounded-2xl p-5"
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
                    style={{ backgroundColor: colors.primary + '20' }}
                  >
                    <Text className="text-3xl">{feature.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="text-lg font-bold mb-1"
                      style={{ color: colors.foreground }}
                    >
                      {feature.title}
                    </Text>
                    <Text 
                      className="text-sm"
                      style={{ color: colors.muted }}
                    >
                      {feature.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* CTA Button */}
          <View className="mt-12">
            <TouchableOpacity
              onPress={handleStartCreating}
              activeOpacity={0.9}
              className="w-full rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View className="w-full px-8 py-5">
                <Text 
                  className="font-bold text-xl text-center"
                  style={{ 
                    color: colors.background,
                    fontWeight: '700',
                  }}
                >
                  开始创建专业头像
                </Text>
              </View>
            </TouchableOpacity>

            <Text 
              className="text-sm text-center mt-4"
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
