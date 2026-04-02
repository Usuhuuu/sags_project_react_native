import { useTheme } from "@/src/context/themeContext";
import React from "react";
import { Text, TextProps } from "react-native";

interface AppTextProps extends TextProps {
  children?: React.ReactNode;
}

export default function AppText({ children, style, ...props }: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text style={[{ color: colors.themeColorTextPure }, style]} {...props}>
      {children}
    </Text>
  );
}
