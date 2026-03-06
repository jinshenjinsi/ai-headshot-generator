import { ScrollView, Text, View, TouchableOpacity, Platform, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useEffect } from "react";
import { getRepairFreeCount } from "@/lib/free-usage-service";

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
  const [repairType, setRepairType] = useState<'upscale' | 'restore'>('upscale');
  const [scale, setScale] = useState<'2x' | '4x'>('2x');
  const [freeCount, setFreeCount] = useState(0);

  useEffect(() => {
    getRepairFreeCount().then(setFreeCount);
  }, []);

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
      params: { image: selectedImage, scale, repairType },
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
              选择修复方式,让AI帮您修复照片
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

          {/* 修复类型选择 */}
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
              选择修复类型
            </Text>
            <Text 
              style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}
            >
              选择适合您照片的修复方式
            </Text>

            <View className="gap-3">
              {[
                { id: 'upscale', name: '📈 超分辨率', desc: '提升分辨率和清晰度' },
                { id: 'restore', name: '✨ 老照片修复', desc: '修复褪色、划痕、噪点' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setRepairType(type.id as 'upscale' | 'restore')}
                  activeOpacity={0.7}
                  className="rounded-lg p-4 flex-row items-center justify-between"
                  style={{
                    backgroundColor: repairType === type.id ? COLORS.accent + '15' : COLORS.background,
                    borderWidth: 1,
                    borderColor: repairType === type.id ? COLORS.accent : COLORS.border,
                  }}
                >
                  <View>
                    <Text 
                      style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600', marginBottom: 2 }}
                    >
                      {type.name}
                    </Text>
                    <Text 
                      style={{ color: COLORS.muted, fontSize: 12 }}
                    >
                      {type.desc}
                    </Text>
                  </View>
                  {repairType === type.id && (
                    <Text style={{ fontSize: 18, color: COLORS.accent }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* 超分倍数选择 */}
            {repairType === 'upscale' && (
              <View className="mt-6 pt-6 border-t" style={{ borderTopColor: COLORS.border }}>
                <Text 
                  style={{ color: COLORS.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 }}
                >
                  选择超分倍数
                </Text>
                <Text 
                  style={{ color: COLORS.muted, fontSize: 12, marginBottom: 4 }}
                >
                  选择合适的放大倍数
                </Text>
                <View className="gap-2 flex-row">
                  {['2x', '4x'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setScale(s as '2x' | '4x')}
                      activeOpacity={0.7}
                      className="flex-1 rounded-lg p-3 items-center"
                      style={{
                        backgroundColor: scale === s ? COLORS.accent : COLORS.background,
                        borderWidth: 1,
                        borderColor: scale === s ? COLORS.accent : COLORS.border,
                      }}
                    >
                      <Text 
                        style={{ 
                          color: scale === s ? COLORS.white : COLORS.text, 
                          fontSize: 14, 
                          fontWeight: '600' 
                        }}
                      >
                        {s}放大
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* 免费次数提醒 */}
          {freeCount > 0 && (
            <View 
              className="rounded-xl p-4 mb-8"
              style={{ backgroundColor: '#D4AF37' + '15', borderLeftWidth: 4, borderLeftColor: COLORS.accent }}
            >
              <Text 
                style={{ color: COLORS.accent, fontSize: 14, fontWeight: '700', marginBottom: 2 }}
              >
                🎁 免费机会
              </Text>
              <Text 
                style={{ color: COLORS.primary, fontSize: 12 }}
              >
                您还有 {freeCount} 次免费修复机会，立即使用吧！
              </Text>
            </View>
          )}

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
              {repairType === 'upscale' ? (
                <>支持2倍、4倍超分辨率{"\n"}提升低分辨率照片清晰度{"\n"}保留原始色彩和细节{"\n"}最大支持 8000×8000 像素</>
              ) : (
                <>修复褪色和色彩偏差{"\n"}去除划痕和污渍{"\n"}降低噪点和颗粒感{"\n"}恢复照片原始质感</>
              )}
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
