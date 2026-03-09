import { useEffect, useState } from "react";
import { Alert, Platform, Linking } from "react-native";
import { trpc } from "@/lib/trpc";

interface UpdateInfo {
  version: string;
  downloadUrl: string;
  updateAvailable: boolean;
  message: string;
}

export function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const checkVersionQuery = trpc.system.checkVersion.useQuery();

  useEffect(() => {
    if (checkVersionQuery.data) {
      setUpdateInfo(checkVersionQuery.data);
      
      // Show update dialog if update is available
      if (checkVersionQuery.data.updateAvailable) {
        showUpdateDialog(checkVersionQuery.data);
      }
    }
  }, [checkVersionQuery.data]);

  const showUpdateDialog = (info: UpdateInfo) => {
    Alert.alert(
      "新版本可用",
      `有新版本 ${info.version} 可用。${info.message}`,
      [
        {
          text: "稍后",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "更新",
          onPress: () => downloadAndInstallAPK(info.downloadUrl),
          style: "default",
        },
      ]
    );
  };

  const downloadAndInstallAPK = async (downloadUrl: string) => {
    try {
      setIsDownloading(true);
      
      // Only support Android
      if (Platform.OS !== "android") {
        Alert.alert("提示", "此功能仅支持Android设备");
        return;
      }

      console.log("[Update] Opening download URL:", downloadUrl);
      
      // Open the download URL in browser/system downloader
      const canOpen = await Linking.canOpenURL(downloadUrl);
      
      if (canOpen) {
        await Linking.openURL(downloadUrl);
        Alert.alert(
          "下载已开始",
          "APK文件已开始下载。下载完成后，点击安装按钮进行安装。"
        );
      } else {
        Alert.alert("错误", "无法打开下载链接");
      }
      
    } catch (error) {
      console.error("[Update] Error:", error);
      Alert.alert("更新失败", `错误: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    updateInfo,
    isDownloading,
    checkVersion: () => checkVersionQuery.refetch(),
  };
}
