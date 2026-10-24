import LottieView from "lottie-react-native";
import { View } from "react-native";

interface OwnActivaterIndicatorProps {
  color: string;
}

const OwnActivaterIndicator = ({ color }: OwnActivaterIndicatorProps) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: color,
      }}
    >
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
        ]}
      />
    </View>
  );
};

export default OwnActivaterIndicator;
