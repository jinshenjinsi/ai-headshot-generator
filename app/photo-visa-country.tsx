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

const VISA_COUNTRIES = [
  { code: "usa", name: "🇺🇸 美国", specs: "50×50mm" },
  { code: "japan", name: "🇯🇵 日本", specs: "45×45mm" },
  { code: "uk", name: "🇬🇧 英国", specs: "35×45mm" },
  { code: "canada", name: "🇨🇦 加拿大", specs: "35×45mm" },
  { code: "australia", name: "🇦🇺 澳大利亚", specs: "35×45mm" },
  { code: "eu", name: "🇪🇺 欧盟", specs: "48×33mm" },
  { code: "singapore", name: "🇸🇬 新加坡", specs: "35×45mm" },
  { code: "korea", name: "🇰🇷 韩国", specs: "35×45mm" },
  { code: "india", name: "🇮🇳 印度", specs: "50.8×50.8mm" },
  { code: "thailand", name: "🇹🇭 泰国", specs: "35×45mm" },
  { code: "vietnam", name: "🇻🇳 越南", specs: "40×60mm" },
  { code: "malaysia", name: "🇲🇾 马来西亚", specs: "35×45mm" },
  { code: "philippines", name: "🇵🇭 菲律宾", specs: "35×45mm" },
  { code: "indonesia", name: "🇮🇩 印度尼西亚", specs: "35×45mm" },
  { code: "newzealand", name: "🇳🇿 新西兰", specs: "35×45mm" },
  { code: "france", name: "🇫🇷 法国", specs: "35×45mm" },
];

export default function PhotoVisaCountryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const type = params.type as string;
  const [selectedCountry, setSelectedCountry] = useState<string>("usa");

  const handleSelectCountry = (countryCode: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCountry(countryCode);
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: "/photo-edit",
      params: { image, type, country: selectedCountry },
    } as any);
  };

  const selectedCountryData = VISA_COUNTRIES.find(c => c.code === selectedCountry);

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
              选择签证国家
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              选择您要申请签证的国家,我们将自动配置标准尺寸和背景
            </Text>
          </View>

          {/* 国家列表 */}
          <View className="gap-2 mb-8">
            {VISA_COUNTRIES.map((country) => (
              <TouchableOpacity
                key={country.code}
                onPress={() => handleSelectCountry(country.code)}
                activeOpacity={0.7}
                className="rounded-xl p-4 flex-row items-center justify-between"
                style={{
                  backgroundColor: selectedCountry === country.code ? COLORS.accent + '15' : COLORS.white,
                  borderWidth: 2,
                  borderColor: selectedCountry === country.code ? COLORS.accent : COLORS.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View className="flex-1">
                  <Text 
                    style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600', marginBottom: 2 }}
                  >
                    {country.name}
                  </Text>
                  <Text 
                    style={{ color: COLORS.muted, fontSize: 12 }}
                  >
                    {country.specs}
                  </Text>
                </View>
                {selectedCountry === country.code && (
                  <Text style={{ fontSize: 18, color: COLORS.accent }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* 已选择信息 */}
          {selectedCountryData && (
            <View 
              className="rounded-xl p-4 mb-8"
              style={{ backgroundColor: COLORS.accent + '10', borderLeftWidth: 4, borderLeftColor: COLORS.accent }}
            >
              <Text 
                style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600', marginBottom: 4 }}
              >
                ✓ 已选择
              </Text>
              <Text 
                style={{ color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 }}
              >
                {selectedCountryData.name}
              </Text>
              <Text 
                style={{ color: COLORS.muted, fontSize: 12 }}
              >
                配置: {selectedCountryData.specs} | 白色背景
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
