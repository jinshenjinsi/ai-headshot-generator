import { ScrollView, Text, View, TouchableOpacity, Platform, Image } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";

const COLORS = {
  primary: "#1A365D",
  accent: "#D4AF37",
  white: "#FFFFFF",
  lightGray: "#F5F5F5",
  darkGray: "#333333",
  success: "#22C55E",
  text: "#1A1A1A",
  lightText: "#666666",
};

export default function HomeScreen() {
  const router = useRouter();

  const handlePhotoGeneration = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/photo-upload" as any);
  };

  const handleStyleGeneration = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/style-upload" as any);
  };

  const handleRepairPhoto = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/repair-upload" as any);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-8 py-8 px-6 pb-12">
          {/* 品牌头部 */}
          <View className="items-center gap-4 mt-4">
            {/* 品牌图标 - 元一图灵 */}
            <Image
              source={require("@/assets/images/yuanyi-icon.png")}
              style={{
                width: 120,
                height: 120,
                borderRadius: 28,
              }}
            />
            
            {/* 品牌名称 - 纯文字 */}
            <View className="flex-row items-center justify-center gap-1">
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: '800',
                  color: COLORS.accent,
                  fontStyle: 'italic',
                  letterSpacing: 2,
                }}
              >
                元一
              </Text>
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: '800',
                  color: COLORS.primary,
                  letterSpacing: 2,
                }}
              >
                图灵
              </Text>
            </View>
            
            <Text 
              className="text-base text-center"
              style={{ color: COLORS.lightText, lineHeight: 22 }}
            >
              一张照片，10种风格{"\n"}专业证件照一键生成
            </Text>
          </View>

          {/* 三大核心功能按钮 */}
          <View className="gap-4 mt-6">
            {/* 证照生成 */}
            <TouchableOpacity
              onPress={handlePhotoGeneration}
              activeOpacity={0.85}
              className="rounded-2xl p-6 overflow-hidden"
              style={{
                backgroundColor: COLORS.primary,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View className="gap-3">
                <Text className="text-4xl">📸</Text>
                <View>
                  <Text 
                    className="text-2xl font-bold mb-2"
                    style={{ color: COLORS.white }}
                  >
                    证照生成
                  </Text>
                  <Text 
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    一张正面照，快速生成标准证件照。支持护照、签证、工作证等多种用途。
                  </Text>
                </View>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                    <Text className="text-xs" style={{ color: COLORS.white }}>护照</Text>
                  </View>
                  <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                    <Text className="text-xs" style={{ color: COLORS.white }}>签证</Text>
                  </View>
                  <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                    <Text className="text-xs" style={{ color: COLORS.white }}>工作证</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* 美照生成 */}
            <TouchableOpacity
              onPress={handleStyleGeneration}
              activeOpacity={0.85}
              className="rounded-2xl p-6 overflow-hidden"
              style={{
                backgroundColor: COLORS.accent,
                shadowColor: COLORS.accent,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View className="gap-3">
                <Text className="text-4xl">✨</Text>
                <View>
                  <Text 
                    className="text-2xl font-bold mb-2"
                    style={{ color: COLORS.primary }}
                  >
                    美照生成
                  </Text>
                  <Text 
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.primary }}
                  >
                    10种专业风格转换：油画、水彩、素描、卡通、动漫、极简等。让你的头像更出众。
                  </Text>
                </View>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  <View className="px-3 py-1 rounded-full" style={{ backgroundColor: COLORS.primary + "20" }}>
                    <Text className="text-xs" style={{ color: COLORS.primary }}>油画</Text>
                  </View>
                  <View className="px-3 py-1 rounded-full" style={{ backgroundColor: COLORS.primary + "20" }}>
                    <Text className="text-xs" style={{ color: COLORS.primary }}>水彩</Text>
                  </View>
                  <View className="px-3 py-1 rounded-full" style={{ backgroundColor: COLORS.primary + "20" }}>
                    <Text className="text-xs" style={{ color: COLORS.primary }}>动漫</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* 照片修复 */}
            <TouchableOpacity
              onPress={handleRepairPhoto}
              activeOpacity={0.85}
              className="rounded-2xl p-6 overflow-hidden"
              style={{
                backgroundColor: COLORS.success,
                shadowColor: COLORS.success,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View className="gap-3">
                <Text className="text-4xl">🔧</Text>
                <View>
                  <Text 
                    className="text-2xl font-bold mb-2"
                    style={{ color: COLORS.white }}
                  >
                    照片修复
                  </Text>
                  <Text 
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    低分辨率照片也能清晰一新。支持2倍和4倍超分辨率，让老照片焕然一新。
                  </Text>
                </View>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                    <Text className="text-xs" style={{ color: COLORS.white }}>2倍超分</Text>
                  </View>
                  <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                    <Text className="text-xs" style={{ color: COLORS.white }}>4倍超分</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* 功能说明 */}
          <View className="gap-4 mt-4">
            <Text 
              className="text-lg font-bold"
              style={{ color: COLORS.primary }}
            >
              为什么选择我们
            </Text>
            
            <View className="gap-3">
              <View className="flex-row gap-3">
                <Text className="text-2xl">⚡</Text>
                <View className="flex-1">
                  <Text 
                    className="font-semibold mb-1"
                    style={{ color: COLORS.text }}
                  >
                    快速生成
                  </Text>
                  <Text 
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.lightText }}
                  >
                    AI驱动的智能处理，30秒内生成专业头像
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-2xl">🎨</Text>
                <View className="flex-1">
                  <Text 
                    className="font-semibold mb-1"
                    style={{ color: COLORS.text }}
                  >
                    多种风格
                  </Text>
                  <Text 
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.lightText }}
                  >
                    从专业商务到创意艺术，10种风格任意转换
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-2xl">💰</Text>
                <View className="flex-1">
                  <Text 
                    className="font-semibold mb-1"
                    style={{ color: COLORS.text }}
                  >
                    价格实惠
                  </Text>                  <Text 
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.lightText }}
                  >
                    预览版免费，高清版仅需¥1.99
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-2xl">🔒</Text>
                <View className="flex-1">
                  <Text 
                    className="font-semibold mb-1"
                    style={{ color: COLORS.text }}
                  >
                    隐私保护
                  </Text>
                  <Text 
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.lightText }}
                  >
                    您的照片仅用于生成，不会被保存或共享
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
