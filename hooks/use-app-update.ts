import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
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

      // Download APK to cache directory
      const fileName = `ai-headshot-${Date.now()}.apk`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      console.log("[Update] Downloading APK from:", downloadUrl);
      console.log("[Update] Saving to:", fileUri);

      const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri);
      
      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      console.log("[Update] Download successful");
      
      // Install APK
      await installAPK(fileUri);
      
    } catch (error) {
      console.error("[Update] Error:", error);
      Alert.alert("更新失败", `下载或安装失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const installAPK = async (apkPath: string) => {
    try {
      console.log("[Update] Installing APK from:", apkPath);
      
      // Use Intent Launcher to open the APK for installation
      if (Platform.OS === "android") {
        const fileUri = `file://${apkPath}`;
        
        // Use the package installer intent
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.INSTALL_PACKAGE,
          {
            data: fileUri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          }
        );
        
        console.log("[Update] Installation initiated");
      }
    } catch (error) {
      console.error("[Update] Installation error:", error);
      throw error;
    }
  };

  return {
    updateInfo,
    isDownloading,
    checkVersion: () => checkVersionQuery.refetch(),
  };
}
