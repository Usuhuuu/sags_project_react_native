import {
  TimePicker15Min,
  WeekCalendarWithoutMonth,
} from "@/src/utils/book/calendar_strip";
import {
  EsportBookingData,
  useBookingStore,
} from "@/src/context/store/bookStore";
import { useTheme } from "@/src/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { Ionicons } from "@expo/vector-icons";
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
import { LinearGradient } from "expo-linear-gradient";

const PC_BANG_BLUE = "#00d2ff";
const PC_BANG_PURPLE = "#9d50bb";

type FieldType = {
  tier: String;
  hours: number | string;
  startTime: Date | string;
  bookingDate: Date;
};
const Step_one_pc = ({
  initTime,
  setInitTime,
}: {
  initTime: boolean;
  setInitTime: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { theme, colors } = useTheme();
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
  const [selectedData, setSelectedDate] = useState(new Date());
  const packages = [
    { label: "1 Hour", value: 1, price: 1200 },
    { label: "3 Hours", value: 3, price: 3000 },
    { label: "5 Hours", value: 5, price: 9000 },
    {
      label: "Night Pass",
      value: 8,
      price: 12000,
      isSpecial: true,
      night_time: "10PM - 6AM",
    },
  ];

  const bookingDetails = useBookingStore(
    (state) => state.esportBookingDetails,
  ) as EsportBookingData;

  const setBookingDetails = useBookingStore(
    (state) => state.setEsportBookingDetails,
  );

  const updateBookingDetails = useCallback(
    ({
      updateField,
      value,
    }: {
      updateField: "tier" | "hours" | "startTime" | "bookingDate";
      value: FieldType[typeof updateField];
    }) => {
      console.log(updateField, value);
      setBookingDetails({ [updateField]: value });
    },
    [setBookingDetails],
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
        <View
          style={{
            backgroundColor: colors.backgroundColor,
            marginBottom: 30,
          }}
        >
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
                  backgroundColor: colors.containerColor,
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

        <View style={[styles.section, { gap: 15 }]}>
          <AppText style={styles.sectionTitle}>When you want to play</AppText>
          <View style={{ gap: 10 }}>
            <AppText style={{ color: colors.themeColorTextSecondary }}>
              SELECT DATE
            </AppText>
            <WeekCalendarWithoutMonth
              selectedDay={selectedData}
              setSelectedDay={(date) => {
                console.log("selected date:", date);
                updateBookingDetails({
                  updateField: "bookingDate",
                  value: date,
                });
                setSelectedDate(date);
              }}
              containerStyle={{
                flex: 1,
                width: "100%",
                height: "100%",
                paddingBottom: 10,
              }}
              selectedDayTextStyle={{ color: colors.white }}
              selectedDayNumberStyle={{ color: colors.white }}
              selectedContainerStyle={{ backgroundColor: colors.primary }}
              textWeekStyle={{
                color: colors.darkGrey,
                fontSize: 12,
                fontWeight: "600",
              }}
              textDayStyle={{
                color:
                  theme === "dark" ? colors.themeColorTextPure : colors.dark,
                fontWeight: "800",
                fontSize: 17,
              }}
              dayBoxStyle={{
                borderRadius: 15,
                backgroundColor:
                  theme === "dark" ? colors.containerColor : colors.white,
              }}
              monthTextStyle={{
                color: colors.darkGrey,
                fontSize: 15,
                fontWeight: "500",
              }}
            />
          </View>
          <View style={{ gap: 10 }}>
            <AppText>START TIME</AppText>
            <View
              style={{
                shadowColor: colors.shadowColor,
                shadowOpacity: 0.1,
                shadowOffset: { width: 2, height: 5 },
              }}
            >
              <TimePicker15Min
                onSelect={updateBookingDetails}
                formatedTime={bookingDetails.bookingDate}
                init={initTime}
                setInited={setInitTime}
              />
            </View>
          </View>
        </View>

        {/* TIME SELECTION */}
        <AppText style={styles.sectionTitle}>Choose Time Package</AppText>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {packages.map((pkg, index) => {
            const isSelected = bookingDetails.hours === pkg.value;
            const popular = pkg.label === "3 Hours";
            return (
              <TouchableOpacity
                onPress={() => {
                  updateBookingDetails({
                    updateField: "hours",
                    value: pkg.value,
                  });
                }}
                style={{
                  marginBottom: 15,
                  alignItems: "center",
                  justifyContent: pkg.isSpecial ? "flex-start" : "center",
                  width: pkg.isSpecial ? "100%" : "30%",
                  flexDirection: pkg.isSpecial ? "row" : "column",
                  backgroundColor: pkg.isSpecial
                    ? "transparent"
                    : colors.containerColor,
                  borderRadius: 12,
                  borderWidth:
                    pkg.isSpecial && isSelected ? 2 : isSelected ? 2 : 0,
                  borderColor:
                    pkg.isSpecial && isSelected
                      ? PC_BANG_PURPLE
                      : !pkg.isSpecial && isSelected
                        ? colors.primary
                        : colors.containerColor,
                  shadowColor:
                    pkg.isSpecial && isSelected
                      ? PC_BANG_PURPLE
                      : !pkg.isSpecial && isSelected
                        ? colors.primary
                        : "#000",
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 2, height: 5 },
                  shadowRadius: 5,
                }}
                key={index}
              >
                {pkg.isSpecial ? (
                  <LinearGradient
                    colors={["#0C0C1E", "#2B1E4E"]}
                    start={{ x: 0.7, y: 0.1 }}
                    end={{ x: 0, y: 0 }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flex: 1,
                      padding: 15,
                      borderRadius: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 25,
                          backgroundColor: "#3b296cff",
                        }}
                      >
                        <Ionicons
                          name="moon-sharp"
                          size={30}
                          color={"#C8B6FF"}
                        />
                      </View>
                      <View>
                        <AppText
                          style={{ color: colors.themeColorTextSecondary }}
                        >
                          {pkg.label}
                        </AppText>
                        <AppText
                          style={{
                            fontSize: 11,
                            color: colors.darkGrey,
                          }}
                        >
                          {pkg.night_time}
                        </AppText>
                      </View>
                    </View>
                    <AppText style={{ color: colors.white }}>
                      {pkg.price}
                    </AppText>
                  </LinearGradient>
                ) : (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 10,
                    }}
                  >
                    {popular && (
                      <View
                        style={{
                          position: "absolute",
                          top: -8,
                          backgroundColor: colors.primary,
                          paddingHorizontal: 8,
                          borderRadius: 12,
                        }}
                      >
                        <AppText style={{ color: colors.white }}>
                          Popular
                        </AppText>
                      </View>
                    )}
                    <AppText style={{ color: colors.themeColorTextSecondary }}>
                      {pkg.label}
                    </AppText>
                    <AppText>{pkg.price}</AppText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
