import { ScrollView, Text, View, TouchableOpacity, Platform, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
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

export default function RepairUploadScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handlePickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!selectedImage) {
      alert("请先上传或拍摄照片");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: "/repair-generating",
      params: { image: selectedImage, scale: "2x" },
    } as any);
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
              照片修复
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 14 }}
            >
              上传低分辨率照片,让AI帮您修复清晰
            </Text>
          </View>

          {/* 图片预览区域 */}
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
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={{ width: '100%', height: 400, resizeMode: 'cover' }}
              />
            ) : (
              <View 
                className="items-center justify-center"
                style={{ height: 300, backgroundColor: COLORS.background }}
              >
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔧</Text>
                <Text 
                  style={{ color: COLORS.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}
                >
                  点击或拖拽上传照片
                </Text>
                <Text 
                  style={{ color: COLORS.muted, fontSize: 12 }}
                >
                  支持 JPG、PNG 格式
                </Text>
              </View>
            )}
          </View>

          {/* 提示信息 */}
          <View 
            className="rounded-xl p-4 mb-8"
            style={{ backgroundColor: COLORS.accent + '10', borderLeftWidth: 4, borderLeftColor: COLORS.accent }}
          >
            <Text 
              style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600', marginBottom: 4 }}
            >
              📝 修复建议
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18 }}
            >
              • 支持2倍、4倍超分辨率{"\n"}
              • 自动修复模糊、噪点{"\n"}
              • 保留原始色彩和细节{"\n"}
              • 最大支持 8000×8000 像素
            </Text>
          </View>

          {/* 操作按钮 */}
          <View className="gap-3 mb-8">
            <TouchableOpacity
              onPress={handlePickImage}
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
                📁 从相册选择
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTakePhoto}
              activeOpacity={0.7}
              className="rounded-xl py-4 items-center"
              style={{
                backgroundColor: COLORS.primary,
              }}
            >
              <Text 
                style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}
              >
                📷 拍照上传
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
                返回首页
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.7}
              className="flex-1 rounded-xl py-4 items-center"
              style={{
                backgroundColor: selectedImage ? COLORS.primary : COLORS.border,
              }}
            >
              <Text 
                style={{ 
                  color: selectedImage ? COLORS.white : COLORS.muted, 
                  fontSize: 14, 
                  fontWeight: '600' 
                }}
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
