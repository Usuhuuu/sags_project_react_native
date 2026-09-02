import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { EsportBookingData, useBookingStore } from "@/context/store/book_store";
import { format } from "date-fns";
import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { useWindowDimensions } from "react-native";

interface Step_two_pc_props {
  listing: EsportBookingData | undefined;
  subtotal?: number;
  serviceFee?: number;
  grandTotal?: number;
  step?: number;
  setStep?: React.Dispatch<React.SetStateAction<number>>;
}

const SummaryRow = ({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: any;
}) => (
  <View style={[s.summaryRow, { borderBottomColor: colors.borderSubtle }]}>
    <AppText style={[s.summaryLabel, { color: colors.onSurfaceVariant }]}>
      {label}
    </AppText>
    <AppText style={[s.summaryValue, { color: colors.onSurface }]}>
      {value}
    </AppText>
  </View>
);

const Step_two_pc = ({
  listing,
  subtotal = 0,
  serviceFee = 0,
  grandTotal,
}: Step_two_pc_props) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const bookingDetails = useBookingStore((state) => state.esportBookingDetails);

  if (!bookingDetails) return <OwnActivaterIndicator />;

  const renderItems = [
    {
      key: "date",
      label: "Date",
      value: bookingDetails.bookingDate
        ? format(new Date(bookingDetails.bookingDate), "EEEE, MMM d, yyyy")
        : undefined,
      icon: <Entypo name="calendar" size={22} color={colors.accentPrimary} />,
      isLast: false,
    },
    {
      key: "tier",
      label: "Zone Selection",
      value: bookingDetails.tier,
      icon: (
        <MaterialIcons name="monitor" size={22} color={colors.accentPrimary} />
      ),
      isLast: false,
    },
    {
      key: "hours",
      label: "Time Package",
      value: `${bookingDetails.hours} Hours Package`,
      icon: <Feather name="clock" size={22} color={colors.accentPrimary} />,
      isLast: false,
    },
    {
      key: "startTime",
      label: "Arrival Time",
      date: bookingDetails.startTime as Date,
      icon: <Feather name="watch" size={22} color={colors.accentPrimary} />,
      isLast: true,
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Venue Card */}
        <View
          style={[
            s.venueCard,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.shadowColor,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={s.imageContainer}>
            <Carousel
              data={
                listing?.imageUrls ?? [
                  require("@/assets/images/computerImage/regular_high.png"),
                ]
              }
              renderItem={({ item }: { item: string }) => (
                <Image source={{ uri: item }} style={s.venueImage} />
              )}
              width={width - 32}
              height={180}
            />
            <View style={[s.badge, { backgroundColor: colors.accentPrimary }]}>
              <AppText style={s.badgeText}>Top Rated</AppText>
            </View>
          </View>

          <View style={s.venueInfo}>
            <AppText style={[s.venueName, { color: colors.onSurface }]}>
              {listing?.name}
            </AppText>
            <TouchableOpacity onPress={() => console.log("Open map")}>
              <AppText style={[s.venueLocation, { color: colors.outline }]}>
                📍 {listing?.location.smart_location}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Details */}
        <AppText style={[s.sectionTitle, { color: colors.outline }]}>
          BOOKING DETAILS
        </AppText>
        <View
          style={[
            s.detailsCard,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.shadowColor,
              borderColor: colors.border,
            },
          ]}
        >
          {renderItems.map((item, index) => {
            const tierUpperCase =
              item.key === "tier"
                ? item.value
                    ?.toString()
                    .replace(/^\w/, (char) => char.toUpperCase())
                : item.value;
            return (
              <View
                style={[
                  s.detailItem,
                  !item.isLast && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderSubtle,
                  },
                ]}
                key={`${item.key}-${index}`}
              >
                <View
                  style={[
                    s.iconCircle,
                    { backgroundColor: colors.accentPrimaryGlow },
                  ]}
                >
                  {item.icon}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText style={[s.detailLabel, { color: colors.outline }]}>
                    {item.label}
                  </AppText>
                  {item.value ? (
                    <AppText
                      style={[s.detailValue, { color: colors.onSurface }]}
                    >
                      {tierUpperCase}
                    </AppText>
                  ) : item?.date ? (
                    <AppText
                      style={[s.detailValue, { color: colors.onSurface }]}
                    >
                      {format(new Date(item.date), "HH:mm")}
                    </AppText>
                  ) : (
                    <AppText style={{ color: colors.outline }}>
                      --:-- --
                    </AppText>
                  )}
                </View>
                <TouchableOpacity>
                  <AppText
                    style={[s.editText, { color: colors.accentPrimary }]}
                  >
                    Edit
                  </AppText>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Payment Summary */}
        <AppText style={[s.sectionTitle, { color: colors.outline }]}>
          PAYMENT SUMMARY
        </AppText>
        <View
          style={[
            s.detailsCard,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.shadowColor,
              borderColor: colors.border,
            },
          ]}
        >
          <SummaryRow
            label={`${bookingDetails.tier ?? "regular"} zone rate (${bookingDetails.hours ?? 0} Hours)`}
            value={`₩${subtotal.toLocaleString()}`}
            colors={colors}
          />
          <SummaryRow
            label="Service Fee"
            value={`₩${serviceFee.toLocaleString()}`}
            colors={colors}
          />
          <View style={[s.divider, { backgroundColor: colors.borderSubtle }]} />
          <View style={s.totalRow}>
            <AppText style={[s.totalLabel, { color: colors.onSurface }]}>
              Total Amount
            </AppText>
            <AppText style={[s.totalValue, { color: colors.accentPrimary }]}>
              ₩{(grandTotal ?? subtotal + serviceFee).toLocaleString()}
            </AppText>
          </View>
        </View>

        {/* Wire Payment Method */}
        <AppText style={[s.sectionTitle, { color: colors.outline }]}>
          PAYMENT METHOD
        </AppText>
        <View
          style={[
            s.detailsCard,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.shadowColor,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              s.methodRow,
              {
                borderColor: colors.accentPrimaryBorder,
                backgroundColor: colors.accentPrimaryGlow,
              },
            ]}
          >
            <View style={[s.methodIcon, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons
                name="cellphone-wireless"
                size={22}
                color={colors.accentPrimary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={[s.methodTitle, { color: colors.onSurface }]}>
                Wire — Mobile Payment
              </AppText>
              <AppText
                style={[s.methodDesc, { color: colors.onSurfaceVariant }]}
              >
                Bank & mobile operators
              </AppText>
            </View>
            <View
              style={[
                s.secureChip,
                {
                  backgroundColor: colors.successGlow,
                  borderColor: colors.successBorder,
                },
              ]}
            >
              <Ionicons
                name="lock-closed"
                size={11}
                color={colors.successColor}
              />
              <AppText style={[s.secureText, { color: colors.successColor }]}>
                Secure
              </AppText>
            </View>
          </View>

          {grandTotal !== undefined && (
            <View
              style={[s.amountWrap, { borderTopColor: colors.borderSubtle }]}
            >
              <AppText
                style={[s.amountLabel, { color: colors.onSurfaceVariant }]}
              >
                TOTAL DUE
              </AppText>
              <View
                style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}
              >
                <AppText
                  style={[s.amountValue, { color: colors.accentPrimary }]}
                >
                  ₩{grandTotal.toLocaleString()}
                </AppText>
                <AppText
                  style={[s.amountUnit, { color: colors.onSurfaceVariant }]}
                >
                  KRW
                </AppText>
              </View>
            </View>
          )}
        </View>

        <AppText style={[s.footerTerms, { color: colors.outline }]}>
          By clicking "Confirm & Pay", you agree to our booking terms and house
          rules.
        </AppText>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 40 },
  venueCard: {
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },
  imageContainer: { height: 180, position: "relative" },
  venueImage: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  venueInfo: {
    padding: 16,
    gap: 4,
  },
  venueName: { fontSize: 20, fontWeight: "700" },
  venueLocation: { marginTop: 2, fontSize: 13 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 12,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  detailLabel: { fontSize: 12, marginBottom: 2 },
  detailValue: { fontSize: 16, fontWeight: "600" },
  editText: { fontSize: 13, fontWeight: "700" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  summaryLabel: { fontSize: 15 },
  summaryValue: { fontSize: 15, fontWeight: "600" },
  divider: { height: 1, marginVertical: 8 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  totalLabel: { fontSize: 18, fontWeight: "700" },
  totalValue: { fontSize: 20, fontWeight: "800" },
  footerTerms: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  methodDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  secureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  secureText: {
    fontSize: 11,
    fontWeight: "700",
  },
  amountWrap: {
    alignItems: "center",
    paddingVertical: 14,
    gap: 6,
    borderTopWidth: 1,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  amountUnit: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Step_two_pc;
