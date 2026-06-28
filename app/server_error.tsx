import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

interface ServerErrorScreenProps {
  statusCode: number;
}

const ServerErrorScreen = (props: ServerErrorScreenProps) => {
  return (
    <LinearGradient
      colors={["#060B16", "#0B1A2E", "#060B16"]}
      style={styles.container}
    >
      {/* Icon */}
      <View style={styles.iconWrapper}>
        <Feather name="search" size={96} color="#7EC8FF" />
      </View>

      {/* Text */}
      <Text style={styles.title}>Not Found</Text>
      <Text style={styles.description}>
        The page or data you are looking for{"\n"}
        has vanished into the digital void.
      </Text>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/")}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Go Home</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  iconWrapper: {
    marginBottom: 32,
    shadowColor: "#7EC8FF",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    color: "#A0AEC0",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },

  button: {
    width: width * 0.7,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "rgba(126, 200, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(126, 200, 255, 0.4)",
    alignItems: "center",
  },

  buttonText: {
    color: "#E6F4FF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ServerErrorScreen;
