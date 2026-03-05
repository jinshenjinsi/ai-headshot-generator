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

export default function RepairResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const image = params.image as string;
  const repairType = params.repairType as string;

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

  // 获取修复后图片的显示效果
  const getImageStyle = () => {
    const baseStyle: any = {
      width: "100%",
      height: 200,
      resizeMode: "cover",
    };

    // 应用亮度和对比度滤镜
    if (Platform.OS === "web") {
      baseStyle.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    } else {
      // React Native 不直接支持 filter，但可以通过 opacity 和其他属性模拟
      baseStyle.opacity = brightness / 100;
    }

    // 如果是老照片修复，不添加底色
    if (repairType === "enhance") {
      // 不添加任何额外效果
    }

    return baseStyle;
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 py-6 px-4">
          {/* 返回按钮 */}
          <TouchableOpacity
            onPress={() => {
              router.replace({
                pathname: "/repair-upload",
              } as any);
            }}
            className="mb-6"
            activeOpacity={0.7}
          >
            <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: "600" }}>
              ← 上一步
            </Text>
          </TouchableOpacity>

          {/* 页面标题 */}
          <View className="mb-8">
            <Text
              style={{ color: COLORS.primary, fontSize: 28, fontWeight: "800", marginBottom: 8 }}
            >
              照片修复完成
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 14 }}>
              您的照片已修复，可以选择倍数并下载
            </Text>
          </View>

          {/* 修复结果对比 */}
          <View
            className="rounded-2xl mb-8 overflow-hidden"
            style={{
              backgroundColor: COLORS.white,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row">
              {/* 原始照片 */}
              <View className="flex-1 items-center">
                <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: "600", padding: 8 }}>
                  原始照片
                </Text>
                <Image source={{ uri: image }} style={{ width: "100%", height: 200, resizeMode: "cover" }} />
              </View>

              {/* 分割线 */}
              <View style={{ width: 1, backgroundColor: COLORS.border }} />

              {/* 修复后照片 */}
              <View className="flex-1 items-center relative">
                <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: "600", padding: 8 }}>
                  修复后 ({selectedScale})
                </Text>
                <View
                  style={{
                    width: "100%",
                    height: 200,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Image source={{ uri: image }} style={getImageStyle()} />

                  {/* 色彩调整面板 */}
                  {showAdjustments && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        gap: 12,
                      }}
                    >
                      {/* 亮度调整 */}
                      <View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                          <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: "600" }}>
                            亮度
                          </Text>
                          <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: "600" }}>
                            {brightness}%
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 4 }}>
                          {[70, 85, 100, 115, 130].map((val) => (
                            <TouchableOpacity
                              key={val}
                              onPress={() => setBrightness(val)}
                              style={{
                                flex: 1,
                                paddingVertical: 6,
                                backgroundColor: brightness === val ? COLORS.accent : "rgba(255, 255, 255, 0.2)",
                                borderRadius: 4,
                                alignItems: "center",
                              }}
                            >
                              <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: "600" }}>
                                {val}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* 对比度调整 */}
                      <View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                          <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: "600" }}>
                            对比度
                          </Text>
                          <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: "600" }}>
                            {contrast}%
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 4 }}>
                          {[70, 85, 100, 115, 130].map((val) => (
                            <TouchableOpacity
                              key={val}
                              onPress={() => setContrast(val)}
                              style={{
                                flex: 1,
                                paddingVertical: 6,
                                backgroundColor: contrast === val ? COLORS.accent : "rgba(255, 255, 255, 0.2)",
                                borderRadius: 4,
                                alignItems: "center",
                              }}
                            >
                              <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: "600" }}>
                                {val}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* 色彩调整按钮 */}
          <TouchableOpacity
            onPress={() => setShowAdjustments(!showAdjustments)}
            activeOpacity={0.7}
            className="rounded-lg py-3 px-4 mb-6 items-center flex-row justify-center gap-2"
            style={{
              backgroundColor: showAdjustments ? COLORS.accent : COLORS.primary,
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: "600" }}>
              {showAdjustments ? "✓ 色彩调整中" : "🎨 色彩调整"}
            </Text>
          </TouchableOpacity>

          {/* 修复倍数选择 */}
          <View
            className="rounded-2xl p-6 mb-8"
            style={{
              backgroundColor: COLORS.white,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text style={{ color: COLORS.primary, fontSize: 18, fontWeight: "700", marginBottom: 4 }}>
              选择修复倍数
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}>
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
                    backgroundColor: selectedScale === scale.id ? COLORS.accent + "15" : COLORS.background,
                    borderWidth: 1,
                    borderColor: selectedScale === scale.id ? COLORS.accent : COLORS.border,
                  }}
                >
                  <View>
                    <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: "600", marginBottom: 2 }}>
                      {scale.name}
                    </Text>
                    <Text style={{ color: COLORS.muted, fontSize: 12 }}>
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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text style={{ color: COLORS.primary, fontSize: 18, fontWeight: "700", marginBottom: 4 }}>
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
                    <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: "600", marginBottom: 2 }}>
                      {item.title}
                    </Text>
                    <Text style={{ color: COLORS.muted, fontSize: 12 }}>
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
              <Text style={{ color: COLORS.accent, fontSize: 16, fontWeight: "600" }}>
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
              <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: "600" }}>
                💾 下载高清版 ¥2.9
              </Text>
            </TouchableOpacity>
          </View>

          {/* 底部导航 */}
          <View className="flex-row gap-3 mb-8">
            <TouchableOpacity
              onPress={() => {
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
              <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: "600" }}>
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
              <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: "600" }}>
                返回首页
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
