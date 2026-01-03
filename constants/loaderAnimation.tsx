import LottieView from "lottie-react-native";
import React from "react";
import { View, ViewStyle } from "react-native";

interface OwnActivaterIndicatorProps {
  style?: ViewStyle;
}

const OwnActivaterIndicator = ({ style }: OwnActivaterIndicatorProps) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <LottieView
        source={require("@/assets/images/book/basket.json")}
        autoPlay={true}
        loop={true}
        style={[
          {
            width: 250,
            height: 250,
            alignSelf: "center",
            justifyContent: "center",
          },
          style,
        ]}
      />
    </View>
  );
};

export default OwnActivaterIndicator;
