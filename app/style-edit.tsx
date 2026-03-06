import { ScrollView, Text, View, TouchableOpacity, Image, Pressable, Platform, LayoutChangeEvent } from "react-native";
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

export default function StyleEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const style = params.style as string;

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sharpness, setSharpness] = useState(100);
  
  // 为每个滑条使用独立的宽度状态
  const [brightnessWidth, setBrightnessWidth] = useState(0);
  const [contrastWidth, setContrastWidth] = useState(0);
  const [saturationWidth, setSaturationWidth] = useState(0);
  const [sharpnessWidth, setSharpnessWidth] = useState(0);

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
    const newValue = Math.max(0, Math.min(200, value));
    setter(newValue);
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
      pathname: "/generating-style",
      params: { 
        image, 
        style,
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

  const handleSliderPress = (e: any, setter: (v: number) => void, sliderWidth: number) => {
    if (sliderWidth === 0) {
      console.warn("Slider width not set");
      return;
    }
    
    const locationX = e.nativeEvent.locationX;
    if (locationX === undefined || locationX === null) {
      console.warn("Location X not available");
      return;
    }
    
    // 计算值：locationX / sliderWidth = value / 200
    // 所以 value = (locationX / sliderWidth) * 200
    // 确俟value在0-200范围内
    let newValue = Math.round((locationX / sliderWidth) * 200);
    newValue = Math.max(0, Math.min(200, newValue));
    handleSliderChange(newValue, setter);
  };

  const renderSlider = (
    label: string, 
    value: number, 
    setter: (v: number) => void, 
    sliderType: string,
    sliderWidth: number,
    setSliderWidth: (w: number) => void
  ) => {
    // 计算填充百分比：value从0-200，所以填充百分比 = (value / 200) * 100
    // 注意：value越小越暗，value越大越亮，所以填充百分比就是 (value / 200) * 100
    const fillPercentage = (value / 200) * 100;

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
            {isNaN(value) ? "100" : value}%
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
          onLayout={(e: LayoutChangeEvent) => {
            const width = e.nativeEvent.layout.width;
            setSliderWidth(width);
          }}
          onPress={(e) => handleSliderPress(e, setter, sliderWidth)}
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
              width: `${fillPercentage}%`,
              height: 42,
              backgroundColor: COLORS.accent,
              borderRadius: 21,
            }}
          />
          
          {/* 数值显示 */}
          <Text 
            style={{ 
              color: fillPercentage > 50 ? COLORS.white : COLORS.text,
              fontSize: 12,
              fontWeight: '600',
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            {isNaN(value) ? "100" : value}%
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

            {renderSlider("亮度", brightness, setBrightness, "brightness", brightnessWidth, setBrightnessWidth)}
            {renderSlider("对比度", contrast, setContrast, "contrast", contrastWidth, setContrastWidth)}
            {renderSlider("饱和度", saturation, setSaturation, "saturation", saturationWidth, setSaturationWidth)}
            {renderSlider("锐度", sharpness, setSharpness, "sharpness", sharpnessWidth, setSharpnessWidth)}

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
