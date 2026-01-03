import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React from "react";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import {
  EsportBookingData,
  useBookingStore,
} from "@/app/(modals)/context/store/bookStore";
import { format } from "date-fns";
import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";

interface Step_two_pc_props {
  listing: EsportBookingData | undefined;
  step?: number;
  setStep?: React.Dispatch<React.SetStateAction<number>>;
}
const Step_two_pc = ({ listing, step, setStep }: Step_two_pc_props) => {
  const { width } = Dimensions.get("window");
  const { colors, theme } = useTheme();
  const bookingDetails = useBookingStore((state) => state.esportBookingDetails);
  if (!bookingDetails) return <Text>Loading...</Text>;
  const renderItems = [
    {
      key: "date",
      label: "Date",
      value: bookingDetails.bookingDate
        ? format(new Date(bookingDetails.bookingDate), "EEEE, MMM d, yyyy")
        : undefined,
      icon: <Entypo name="calendar" size={24} color="white" />,
      isLast: false,
    },
    {
      key: "tier",
      label: "Zone Selection",
      value: bookingDetails.tier,
      icon: <MaterialIcons name="monitor" size={24} color="white" />,
      isLast: false,
    },
    {
      key: "hours",
      label: "Time Package",
      value: `${bookingDetails.hours} Hours Package`,
      icon: <Feather name="clock" size={24} color="white" />,
      isLast: false,
    },
    {
      key: "startTime",
      label: "Arrival Time",
      date: bookingDetails.startTime as Date,
      icon: <Feather name="watch" size={24} color="white" />,
      isLast: true,
    },
  ];
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Venue Card */}

        <View
          style={[
            styles.venueCard,
            {
              backgroundColor: colors.containerColor,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <View style={styles.imageContainer}>
            <Carousel
              data={
                listing?.imageUrls ?? [
                  require("@/assets/images/computerImage/regular_high.png"),
                ]
              }
              renderItem={({ item }: { item: string }) => (
                <Image source={{ uri: item }} style={styles.venueImage} />
              )}
              width={width - 20}
              height={180}
            />
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>Top Rated</AppText>
            </View>
          </View>

          <View style={styles.venueInfo}>
            <View>
              <AppText style={styles.venueName}>{listing?.name}</AppText>
              <TouchableOpacity
                onPress={() => {
                  console.log("Open map");
                }}
              >
                <AppText style={styles.venueLocation}>
                  📍 {listing?.location.smart_location}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <Text style={styles.sectionTitle}>BOOKING DETAILS</Text>
        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: colors.containerColor,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          {Array.isArray(renderItems) &&
            renderItems.map((item, index) => {
              const tierUpperCase =
                item.key === "tier"
                  ? item.value
                      ?.toString()
                      .replace(/^\w/, (char) => char.toUpperCase())
                  : item.value;
              return (
                <View
                  style={[styles.detailItem, !item.isLast && styles.itemBorder]}
                  key={`${item.key}-${index}`}
                >
                  <View style={styles.iconCircle}>{item.icon}</View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText style={styles.detailLabel}>{item.label}</AppText>
                    {item.value ? (
                      <AppText style={styles.detailValue}>
                        {tierUpperCase}
                      </AppText>
                    ) : item?.date ? (
                      <AppText style={styles.detailValue}>
                        {format(new Date(item.date), "HH:mm")}
                      </AppText>
                    ) : (
                      <AppText>--:-- --</AppText>
                    )}
                  </View>
                  <TouchableOpacity>
                    <AppText style={styles.editText}>Edit</AppText>
                  </TouchableOpacity>
                </View>
              );
            })}
        </View>

        {/* Payment Summary */}
        <AppText style={styles.sectionTitle}>PAYMENT SUMMARY</AppText>
        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: colors.containerColor,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <SummaryRow
            label={`${listing?.tier} zone rate (3 Hours)`}
            value="₩3,000"
          />
          <SummaryRow label="Service Fee" value="₩200" />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <AppText style={styles.totalLabel}>Total Amount</AppText>
            <AppText style={styles.totalValue}>₩3,200</AppText>
          </View>
        </View>

        <AppText style={styles.footerTerms}>
          By clicking "Confirm & Pay", you agree to our booking terms and house
          rules.
        </AppText>
      </ScrollView>
    </View>
  );
};

type SummaryRowProps = {
  label: string;
  value: string;
};

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value }) => (
  <View style={styles.summaryRow}>
    <AppText style={styles.summaryLabel}>{label}</AppText>
    <AppText style={styles.summaryValue}>{value}</AppText>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121826" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 16 },

  venueCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
  },
  imageContainer: { height: 180, position: "relative" },
  venueImage: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  venueInfo: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  venueName: { fontSize: 20, fontWeight: "bold" },
  venueLocation: { marginTop: 4 },
  gameIconContainer: {
    backgroundColor: "#2D3748",
    padding: 8,
    borderRadius: 12,
  },

  sectionTitle: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 1,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: "#2D3748" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2D3748",
    justifyContent: "center",
    alignItems: "center",
  },
  detailLabel: { color: "#94A3B8", fontSize: 12 },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  editText: { color: "#3B82F6", fontWeight: "bold" },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: { color: "#94A3B8", fontSize: 15 },
  summaryValue: { fontSize: 15, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#2D3748", marginVertical: 12 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalValue: { color: "#3B82F6", fontSize: 20, fontWeight: "bold" },

  footerTerms: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 12,
    paddingHorizontal: 20,
    marginBottom: 100,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#1E2632",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2D3748",
  },
  bottomLabel: { color: "#94A3B8", fontSize: 12 },
  bottomPrice: { color: "white", fontSize: 20, fontWeight: "bold" },
  payButton: {
    backgroundColor: "#1D88FE",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  payButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
});

export default Step_two_pc;
