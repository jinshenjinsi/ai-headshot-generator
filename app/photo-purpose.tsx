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

const PURPOSES = [
  {
    id: "passport",
    icon: "🛂",
    title: "护照照",
    desc: "国际护照申请用",
    size: "35×45mm",
  },
  {
    id: "visa",
    icon: "✈️",
    title: "签证照",
    desc: "各国签证申请用",
    size: "35×45mm",
  },
  {
    id: "work",
    icon: "💼",
    title: "工作证",
    desc: "企业工作证、员工卡",
    size: "自定义",
  },
  {
    id: "resume",
    icon: "📄",
    title: "简历照",
    desc: "求职、招聘用途",
    size: "1寸或2寸",
  },
  {
    id: "student",
    icon: "🎓",
    title: "学生证",
    desc: "学校、考试用途",
    size: "1寸",
  },
  {
    id: "social",
    icon: "🌐",
    title: "社交头像",
    desc: "微信、微博、抖音",
    size: "正方形",
  },
];

export default function PhotoPurposeScreen() {
  const router = useRouter();
  const { image } = useLocalSearchParams();

  const handleSelectPurpose = (purposeId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: "/photo-type",
      params: { image, purpose: purposeId },
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
              选择证照用途
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              选择您需要的证照类型，我们会自动调整尺寸和格式
            </Text>
          </View>

          {/* 用途选择网格 */}
          <View className="gap-3 mb-8">
            {PURPOSES.map((purpose) => (
              <TouchableOpacity
                key={purpose.id}
                onPress={() => handleSelectPurpose(purpose.id)}
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
                    <Text className="text-3xl">{purpose.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      style={{ color: COLORS.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 }}
                    >
                      {purpose.title}
                    </Text>
                    <Text 
                      style={{ color: COLORS.muted, fontSize: 12, marginBottom: 4 }}
                    >
                      {purpose.desc}
                    </Text>
                    <Text 
                      style={{ color: COLORS.accent, fontSize: 11, fontWeight: '600' }}
                    >
                      尺寸: {purpose.size}
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
              不同用途的证照有不同的尺寸和格式要求。选择正确的用途可以确保生成的证照符合标准。
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
