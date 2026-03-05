import { ScrollView, Text, View, TouchableOpacity, Platform, Image, Alert } from "react-native";
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
  success: "#10B981",
};

const PRESET_SIZES = [
  { name: "当前尺寸", width: 25, height: 35, specs: "25×35mm" },
  { name: "1寸", width: 25, height: 35, specs: "25×35mm" },
  { name: "2寸", width: 35, height: 53, specs: "35×53mm" },
  { name: "护照", width: 35, height: 45, specs: "35×45mm" },
];

export default function PhotoResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const type = params.type as string;
  const country = params.country as string;

  const [selectedSize, setSelectedSize] = useState(0);
  const [customWidth, setCustomWidth] = useState("25");
  const [customHeight, setCustomHeight] = useState("35");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showAdjustments, setShowAdjustments] = useState(false);

  const handleDownload = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    alert("下载功能将在后续实现");
  };

  const handleDownloadPaid = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    alert("付费下载功能将在后续实现");
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
              证照生成完成
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              您的证照已生成,可以下载或修改尺寸
            </Text>
          </View>

          {/* 生成结果 */}
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
            <View style={{ position: 'relative', width: '100%', height: 400 }}>
              <Image
                source={{ uri: image }}
                style={{ 
                  width: '100%', 
                  height: 400, 
                  resizeMode: 'cover',
                  opacity: Math.min(1, brightness / 100),
                  tintColor: contrast > 100 ? 'rgba(0,0,0,' + Math.min(0.7, (contrast - 100) / 100 * 0.6) + ')' : 
                             contrast < 100 ? 'rgba(255,255,255,' + Math.min(0.6, (100 - contrast) / 100 * 0.5) + ')' : undefined,
                }}
              />
              {/* 色彩调整面板 - 覆盖在图片上方 */}
              <View 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  gap: 8,
                }}
              >
                {/* 亮度调整 */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: '600' }}>
                      亮度
                    </Text>
                    <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '600' }}>
                      {brightness}%
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {[70, 85, 100, 115, 130].map((val) => (
                      <TouchableOpacity
                        key={val}
                        onPress={() => setBrightness(val)}
                        style={{
                          flex: 1,
                          paddingVertical: 5,
                          backgroundColor: brightness === val ? COLORS.accent : 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 3,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: COLORS.white, fontSize: 9, fontWeight: '600' }}>
                          {val}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 对比度调整 */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: '600' }}>
                      对比度
                    </Text>
                    <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '600' }}>
                      {contrast}%
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {[70, 85, 100, 115, 130].map((val) => (
                      <TouchableOpacity
                        key={val}
                        onPress={() => setContrast(val)}
                        style={{
                          flex: 1,
                          paddingVertical: 5,
                          backgroundColor: contrast === val ? COLORS.accent : 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 3,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: COLORS.white, fontSize: 9, fontWeight: '600' }}>
                          {val}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
            <View className="p-4" style={{ backgroundColor: COLORS.background }}>
              <Text 
                style={{ color: COLORS.text, fontSize: 12, fontWeight: '600', marginBottom: 4 }}
              >
                📋 证照信息
              </Text>
              <Text 
                style={{ color: COLORS.muted, fontSize: 11 }}
              >
                用途: {type === 'passport' ? '护照照' : type === 'visa' ? '签证照' : '其他'} | 背景: 白色 | 尺寸: 25×35mm
              </Text>
            </View>
          </View>

          {/* 色彩调整按钮已移除 - 直接在图片上显示调整面板 */}

          {/* 修改尺寸 */}
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
              style={{ color: COLORS.primary, fontSize: 18, fontWeight: '700', marginBottom: 4 }}
            >
              修改尺寸
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}
            >
              您可以自定义输出尺寸(单位:mm)
            </Text>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1">
                <Text 
                  style={{ color: COLORS.text, fontSize: 12, fontWeight: '600', marginBottom: 4 }}
                >
                  宽度(mm)
                </Text>
                <View 
                  className="rounded-lg px-3 py-2 border"
                  style={{ borderColor: COLORS.border }}
                >
                  <Text 
                    style={{ color: COLORS.text, fontSize: 14 }}
                  >
                    {customWidth}
                  </Text>
                </View>
              </View>
              <View className="flex-1">
                <Text 
                  style={{ color: COLORS.text, fontSize: 12, fontWeight: '600', marginBottom: 4 }}
                >
                  高度(mm)
                </Text>
                <View 
                  className="rounded-lg px-3 py-2 border"
                  style={{ borderColor: COLORS.border }}
                >
                  <Text 
                    style={{ color: COLORS.text, fontSize: 14 }}
                  >
                    {customHeight}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              className="rounded-lg py-3 items-center"
              style={{
                backgroundColor: COLORS.border,
              }}
            >
              <Text 
                style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}
              >
                应用新尺寸
              </Text>
            </TouchableOpacity>
          </View>

          {/* 快速下载 */}
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
              style={{ color: COLORS.primary, fontSize: 18, fontWeight: '700', marginBottom: 4 }}
            >
              快速下载
            </Text>
            <View className="gap-2">
              {PRESET_SIZES.map((size, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedSize(index)}
                  activeOpacity={0.7}
                  className="rounded-lg p-3 flex-row items-center justify-between"
                  style={{
                    backgroundColor: selectedSize === index ? COLORS.accent + '15' : COLORS.background,
                    borderWidth: 1,
                    borderColor: selectedSize === index ? COLORS.accent : COLORS.border,
                  }}
                >
                  <View>
                    <Text 
                      style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600', marginBottom: 2 }}
                    >
                      {size.name}
                    </Text>
                    <Text 
                      style={{ color: COLORS.muted, fontSize: 12 }}
                    >
                      {size.specs}
                    </Text>
                  </View>
                  {selectedSize === index && (
                    <Text style={{ fontSize: 18, color: COLORS.accent }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 底部操作 */}
          <View className="gap-3 mb-8">
            <TouchableOpacity
              onPress={handleDownload}
              activeOpacity={0.7}
              className="rounded-xl py-4 items-center"
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 2,
                borderColor: COLORS.accent,
              }}
            >
              <Text 
                style={{ color: COLORS.accent, fontSize: 16, fontWeight: '600' }}
              >
                📥 下载预览版(免费)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDownloadPaid}
              activeOpacity={0.7}
              className="rounded-xl py-4 items-center"
              style={{
                backgroundColor: COLORS.success,
              }}
            >
              <Text 
                style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}
              >
                💾 下载高清版 ¥5.6
              </Text>
            </TouchableOpacity>
          </View>

          {/* 底部导航 */}
          <View className="flex-row gap-3 mb-8">
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
