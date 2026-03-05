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

export default function RepairResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;

  const [selectedScale, setSelectedScale] = useState("2x");
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
            onPress={() => {
              // 回到上传页面而不是生成页面
              router.replace({
                pathname: "/repair-upload",
              } as any);
            }}
            className="mb-6"
            activeOpacity={0.7}
          >
            <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600' }}>
              ← 上一步
            </Text>
          </TouchableOpacity>

          {/* 页面标题 */}
          <View className="mb-8">
            <Text 
              style={{ color: COLORS.primary, fontSize: 28, fontWeight: '800', marginBottom: 8 }}
            >
              照片修复完成
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              您的照片已修复,可以选择倍数并下载
            </Text>
          </View>

          {/* 修复结果对比 */}
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
            <View className="flex-row">
              <View className="flex-1 items-center">
                <Text 
                  style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600', padding: 8 }}
                >
                  原始照片
                </Text>
                <Image
                  source={{ uri: image }}
                  style={{ width: '100%', height: 200, resizeMode: 'cover' }}
                />
              </View>
              <View 
                style={{ width: 1, backgroundColor: COLORS.border }} 
              />
              <View className="flex-1 items-center relative">
                <Text 
                  style={{ color: COLORS.accent, fontSize: 12, fontWeight: '600', padding: 8 }}
                >
                  修复后 ({selectedScale})
                </Text>
                <Image
                  source={{ uri: image }}
                  style={{ width: '100%', height: 200, resizeMode: 'cover' }}
                />
                {showAdjustments && (
                  <View 
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                    }}
                  >
                    <View style={{ marginBottom: 8 }}>
                      <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: '600', marginBottom: 4 }}>
                        亮: {brightness}%
                      </Text>
                      <View 
                        style={{
                          height: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <View 
                          style={{
                            height: '100%',
                            width: `${brightness}%`,
                            backgroundColor: COLORS.accent,
                          }}
                        />
                      </View>
                    </View>

                    <View>
                      <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: '600', marginBottom: 4 }}>
                        对: {contrast}%
                      </Text>
                      <View 
                        style={{
                          height: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <View 
                          style={{
                            height: '100%',
                            width: `${contrast}%`,
                            backgroundColor: COLORS.accent,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* 色彩调整 */}
          <TouchableOpacity
            onPress={() => setShowAdjustments(!showAdjustments)}
            activeOpacity={0.7}
            className="rounded-lg py-3 px-4 mb-6 items-center flex-row justify-center gap-2"
            style={{
              backgroundColor: showAdjustments ? COLORS.accent : COLORS.primary,
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}>
              {showAdjustments ? '✓ 色彩调整中' : '🎨 色彩调整'}
            </Text>
          </TouchableOpacity>

          {/* 修复倍数选择 */}
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
              选择修复倍数
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}
            >
              更高倍数获得更清晰的效果
            </Text>

            <View className="gap-2">
              {[
                { id: "2x", name: "2倍超分", desc: "标准清晰度" },
                { id: "4x", name: "4倍超分", desc: "超高清晰度" },
              ].map((scale) => (
                <TouchableOpacity
                  key={scale.id}
                  onPress={() => setSelectedScale(scale.id)}
                  activeOpacity={0.7}
                  className="rounded-lg p-3 flex-row items-center justify-between"
                  style={{
                    backgroundColor: selectedScale === scale.id ? COLORS.accent + '15' : COLORS.background,
                    borderWidth: 1,
                    borderColor: selectedScale === scale.id ? COLORS.accent : COLORS.border,
                  }}
                >
                  <View>
                    <Text 
                      style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600', marginBottom: 2 }}
                    >
                      {scale.name}
                    </Text>
                    <Text 
                      style={{ color: COLORS.muted, fontSize: 12 }}
                    >
                      {scale.desc}
                    </Text>
                  </View>
                  {selectedScale === scale.id && (
                    <Text style={{ fontSize: 18, color: COLORS.accent }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 修复信息 */}
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
              修复详情
            </Text>
            
            <View className="gap-3">
              {[
                { icon: "🔍", title: "清晰度提升", desc: "自动修复模糊和噪点" },
                { icon: "🎨", title: "色彩还原", desc: "保留原始色彩信息" },
                { icon: "⚡", title: "快速处理", desc: "30秒内完成修复" },
              ].map((item, index) => (
                <View key={index} className="flex-row items-start gap-3">
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  <View className="flex-1">
                    <Text 
                      style={{ color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 }}
                    >
                      {item.title}
                    </Text>
                    <Text 
                      style={{ color: COLORS.muted, fontSize: 12 }}
                    >
                      {item.desc}
                    </Text>
                  </View>
                </View>
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
                💾 下载高清版 ¥2.9
              </Text>
            </TouchableOpacity>
          </View>

          {/* 底部导航 */}
          <View className="flex-row gap-3 mb-8">
            <TouchableOpacity
              onPress={() => {
                // 回到上传页面
                router.replace({
                  pathname: "/repair-upload",
                } as any);
              }}
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
                重新修复
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
