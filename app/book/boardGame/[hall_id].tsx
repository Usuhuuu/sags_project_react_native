import { useHallInfo } from "@/context/hall_info_context";
import { useTheme } from "@/context/theme_context";
import {
  FontAwesome5,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  WeekCalendarWithoutMonth,
  TimePicker15Min,
} from "@/components/book/strip_calendar";
import AppText from "@/components/ui/app_text";
import { EsportHallDataType, EsportHallPrices } from "@/types/hall_info_type";
import { HallTypesSeparator } from "@/types/hall_separator_type";
import axiosInstance from "@/hooks/axiosInstance";
import { showToast } from "@/utils/toast";
import { calculateDurationPrice } from "@/utils/duration_price";
import { saveToken } from "@/components/book/session";
import Confirm_Modal from "@/components/book/confirmation";
import { format } from "date-fns";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { bookingNotificationSchedule } from "@/context/store/notification_store";
import { queryClient } from "@/hooks/queryClient";

// ─── Props ───────────────────────────────────────────────────────────────────
export interface BookingBoardGameProps {
  listing?: EsportHallDataType;
  hallID?: string;
  hallType?: HallTypesSeparator;
}

// ─── Tiers / Tables ──────────────────────────────────────────────────────────
const TABLE_TIERS = [
  {
    id: "regular" as const,
    label: "Pool Table",
    desc: "Classic 9ft · Standard Play",
    image: require("@/assets/images/computerImage/regular.png"),
  },
  {
    id: "vip" as const,
    label: "Snooker Table",
    desc: "Premium 12ft · Tournament Feel",
    image: require("@/assets/images/computerImage/vip_zone.png"),
  },
  {
    id: "stage" as const,
    label: "English Table",
    desc: "Pro 10ft · Competition Ready",
    image: require("@/assets/images/computerImage/stage.png"),
  },
] as const;

const PACKAGES: {
  label: string;
  value: number;
  popular?: boolean;
}[] = [
  { label: "1 Hour", value: 1 },
  { label: "2 Hours", value: 2 },
  { label: "3 Hours", value: 3, popular: true },
  { label: "5 Hours", value: 5 },
  { label: "Whole Day", value: 8 },
];

// ─── Pool-ball palette for duration chips ─────────────────────────────────────
const BALL_META: Record<number, { color: string }> = {
  1: { color: "#F59E0B" }, // yellow
  2: { color: "#2563EB" }, // blue
  3: { color: "#DC2626" }, // red
  5: { color: "#EA580C" }, // orange
  8: { color: "#111827" }, // 8-ball black
};

// Felt-cloth accent colour per table tier
const TIER_FELT: Record<string, string> = {
  regular: "#16A34A", // green felt
  vip: "#7C3AED", // purple baize
  stage: "#DC2626", // red competition cloth
};

