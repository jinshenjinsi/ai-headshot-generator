import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

interface ImageEditorProps {
  contrast: number;
  saturation: number;
  sharpness: number;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onSharpnessChange: (value: number) => void;
  onReset: () => void;
}

export function ImageEditor({
  contrast,
  saturation,
  sharpness,
  onContrastChange,
  onSaturationChange,
  onSharpnessChange,
  onReset,
}: ImageEditorProps) {
  const renderSlider = (
    label: string,
    icon: string,
    value: number,
    onMinus: () => void,
    onPlus: () => void,
    barColor: string
  ) => (
    <View>
      <Text style={{ color: "#E5E7EB" }} className="text-sm font-semibold mb-2">
        {icon} {label}
      </Text>
      <View className="flex-row gap-2 items-center">
        <TouchableOpacity
          onPress={onMinus}
          className="px-3 py-1 rounded-lg"
          style={{ backgroundColor: "#374151" }}
        >
          <Text style={{ color: "#9CA3AF" }}>−</Text>
        </TouchableOpacity>
        <View className="flex-1 h-6 rounded-lg" style={{ backgroundColor: "#374151" }}>
          <View
            className="h-full rounded-lg"
            style={{
              width: `${((value - 0.5) / 1) * 100}%`,
              backgroundColor: barColor,
            }}
          />
        </View>
        <TouchableOpacity
          onPress={onPlus}
          className="px-3 py-1 rounded-lg"
          style={{ backgroundColor: "#374151" }}
        >
          <Text style={{ color: "#9CA3AF" }}>+</Text>
        </TouchableOpacity>
        <Text style={{ color: "#9CA3AF" }} className="text-xs w-8 text-right">
          {(value * 100).toFixed(0)}%
        </Text>
      </View>
    </View>
  );

  return (
    <View className="mt-4 gap-4">
      {renderSlider(
        "对比度",
        "🎨",
        contrast,
        () => onContrastChange(Math.max(0.5, contrast - 0.1)),
        () => onContrastChange(Math.min(1.5, contrast + 0.1)),
        "#F59E0B"
      )}

      {renderSlider(
        "饱和度",
        "🌈",
        saturation,
        () => onSaturationChange(Math.max(0.5, saturation - 0.1)),
        () => onSaturationChange(Math.min(1.5, saturation + 0.1)),
        "#EC4899"
      )}

      {renderSlider(
        "锐度",
        "✨",
        sharpness,
        () => onSharpnessChange(Math.max(0.5, sharpness - 0.1)),
        () => onSharpnessChange(Math.min(1.5, sharpness + 0.1)),
        "#06B6D4"
      )}

      <TouchableOpacity
        onPress={onReset}
        className="px-4 py-2 rounded-lg"
        style={{ backgroundColor: "#374151" }}
      >
        <Text style={{ color: "#9CA3AF" }} className="text-xs font-semibold text-center">
          重置高级调整
        </Text>
      </TouchableOpacity>
    </View>
  );
}
