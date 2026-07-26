import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme_context";

interface StepIndicatorProps {
  steps: number;
  currentStep: number;
  stepCount?: number;
  size?: number;
  activeSize?: number;
  lineWidth?: number;
  activeColor?: string;
  inactiveColor?: string;
  completedColor?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  stepCount = 3,
  size = 22,
  activeSize = 26,
  lineWidth = 2,
  activeColor,
  inactiveColor,
  completedColor,
}) => {
  const { colors } = useTheme();

  const active = activeColor ?? colors.accentPrimary;
  const inactive = inactiveColor ?? colors.outline;
  const completed = completedColor ?? colors.accentPrimary;
  const textOnActive = colors.themeColorTextPure;

  return (
    <View style={styles.container}>
      {[...Array(stepCount)].map((_, i) => (
        <React.Fragment key={i}>
          {/* Connecting line */}
          {i > 0 && (
            <View
              style={[
                styles.line,
                {
                  width: 20,
                  height: lineWidth,
                  backgroundColor: i <= currentStep ? completed : inactive,
                },
              ]}
            />
          )}
          {/* Step circle */}
          <View
            style={[
              styles.circle,
              {
                width: i === currentStep ? activeSize : size,
                height: i === currentStep ? activeSize : size,
                borderRadius: (i === currentStep ? activeSize : size) / 2,
                backgroundColor: i <= currentStep ? completed : "transparent",
                borderWidth: lineWidth,
                borderColor: i <= currentStep ? completed : inactive,
              },
            ]}
          >
            <View
              style={[
                styles.innerDot,
                {
                  width: i === currentStep ? activeSize * 0.45 : size * 0.45,
                  height: i === currentStep ? activeSize * 0.45 : size * 0.45,
                  borderRadius:
                    (i === currentStep ? activeSize * 0.45 : size * 0.45) / 2,
                  backgroundColor:
                    i === currentStep
                      ? textOnActive
                      : i < currentStep
                        ? textOnActive
                        : "transparent",
                },
              ]}
            />
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  line: {
    // width and height set inline
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  innerDot: {
    // size set inline
  },
});

export default StepIndicator;
