import { ScrollView, Text, View, TouchableOpacity, Platform, Image, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useRef } from "react";

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
  const background = params.background as string || "white";

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sharpness, setSharpness] = useState(100);

  const brightnessRef = useRef(null);
  const contrastRef = useRef(null);
  const saturationRef = useRef(null);
  const sharpnessRef = useRef(null);

  const handleSliderPress = (value: number, setter: (v: number) => void, ref: any) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setter(value);
  };

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
      pathname: "/photo-generating",
      params: { 
        image, 
        type, 
        background,
      },
    } as any);
  };

  const renderSlider = (label: string, value: number, setter: (v: number) => void, ref: any) => (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text 
          style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}
        >
          {label}
        </Text>
        <Text 
          style={{ color: COLORS.accent, fontSize: 14, fontWeight: '700' }}
        >
          {value}%
        </Text>
      </View>
      
      {/* 滑条轨道 */}
      <Pressable
        ref={ref}
        onPress={(e) => {
          const locationX = (e.nativeEvent as any).locationX || 0;
          const trackWidth = 280;
          const percentage = Math.max(0, Math.min(200, Math.round((locationX / trackWidth) * 200)));
          handleSliderPress(percentage, setter, ref);
        }}
        style={{
          height: 40,
          backgroundColor: COLORS.border,
          borderRadius: 20,
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}
      >
        {/* 填充部分 */}
        <View 
          style={{ 
            position: 'absolute',
            left: 4,
            top: 4,
            width: `${(value / 200) * 100}%`,
            height: 32,
            backgroundColor: COLORS.accent,
            borderRadius: 16,
          }}
        />
        
        {/* 数值显示 */}
        <Text 
          style={{ 
            color: value > 100 ? COLORS.white : COLORS.text,
            fontSize: 12,
            fontWeight: '600',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          {value}%
        </Text>
      </Pressable>

      {/* 快速调整按钮 */}
      <View className="flex-row gap-2 mt-2">
        <TouchableOpacity
          onPress={() => handleSliderPress(Math.max(0, value - 10), setter, ref)}
          className="flex-1 py-2 rounded-lg items-center"
          style={{ backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border }}
        >
          <Text style={{ color: COLORS.text, fontSize: 12, fontWeight: '600' }}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSliderPress(100, setter, ref)}
          className="flex-1 py-2 rounded-lg items-center"
          style={{ backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border }}
        >
          <Text style={{ color: COLORS.text, fontSize: 12, fontWeight: '600' }}>重置</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSliderPress(Math.min(200, value + 10), setter, ref)}
          className="flex-1 py-2 rounded-lg items-center"
          style={{ backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border }}
        >
          <Text style={{ color: COLORS.text, fontSize: 12, fontWeight: '600' }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

            {renderSlider("亮度", brightness, setBrightness, brightnessRef)}
            {renderSlider("对比度", contrast, setContrast, contrastRef)}
            {renderSlider("饱和度", saturation, setSaturation, saturationRef)}
            {renderSlider("锐度", sharpness, setSharpness, sharpnessRef)}

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
                全部重置
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
