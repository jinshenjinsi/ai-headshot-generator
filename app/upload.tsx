import { useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Image, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";

const MIN_PHOTOS = 5;
const MAX_PHOTOS = 15;

export default function UploadScreen() {
  const router = useRouter();
  const colors = useColors();
  const { photos, setPhotos } = useApp();

  // Reset photos when entering this screen
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    router.push("/style-selection" as any);
  };

  const canProceed = photos.length >= MIN_PHOTOS;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <View className="flex-row items-center gap-3 mb-4">
              <View className="flex-1 h-1 bg-primary rounded-full" />
              <View className="flex-1 h-1 bg-border rounded-full" />
              <View className="flex-1 h-1 bg-border rounded-full" />
            </View>
            
            <Text className="text-3xl font-bold text-foreground">上传照片</Text>
            <Text className="text-base text-muted mt-2">
              至少上传{MIN_PHOTOS}张照片,建议{MIN_PHOTOS}-{MAX_PHOTOS}张以获得最佳效果
            </Text>
            <Text className="text-sm text-muted mt-1">
              已上传: {photos.length}/{MAX_PHOTOS}
            </Text>
          </View>

          {/* Photo Grid */}
          <View className="flex-row flex-wrap gap-3">
            {photos.map((photo, index) => (
              <View key={index} className="relative" style={{ width: "30%" }}>
                <Image
                  source={{ uri: photo }}
                  className="w-full aspect-square rounded-xl"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removePhoto(index)}
                  activeOpacity={0.7}
                  className="absolute top-2 right-2 w-8 h-8 bg-error rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.error }}
                >
                  <Text className="text-background font-bold">×</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Add Photo Button */}
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity
                onPress={pickImages}
                activeOpacity={0.7}
                className="border-2 border-dashed border-border rounded-xl items-center justify-center"
                style={{ width: "30%", aspectRatio: 1 }}
              >
                <IconSymbol size={32} name="plus.circle.fill" color={colors.primary} />
                <Text className="text-xs text-muted mt-2">添加照片</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tips */}
          <View className="bg-surface rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">拍照建议:</Text>
            <View className="gap-2">
              <Text className="text-sm text-muted">• 确保光线充足,面部清晰</Text>
              <Text className="text-sm text-muted">• 包含多个角度(正面、侧面)</Text>
              <Text className="text-sm text-muted">• 避免戴帽子或墨镜</Text>
              <Text className="text-sm text-muted">• 不要有其他人出现在照片中</Text>
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNext}
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
              下一步
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
