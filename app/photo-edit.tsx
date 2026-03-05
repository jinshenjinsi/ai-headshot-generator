import { ScrollView, Text, View, TouchableOpacity, Platform, Image, TextInput } from "react-native";
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

export default function PhotoEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const type = params.type as string;
  const country = params.country as string;

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sharpness, setSharpness] = useState(100);

  const handleReset = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSharpness(100);
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: "/photo-result",
      params: { 
        image, 
        type, 
        country,
        brightness,
        contrast,
        saturation,
        sharpness,
      },
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
              编辑调整
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              调整亮度、对比度等参数,获得最佳效果
            </Text>
          </View>

          {/* 图片预览 */}
          <View 
            className="rounded-2xl mb-8 overflow-hidden"
            style={{
              backgroundColor: COLORS.white,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Image
              source={{ uri: image }}
              style={{ 
                width: '100%', 
                height: 400,
                resizeMode: 'cover',
              }}
            />
          </View>

          {/* 调整控件 */}
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
              style={{ color: COLORS.primary, fontSize: 18, fontWeight: '700', marginBottom: 6 }}
            >
              图片调整
            </Text>

            {/* 亮度 */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text 
                  style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}
                >
                  亮度
                </Text>
                <Text 
                  style={{ color: COLORS.muted, fontSize: 12 }}
                >
                  {brightness}%
                </Text>
              </View>
              <View 
                className="h-8 rounded-full flex-row items-center"
                style={{ backgroundColor: COLORS.border }}
              >
                <View 
                  style={{ 
                    width: `${brightness / 2}%`,
                    height: '100%',
                    backgroundColor: COLORS.accent,
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>

            {/* 对比度 */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text 
                  style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}
                >
                  对比度
                </Text>
                <Text 
                  style={{ color: COLORS.muted, fontSize: 12 }}
                >
                  {contrast}%
                </Text>
              </View>
              <View 
                className="h-8 rounded-full flex-row items-center"
                style={{ backgroundColor: COLORS.border }}
              >
                <View 
                  style={{ 
                    width: `${contrast / 2}%`,
                    height: '100%',
                    backgroundColor: COLORS.accent,
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>

            {/* 饮和度 */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text 
                  style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}
                >
                  饮和度
                </Text>
                <Text 
                  style={{ color: COLORS.muted, fontSize: 12 }}
                >
                  {saturation}%
                </Text>
              </View>
              <View 
                className="h-8 rounded-full flex-row items-center"
                style={{ backgroundColor: COLORS.border }}
              >
                <View 
                  style={{ 
                    width: `${saturation / 2}%`,
                    height: '100%',
                    backgroundColor: COLORS.accent,
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>

            {/* 锐度 */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text 
                  style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}
                >
                  锐度
                </Text>
                <Text 
                  style={{ color: COLORS.muted, fontSize: 12 }}
                >
                  {sharpness}%
                </Text>
              </View>
              <View 
                className="h-8 rounded-full flex-row items-center"
                style={{ backgroundColor: COLORS.border }}
              >
                <View 
                  style={{ 
                    width: `${sharpness / 2}%`,
                    height: '100%',
                    backgroundColor: COLORS.accent,
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>

            {/* 重置按钮 */}
            <TouchableOpacity
              onPress={handleReset}
              activeOpacity={0.7}
              className="rounded-xl py-3 items-center"
              style={{
                backgroundColor: COLORS.background,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Text 
                style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}
              >
                重置
              </Text>
            </TouchableOpacity>
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
