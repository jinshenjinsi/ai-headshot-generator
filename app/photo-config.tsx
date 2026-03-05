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

const BACKGROUNDS = [
  { id: "white", name: "白色", color: "#FFFFFF", border: "#E2E8F0" },
  { id: "blue", name: "蓝色", color: "#1E40AF", border: "#1E40AF" },
  { id: "red", name: "红色", color: "#DC2626", border: "#DC2626" },
  { id: "gray", name: "灰色", color: "#6B7280", border: "#6B7280" },
];

export default function PhotoConfigScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const type = params.type as string;

  const [selectedBackground, setSelectedBackground] = useState("white");

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: "/photo-edit",
      params: { image, type, background: selectedBackground },
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
              配置证照
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              选择背景颜色和其他配置
            </Text>
          </View>

          {/* 背景颜色选择 */}
          <View className="mb-8">
            <Text 
              style={{ color: COLORS.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 }}
            >
              背景颜色
            </Text>
            <View className="gap-3 mt-4">
              {BACKGROUNDS.map((bg) => (
                <TouchableOpacity
                  key={bg.id}
                  onPress={() => setSelectedBackground(bg.id)}
                  activeOpacity={0.7}
                  className="rounded-2xl p-4 flex-row items-center gap-4"
                  style={{
                    backgroundColor: COLORS.white,
                    borderWidth: 2,
                    borderColor: selectedBackground === bg.id ? COLORS.accent : COLORS.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  <View 
                    className="w-14 h-14 rounded-xl"
                    style={{ 
                      backgroundColor: bg.color,
                      borderWidth: 1,
                      borderColor: bg.border,
                    }}
                  />
                  <View className="flex-1">
                    <Text 
                      style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600' }}
                    >
                      {bg.name}
                    </Text>
                  </View>
                  {selectedBackground === bg.id && (
                    <Text style={{ fontSize: 20, color: COLORS.accent }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 预览 */}
          <View 
            className="rounded-2xl p-6 mb-8"
            style={{
              backgroundColor: COLORS.white,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text 
              style={{ color: COLORS.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 }}
            >
              预览效果
            </Text>
            <View 
              className="rounded-xl items-center justify-center"
              style={{
                height: 300,
                backgroundColor: BACKGROUNDS.find(b => b.id === selectedBackground)?.color || "#FFFFFF",
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Text style={{ fontSize: 48 }}>👤</Text>
              <Text 
                style={{ color: COLORS.muted, fontSize: 12, marginTop: 8 }}
              >
                背景: {BACKGROUNDS.find(b => b.id === selectedBackground)?.name}
              </Text>
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
              onPress={handleNext}
              activeOpacity={0.7}
              className="flex-1 rounded-xl py-4 items-center"
              style={{
                backgroundColor: COLORS.primary,
              }}
            >
              <Text 
                style={{ color: COLORS.white, fontSize: 14, fontWeight: '600' }}
              >
                下一步
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
