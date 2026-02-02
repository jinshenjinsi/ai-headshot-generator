import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";

interface Style {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  icon: string;
}

const STYLES: Style[] = [
  {
    id: "office-boardroom",
    name: "会议室",
    description: "专业会议室背景,正式商务风格",
    category: "办公室",
    prompt: "professional business headshot portrait in modern boardroom setting, business attire, confident expression, corporate lighting, high quality, sharp focus",
    icon: "🏢",
  },
  {
    id: "office-lobby",
    name: "办公大堂",
    description: "现代办公楼大堂,简约专业",
    category: "办公室",
    prompt: "professional headshot portrait in modern office lobby, business casual, natural lighting, glass windows background, contemporary architecture, high quality",
    icon: "🏛️",
  },
  {
    id: "outdoor-city",
    name: "城市街景",
    description: "都市建筑背景,时尚现代",
    category: "户外",
    prompt: "professional headshot portrait outdoors in urban setting, modern buildings background, natural daylight, business casual style, city skyline, high quality",
    icon: "🌆",
  },
  {
    id: "outdoor-park",
    name: "公园绿地",
    description: "自然绿色背景,轻松亲和",
    category: "户外",
    prompt: "professional headshot portrait in park setting, greenery background, natural soft lighting, approachable friendly style, outdoor environment, high quality",
    icon: "🌳",
  },
  {
    id: "studio-white",
    name: "纯白背景",
    description: "经典白色背景,简洁专业",
    category: "工作室",
    prompt: "professional studio headshot portrait with clean white background, professional studio lighting, minimalist style, sharp focus, high quality",
    icon: "⚪",
  },
  {
    id: "studio-gray",
    name: "灰色背景",
    description: "中性灰色背景,沉稳大气",
    category: "工作室",
    prompt: "professional studio headshot portrait with neutral gray background, professional lighting, sophisticated elegant look, corporate style, high quality",
    icon: "⚫",
  },
];

export default function StyleSelectionScreen() {
  const router = useRouter();
  const colors = useColors();
  const { selectedStyle, setSelectedStyle } = useApp();

  const handleStyleSelect = (style: Style) => {
    setSelectedStyle(style);
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleGenerate = () => {
    if (!selectedStyle) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    router.push("/generating" as any);
  };

  const canProceed = selectedStyle !== null;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-8 py-8 px-6 pb-12">
          {/* Elegant Header */}
          <View>
            {/* Progress Indicator */}
            <View className="flex-row items-center gap-3 mb-6">
              <View 
                className="flex-1 h-1 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              <View 
                className="flex-1 h-1 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              <View 
                className="flex-1 h-1 rounded-full opacity-20"
                style={{ backgroundColor: colors.primary }}
              />
            </View>
            
            <Text 
              className="text-4xl font-bold mb-3"
              style={{ 
                color: colors.foreground,
                fontWeight: '800',
                letterSpacing: -0.5,
              }}
            >
              选择专业风格
            </Text>
            <Text 
              className="text-lg leading-relaxed"
              style={{ color: colors.muted }}
            >
              精选6种顶级场景风格{"\n"}
              打造独一无二的专业形象
            </Text>
          </View>

          {/* Premium Style Cards */}
          <View className="gap-4">
            {STYLES.map((style) => {
              const isSelected = selectedStyle?.id === style.id;
              
              return (
                <TouchableOpacity
                  key={style.id}
                  onPress={() => handleStyleSelect(style)}
                  activeOpacity={0.8}
                  className="rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : 'transparent',
                    shadowColor: isSelected ? colors.primary : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isSelected ? 0.3 : 0.05,
                    shadowRadius: isSelected ? 16 : 8,
                    elevation: isSelected ? 8 : 2,
                  }}
                >
                  <View className="flex-row items-center gap-5 p-5">
                    {/* Icon */}
                    <View 
                      className="w-20 h-20 rounded-2xl items-center justify-center"
                      style={{ 
                        backgroundColor: isSelected 
                          ? colors.primary + '25' 
                          : colors.primary + '10'
                      }}
                    >
                      <Text className="text-4xl">{style.icon}</Text>
                    </View>
                    
                    {/* Content */}
                    <View className="flex-1 gap-2">
                      <View className="flex-row items-center gap-3">
                        <Text 
                          className="text-xl font-bold"
                          style={{ color: colors.foreground }}
                        >
                          {style.name}
                        </Text>
                        <View 
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: colors.primary + '20' }}
                        >
                          <Text 
                            className="text-xs font-semibold"
                            style={{ color: colors.primary }}
                          >
                            {style.category}
                          </Text>
                        </View>
                      </View>
                      <Text 
                        className="text-sm leading-relaxed"
                        style={{ color: colors.muted }}
                      >
                        {style.description}
                      </Text>
                    </View>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <View 
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text className="text-white text-lg font-bold">✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Premium Generate Button */}
          <TouchableOpacity
            onPress={handleGenerate}
            activeOpacity={0.9}
            disabled={!canProceed}
            className="w-full rounded-2xl overflow-hidden mt-4"
            style={{
              backgroundColor: canProceed ? colors.primary : colors.border,
              shadowColor: canProceed ? colors.primary : 'transparent',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: canProceed ? 8 : 0,
            }}
          >
            <View className="w-full px-8 py-5">
              <Text 
                className="font-bold text-xl text-center"
                style={{ 
                  color: canProceed ? colors.background : colors.muted,
                  fontWeight: '700',
                }}
              >
                开始生成专业头像
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
