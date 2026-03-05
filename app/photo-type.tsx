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

const PHOTO_TYPES = [
  {
    id: "passport",
    icon: "🛂",
    label: "护照照",
    desc: "标准护照照片规格",
    requiresCountry: true,
  },
  {
    id: "visa",
    icon: "✈️",
    label: "签证照",
    desc: "各国签证照片规格",
    requiresCountry: true,
  },
];

const OTHER_TYPES = [
  {
    id: "work",
    icon: "💼",
    label: "工作证",
    desc: "企业工作证、员工卡",
    requiresCountry: false,
  },
  {
    id: "resume",
    icon: "📄",
    label: "简历照",
    desc: "求职、招聘用途",
    requiresCountry: false,
  },
  {
    id: "student",
    icon: "🎓",
    label: "学生证",
    desc: "学校、考试用途",
    requiresCountry: false,
  },
  {
    id: "social",
    icon: "🌐",
    label: "社交头像",
    desc: "微信、微博、抖音",
    requiresCountry: false,
  },
];

export default function PhotoTypeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelectType = (typeId: string, requiresCountry: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedType(typeId);

    setTimeout(() => {
      if (requiresCountry) {
        router.push({
          pathname: typeId === "passport" ? "/photo-country" : "/photo-visa-country",
          params: { image, type: typeId },
        } as any);
      } else {
        router.push({
          pathname: "/photo-config",
          params: { image, type: typeId },
        } as any);
      }
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
              选择证照类型
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              选择您需要的证照类型
            </Text>
          </View>

          {/* 有特定要求的证照 */}
          <View className="mb-8">
            <Text 
              style={{ color: COLORS.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 }}
            >
              有特定要求的证照
            </Text>
            <View className="gap-3 mt-4">
              {PHOTO_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => handleSelectType(type.id, type.requiresCountry)}
                  activeOpacity={0.7}
                  className="rounded-2xl p-4 flex-row items-center gap-4"
                  style={{
                    backgroundColor: selectedType === type.id ? COLORS.accent + '15' : COLORS.white,
                    borderWidth: 2,
                    borderColor: selectedType === type.id ? COLORS.accent : COLORS.border,
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
                    <Text className="text-2xl">{type.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600', marginBottom: 2 }}
                    >
                      {type.label}
                    </Text>
                    <Text 
                      style={{ color: COLORS.muted, fontSize: 12 }}
                    >
                      {type.desc}
                    </Text>
                  </View>
                  {selectedType === type.id && (
                    <Text style={{ fontSize: 20 }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 其他证照 */}
          <View className="mb-8">
            <Text 
              style={{ color: COLORS.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 }}
            >
              其他证照
            </Text>
            <View className="gap-3 mt-4">
              {OTHER_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => handleSelectType(type.id, type.requiresCountry)}
                  activeOpacity={0.7}
                  className="rounded-2xl p-4 flex-row items-center gap-4"
                  style={{
                    backgroundColor: selectedType === type.id ? COLORS.accent + '15' : COLORS.white,
                    borderWidth: 2,
                    borderColor: selectedType === type.id ? COLORS.accent : COLORS.border,
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
                    <Text className="text-2xl">{type.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600', marginBottom: 2 }}
                    >
                      {type.label}
                    </Text>
                    <Text 
                      style={{ color: COLORS.muted, fontSize: 12 }}
                    >
                      {type.desc}
                    </Text>
                  </View>
                  {selectedType === type.id && (
                    <Text style={{ fontSize: 20 }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
