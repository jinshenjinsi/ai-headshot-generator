import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const CERTIFICATE_TYPES = [
  {
    id: "work",
    icon: "💼",
    title: "工作证件照",
    desc: "企业工作证、员工卡",
    color: "#3B82F6",
  },
  {
    id: "resume",
    icon: "📄",
    title: "简历照",
    desc: "求职、招聘用途",
    color: "#8B5CF6",
  },
  {
    id: "visa",
    icon: "🛂",
    title: "签证照",
    desc: "护照、签证申请",
    color: "#EC4899",
  },
  {
    id: "student",
    icon: "🎓",
    title: "学生证",
    desc: "学校、考试用途",
    color: "#F59E0B",
  },
  {
    id: "professional",
    icon: "👔",
    title: "专业形象照",
    desc: "LinkedIn、名片用",
    color: "#10B981",
  },
  {
    id: "social",
    icon: "📸",
    title: "社交头像",
    desc: "微信、微博、抖音",
    color: "#06B6D4",
  },
];

const AI_STYLES = [
  { icon: "🎨", name: "专业风格", desc: "正式、商务感" },
  { icon: "🎭", name: "卡通风格", desc: "可爱、活泼" },
  { icon: "🖼️", name: "油画风格", desc: "艺术、高级感" },
  { icon: "💧", name: "水彩风格", desc: "柔和、梦幻" },
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

  const handleCertificateSelect = (type: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/upload" as any);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 py-8 px-4">
          {/* Hero Section */}
          <View className="items-center gap-6 mb-12">
            <View 
              className="w-20 h-20 rounded-3xl items-center justify-center"
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text className="text-4xl">✨</Text>
            </View>
            
            <View className="items-center gap-3">
              <Text 
                className="text-4xl font-bold text-center"
                style={{ 
                  color: colors.foreground,
                  fontWeight: '800',
                }}
              >
                AI专业头像
              </Text>
              <Text 
                className="text-base text-center px-6"
                style={{ 
                  color: colors.muted,
                  fontWeight: '400',
                }}
              >
                一张照片,10种风格{"\n"}
                专业证件照一键生成
              </Text>
            </View>
          </View>

          {/* Certificate Types Section */}
          <View className="mb-10">
            <Text 
              className="text-lg font-bold mb-4 px-2"
              style={{ color: colors.foreground }}
            >
              证件照用途
            </Text>
            <View className="gap-3">
              {CERTIFICATE_TYPES.map((type, index) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => handleCertificateSelect(type.id)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-4 rounded-2xl p-4"
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
                    style={{ 
                      backgroundColor: type.color + '20',
                    }}
                  >
                    <Text className="text-2xl">{type.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="font-semibold mb-1"
                      style={{ color: colors.foreground }}
                    >
                      {type.title}
                    </Text>
                    <Text 
                      className="text-sm"
                      style={{ color: colors.muted }}
                    >
                      {type.desc}
                    </Text>
                  </View>
                  <Text 
                    className="text-lg"
                    style={{ color: colors.primary }}
                  >
                    →
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI Styles Section */}
          <View className="mb-10">
            <Text 
              className="text-lg font-bold mb-4 px-2"
              style={{ color: colors.foreground }}
            >
              AI风格转换
            </Text>
            <View className="flex-row flex-wrap gap-3 justify-between">
              {AI_STYLES.map((style, index) => (
                <View
                  key={index}
                  className="rounded-2xl p-4 items-center justify-center"
                  style={{
                    width: "48%",
                    backgroundColor: colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <Text className="text-3xl mb-2">{style.icon}</Text>
                  <Text 
                    className="font-semibold text-center mb-1"
                    style={{ color: colors.foreground }}
                  >
                    {style.name}
                  </Text>
                  <Text 
                    className="text-xs text-center"
                    style={{ color: colors.muted }}
                  >
                    {style.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Features Section */}
          <View className="mb-10">
            <Text 
              className="text-lg font-bold mb-4 px-2"
              style={{ color: colors.foreground }}
            >
              核心功能
            </Text>
            <View className="gap-3">
              {[
                { icon: "⚡", title: "极速生成", desc: "30秒完成生成" },
                { icon: "🎨", title: "高级编辑", desc: "对比度、饱和度、锐度调整" },
                { icon: "💾", title: "多尺寸下载", desc: "一键下载多个尺寸" },
              ].map((feature, index) => (
                <View 
                  key={index}
                  className="flex-row items-center gap-4 rounded-2xl p-4"
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
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: colors.primary + '20' }}
                  >
                    <Text className="text-2xl">{feature.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="font-semibold"
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
          <View className="mt-6 mb-8">
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
                  立即开始
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
