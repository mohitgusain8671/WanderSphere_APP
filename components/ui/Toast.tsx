import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  visible,
  onHide,
  duration = 4000,
}) => {
  const { colors } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible, duration, fadeAnim, onHide]);

  if (!visible) return null;

  const getToastStyles = () => {
    const baseStyles = "flex-row items-center p-4 rounded-lg mx-4 mb-4";

    switch (type) {
      case "success":
        return `${baseStyles} bg-green-100 border border-green-200`;
      case "error":
        return `${baseStyles} bg-red-100 border border-red-200`;
      case "warning":
        return `${baseStyles} bg-yellow-100 border border-yellow-200`;
      default:
        return `${baseStyles} bg-blue-100 border border-blue-200`;
    }
  };

  const getIconName = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "warning":
        return "warning";
      default:
        return "information-circle";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#10B981";
      case "error":
        return "#EF4444";
      case "warning":
        return "#F59E0B";
      default:
        return "#3B82F6";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "#065F46";
      case "error":
        return "#991B1B";
      case "warning":
        return "#92400E";
      default:
        return "#1E40AF";
    }
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <View className={getToastStyles()}>
        <Ionicons
          name={getIconName()}
          size={24}
          color={getIconColor()}
          className="mr-3"
        />
        <Text
          className="flex-1 text-sm font-medium"
          style={{ color: getTextColor() }}
        >
          {message}
        </Text>
        <TouchableOpacity onPress={onHide} className="ml-2">
          <Ionicons name="close" size={20} color={getTextColor()} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
