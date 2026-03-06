import { ScrollView, Text, View, TouchableOpacity, Image, Pressable, Platform } from "react-native";
import { useEffect } from "react";
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

  // 计算滤镜效果
  const getImageStyle = () => {
    // 亮度范围：0-200
    // 正确方向：0为暗，100为正常，200为亮
    const brightnessValue = (brightness - 100) / 100 + 1; // 0->0, 100->1.0, 200->2.0
    
    if (Platform.OS === "web") {
      // Web：直接使用brightness filter
      // 饱和度：0-200，100为正常
      // 锐度：0-200，100为正常
      return {
        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) brightness(${100 + (sharpness - 100) * 0.3}%)`,
      };
    } else {
      // React Native：使用opacity模拟亮度
      return {
        opacity: Math.min(1, brightnessValue),
      };
    }
  };

  const handleSliderPress = (value: number, setter: (v: number) => void, ref: any) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // 限制范围在0-200
    setter(Math.max(0, Math.min(200, value)));
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
        country,
        background,
        brightness,
        contrast,
        saturation,
        sharpness,
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
      
      {/* 快速调整按钮 - 温和的选择 */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {[80, 90, 100, 110, 120].map((val) => (
          <TouchableOpacity
            key={val}
            onPress={() => handleSliderPress(val, setter, ref)}
            style={{
              flex: 1,
              paddingVertical: 6,
              backgroundColor: value === val ? COLORS.accent : COLORS.background,
              borderWidth: 1,
              borderColor: value === val ? COLORS.accent : COLORS.border,
              borderRadius: 6,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: value === val ? COLORS.white : COLORS.text, fontSize: 11, fontWeight: '600' }}>
              {val === 80 ? '暗' : val === 90 ? '-' : val === 100 ? '正常' : val === 110 ? '+' : '亮'}
            </Text>
          </TouchableOpacity>
        ))}
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
                ...getImageStyle(),
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

            {renderSlider("亮度(暗-亮)", brightness, setBrightness, brightnessRef)}
            {renderSlider("对比度(弱-强)", contrast, setContrast, contrastRef)}
            {renderSlider("饱和度(淡-浓)", saturation, setSaturation, saturationRef)}
            {renderSlider("锐度(弱-强)", sharpness, setSharpness, sharpnessRef)}

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
