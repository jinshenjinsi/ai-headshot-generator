import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

// 深蓝+金色配色方案
const COLORS = {
  primary: "#1A365D",      // 深蓝
  accent: "#D4AF37",       // 金色
  background: "#F5F7FA",   // 浅灰
  white: "#FFFFFF",
  text: "#2D3748",
  muted: "#718096",
  border: "#E2E8F0",
};

// 三大核心功能
const MAIN_FEATURES = [
  {
    id: "photo",
    icon: "📸",
    title: "证照生成",
    desc: "一张正面照,快速生成标准证件照。支持护照、签证、工作证等多种用途。",
    route: "/photo-upload",
  },
  {
    id: "style",
    icon: "✨",
    title: "美照生成",
    desc: "10种专业风格转换,让你的头像更出众。卡通、油画、水彩等任意选择。",
    route: "/style-upload",
  },
  {
    id: "repair",
    icon: "🔧",
    title: "照片修复",
    desc: "低分辨率照片也能变清晰。2倍、4倍超分,让老照片焕然一新。",
    route: "/repair-upload",
  },
];

// 证件照用途分类
const CERTIFICATE_TYPES = [
  {
    id: "work",
    icon: "💼",
    title: "工作证",
    desc: "企业工作证、员工卡",
  },
  {
    id: "resume",
    icon: "📄",
    title: "简历照",
    desc: "求职、招聘用途",
  },
  {
    id: "passport",
    icon: "🛂",
    title: "护照照",
    desc: "护照申请用",
  },
  {
    id: "visa",
    icon: "✈️",
    title: "签证照",
    desc: "签证申请用",
  },
  {
    id: "student",
    icon: "🎓",
    title: "学生证",
    desc: "学校、考试用途",
  },
  {
    id: "social",
    icon: "🌐",
    title: "社交头像",
    desc: "微信、微博、抖音",
  },
];

// AI风格
const AI_STYLES = [
  { icon: "👔", name: "专业", desc: "正式、商务感" },
  { icon: "🎨", name: "油画", desc: "艺术、高级感" },
  { icon: "🌈", name: "水彩", desc: "柔和、梦幻" },
  { icon: "✏️", name: "素描", desc: "经典、优雅" },
  { icon: "🎭", name: "卡通", desc: "可爱、活泼" },
  { icon: "🎬", name: "动漫", desc: "二次元风格" },
  { icon: "⚫", name: "极简", desc: "简洁、现代" },
  { icon: "🕰️", name: "复古", desc: "怀旧、文艺" },
  { icon: "⚡", name: "霓虹", desc: "炫彩、科幻" },
  { icon: "🎪", name: "艺术", desc: "创意、独特" },
];

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();

  const handleFeaturePress = (route: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 py-6 px-4">
          {/* 顶部品牌区域 */}
          <View className="items-center gap-4 mb-10 pt-4">
            <View 
              className="w-20 h-20 rounded-3xl items-center justify-center"
              style={{
                backgroundColor: COLORS.accent,
                shadowColor: COLORS.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text className="text-4xl">✨</Text>
            </View>
            
            <View className="items-center gap-2">
              <Text 
                className="text-3xl font-bold text-center"
                style={{ 
                  color: COLORS.primary,
                  fontWeight: '800',
                }}
              >
                AI专业头像
              </Text>
              <Text 
                className="text-sm text-center px-6"
                style={{ 
                  color: COLORS.muted,
                }}
              >
                一张照片,10种风格{"\n"}
                专业证件照一键生成
              </Text>
            </View>
          </View>

          {/* 三大核心功能 */}
          <View className="mb-8">
            <View className="gap-3">
              {MAIN_FEATURES.map((feature) => (
                <TouchableOpacity
                  key={feature.id}
                  onPress={() => handleFeaturePress(feature.route)}
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
                  <View className="flex-row items-start gap-4">
                    <View 
                      className="w-14 h-14 rounded-xl items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: COLORS.accent + '15',
                      }}
                    >
                      <Text className="text-2xl">{feature.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text 
                        className="font-bold mb-1"
                        style={{ color: COLORS.primary, fontSize: 16 }}
                      >
                        {feature.title}
                      </Text>
                      <Text 
                        className="text-sm leading-relaxed"
                        style={{ color: COLORS.muted }}
                      >
                        {feature.desc}
                      </Text>
                    </View>
                    <Text 
                      className="text-lg"
                      style={{ color: COLORS.accent }}
                    >
                      →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 证件照用途分类 */}
          <View className="mb-8">
            <Text 
              className="font-bold mb-4 px-2"
              style={{ color: COLORS.primary, fontSize: 16 }}
            >
              证件照用途
            </Text>
            <View className="flex-row flex-wrap gap-3 justify-between">
              {CERTIFICATE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => handleFeaturePress("/photo-upload")}
                  activeOpacity={0.7}
                  className="rounded-2xl p-3 items-center justify-center"
                  style={{
                    width: "48%",
                    backgroundColor: COLORS.white,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  <Text className="text-2xl mb-2">{type.icon}</Text>
                  <Text 
                    className="font-semibold text-center text-sm"
                    style={{ color: COLORS.primary }}
                  >
                    {type.title}
                  </Text>
                  <Text 
                    className="text-xs text-center mt-1"
                    style={{ color: COLORS.muted }}
                  >
                    {type.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI风格展示 */}
          <View className="mb-8">
            <Text 
              className="font-bold mb-4 px-2"
              style={{ color: COLORS.primary, fontSize: 16 }}
            >
              AI风格转换
            </Text>
            <View className="flex-row flex-wrap gap-2 justify-between">
              {AI_STYLES.map((style, index) => (
                <View
                  key={index}
                  className="rounded-xl p-2 items-center justify-center"
                  style={{
                    width: "23%",
                    backgroundColor: COLORS.white,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Text className="text-xl mb-1">{style.icon}</Text>
                  <Text 
                    className="font-semibold text-center text-xs"
                    style={{ color: COLORS.primary }}
                  >
                    {style.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 核心功能特性 */}
          <View className="mb-8">
            <Text 
              className="font-bold mb-4 px-2"
              style={{ color: COLORS.primary, fontSize: 16 }}
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
                    backgroundColor: COLORS.white,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  <View 
                    className="w-12 h-12 rounded-xl items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: COLORS.accent + '15' }}
                  >
                    <Text className="text-2xl">{feature.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="font-semibold"
                      style={{ color: COLORS.primary }}
                    >
                      {feature.title}
                    </Text>
                    <Text 
                      className="text-sm"
                      style={{ color: COLORS.muted }}
                    >
                      {feature.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 底部CTA */}
          <View className="mt-4 mb-8">
            <TouchableOpacity
              onPress={() => handleFeaturePress("/photo-upload")}
              activeOpacity={0.9}
              className="w-full rounded-2xl overflow-hidden py-4"
              style={{
                backgroundColor: COLORS.primary,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text 
                className="font-bold text-xl text-center"
                style={{ 
                  color: COLORS.white,
                  fontWeight: '700',
                }}
              >
                立即开始
              </Text>
            </TouchableOpacity>

            <Text 
              className="text-sm text-center mt-4"
              style={{ color: COLORS.muted }}
            >
              无需注册 · 即刻体验 · 专业品质
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
