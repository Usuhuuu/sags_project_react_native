import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignupThree = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#061314" }}>
      <StatusBar barStyle="light-content" />

      {/* Header & Progress */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 24 }}>‹</Text>
          <Text style={{ color: "#94a3b8", fontSize: 14, fontWeight: "600" }}>
            Step 3 of 3
          </Text>
          <View style={{ width: 20 }} />
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 40 }}>
          <View
            style={{
              flex: 1,
              height: 4,
              backgroundColor: "#00e5ff",
              borderRadius: 2,
            }}
          />
          <View
            style={{
              flex: 1,
              height: 4,
              backgroundColor: "#00e5ff",
              borderRadius: 2,
            }}
          />
          <View
            style={{
              flex: 1,
              height: 4,
              backgroundColor: "#00e5ff",
              borderRadius: 2,
            }}
          />
        </View>

        {/* Title Section */}
        <Text
          style={{
            color: "white",
            fontSize: 36,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          Account Security
        </Text>
        <Text style={{ color: "#94a3b8", fontSize: 18, marginBottom: 35 }}>
          Protect your stats and bookings.
        </Text>

        {/* Email Field */}
        <Text
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 12,
          }}
        >
          Email Address
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#131f20",
            borderRadius: 30,
            paddingHorizontal: 20,
            height: 60,
            marginBottom: 25,
          }}
        >
          <Text style={{ marginRight: 10 }}>@</Text>
          <TextInput
            placeholder="baller@example.com"
            placeholderTextColor="#4b5563"
            style={{ flex: 1, color: "white", fontSize: 16 }}
          />
        </View>

        {/* Password Field */}
        <Text
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 12,
          }}
        >
          Create Password
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#131f20",
            borderRadius: 30,
            paddingHorizontal: 20,
            height: 60,
            marginBottom: 10,
          }}
        >
          <Text style={{ marginRight: 10 }}>🔒</Text>
          <TextInput
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#4b5563"
            style={{ flex: 1, color: "white", fontSize: 16 }}
          />
          <Text>👁️</Text>
        </View>

        {/* Strength Meter */}
        <View style={{ alignItems: "flex-end", marginBottom: 30 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 4,
              width: 120,
              marginBottom: 4,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: "#22c55e",
                borderRadius: 2,
              }}
            />
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: "#22c55e",
                borderRadius: 2,
              }}
            />
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: "#334155",
                borderRadius: 2,
              }}
            />
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: "#334155",
                borderRadius: 2,
              }}
            />
          </View>
          <Text style={{ color: "#64748b", fontSize: 12 }}>
            Medium Strength
          </Text>
        </View>

        {/* Checkbox Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            paddingRight: 20,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#334155",
              marginRight: 12,
            }}
          />
          <Text style={{ color: "#94a3b8", fontSize: 14, lineHeight: 20 }}>
            I agree to the{" "}
            <Text style={{ color: "#00e5ff", textDecorationLine: "underline" }}>
              Community Rules
            </Text>{" "}
            &{" "}
            <Text style={{ color: "#00e5ff", textDecorationLine: "underline" }}>
              Terms of Service
            </Text>
            .
          </Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={{ position: "absolute", bottom: 40, left: 20, right: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#00e5ff",
            height: 60,
            borderRadius: 30,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "black",
              fontSize: 18,
              fontWeight: "bold",
              marginRight: 8,
            }}
          >
            Start Playing
          </Text>
          <Text style={{ fontSize: 18 }}>🏀</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignupThree;
