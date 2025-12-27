import {
  EsportBookingData,
  useBookingStore,
} from "@/app/(modals)/context/store/bookStore";
import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  ActivityIndicator,
} from "react-native";

const PC_BANG_BLUE = "#00d2ff";
const PC_BANG_PURPLE = "#9d50bb";

interface Step_one_pc_props {
  bookSaveFunc: (data: Partial<EsportBookingData>) => void;
}

const Step_one_pc = ({ bookSaveFunc }: Step_one_pc_props) => {
  const { theme, colors } = useTheme();

  const [tier, setTier] = useState<"regular" | "vip" | "stage">("regular");
  const [hours, setHours] = useState<number | string>(1);
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

  const bookingDetails = useBookingStore(
    (state) => state.esportBookingDetails
  ) as EsportBookingData;

  const setBookingDetails = useBookingStore(
    (state) => state.setEsportBookingDetails
  );

  const updateBookingDetails = useCallback(
    ({
      updateField,
      value,
    }: {
      updateField: "tier" | "hours";
      value: string | number;
    }) => {
      console.log(updateField, value);
      setBookingDetails({ [updateField]: value });
    },
    [setBookingDetails]
  );

  if (bookingDetails === null) {
    return (
      <View>
        <ActivityIndicator size={"large"} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText style={styles.title}>Gamer's Haven</AppText>
        <AppText style={styles.subtitle}>
          Select your gaming environment
        </AppText>

        {/* TIER SELECTION */}
        <View style={styles.section}>
          {tiers.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() =>
                updateBookingDetails({
                  updateField: "tier",
                  value: item.id,
                })
              }
              style={[
                styles.tierCard,
                {
                  borderColor:
                    item.id === bookingDetails.tier
                      ? colors.primary
                      : colors.dark,
                  borderWidth: item.id === bookingDetails.tier ? 2 : undefined,
                  borderRadius: 12,
                  shadowColor:
                    item.id === bookingDetails.tier ? colors.primary : "#000",
                },
              ]}
            >
              {"component" in item ? item.icon : null}

              <View
                style={{
                  overflow: "hidden",
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
              onPress={() =>
                updateBookingDetails({
                  updateField: "hours",
                  value: pkg.value,
                })
              }
              style={[
                styles.packageBtn,
                bookingDetails.hours === pkg.value && {
                  backgroundColor: colors.primary,
                },
                pkg.isSpecial && styles.specialBtn,
                {
                  shadowColor: colors.shadowColor,
                  shadowOpacity: 0.4,
                  shadowOffset: { width: 2, height: 2 },
                  backgroundColor:
                    pkg.value === bookingDetails.hours
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
                      pkg.value === bookingDetails.hours
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
                  bookingDetails.hours === pkg.value && { color: colors.white },
                ]}
              >
                ₩{pkg.price.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOTER / BOOKING */}
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
    borderRadius: 10,
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
    borderRadius: 10,
  },
  bookBtnText: { fontWeight: "bold", fontSize: 16 },
});

export default Step_one_pc;
