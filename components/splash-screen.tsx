import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we load
SplashScreen.preventAutoHideAsync();

interface SplashScreenComponentProps {
  onFinish?: () => void;
}

export function SplashScreenComponent({ onFinish }: SplashScreenComponentProps) {
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef(null);

  const player = useVideoPlayer(
    require("@/assets/videos/splash-animation.mp4"),
    (player) => {
      player.loop = false;
      player.play();
    }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      SplashScreen.hideAsync();
      onFinish?.();
    }, 3500); // 3 seconds for video + 500ms buffer

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1a2d4d",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <VideoView
        ref={videoRef}
        player={player}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
        nativeControls={false}
        contentFit="cover"
      />

      {/* Fallback loading indicator if video doesn't load */}
      {!isReady && (
        <View
          style={{
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      )}
    </View>
  );
}
