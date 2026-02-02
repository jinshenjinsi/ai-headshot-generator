import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function GalleryScreen() {
  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">我的头像</Text>
            <Text className="text-base text-muted mt-2">
              查看您生成的所有专业头像
            </Text>
          </View>

          <View className="items-center justify-center flex-1">
            <Text className="text-muted text-center">
              还没有生成任何头像{"\n"}
              从首页开始创建您的第一张专业头像
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
