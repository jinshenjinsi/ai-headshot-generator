import { ScrollView, Text, View, TouchableOpacity, Image, Pressable, Platform, useWindowDimensions } from "react-native";
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
  const { width: screenWidth } = useWindowDimensions();

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sharpness, setSharpness] = useState(100);

  // 计算滤镜效果
  const getImageStyle = () => {
    if (Platform.OS === "web") {
      return {
        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) brightness(${100 + (sharpness - 100) * 0.3}%)`,
      };
    } else {
      return {
        opacity: Math.min(1, brightness / 100),
      };
    }
  };

  const handleSliderChange = (value: number, setter: (v: number) => void) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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

  const getButtonLabel = (val: number, sliderType: string): string => {
    if (sliderType === "brightness") {
      return val === 80 ? "暗" : val === 90 ? "-" : val === 100 ? "正常" : val === 110 ? "+" : "亮";
    } else if (sliderType === "contrast") {
      return val === 80 ? "弱" : val === 90 ? "-" : val === 100 ? "正常" : val === 110 ? "+" : "强";
    } else if (sliderType === "saturation") {
      return val === 80 ? "淡" : val === 90 ? "-" : val === 100 ? "正常" : val === 110 ? "+" : "浓";
    } else if (sliderType === "sharpness") {
      return val === 80 ? "弱" : val === 90 ? "-" : val === 100 ? "正常" : val === 110 ? "+" : "强";
    }
    return "";
  };

  const renderSlider = (label: string, value: number, setter: (v: number) => void, sliderType: string) => {
    const sliderRef = useRef<View>(null);
    // trackWidth用于计算点击位置，实际宽度由Pressable决定

    return (
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
        
        {/* 快速调整按钮 */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          {[80, 90, 100, 110, 120].map((val) => (
            <TouchableOpacity
              key={val}
              onPress={() => handleSliderChange(val, setter)}
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
                {getButtonLabel(val, sliderType)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* 滑条轨道 */}
        <Pressable
          ref={sliderRef}
          onPress={(e) => {
            const locationX = (e.nativeEvent as any).locationX || 0;
            const pressableWidth = (e.currentTarget as any).offsetWidth || screenWidth - 40;
            // 将点击位置转换为0-200的值
            const newValue = Math.round((locationX / pressableWidth) * 200);
            handleSliderChange(newValue, setter);
          }}
          style={{
            height: 50,
            backgroundColor: COLORS.border,
            borderRadius: 25,
            justifyContent: 'center',
            paddingHorizontal: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 填充部分 - 从左到右 */}
          <View 
            style={{ 
              position: 'absolute',
              left: 4,
              top: 4,
              width: `${(value / 200) * 100}%`,
              height: 42,
              backgroundColor: COLORS.accent,
              borderRadius: 21,
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

            {renderSlider("亮度", brightness, setBrightness, "brightness")}
            {renderSlider("对比度", contrast, setContrast, "contrast")}
            {renderSlider("饱和度", saturation, setSaturation, "saturation")}
            {renderSlider("锐度", sharpness, setSharpness, "sharpness")}

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
