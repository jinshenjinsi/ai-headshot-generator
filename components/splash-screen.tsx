import React, { useEffect, useState } from "react";
import { View, Image, Animated, Easing } from "react-native";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we load
SplashScreen.preventAutoHideAsync();

interface SplashScreenComponentProps {
  onFinish?: () => void;
}

export function SplashScreenComponent({ onFinish }: SplashScreenComponentProps) {
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animation immediately
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setIsReady(true);
      SplashScreen.hideAsync();
      onFinish?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish, fadeAnim, scaleAnim]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1a2d4d",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("@/assets/images/yuanyi-icon.png")}
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            marginBottom: 20,
          }}
        />
        <View
          style={{
            alignItems: "center",
          }}
        >
          <Animated.Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#D4AF37",
              opacity: fadeAnim,
              marginBottom: 8,
            }}
          >
            元一图灵
          </Animated.Text>
          <Animated.Text
            style={{
              fontSize: 14,
              color: "#FFFFFF",
              opacity: fadeAnim,
            }}
          >
            专业证件照一键生成
          </Animated.Text>
        </View>
      </Animated.View>
    </View>
  );
}
