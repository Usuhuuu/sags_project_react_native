import {
  TimePicker15Min,
  WeekCalendarWithoutMonth,
} from "@/components/book/strip_calendar";
import { EsportBookingData, useBookingStore } from "@/context/store/book_store";
import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  View,
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
  tier: string;
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
      setBookingDetails({ [updateField]: value });
    },
    [setBookingDetails],
  );

  if (bookingDetails === null) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: colors.backgroundColor }]}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={[s.title, { color: colors.onSurface }]}>
          Gamer's Haven
        </AppText>
        <AppText style={[s.subtitle, { color: colors.outline }]}>
          Select your gaming environment
        </AppText>

        {/* TIER SELECTION */}
        <View style={s.tierSection}>
          {tiers.map((item) => {
            const active = item.id === bookingDetails.tier;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() =>
                  updateBookingDetails({ updateField: "tier", value: item.id })
                }
                style={[
                  s.tierCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: active ? colors.accentPrimary : colors.border,
                    borderWidth: active ? 2 : 1,
                    shadowColor: active
                      ? colors.accentPrimary
                      : colors.shadowColor,
                  },
                ]}
              >
                {item.id === "stage" ? (
                  <View style={[s.stageInner, { backgroundColor: "#0D1A14" }]}>
                    <Image source={item.backgroundImage} style={s.stageImage} />
                    <View style={s.tierTextCol}>
                      <AppText style={s.tierLabel}>{item.label}</AppText>
                      <AppText style={s.tierDesc}>{item.desc}</AppText>
                    </View>
                  </View>
                ) : (
                  <ImageBackground
                    source={item.backgroundImage}
                    style={s.tierBg}
                    resizeMode={item.id === "vip" ? "stretch" : "cover"}
                  >
                    <AppText style={s.tierLabel}>{item.label}</AppText>
                    <AppText style={s.tierDesc}>{item.desc}</AppText>
                  </ImageBackground>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* DATE & TIME */}
        <View style={s.section}>
          <AppText style={[s.sectionTitle, { color: colors.onSurface }]}>
            When you want to play
          </AppText>
          <View style={{ gap: 10 }}>
            <AppText style={[s.fieldLabel, { color: colors.outline }]}>
              SELECT DATE
            </AppText>
            <WeekCalendarWithoutMonth
              selectedDay={selectedData}
              setSelectedDay={(date) => {
                updateBookingDetails({
                  updateField: "bookingDate",
                  value: date,
                });
                setSelectedDate(date);
              }}
              containerStyle={s.calendarContainer}
              selectedDayTextStyle={{ color: colors.white }}
              selectedDayNumberStyle={{ color: colors.white }}
              selectedContainerStyle={{ backgroundColor: colors.accentPrimary }}
              textWeekStyle={{
                color: colors.outline,
                fontSize: 12,
                fontWeight: "600",
              }}
              textDayStyle={{
                color: theme === "dark" ? colors.onSurface : colors.dark,
                fontWeight: "800",
                fontSize: 17,
              }}
              dayBoxStyle={{
                borderRadius: 15,
                backgroundColor:
                  theme === "dark" ? colors.surfaceHigh : colors.white,
              }}
              monthTextStyle={{
                color: colors.outline,
                fontSize: 15,
                fontWeight: "500",
              }}
            />
          </View>
          <View style={{ gap: 10 }}>
            <AppText style={[s.fieldLabel, { color: colors.outline }]}>
              START TIME
            </AppText>
            <View
              style={[s.timePickerShadow, { shadowColor: colors.shadowColor }]}
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

        {/* PACKAGES */}
        <AppText style={[s.sectionTitle, { color: colors.onSurface }]}>
          Choose Time Package
        </AppText>
        <View style={s.pkgGrid}>
          {packages.map((pkg, index) => {
            const isSelected = bookingDetails.hours === pkg.value;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() =>
                  updateBookingDetails({
                    updateField: "hours",
                    value: pkg.value,
                  })
                }
                style={[
                  pkg.isSpecial ? s.pkgFull : s.pkgThird,
                  {
                    backgroundColor: pkg.isSpecial
                      ? "transparent"
                      : colors.surface,
                    borderColor: isSelected
                      ? pkg.isSpecial
                        ? PC_BANG_PURPLE
                        : colors.accentPrimary
                      : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    shadowColor: isSelected
                      ? pkg.isSpecial
                        ? PC_BANG_PURPLE
                        : colors.accentPrimary
                      : colors.shadowColor,
                  },
                ]}
              >
                {pkg.isSpecial ? (
                  <LinearGradient
                    colors={["#0C0C1E", "#2B1E4E"]}
                    start={{ x: 0.7, y: 0.1 }}
                    end={{ x: 0, y: 0 }}
                    style={s.nightGradient}
                  >
                    <View style={s.nightLeft}>
                      <View style={s.nightIconBox}>
                        <Ionicons name="moon-sharp" size={26} color="#C8B6FF" />
                      </View>
                      <View>
                        <AppText style={{ color: colors.onSurface }}>
                          {pkg.label}
                        </AppText>
                        <AppText
                          style={[s.nightTime, { color: colors.outline }]}
                        >
                          {pkg.night_time}
                        </AppText>
                      </View>
                    </View>
                    <AppText style={{ color: colors.white, fontWeight: "700" }}>
                      ₩{pkg.price.toLocaleString()}
                    </AppText>
                  </LinearGradient>
                ) : (
                  <View style={s.pkgInner}>
                    {pkg.label === "3 Hours" && (
                      <View
                        style={[
                          s.popularBadge,
                          { backgroundColor: colors.accentPrimary },
                        ]}
                      >
                        <AppText style={s.popularText}>Popular</AppText>
                      </View>
                    )}
                    <AppText
                      style={[s.pkgLabel, { color: colors.onSurfaceVariant }]}
                    >
                      {pkg.label}
                    </AppText>
                    <AppText style={[s.pkgPrice, { color: colors.onSurface }]}>
                      ₩{pkg.price.toLocaleString()}
                    </AppText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 24, paddingBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, marginBottom: 28 },
  tierSection: { marginBottom: 28 },
  tierCard: {
    marginBottom: 12,
    borderRadius: 16,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },
  tierBg: { padding: 24, minHeight: 100, justifyContent: "flex-end" },
  stageInner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    overflow: "hidden",
  },
  stageImage: { height: 100, width: "50%", resizeMode: "cover" },
  tierTextCol: { flex: 1, paddingHorizontal: 14, gap: 2 },
  tierLabel: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  tierDesc: { color: "#CCCCCC", fontSize: 12 },
  section: { marginBottom: 28, gap: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  fieldLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8 },
  calendarContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingBottom: 10,
  },
  timePickerShadow: {
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pkgGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  pkgThird: {
    width: "30%",
    borderRadius: 14,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  pkgFull: {
    width: "100%",
    borderRadius: 14,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  pkgInner: {
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 8,
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  popularText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  pkgLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  pkgPrice: { fontSize: 18, fontWeight: "800" },
  nightGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  nightLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  nightIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b296c",
    justifyContent: "center",
    alignItems: "center",
  },
  nightTime: { fontSize: 11, marginTop: 1 },
});

export default Step_one_pc;
