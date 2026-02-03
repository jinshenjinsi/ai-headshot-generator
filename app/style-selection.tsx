import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
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
  exampleImage: any;
  background: "white" | "black" | "neutral" | "gray" | "office";
  gender?: "none" | "male" | "female";
}

const STYLES: Style[] = [
  {
    id: "office-boardroom",
    name: "会议室",
    description: "专业会议室背景,正式商务风格",
    category: "办公室",
    prompt: "Professional corporate headshot photo. Character: this person with their exact face. Setting: modern glass-walled boardroom with blurred meeting table. Attire: dark navy business suit, white dress shirt, solid color tie. Lighting: bright overhead LED lights creating sharp shadows, high contrast. Expression: confident and authoritative. Camera: 85mm lens, f/2.8, sharp focus on face. Style: corporate executive portrait, formal and powerful.",
    icon: "🏢",
    exampleImage: require("@/assets/images/example-boardroom.jpg"),
    background: "office",
  },
  {
    id: "office-lobby",
    name: "办公大堂",
    description: "现代办公楼大堂,简约专业",
    category: "办公室",
    prompt: "Professional business casual headshot. Character: this person with their exact face. Setting: bright modern office lobby with floor-to-ceiling windows, natural daylight streaming in. Attire: light blue button-down shirt, no tie, smart casual. Lighting: soft natural window light from side, minimal shadows, bright and airy. Expression: friendly and approachable. Camera: 50mm lens, f/1.8, natural depth of field. Style: contemporary professional, warm and inviting.",
    icon: "🏛️",
    exampleImage: require("@/assets/images/example-office-lobby.jpg"),
    background: "office",
  },
  {
    id: "outdoor-city",
    name: "城市街景",
    description: "都市建筑背景,时尚现代",
    category: "户外",
    prompt: "Urban professional outdoor portrait. Character: this person with their exact face. Setting: city street with modern skyscrapers and glass buildings in background, slightly blurred. Attire: charcoal gray blazer over white shirt, open collar, modern business style. Lighting: golden hour sunlight from 45-degree angle, warm glow on face, soft shadows. Expression: confident and dynamic. Camera: 70mm lens, f/2.0, shallow depth of field. Style: editorial fashion meets corporate, energetic and contemporary.",
    icon: "🌆",
    exampleImage: require("@/assets/images/example-city.jpg"),
    background: "neutral",
  },
  {
    id: "outdoor-park",
    name: "公园绿地",
    description: "自然绿色背景,轻松亲和",
    category: "户外",
    prompt: "Natural outdoor professional portrait. Character: this person with their exact face. Setting: lush green park with trees and foliage, soft bokeh background. Attire: light-colored blazer or cardigan, casual shirt, relaxed professional look. Lighting: diffused natural daylight through tree canopy, soft and flattering, no harsh shadows. Expression: warm smile, friendly and approachable. Camera: 85mm lens, f/1.4, beautiful bokeh. Style: lifestyle professional, natural and authentic.",
    icon: "🌳",
    exampleImage: require("@/assets/images/example-park.jpg"),
    background: "neutral",
  },
  {
    id: "studio-white",
    name: "纯白背景",
    description: "经典白色背景,简洁专业",
    category: "工作室",
    prompt: "Classic studio headshot with pure white backdrop. Character: this person with their exact face. Setting: seamless white background, completely uniform. Attire: formal dark suit or professional attire, crisp and clean. Lighting: three-point studio lighting setup - key light from front-left, fill light from right, rim light from back, creating dimension while minimizing shadows. Expression: neutral professional, slight smile. Camera: 105mm lens, f/5.6, everything in sharp focus. Style: traditional ID photo / corporate directory, clean and standardized.",
    icon: "⚪",
    exampleImage: require("@/assets/images/example-white.jpg"),
    background: "white",
  },
  {
    id: "studio-gray",
    name: "灰色背景",
    description: "中性灰色背景,沉稳大气",
    category: "工作室",
    prompt: "Sophisticated studio portrait with gray backdrop. Character: this person with their exact face. Setting: medium gray seamless background with subtle gradient. Attire: tailored charcoal or black suit, elegant and refined. Lighting: dramatic Rembrandt lighting - single key light from 45-degree angle creating triangle of light on cheek, deep shadows for depth and character. Expression: serious and contemplative, professional gravitas. Camera: 135mm lens, f/4.0, compressed perspective. Style: fine art portrait meets corporate, dramatic and distinguished.",
    icon: "⚫",
    exampleImage: require("@/assets/images/example-gray.jpg"),
    background: "gray",
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

          {/* Premium Style Cards with Examples */}
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
                  <View className="flex-row items-center gap-4 p-4">
                    {/* Example Image */}
                    <View 
                      className="rounded-2xl overflow-hidden"
                      style={{
                        width: 90,
                        height: 120,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                      }}
                    >
                      <Image
                        source={style.exampleImage}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    </View>
                    
                    {/* Content */}
                    <View className="flex-1 gap-2">
                      <View className="flex-row items-center gap-3">
                        <Text className="text-2xl">{style.icon}</Text>
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
