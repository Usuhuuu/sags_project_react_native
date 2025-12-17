import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { EsportHallDataType } from "@/interfaces/listing";
import { EvilIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground,
} from "react-native";

const PC_BANG_BLUE = "#00d2ff";
const PC_BANG_PURPLE = "#9d50bb";

interface OrderScreenPCProps {
  listing: EsportHallDataType;
  orderModelVisible?: boolean;
  setOrderModelVisible?: React.Dispatch<React.SetStateAction<boolean>>;
}

const OrderScreenPC = ({
  listing,
  orderModelVisible,
  setOrderModelVisible,
}: OrderScreenPCProps) => {
  const { theme, colors } = useTheme();
  const width = Dimensions.get("window").width;
  const [tier, setTier] = useState("Regular");
  const [hours, setHours] = useState(1);

  const tiers = [
    {
      id: "regular",
      label: "Regular Zone",
      icon: "🖥️",
      desc: "Social & Energetic",
      backgroundImage: require("@/assets/images/computerImage/regular.png"),
    },
    {
      id: "vip",
      label: "VIP Zone",
      icon: "🔒",
      desc: "Quiet & Focused",
      backgroundImage: require("@/assets/images/computerImage/vip_zone.png"),
    },
    {
      id: "stage",
      label: "Stage Zone",
      icon: "🎤",
      desc: "Performance & Events",
      backgroundImage: require("@/assets/images/computerImage/stage.png"),
    },
  ];

  const packages = [
    { label: "1 Hour", value: 1, price: 1200 },
    { label: "3 Hours", value: 3, price: 3000 },
    { label: "10 Hours", value: 10, price: 9000 },
    { label: "WHOLE DAY", value: 24, price: 18000, isSpecial: true },
  ];

  const totalPrice = packages.find((p) => p.value === hours)?.price || 0;
  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={{
              padding: 7,
              borderRadius: 25,
              backgroundColor:
                theme === "dark" ? colors.shadowColor : colors.primary,
            }}
            onPress={() => {
              setOrderModelVisible?.(false);
            }}
          >
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor:
                theme === "dark" ? colors.shadowColor : colors.primary,
              padding: 7,
              borderRadius: 25,
            }}
          >
            <EvilIcons name="heart" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        <AppText style={styles.title}>Gamer's Haven</AppText>
        <AppText style={styles.subtitle}>
          Select your gaming environment
        </AppText>

        {/* TIER SELECTION */}
        <View style={styles.section}>
          {tiers.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setTier(item.id)}
              style={[
                styles.tierCard,
                {
                  borderColor: item.id === tier ? colors.primary : undefined,
                },
              ]}
            >
              {"component" in item ? item.icon : null}

              <View
                style={{
                  flex: 1,
                  borderRadius: 10,
                }}
              >
                {item.id === "stage" ? (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      backgroundColor: "#152A1E",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={item.backgroundImage}
                      style={{
                        height: 100,
                        width: "50%",
                        resizeMode: "cover",
                      }}
                      resizeMode="contain"
                    />
                    <View>
                      <Text style={styles.tierLabel}>{item.label}</Text>
                      <Text style={styles.tierDesc}>{item.desc}</Text>
                    </View>
                  </View>
                ) : (
                  <ImageBackground
                    source={item.backgroundImage}
                    style={{ padding: 30 }}
                    resizeMode={item.id === "vip" ? "stretch" : "cover"}
                  >
                    <Text style={styles.tierLabel}>{item.label}</Text>
                    <Text style={styles.tierDesc}>{item.desc}</Text>
                  </ImageBackground>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* TIME SELECTION */}
        <AppText style={styles.sectionTitle}>Choose Time Package</AppText>
        <View style={styles.packageGrid}>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.value}
              onPress={() => setHours(pkg.value)}
              style={[
                styles.packageBtn,
                hours === pkg.value && { backgroundColor: colors.primary },
                pkg.isSpecial && styles.specialBtn,
                {
                  shadowColor: colors.shadowColor,
                  shadowOpacity: 0.4,
                  shadowOffset: { width: 2, height: 2 },
                  backgroundColor:
                    pkg.value === hours
                      ? colors.primary
                      : colors.backgroundColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.packageLabel,
                  {
                    color:
                      pkg.value === hours
                        ? colors.white
                        : colors.themeColorTextPure,
                  },
                ]}
              >
                {pkg.label}
              </Text>
              <Text
                style={[
                  styles.packagePrice,
                  hours === pkg.value && { color: colors.white },
                ]}
              >
                ₩{pkg.price.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOTER / BOOKING */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.backgroundColor,
              shadowColor: colors.shadowColor,
              shadowOpacity: 0.5,
              shadowOffset: { width: 2, height: 2 },
            },
          ]}
        >
          <View>
            <AppText style={styles.footerLabel}>Total for {tier}</AppText>
            <AppText style={styles.totalText}>
              ₩{totalPrice.toLocaleString()}
            </AppText>
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          >
            <Text
              style={[
                styles.bookBtnText,
                {
                  color: theme === "dark" ? colors.dark : colors.white,
                },
              ]}
            >
              Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f15" },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#888", marginBottom: 30 },
  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 15,
  },
  tierCard: {
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowOffset: { width: 2, height: 5 },
  },
  activeTier: { backgroundColor: "#1a2433" },
  tierIcon: { fontSize: 24, marginRight: 15 },
  tierLabel: { color: "#fff", fontSize: 18, fontWeight: "700" },
  tierDesc: { color: "#888", fontSize: 12 },
  packageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  packageBtn: {
    width: "48%",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
    borderColor: "#333",
  },
  activePackage: { backgroundColor: PC_BANG_BLUE, borderColor: PC_BANG_BLUE },
  specialBtn: { borderColor: PC_BANG_PURPLE, borderStyle: "dashed" },
  packageLabel: { color: "#fff", fontSize: 14, fontWeight: "600" },
  packagePrice: { color: "#888", fontSize: 12, marginTop: 4 },
  activeText: { color: "#000" },
  footer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#1a1a24",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: { fontSize: 12 },
  totalText: { fontSize: 22, fontWeight: "bold" },
  bookBtn: {
    backgroundColor: PC_BANG_BLUE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookBtnText: { fontWeight: "bold", fontSize: 16 },
});

export default OrderScreenPC;