const BookingBoardGame = ({
  listing: propListing,
  hallID: propHallID,
}: BookingBoardGameProps) => {
  const { colors: C } = useTheme();
  const { hall_id: routeHallId } = useLocalSearchParams();
  const { getSpecificHall } = useHallInfo();

  // ── Resolve listing: from props (when rendered by book/[hall_id]) or route ──
  const hallId = propHallID ?? String(routeHallId ?? "");
  const listing =
    propListing ?? (getSpecificHall(hallId) as EsportHallDataType | undefined);

  const images = useMemo(() => {
    return listing?.hall_details?.hall_imageURLs ?? [];
  }, [listing]);
  const hallName = listing?.hall_details?.hall_name ?? "Billiard Hall";
  const hallAddress = listing?.hall_details?.hall_address ?? "";
  const hallPrices = listing?.hall_details?.hall_price as
    | EsportHallPrices
    | undefined;

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTier, setSelectedTier] = useState<"regular" | "vip" | "stage">(
    "regular",
  );
  const [hours, setHours] = useState<number>(1);
  const [startTime, setStartTime] = useState<Date | string>(new Date());
  const [initTime, setInitTime] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const hasScheduled = useRef(false);

  // ── Pricing ──────────────────────────────────────────────────────────────────────
  const prices = hallPrices?.esport ?? [];
  const pricePerHour = calculateDurationPrice(prices, 60) ?? 0;
  const totalPrice = calculateDurationPrice(prices, hours * 60) ?? 0;
  const serviceFee = pricePerHour > 0 ? Math.round(pricePerHour * 0.05) : 0;
  const grandTotal = totalPrice + serviceFee;

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);

  // ── Booking handler ──────────────────────────────────────────────────────────
  const handleBooking = useCallback(async () => {
    try {
      const timezone = encodeURIComponent(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      const response = await axiosInstance.post(
        "/auth/book/intent",
        {
          sport_hall_id: listing?.sportHallID,
          date: selectedDate,
          timezone,
          tier: selectedTier,
          hours,
          startTime,
          type: "boardGame",
        },
        { timeout: 10000 },
      );
      if (response.status === 200 && response.data.success) {
        const token = response.data.session;
        saveToken(token);
        showToast({
          title: "Successfully Booked",
          description: "Check Booking from Order Section",
          alertType: "success",
        });
        if (!hasScheduled.current) {
          await bookingNotificationSchedule({
            title: `Reminder: Payment Needed for ${hallName}`,
            body: "Please complete the payment to confirm your booking.",
            bookingToken: token,
          });
          hasScheduled.current = true;
        }
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) && q.queryKey[0] === "booked_order",
        });
        setBookSuccess(true);
        setConfirmModal(true);
      }
    } catch (err: any) {
      if ([409, 401].includes(err.response?.status)) {
        showToast({
          title: "Booking Exists",
          description:
            err.response.data.message ||
            "Conflict in booking. Please choose a different time.",
          alertType: "warn",
        });
      } else {
        showToast({
          title: "Booking Failed",
          description: "An error occurred. Please try again.",
          alertType: "warn",
        });
      }
    }
  }, [selectedDate, selectedTier, hours, startTime, listing, hallName]);

  // ── Confirmation details ─────────────────────────────────────────────────────
  const confirmationDetails = useMemo(
    () => [
      {
        label: "Venue",
        value: hallName,
        icon: (
          <FontAwesome5 name="table-tennis" size={22} color={C.accentPrimary} />
        ),
      },
      {
        label: "Date",
        value: format(selectedDate, "MMM d, yyyy"),
        icon: <Fontisto name="date" size={22} color={C.accentPrimary} />,
      },
      {
        label: "Table",
        value:
          TABLE_TIERS.find((t) => t.id === selectedTier)?.label ?? selectedTier,
        icon: (
          <MaterialIcons
            name="sports-esports"
            size={22}
            color={C.accentPrimary}
          />
        ),
      },
      {
        label: "Duration",
        value: `${hours} Hour${hours > 1 ? "s" : ""}`,
        icon: (
          <Ionicons name="time-outline" size={22} color={C.accentPrimary} />
        ),
      },
    ],
    [hallName, selectedDate, selectedTier, hours, C.accentPrimary],
  );

  // ── Step indicator (memoized) ─────────────────────────────────────────────
  const stepDots = useMemo(
    () => (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {[0, 1].map((i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <View
                style={{
                  width: 24,
                  height: 2,
                  backgroundColor: i <= step ? C.accentPrimary : C.border,
                }}
              />
            )}
            <View
              style={{
                width: i === step ? 26 : 22,
                height: i === step ? 26 : 22,
                borderRadius: i === step ? 13 : 11,
                backgroundColor: i <= step ? C.accentPrimary : "transparent",
                borderWidth: 2,
                borderColor: i <= step ? C.accentPrimary : C.outline,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: i === step ? 10 : 8,
                  height: i === step ? 10 : 8,
                  borderRadius: i === step ? 5 : 4,
                  backgroundColor: i <= step ? C.white : "transparent",
                }}
              />
            </View>
          </React.Fragment>
        ))}
      </View>
    ),
    [step, C.accentPrimary, C.border, C.outline, C.white],
  );
  // ── Step 0 content (memoized — selection form) ────────────────────────────
  const step0Content = useMemo(() => {
    const {
      onSurface,
      outline,
      accentPrimary,
      accentPrimaryGlow,
      border,
      borderSubtle,
      surface,
      surfaceHigh,
      shadowColor,
      onSurfaceVariant,
      white,
      backgroundColor,
    } = C;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={bkS.scrollContent}
      >
        {/* ── Venue Header Card ──────────────────────────────────────────── */}
        <View
          style={[
            bkS.venueHeader,
            {
              backgroundColor: surface,
              borderColor: border,
              shadowColor,
            },
          ]}
        >
          {images.length > 0 ? (
            <Image source={{ uri: images[0] }} style={bkS.venueThumb} />
          ) : (
            <View
              style={[
                bkS.venueThumbPlaceholder,
                { backgroundColor: accentPrimaryGlow },
              ]}
            >
              <Ionicons name="grid" size={18} color={accentPrimary} />
            </View>
          )}
          <View
            style={[
              bkS.venueAccent,
              { backgroundColor: TIER_FELT[selectedTier] },
            ]}
          />
          <View style={{ flex: 1 }}>
            <AppText
              style={[bkS.venueName, { color: onSurface }]}
              numberOfLines={1}
            >
              {hallName}
            </AppText>
            <View style={bkS.venueMeta}>
              <Ionicons name="location-sharp" size={12} color={outline} />
              <AppText
                style={[bkS.venueAddr, { color: outline }]}
                numberOfLines={1}
              >
                {hallAddress}
              </AppText>
            </View>
          </View>
        </View>

        {/* ── TABLE SELECTION ───────────────────────────────────────────── */}
        <View style={bkS.section}>
          <View style={bkS.sectionHeader}>
            <View
              style={[bkS.sectionDot, { backgroundColor: accentPrimary }]}
            />
            <AppText style={[bkS.sectionLabel, { color: outline }]}>
              TABLE SELECTION
            </AppText>
          </View>
          <AppText style={[bkS.sectionSub, { color: onSurfaceVariant }]}>
            Choose your table type
          </AppText>
          {TABLE_TIERS.map((tier) => {
            const active = tier.id === selectedTier;
            const price = pricePerHour;
            const feltColor = TIER_FELT[tier.id];
            return (
              <TouchableOpacity
                key={tier.id}
                activeOpacity={0.8}
                onPress={() => setSelectedTier(tier.id)}
                style={[
                  bkS.tierCard,
                  {
                    backgroundColor: active ? feltColor + "18" : surface,
                    borderColor: active ? feltColor : border,
                    overflow: "hidden",
                  },
                ]}
              >
                {/* Felt-colour left stripe */}
                <View
                  style={[bkS.tierStripe, { backgroundColor: feltColor }]}
                />

                <View style={bkS.tierLeft}>
                  <View
                    style={[
                      bkS.tierIcon,
                      {
                        backgroundColor: active
                          ? feltColor + "22"
                          : backgroundColor,
                        borderColor: active ? feltColor : border,
                      },
                    ]}
                  >
                    <Image source={tier.image} style={bkS.tierThumb} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <AppText
                        style={[
                          bkS.tierLabel,
                          { color: active ? feltColor : onSurface },
                        ]}
                      >
                        {tier.label}
                      </AppText>
                      {active && (
                        <View
                          style={[
                            bkS.feltBadge,
                            { backgroundColor: feltColor },
                          ]}
                        >
                          <AppText style={bkS.feltBadgeText}>SELECTED</AppText>
                        </View>
                      )}
                    </View>
                    <AppText style={[bkS.tierDesc, { color: outline }]}>
                      {tier.desc}
                    </AppText>
                  </View>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <AppText
                    style={[
                      bkS.tierPrice,
                      { color: active ? feltColor : onSurface },
                    ]}
                  >
                    ₩{price.toLocaleString()}
                  </AppText>
                  <AppText style={[bkS.tierUnit, { color: outline }]}>
                    /hr
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Section Divider ───────────────────────────────────────────── */}
        <View style={[bkS.sectionDivider, { backgroundColor: borderSubtle }]} />

        {/* ── SCHEDULE ──────────────────────────────────────────────────── */}
        <View style={bkS.section}>
          <View style={bkS.sectionHeader}>
            <View
              style={[bkS.sectionDot, { backgroundColor: accentPrimary }]}
            />
            <AppText style={[bkS.sectionLabel, { color: outline }]}>
              SCHEDULE
            </AppText>
          </View>
          <AppText style={[bkS.sectionSub, { color: onSurfaceVariant }]}>
            Select date & time
          </AppText>

          <AppText style={[bkS.fieldLabel, { color: outline }]}>DATE</AppText>
          <View
            style={[
              bkS.card,
              {
                backgroundColor: surface,
                borderColor: border,
                shadowColor,
              },
            ]}
          >
            <WeekCalendarWithoutMonth
              selectedDay={selectedDate}
              setSelectedDay={setSelectedDate}
              containerStyle={bkS.calendar}
              selectedDayTextStyle={{ color: white }}
              selectedDayNumberStyle={{ color: white }}
              selectedContainerStyle={{
                backgroundColor: accentPrimary,
              }}
              textWeekStyle={{
                color: outline,
                fontSize: 12,
                fontWeight: "600",
              }}
              textDayStyle={{
                color: onSurface,
                fontWeight: "800",
                fontSize: 17,
              }}
              dayBoxStyle={{
                borderRadius: 14,
                backgroundColor: surfaceHigh,
              }}
              monthTextStyle={{
                color: outline,
                fontSize: 13,
                fontWeight: "500",
              }}
            />
          </View>

          <AppText style={[bkS.fieldLabel, { color: outline, marginTop: 14 }]}>
            START TIME
          </AppText>
          <View
            style={[
              bkS.card,
              {
                backgroundColor: surface,
                borderColor: border,
                shadowColor,
              },
            ]}
          >
            <TimePicker15Min
              onSelect={({ updateField, value }: any) => {
                if (updateField === "startTime" && value) setStartTime(value);
              }}
              formatedTime={selectedDate}
              init={initTime}
              setInited={setInitTime}
            />
          </View>
        </View>

        {/* ── Section Divider ───────────────────────────────────────────── */}
        <View style={[bkS.sectionDivider, { backgroundColor: borderSubtle }]} />

        {/* ── DURATION ──────────────────────────────────────────────────── */}
        <View style={bkS.section}>
          <View style={bkS.sectionHeader}>
            <View
              style={[bkS.sectionDot, { backgroundColor: accentPrimary }]}
            />
            <AppText style={[bkS.sectionLabel, { color: outline }]}>
              DURATION
            </AppText>
          </View>
          <AppText style={[bkS.sectionSub, { color: onSurfaceVariant }]}>
            Choose your play time
          </AppText>
          <View style={bkS.pillRow}>
            {PACKAGES.map((pkg) => {
              const active = hours === pkg.value;
              const ball = BALL_META[pkg.value];
              return (
                <TouchableOpacity
                  key={pkg.value}
                  activeOpacity={0.8}
                  onPress={() => setHours(pkg.value)}
                  style={[
                    bkS.pillChip,
                    {
                      backgroundColor: active ? ball.color : surface,
                      borderColor: active ? ball.color : border,
                    },
                  ]}
                >
                  {pkg.popular && !active && (
                    <View
                      style={[
                        bkS.pillBadge,
                        { backgroundColor: accentPrimary },
                      ]}
                    >
                      <AppText style={bkS.pillBadgeText}>Hot</AppText>
                    </View>
                  )}
                  {/* Pool ball circle */}
                  <View
                    style={[
                      bkS.ballCircle,
                      {
                        backgroundColor: active
                          ? "rgba(255,255,255,0.2)"
                          : ball.color,
                        borderColor: "rgba(255,255,255,0.35)",
                      },
                    ]}
                  >
                    <AppText style={bkS.ballNum}>{pkg.value}</AppText>
                  </View>
                  <View>
                    <AppText
                      style={[
                        bkS.pillLabel,
                        { color: active ? white : onSurface },
                      ]}
                    >
                      {pkg.label}
                    </AppText>
                    <AppText
                      style={[
                        bkS.pillPrice,
                        {
                          color: active
                            ? "rgba(255,255,255,0.8)"
                            : onSurfaceVariant,
                        },
                      ]}
                    >
                      ₩{(pricePerHour * pkg.value).toLocaleString()}
                    </AppText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Spacer so footer doesn't overlap */}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  }, [
    selectedTier,
    selectedDate,
    initTime,
    hours,
    pricePerHour,
    hallName,
    hallAddress,
    images,
    C,
  ]);

  // ── Step 1 content (memoized — review & confirm) ─────────────────────────
  const step1Content = useMemo(() => {
    const tierLabel =
      TABLE_TIERS.find((t) => t.id === selectedTier)?.label ?? "Table";
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={bkS.scrollContent}
      >
        {/* Venue summary */}
        <View
          style={[
            bkS.confirmCard,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <Image
            source={
              images.length > 0
                ? { uri: images[0] }
                : require("@/assets/images/computerImage/regular.png")
            }
            style={bkS.confirmImg}
          />
          <View style={bkS.confirmInfo}>
            <AppText
              style={[bkS.confirmName, { color: C.onSurface }]}
              numberOfLines={1}
            >
              {hallName}
            </AppText>
            <AppText
              style={[bkS.confirmAddr, { color: C.outline }]}
              numberOfLines={1}
            >
              {hallAddress}
            </AppText>
          </View>
        </View>

        {/* Booking details */}
        <View style={bkS.confirmSection}>
          <AppText style={[bkS.confirmSectionLabel, { color: C.outline }]}>
            RESERVATION
          </AppText>
          <TouchableOpacity onPress={() => setStep(0)}>
            <AppText style={[bkS.confirmEdit, { color: C.accentPrimary }]}>
              Edit
            </AppText>
          </TouchableOpacity>
        </View>
        <View
          style={[
            bkS.confirmCard,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          {confirmationDetails.map((item, i) => (
            <View
              key={item.label}
              style={[
                bkS.confirmRow,
                i < confirmationDetails.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: C.borderSubtle,
                },
              ]}
            >
              <View style={bkS.confirmRowIcon}>
                <View
                  style={[
                    bkS.confirmIconInner,
                    { backgroundColor: C.accentPrimaryGlow },
                  ]}
                >
                  {item.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={[bkS.confirmRowLabel, { color: C.outline }]}>
                    {item.label}
                  </AppText>
                  <AppText
                    style={[bkS.confirmRowValue, { color: C.onSurface }]}
                  >
                    {item.value}
                  </AppText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment */}
        <View style={bkS.confirmSection}>
          <AppText style={[bkS.confirmSectionLabel, { color: C.outline }]}>
            PAYMENT
          </AppText>
        </View>
        <View
          style={[
            bkS.confirmCard,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <View style={bkS.confirmRow}>
            <View style={{ flex: 1 }}>
              <AppText style={[bkS.confirmRowLabel, { color: C.outline }]}>
                {tierLabel}
              </AppText>
              <AppText
                style={[bkS.confirmRowSub, { color: C.onSurfaceVariant }]}
              >
                {hours} hour{hours > 1 ? "s" : ""}
              </AppText>
            </View>
            <AppText style={[bkS.confirmRowValue, { color: C.onSurface }]}>
              ₩{totalPrice.toLocaleString()}
            </AppText>
          </View>
          <View
            style={[bkS.confirmDivider, { backgroundColor: C.borderSubtle }]}
          />
          <View style={bkS.confirmRow}>
            <AppText style={[bkS.confirmRowLabel, { color: C.outline }]}>
              Service Fee
            </AppText>
            <AppText style={[bkS.confirmRowValue, { color: C.onSurface }]}>
              ₩{serviceFee.toLocaleString()}
            </AppText>
          </View>
          <View
            style={[bkS.confirmDivider, { backgroundColor: C.borderSubtle }]}
          />
          <View style={bkS.confirmTotal}>
            <AppText style={[bkS.confirmTotalLabel, { color: C.onSurface }]}>
              Total Amount
            </AppText>
            <AppText
              style={[bkS.confirmTotalValue, { color: C.accentPrimary }]}
            >
              ₩{grandTotal.toLocaleString()}
            </AppText>
          </View>
        </View>

        {/* Wire Payment Method */}
        <View style={bkS.confirmSection}>
          <AppText style={[bkS.confirmSectionLabel, { color: C.outline }]}>
            PAYMENT METHOD
          </AppText>
        </View>
        <View
          style={[
            bkS.confirmCard,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: C.accentPrimaryBorder,
              backgroundColor: C.accentPrimaryGlow,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: C.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name="cellphone-wireless"
                size={22}
                color={C.accentPrimary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                style={[
                  bkS.confirmRowLabel,
                  { color: C.onSurface, fontWeight: "700", marginBottom: 0 },
                ]}
              >
                Wire — Mobile Payment
              </AppText>
              <AppText
                style={[bkS.confirmRowSub, { color: C.onSurfaceVariant }]}
              >
                Bank & mobile operators
              </AppText>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: C.successGlow,
                borderWidth: 1,
                borderColor: C.successBorder,
              }}
            >
              <Ionicons name="lock-closed" size={11} color={C.successColor} />
              <AppText
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: C.successColor,
                }}
              >
                Secure
              </AppText>
            </View>
          </View>
        </View>

        <AppText style={[bkS.confirmTerms, { color: C.outline }]}>
          By confirming you accept the facility{"'"}s terms and conditions.
        </AppText>
      </ScrollView>
    );
  }, [
    C.accentPrimary,
    C.accentPrimaryGlow,
    C.border,
    C.borderSubtle,
    C.outline,
    C.onSurface,
    C.onSurfaceVariant,
    C.surface,
    hallName,
    hallAddress,
    images,
    confirmationDetails,
    selectedTier,
    hours,
    totalPrice,
    serviceFee,
    grandTotal,
    C.accentPrimaryBorder,
    C.successColor,
    C.successGlow,
    C.successBorder,
  ]);

  if (!listing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: C.backgroundColor,
        }}
      >
        <OwnActivaterIndicator color={C.accentPrimary} />
      </View>
    );
  }

  // ── BOOKING MODE ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[bkS.flex, { backgroundColor: C.backgroundColor }]}>
      {/* Header */}
      <View style={[bkS.header, { borderBottomColor: C.border }]}>
        <TouchableOpacity
          onPress={() => {
            if (step === 0) {
              router.back();
            } else {
              setStep(step - 1);
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={C.accentPrimary} />
        </TouchableOpacity>
        {stepDots}
        <View style={{ width: 32 }} />
      </View>
      {/* Felt-colour tier accent line */}
      <View
        style={{
          height: 2,
          marginHorizontal: 20,
          borderRadius: 1,
          backgroundColor: TIER_FELT[selectedTier],
          opacity: 0.6,
        }}
      />

      {/* Content */}
      {step === 0 ? step0Content : step1Content}

      {/* Footer */}
      <View
        style={[
          bkS.footer,
          {
            backgroundColor: C.surface,
            borderTopColor: C.border,
          },
        ]}
      >
        {step === 0 ? (
          <>
            <View style={{ gap: 2 }}>
              <AppText style={[bkS.footerLabel, { color: C.outline }]}>
                Total for{" "}
                {TABLE_TIERS.find((t) => t.id === selectedTier)?.label ??
                  "Table"}
              </AppText>
              <AppText
                style={[bkS.footerPrice, { color: TIER_FELT[selectedTier] }]}
              >
                ₩{totalPrice.toLocaleString()}
              </AppText>
            </View>
            <TouchableOpacity
              style={[
                bkS.primaryBtn,
                { backgroundColor: TIER_FELT[selectedTier] },
              ]}
              onPress={() => setStep(1)}
            >
              <AppText style={bkS.primaryBtnText}>Continue</AppText>
              <Ionicons name="arrow-forward" size={18} color={C.white} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[bkS.secondaryBtn, { backgroundColor: C.surfaceHigh }]}
              onPress={() => setStep(0)}
            >
              <AppText style={[bkS.secondaryBtnText, { color: C.onSurface }]}>
                Back
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[bkS.primaryBtn, { backgroundColor: C.accentPrimary }]}
              onPress={handleBooking}
            >
              <AppText style={bkS.primaryBtnText}>Confirm Booking</AppText>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Success Modal */}
      {bookSuccess && (
        <Confirm_Modal
          confirmModal={confirmModal}
          setConfirmModal={setConfirmModal}
          confirmationDetails={confirmationDetails.map((d) => ({
            ...d,
            value: d.value ?? "",
          }))}
          addToCalendar={() => console.log("Add to calendar")}
          hasScheduled={hasScheduled}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Booking Styles ──────────────────────────────────────────────────────────
const bkS = StyleSheet.create({
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  // Scroll
  scrollContent: { paddingBottom: 40 },

  // Venue Header Card
  venueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  venueThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  venueThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  venueAccent: {
    width: 3,
    height: 36,
    borderRadius: 2,
  },
  venueName: { fontSize: 17, fontWeight: "700" },
  venueMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  venueAddr: { fontSize: 11, flex: 1 },

  // Section
  section: { paddingHorizontal: 16, marginTop: 22 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  sectionSub: { fontSize: 13, marginBottom: 14, marginLeft: 12 },

  // Section Divider
  sectionDivider: {
    height: 1,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },

  // Card container (calendar / time picker)
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  calendar: { flex: 1, width: "100%", height: "100%" },

  // Tiers
  tierCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
  },
  tierLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  tierIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tierLabel: { fontSize: 16, fontWeight: "700" },
  tierDesc: { fontSize: 12, marginTop: 2 },
  tierThumb: {
    width: 65,
    height: 65,
    borderRadius: 12,
    resizeMode: "cover",
  },
  tierPrice: { fontSize: 18, fontWeight: "800" },
  tierUnit: { fontSize: 11 },
  // Time
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  // Duration Pill Chips
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    position: "relative",
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  pillPrice: {
    fontSize: 12,
    fontWeight: "700",
  },
  pillBadge: {
    position: "absolute",
    top: -8,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 10,
  },
  pillBadgeText: { color: "#FFFFFF", fontSize: 8, fontWeight: "800" },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: { fontSize: 12 },
  footerPrice: { fontSize: 20, fontWeight: "800" },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // ── Step 1 Confirm Styles ──
  confirmCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  confirmImg: { width: "100%", height: 120 },
  confirmInfo: { padding: 14, gap: 4 },
  confirmName: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  confirmAddr: { fontSize: 12, fontWeight: "400", lineHeight: 16 },
  confirmSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  confirmSectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    lineHeight: 14,
  },
  confirmEdit: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  confirmRowIcon: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  confirmIconInner: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmRowLabel: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
    marginBottom: 1,
  },
  confirmRowValue: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  confirmRowSub: {
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 15,
    marginTop: 2,
  },
  confirmDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  confirmTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 14,
  },
  confirmTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  confirmTotalValue: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
  },
  confirmTerms: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  secondaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "700" },

  // ── Billiard-specific ─────────────────────────────────────────────────────
  tierStripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  feltBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  feltBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  ballCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  ballNum: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
});

export default React.memo(BookingBoardGame);
