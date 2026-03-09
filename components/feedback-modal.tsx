import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const COLORS = {
  primary: "#1A365D",
  accent: "#D4AF37",
  background: "#F5F7FA",
  white: "#FFFFFF",
  text: "#2D3748",
  muted: "#718096",
  border: "#E2E8F0",
  success: "#22C55E",
  error: "#EF4444",
};

export function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "general">("general");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedbackMutation = trpc.system.submitFeedback.useMutation();

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("提示", "请输入反馈标题");
      return;
    }

    if (!content.trim()) {
      Alert.alert("提示", "请输入反馈内容");
      return;
    }

    try {
      setIsSubmitting(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await submitFeedbackMutation.mutateAsync({
        type: feedbackType,
        title: title.trim(),
        content: content.trim(),
        email: email.trim() || undefined,
      });

      Alert.alert("感谢！", "您的反馈已成功提交，我们会认真考虑您的建议。");
      handleReset();
      onClose();
    } catch (error) {
      console.error("[Feedback] Error:", error);
      Alert.alert("错误", `提交失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFeedbackType("general");
    setTitle("");
    setContent("");
    setEmail("");
  };

  const FeedbackTypeButton = ({
    type,
    label,
  }: {
    type: "bug" | "feature" | "general";
    label: string;
  }) => (
    <TouchableOpacity
      onPress={() => setFeedbackType(type)}
      activeOpacity={0.7}
      className="flex-1 rounded-lg py-3 items-center"
      style={{
        backgroundColor: feedbackType === type ? COLORS.primary : COLORS.background,
        borderWidth: 1,
        borderColor: feedbackType === type ? COLORS.primary : COLORS.border,
      }}
    >
      <Text
        style={{
          color: feedbackType === type ? COLORS.white : COLORS.text,
          fontSize: 13,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.white,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "90%",
            paddingTop: 24,
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: COLORS.primary,
                }}
              >
                意见反馈
              </Text>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                className="p-2"
              >
                <Text style={{ fontSize: 24, color: COLORS.muted }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Feedback Type Selection */}
            <View className="mb-6">
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: COLORS.text,
                  marginBottom: 10,
                }}
              >
                反馈类型
              </Text>
              <View className="flex-row gap-3">
                <FeedbackTypeButton type="bug" label="🐛 Bug" />
                <FeedbackTypeButton type="feature" label="✨ 功能" />
                <FeedbackTypeButton type="general" label="💬 其他" />
              </View>
            </View>

            {/* Title Input */}
            <View className="mb-6">
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: COLORS.text,
                  marginBottom: 8,
                }}
              >
                标题 *
              </Text>
              <TextInput
                placeholder="请输入反馈标题"
                placeholderTextColor={COLORS.muted}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: COLORS.text,
                  backgroundColor: COLORS.background,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.muted,
                  marginTop: 4,
                  textAlign: "right",
                }}
              >
                {title.length}/100
              </Text>
            </View>

            {/* Content Input */}
            <View className="mb-6">
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: COLORS.text,
                  marginBottom: 8,
                }}
              >
                详细描述 *
              </Text>
              <TextInput
                placeholder="请详细描述您的反馈内容..."
                placeholderTextColor={COLORS.muted}
                value={content}
                onChangeText={setContent}
                maxLength={500}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: COLORS.text,
                  backgroundColor: COLORS.background,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.muted,
                  marginTop: 4,
                  textAlign: "right",
                }}
              >
                {content.length}/500
              </Text>
            </View>

            {/* Email Input (Optional) */}
            <View className="mb-6">
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: COLORS.text,
                  marginBottom: 8,
                }}
              >
                邮箱 (可选)
              </Text>
              <TextInput
                placeholder="your@email.com"
                placeholderTextColor={COLORS.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: COLORS.text,
                  backgroundColor: COLORS.background,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.muted,
                  marginTop: 4,
                }}
              >
                提供邮箱便于我们与您联系
              </Text>
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3 mt-8">
              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                activeOpacity={0.7}
                className="flex-1 rounded-xl py-3 items-center"
                style={{
                  backgroundColor: COLORS.background,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  取消
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.7}
                className="flex-1 rounded-xl py-3 items-center"
                style={{
                  backgroundColor: isSubmitting ? COLORS.muted : COLORS.primary,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {isSubmitting ? "提交中..." : "提交反馈"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
