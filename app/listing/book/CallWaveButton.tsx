import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/Colors";

interface CallWaveButtonProps {
  time_slot: string[];
  playersNeeded: number | string;
  shouldAnimate?: boolean;
}

const Wave = ({ delay = 0 }: { delay?: number }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.5, {
          duration: 1200,
          easing: Easing.out(Easing.ease),
        }),
        -1,
        true
      )
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 1.5 - scale.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "rgba(33, 150, 243, 0.2)",
        },
        animatedStyle,
      ]}
    />
  );
};

const CallWaveButton = ({
  time_slot,
  playersNeeded,
  shouldAnimate = true,
}: CallWaveButtonProps) => {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontWeight: "600", fontSize: 12, color: Colors.primary }}>
        partners looking for
      </Text>

      <View
        style={{
          width: 80,
          height: 80,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {shouldAnimate && (
          <View
            style={{
              position: "absolute",
              width: 80,
              height: 80,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Wave delay={0} />
            <Wave delay={1000} />
          </View>
        )}

        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 30,
            backgroundColor: Colors.primary,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 24 }}>
            {playersNeeded}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default React.memo(CallWaveButton);
