import { ScrollView, Text, View, TouchableOpacity, Platform, Image } from "react-native";
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

const STYLE_NAMES: Record<string, string> = {
  professional: "专业",
  oil: "油画",
  watercolor: "水彩",
  sketch: "素描",
  cartoon: "卡通",
  anime: "动漫",
  minimal: "极简",
  retro: "复古",
  neon: "霓虹",
  art: "艺术",
};

export default function StyleResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const style = params.style as string;

  const [selectedFormat, setSelectedFormat] = useState("png");

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
              美照生成完成
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              您的美照已生成,可以下载或继续编辑
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
            <Image
              source={{ uri: image }}
              style={{ width: '100%', height: 400, resizeMode: 'cover' }}
            />
            <View className="p-4" style={{ backgroundColor: COLORS.background }}>
              <Text 
                style={{ color: COLORS.text, fontSize: 12, fontWeight: '600', marginBottom: 4 }}
              >
                🎨 生成信息
              </Text>
              <Text 
                style={{ color: COLORS.muted, fontSize: 11 }}
              >
                风格: {STYLE_NAMES[style] || style} | 分辨率: 1024×1024 | 格式: PNG
              </Text>
            </View>
          </View>

          {/* 其他风格预览 */}
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
              尝试其他风格
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}
            >
              同一张照片,10种风格任意转换
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {["professional", "oil", "watercolor", "sketch", "cartoon", "anime", "minimal", "retro", "neon", "art"].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    router.push({
                      pathname: "/style-edit",
                      params: { image, style: s },
                    } as any);
                  }}
                  activeOpacity={0.7}
                  className="rounded-lg px-3 py-2"
                  style={{
                    backgroundColor: s === style ? COLORS.accent : COLORS.border,
                  }}
                >
                  <Text 
                    style={{ 
                      color: s === style ? COLORS.white : COLORS.text, 
                      fontSize: 12, 
                      fontWeight: '600' 
                    }}
                  >
                    {STYLE_NAMES[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 导出格式 */}
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
              导出格式
            </Text>
            <View className="gap-2">
              {[
                { id: "png", name: "PNG (无损)" },
                { id: "jpg", name: "JPG (压缩)" },
                { id: "webp", name: "WebP (最优)" },
              ].map((format) => (
                <TouchableOpacity
                  key={format.id}
                  onPress={() => setSelectedFormat(format.id)}
                  activeOpacity={0.7}
                  className="rounded-lg p-3 flex-row items-center justify-between"
                  style={{
                    backgroundColor: selectedFormat === format.id ? COLORS.accent + '15' : COLORS.background,
                    borderWidth: 1,
                    borderColor: selectedFormat === format.id ? COLORS.accent : COLORS.border,
                  }}
                >
                  <Text 
                    style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}
                  >
                    {format.name}
                  </Text>
                  {selectedFormat === format.id && (
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
                💾 下载高清版 ¥3.9
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
