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
}

const STYLES: Style[] = [
  {
    id: "office-boardroom",
    name: "会议室",
    description: "专业会议室背景,正式商务风格",
    category: "办公室",
    prompt: "professional business headshot portrait in modern boardroom setting, business attire, confident expression, corporate lighting, high quality, sharp focus",
  },
  {
    id: "office-lobby",
    name: "办公大堂",
    description: "现代办公楼大堂,简约专业",
    category: "办公室",
    prompt: "professional headshot portrait in modern office lobby, business casual, natural lighting, glass windows background, contemporary architecture, high quality",
  },
  {
    id: "outdoor-city",
    name: "城市街景",
    description: "都市建筑背景,时尚现代",
    category: "户外",
    prompt: "professional headshot portrait outdoors in urban setting, modern buildings background, natural daylight, business casual style, city skyline, high quality",
  },
  {
    id: "outdoor-park",
    name: "公园绿地",
    description: "自然绿色背景,轻松亲和",
    category: "户外",
    prompt: "professional headshot portrait in park setting, greenery background, natural soft lighting, approachable friendly style, outdoor environment, high quality",
  },
  {
    id: "studio-white",
    name: "纯白背景",
    description: "经典白色背景,简洁专业",
    category: "工作室",
    prompt: "professional studio headshot portrait with clean white background, professional studio lighting, minimalist style, sharp focus, high quality",
  },
  {
    id: "studio-gray",
    name: "灰色背景",
    description: "中性灰色背景,沉稳大气",
    category: "工作室",
    prompt: "professional studio headshot portrait with neutral gray background, professional lighting, sophisticated elegant look, corporate style, high quality",
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
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6 pb-6">
          {/* Header */}
          <View>
            <View className="flex-row items-center gap-3 mb-4">
              <View className="flex-1 h-1 bg-primary rounded-full" />
              <View className="flex-1 h-1 bg-primary rounded-full" />
              <View className="flex-1 h-1 bg-border rounded-full" />
            </View>
            
            <Text className="text-3xl font-bold text-foreground">选择风格</Text>
            <Text className="text-base text-muted mt-2">
              选择您喜欢的头像风格和场景
            </Text>
          </View>

          {/* Style Grid */}
          <View className="gap-4">
            {STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                onPress={() => handleStyleSelect(style)}
                activeOpacity={0.7}
                className={`bg-surface rounded-2xl p-4 border-2 ${
                  selectedStyle?.id === style.id ? "border-primary" : "border-transparent"
                }`}
                style={{
                  borderColor: selectedStyle?.id === style.id ? colors.primary : "transparent",
                }}
              >
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-16 h-16 rounded-xl items-center justify-center"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <Text className="text-2xl">
                      {style.category === "办公室" ? "🏢" : 
                       style.category === "户外" ? "🌳" : "📸"}
                    </Text>
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg font-bold text-foreground">
                        {style.name}
                      </Text>
                      <View className="bg-primary/20 px-2 py-1 rounded-md">
                        <Text className="text-xs text-primary font-semibold">
                          {style.category}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-muted mt-1">
                      {style.description}
                    </Text>
                  </View>

                  {selectedStyle?.id === style.id && (
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="text-background text-sm font-bold">✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            onPress={handleGenerate}
            activeOpacity={0.9}
            disabled={!canProceed}
            className={`w-full px-8 py-4 rounded-2xl ${
              canProceed ? "bg-primary" : "bg-border"
            }`}
          >
            <Text
              className={`font-bold text-lg text-center ${
                canProceed ? "text-background" : "text-muted"
              }`}
            >
              生成预览
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
