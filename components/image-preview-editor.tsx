import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { applyFiltersToImage, type ImageFilters } from "@/lib/image-processor";

interface ImagePreviewEditorProps {
  imageUrl: string;
  filters: ImageFilters;
  onFiltersChange: (filters: ImageFilters) => void;
}

/**
 * 图片编辑预览组件
 * 仅在Web平台上使用,用于实时预览编辑效果
 */
export function ImagePreviewEditor({
  imageUrl,
  filters,
  onFiltersChange,
}: ImagePreviewEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>("");

  // 当滤镜改变时,重新处理图片
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const updatePreview = async () => {
      setIsProcessing(true);
      try {
        const result = await applyFiltersToImage(imageUrl, filters);
        setProcessedImageUrl(result);
      } catch (error) {
        console.error("Failed to process image:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    // 防抖处理,避免频繁重绘
    const timer = setTimeout(updatePreview, 300);
    return () => clearTimeout(timer);
  }, [filters, imageUrl]);

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View className="mt-4 gap-4">
      {/* 预览容器 */}
      <View className="rounded-xl overflow-hidden" style={{ backgroundColor: "#1F2937" }}>
        {isProcessing && (
          <View className="absolute inset-0 items-center justify-center z-10" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        )}
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
        {processedImageUrl && (
          <img
            src={processedImageUrl}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
            alt="Preview"
          />
        )}
      </View>

      {/* 编辑控件提示 */}
      {isProcessing && (
        <Text className="text-xs text-center" style={{ color: "#9CA3AF" }}>
          处理中...
        </Text>
      )}
    </View>
  );
}
