import { ScrollView, Text, View, TouchableOpacity, Image, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useEffect } from "react";
import Slider from "@react-native-community/slider";
import { getPhotoAndStyleFreeCount, canUsePhotoAndStyleFree } from "@/lib/free-usage-service";

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
  const [freeCount, setFreeCount] = useState(0);
  const [canUseFree, setCanUseFree] = useState(false);

  useEffect(() => {
    const loadFreeStatus = async () => {
      const count = await getPhotoAndStyleFreeCount();
      const canUse = await canUsePhotoAndStyleFree();
      setFreeCount(count);
      setCanUseFree(canUse);
    };
    loadFreeStatus();
  }, []);

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
      pathname: "/generating-style",
      params: { 
        image, 
        style,
      },
    } as any);
  };



  const renderSlider = (
    label: string, 
    value: number, 
    setter: (v: number) => void, 
    sliderType: string
  ) => {
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
            {Math.round(value)}%
          </Text>
        </View>
        

        
        {/* 滑条 - 使用原生Slider组件 */}
        <View style={{
          height: 50,
          justifyContent: 'center',
          backgroundColor: COLORS.border,
          borderRadius: 25,
          paddingHorizontal: 4,
        }}>
          <Slider
            style={{ width: '100%', height: 50 }}
            minimumValue={0}
            maximumValue={200}
            value={value}
            onValueChange={(val) => handleSliderChange(val, setter)}
            minimumTrackTintColor={COLORS.accent}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.accent}
            step={1}
          />
        </View>
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

          {/* 免费次数提示 */}
          {canUseFree && (
            <View 
              className="rounded-xl p-4 mb-4"
              style={{
                backgroundColor: '#D4AF3720',
                borderWidth: 1,
                borderColor: COLORS.accent,
              }}
            >
              <Text 
                style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600', textAlign: 'center' }}
              >
                ✨ 您还有 {freeCount} 次免费生成机会
              </Text>
            </View>
          )}

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
              <View>
                <Text 
                  style={{ color: COLORS.white, fontSize: 14, fontWeight: '600', textAlign: 'center' }}
                >
                  生成
                </Text>
                <Text 
                  style={{ color: COLORS.white, fontSize: 11, textAlign: 'center', marginTop: 2 }}
                >
                  {canUseFree ? `免费(${freeCount}次)` : '¥1.99'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
