import React, { useEffect } from "react";
import { View, Animated, Easing, Dimensions, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/theme_context";

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const SHIMMER_WIDTH = 200;

// One shared value drives every SkeletonBox — single animation on the native thread
const shimmerX = new Animated.Value(-SHIMMER_WIDTH);

type SkeletonBoxProps = {
  style: ViewStyle;
  baseColor: string;
  highlightOpacity: number;
};

const SkeletonBox = ({
  style,
  baseColor,
  highlightOpacity,
}: SkeletonBoxProps) => (
  <View
    style={[
      { backgroundColor: baseColor, overflow: "hidden", borderRadius: 5 },
      style,
    ]}
  >
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: SHIMMER_WIDTH,
        transform: [{ translateX: shimmerX }],
      }}
    >
      <LinearGradient
        colors={[
          "rgba(255,255,255,0)",
          `rgba(255,255,255,${highlightOpacity})`,
          "rgba(255,255,255,0)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  </View>
);

const TimeSlotSkeleton = ({ slotCount = 8 }: { slotCount?: number }) => {
  const { height } = Dimensions.get("screen");
  const { theme } = useTheme();
  const count = slotCount || 8;
  const itemHeight = (height - 30) / count;

  // Dark:  #272D3A — just above containerColor #151a20, echoes surfaceHigh #282a2e
  // Light: #C8CDD8 — one step darker than themeContainerGrey #E4E6EC
  const baseColor = theme === "dark" ? "#272D3A" : "#C8CDD8";
  const highlightOpacity = theme === "dark" ? 0.1 : 0.65;

  useEffect(() => {
    shimmerX.setValue(-SHIMMER_WIDTH);
    const loop = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: SCREEN_WIDTH + SHIMMER_WIDTH,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={{ padding: 10, height: height * 0.6 }}>
      <View style={{ flex: 1 }}>
        {/* Whole day button skeleton */}
        <View style={{ height: height * 0.1 }}>
          <SkeletonBox
            baseColor={baseColor}
            highlightOpacity={highlightOpacity}
            style={{
              borderWidth: 2,
              borderRadius: 5,
              height: height * 0.07,
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </View>

        {/* Time slot skeletons */}
        <View style={{ height: height * 0.5 }}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {Array.from({ length: count }).map((_, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  height: itemHeight,
                  maxHeight: itemHeight,
                }}
              >
                <SkeletonBox
                  baseColor={baseColor}
                  highlightOpacity={highlightOpacity}
                  style={{
                    borderRadius: 5,
                    marginBottom: 7,
                    width: "50%",
                    minWidth: "50%",
                    marginHorizontal: -2,
                    height: itemHeight - 7,
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default TimeSlotSkeleton;
