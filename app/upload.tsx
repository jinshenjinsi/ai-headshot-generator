import { useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Image, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";

const MIN_PHOTOS = 5;
const MAX_PHOTOS = 15;

export default function UploadScreen() {
  const router = useRouter();
  const colors = useColors();
  const { photos, setPhotos } = useApp();

  useEffect(() => {
    setPhotos([]);
  }, []);

  const pickImages = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert("提示", `最多只能上传${MAX_PHOTOS}张照片`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_PHOTOS - photos.length,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos([...photos, ...newPhotos]);
      
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (photos.length < MIN_PHOTOS) {
      Alert.alert("提示", `请至少上传${MIN_PHOTOS}张照片`);
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    router.push("/style-selection" as any);
  };

  const canProceed = photos.length >= MIN_PHOTOS;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-8 py-8 px-6">
          {/* Elegant Header */}
          <View>
            {/* Progress Indicator */}
            <View className="flex-row items-center gap-3 mb-6">
              <View 
                className="flex-1 h-1 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              <View 
                className="flex-1 h-1 rounded-full opacity-20"
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
              上传您的照片
            </Text>
            <Text 
              className="text-lg leading-relaxed"
              style={{ color: colors.muted }}
            >
              至少{MIN_PHOTOS}张,建议{MIN_PHOTOS}-{MAX_PHOTOS}张照片{"\n"}
              以获得最佳AI生成效果
            </Text>
            
            {/* Photo Counter */}
            <View 
              className="mt-4 self-start px-4 py-2 rounded-full"
              style={{ backgroundColor: colors.primary + '15' }}
            >
              <Text 
                className="text-sm font-semibold"
                style={{ color: colors.primary }}
              >
                已上传 {photos.length}/{MAX_PHOTOS}
              </Text>
            </View>
          </View>

          {/* Premium Photo Grid */}
          <View className="flex-row flex-wrap gap-4">
            {photos.map((photo, index) => (
              <View 
                key={index} 
                className="relative rounded-2xl overflow-hidden"
                style={{ 
                  width: "30%",
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Image
                  source={{ uri: photo }}
                  className="w-full aspect-square"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removePhoto(index)}
                  activeOpacity={0.8}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center"
                  style={{ 
                    backgroundColor: colors.error,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                  }}
                >
                  <Text className="text-white font-bold text-lg">×</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Premium Add Button */}
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity
                onPress={pickImages}
                activeOpacity={0.8}
                className="border-2 rounded-2xl items-center justify-center"
                style={{ 
                  width: "30%", 
                  aspectRatio: 1,
                  borderColor: colors.primary + '40',
                  borderStyle: 'dashed',
                  backgroundColor: colors.surface,
                }}
              >
                <Text className="text-4xl mb-2">+</Text>
                <Text 
                  className="text-xs font-semibold"
                  style={{ color: colors.primary }}
                >
                  添加照片
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Premium Tips Card */}
          <View 
            className="rounded-3xl p-6 gap-4"
            style={{ 
              backgroundColor: colors.surface,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center gap-3">
              <View 
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Text className="text-xl">💡</Text>
              </View>
              <Text 
                className="text-lg font-bold flex-1"
                style={{ color: colors.foreground }}
              >
                专业拍摄建议
              </Text>
            </View>
            
            <View className="gap-3 ml-13">
              {[
                "光线充足,面部清晰可见",
                "包含正面、侧面等多角度",
                "避免佩戴帽子或墨镜",
                "照片中仅有您一人",
              ].map((tip, index) => (
                <View key={index} className="flex-row items-start gap-3">
                  <View 
                    className="w-1.5 h-1.5 rounded-full mt-2"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <Text 
                    className="text-base flex-1"
                    style={{ color: colors.muted }}
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Premium Next Button */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            disabled={!canProceed}
            className="w-full rounded-2xl overflow-hidden"
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
                下一步：选择风格
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
