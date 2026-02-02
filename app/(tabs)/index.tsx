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
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-between gap-8 py-8">
          {/* Hero Section */}
          <View className="items-center gap-6 flex-1 justify-center">
            <View className="w-24 h-24 bg-primary rounded-3xl items-center justify-center">
              <IconSymbol size={48} name="camera.fill" color={colors.background} />
            </View>
            
            <View className="items-center gap-3">
              <Text className="text-4xl font-bold text-foreground text-center">
                AI专业头像生成器
              </Text>
              <Text className="text-lg text-muted text-center px-4 leading-relaxed">
                使用AI技术快速生成{"\n"}
                高质量的专业商务头像
              </Text>
            </View>

            {/* Features */}
            <View className="w-full gap-4 mt-8">
              <View className="flex-row items-center gap-3 px-4">
                <View className="w-10 h-10 bg-success/20 rounded-full items-center justify-center">
                  <IconSymbol size={20} name="checkmark.circle.fill" color={colors.success} />
                </View>
                <Text className="text-base text-foreground flex-1">
                  只需5-10张照片即可开始
                </Text>
              </View>

              <View className="flex-row items-center gap-3 px-4">
                <View className="w-10 h-10 bg-success/20 rounded-full items-center justify-center">
                  <IconSymbol size={20} name="checkmark.circle.fill" color={colors.success} />
                </View>
                <Text className="text-base text-foreground flex-1">
                  30秒快速预览,无需长时间等待
                </Text>
              </View>

              <View className="flex-row items-center gap-3 px-4">
                <View className="w-10 h-10 bg-success/20 rounded-full items-center justify-center">
                  <IconSymbol size={20} name="checkmark.circle.fill" color={colors.success} />
                </View>
                <Text className="text-base text-foreground flex-1">
                  多种专业场景和风格可选
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Button */}
          <View className="items-center gap-4">
            <TouchableOpacity
              onPress={handleStartCreating}
              activeOpacity={0.9}
              className="w-full bg-primary px-8 py-4 rounded-2xl shadow-lg"
            >
              <Text className="text-background font-bold text-lg text-center">
                开始创建头像
              </Text>
            </TouchableOpacity>

            <Text className="text-sm text-muted text-center">
              无需注册,立即开始使用
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
