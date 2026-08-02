import { useHallInfo } from "@/context/hall_info_context";
import { useTheme } from "@/context/theme_context";
import {
  AntDesign,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import {
  WeekCalendarWithoutMonth,
  TimePicker15Min,
} from "@/components/book/strip_calendar";
import AppText from "@/components/ui/app_text";
import {
  EsportHallDataType,
  EsportHallPrices,
  SportHallPrice,
} from "@/types/hall_info_type";
import {
  HallDetailSeparator,
  HallTypesSeparator,
} from "@/types/hall_separator_type";
import axiosInstance from "@/hooks/axiosInstance";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { saveToken } from "@/components/book/session";
import Confirm_Modal from "@/components/book/confirmation";
import { format } from "date-fns";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { bookingNotificationSchedule } from "@/context/store/notification_store";
import { queryClient } from "@/hooks/queryClient";
import Animated, { useSharedValue } from "react-native-reanimated";
import SportHallReviewPage, { Review } from "@/app/review/hall_review";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";

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
  isSpecial?: boolean;
}[] = [
  { label: "1 Hour", value: 1 },
  { label: "2 Hours", value: 2 },
  { label: "3 Hours", value: 3, popular: true },
  { label: "5 Hours", value: 5 },
  { label: "Whole Day", value: 8, isSpecial: true },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatPrice = (price: string) => {
  const num = parseInt(price, 10);
  return isNaN(num) ? "0" : num.toLocaleString();
};

const getTierPrice = (
  prices: EsportHallPrices | undefined,
  tier: string,
): SportHallPrice | null => {
  if (!prices) return null;
  switch (tier) {
    case "regular":
      return prices.pcHall;
    case "vip":
      return prices.pcVipHall;
    case "stage":
      return prices.pcStageHall;
    default:
      return null;
  }
};

// ─── Billiard feature icons ──────────────────────────────────────────────────
const featureIcons: Record<string, { label: string; icon: React.ReactNode }> = {
  billiards: {
    label: "Billiards",
    icon: <FontAwesome5 name="table-tennis" size={18} color="#FFF" />,
  },
  darts: {
    label: "Darts",
    icon: <FontAwesome5 name="bullseye" size={18} color="#FFF" />,
  },
  wifi: {
    label: "Wi-Fi",
    icon: <Feather name="wifi" size={20} color="#FFF" />,
  },
  parking: {
    label: "Parking",
    icon: <FontAwesome5 name="parking" size="18" color="#FFF" />,
  },
  changing_room: {
    label: "Changing Room",
    icon: <FontAwesome name="shower" size={18} color="#FFF" />,
  },
  shower: {
    label: "Shower",
    icon: <Ionicons name="water" size={20} color="#FFF" />,
  },
};

const BookingBoardGame = ({
  listing: propListing,
  hallID: propHallID,
}: BookingBoardGameProps) => {
  const { colors: C } = useTheme();
  const { width, height } = useWindowDimensions();
  const { hall_id: routeHallId } = useLocalSearchParams();
  const { getSpecificHall } = useHallInfo();

  // ── Resolve listing: from props (when rendered by book/[hall_id]) or route ──
  const hallId = propHallID ?? String(routeHallId ?? "");
  const listing =
    propListing ?? (getSpecificHall(hallId) as EsportHallDataType | undefined);

  const images = listing?.hall_details?.hall_imageURLs ?? [];
  const hallName = listing?.hall_details?.hall_name ?? "Billiard Hall";
  const hallAddress = listing?.hall_details?.hall_address ?? "";
  const hallPrices = listing?.hall_details?.hall_price as
    | EsportHallPrices
    | undefined;
  const workTime = listing?.hall_details?.hall_work_time;

  // ── State ──────────────────────────────────────────────────────────────────
  const [isBooking, setIsBooking] = useState(false); // detail vs booking mode
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTier, setSelectedTier] = useState<"regular" | "vip" | "stage">(
    "regular",
  );
  const [hours, setHours] = useState<number>(1);
  const [startTime, setStartTime] = useState<Date | string>(new Date());
  const [initTime, setInitTime] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const hasScheduled = useRef(false);

  // ── Detail page state ──────────────────────────────────────────────────────
  const imageRef = useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);
  const [activeTab, setActiveTab] = useState(HallDetailSeparator.DETAILS);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [noMore, setNoMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);

  const tabs = [
    { key: HallDetailSeparator.DETAILS, label: "Details" },
    { key: HallDetailSeparator.AMENTITIES, label: "Amenities" },
    { key: HallDetailSeparator.REVIEW, label: "Review" },
  ];

  // ── Pricing ────────────────────────────────────────────────────────────────
  const tierPrice = getTierPrice(hallPrices, selectedTier);
  const pricePerHour = tierPrice ? parseInt(tierPrice.oneHour, 10) : 0;
  const totalPrice = pricePerHour * hours;
  const serviceFee = pricePerHour > 0 ? Math.round(pricePerHour * 0.05) : 0;
  const grandTotal = totalPrice + serviceFee;

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);

  // ── Reviews fetch (same pattern as Pc_Halls) ────────────────────────────────
  useEffect(() => {
    if (activeTab !== "review" || fetched.current || noMore || !listing) return;
    fetched.current = true;
    setLoading(true);
    let mounted = true;
    axiosInstanceRegular
      .get(`/zaal-review/${listing.sportHallID}?page=${page}`)
      .then((res) => {
        fetched.current = false;
        if (!mounted) return;
        if (!res.data?.success || !res.data.data) {
          setLoading(false);
          return;
        }
        const d = res.data.data;
        setReviews((prev) => {
          const m = { ...prev };
          d.reviews.forEach((r: Review) => {
            if (!prev[r._id]) m[r._id] = r;
          });
          const keys = Object.keys(m);
          if (keys.length > 50) {
            keys.slice(0, keys.length - 50).forEach((k) => delete m[k]);
          }
          return m;
        });
        if (d.reviews.length < 10) setNoMore(true);
        setRating(d.avg_rating);
        setCount(d.review_count);
        setLoading(false);
      })
      .catch(() => {
        fetched.current = false;
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page, activeTab, listing]);

  useEffect(() => {
    setReviews({});
    setPage(0);
    setNoMore(false);
    fetched.current = false;
  }, [listing?.sportHallID]);

  // ── Price generator (matching Pc_Halls pattern) ──────────────────────────────
  const priceGen = useCallback(
    (t: "hour" | "wholeDay") => {
      if (!hallPrices) return null;
      return Object.entries(hallPrices).map(([k, v]: [string, any], i) => (
        <View key={i} style={detS.priceRow}>
          <AppText style={[detS.priceLabel, { color: C.onSurface }]}>
            {k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
          </AppText>
          <AppText style={[detS.priceValue, { color: C.accentPrimary }]}>
            ₩{t === "hour" ? formatPrice(v.oneHour) : formatPrice(v.wholeDay)}
          </AppText>
        </View>
      ));
    },
    [hallPrices, C],
  );

  // ── Detail tab content ──────────────────────────────────────────────────────
  const hallFeatures = listing?.hall_details?.hall_feature;
  const activeFeatures = hallFeatures
    ? Object.entries(featureIcons).filter(
        ([key]) => hallFeatures[key as keyof typeof hallFeatures],
      )
    : [];

  const detailContent = useMemo(() => {
    if (!listing) return {};
    return {
      [HallDetailSeparator.DETAILS]: [
        {
          label: "About",
          value: `Professional billiard & board game hall featuring premium tables, darts area, and lounge. ${listing.hall_details.hall_name} offers top-tier equipment and a relaxed atmosphere.`,
        },
        {
          label: "Opening Hours",
          value: `${workTime?.start_time ?? "09:00"} - ${workTime?.end_time ?? "23:00"}`,
        },
        {
          label: "Phone",
          value: listing.hall_details.hall_phone_number ?? "N/A",
        },
        ...(activeFeatures.length > 0
          ? [
              {
                label: "Facilities",
                resolve: activeFeatures.map(([, v], i) => (
                  <View style={detS.facilityItem} key={i}>
                    <View
                      style={[
                        detS.facilityIcon,
                        { backgroundColor: C.accentPrimary },
                      ]}
                    >
                      {v.icon}
                    </View>
                    <AppText style={[detS.facilityLabel, { color: C.outline }]}>
                      {v.label}
                    </AppText>
                  </View>
                )),
              },
            ]
          : []),
        {
          label: "Prices Per Hour",
          component: <>{priceGen("hour")}</>,
        },
        {
          label: "Whole Day Rates",
          component: <>{priceGen("wholeDay")}</>,
        },
      ],
      [HallDetailSeparator.AMENTITIES]: [
        {
          label: "Amenities",
          value:
            "Smoking area, beverage service, locker storage, and free Wi-Fi available for all guests.",
        },
      ],
      [HallDetailSeparator.REVIEW]: [
        {
          label: undefined,
          component: loading ? (
            <View style={detS.loadingWrap}>
              <OwnActivaterIndicator />
            </View>
          ) : (
            <SportHallReviewPage
              sport_hall_id={listing.sportHallID}
              reviews={reviews}
              rating={rating}
              count={count}
              setPage={setPage}
            />
          ),
        },
      ],
    };
  }, [listing, activeFeatures, C, loading, reviews, rating, count, priceGen]);

  // ── Booking handler ──────────────────────────────────────────────────────────
  const handleBooking = useCallback(async () => {
    try {
      setIsWaiting(true);
      const timezone = encodeURIComponent(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      const response = await axiosInstance.post(
        "/auth/book/esport",
        {
          sport_hall_id: listing?.sportHallID,
          date: selectedDate,
          timezone,
          tier: selectedTier,
          hours,
          startTime,
        },
        { timeout: 10000 },
      );
      if (response.status === 200 && response.data.success) {
        const token = response.data.session;
        saveToken(token);
        Notifier.showNotification({
          title: "Successfully Booked",
          description: "Check Booking from Order Section",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "success" },
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
        Notifier.showNotification({
          title: "Booking Exists",
          description:
            err.response.data.message ||
            "Conflict in booking. Please choose a different time.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
      } else {
        Notifier.showNotification({
          title: "Booking Failed",
          description: "An error occurred. Please try again.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
      }
    } finally {
      setIsWaiting(false);
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
          <View style={[bkS.venueAccent, { backgroundColor: accentPrimary }]} />
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
            const tPrice = getTierPrice(hallPrices, tier.id);
            const price = tPrice ? parseInt(tPrice.oneHour, 10) : 0;
            return (
              <TouchableOpacity
                key={tier.id}
                activeOpacity={0.8}
                onPress={() => setSelectedTier(tier.id)}
                style={[
                  bkS.tierCard,
                  {
                    backgroundColor: surface,
                    borderColor: active ? accentPrimary : border,
                  },
                ]}
              >
                <View style={bkS.tierLeft}>
                  <View
                    style={[
                      bkS.tierIcon,
                      {
                        backgroundColor: active
                          ? accentPrimaryGlow
                          : backgroundColor,
                        borderColor: active ? accentPrimary : border,
                      },
                    ]}
                  >
                    <Image source={tier.image} style={bkS.tierThumb} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText
                      style={[
                        bkS.tierLabel,
                        { color: active ? accentPrimary : onSurface },
                      ]}
                    >
                      {tier.label}
                    </AppText>
                    <AppText style={[bkS.tierDesc, { color: outline }]}>
                      {tier.desc}
                    </AppText>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <AppText style={[bkS.tierPrice, { color: onSurface }]}>
                    ₩{price.toLocaleString()}
                  </AppText>
                  <AppText style={[bkS.tierUnit, { color: outline }]}>
                    /hr
                  </AppText>
                </View>
                {active && (
                  <View style={[bkS.tick, { backgroundColor: accentPrimary }]}>
                    <Ionicons name="checkmark" size={11} color={white} />
                  </View>
                )}
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
              return (
                <TouchableOpacity
                  key={pkg.value}
                  activeOpacity={0.8}
                  onPress={() => setHours(pkg.value)}
                  style={[
                    bkS.pillChip,
                    {
                      backgroundColor: active
                        ? accentPrimary
                        : pkg.isSpecial
                          ? surfaceHigh
                          : surface,
                      borderColor: active ? accentPrimary : border,
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
                      <AppText style={bkS.pillBadgeText}>Popular</AppText>
                    </View>
                  )}
                  {pkg.isSpecial && (
                    <Ionicons
                      name="moon"
                      size={13}
                      color={active ? white : accentPrimary}
                    />
                  )}
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
                      { color: active ? white : onSurfaceVariant },
                    ]}
                  >
                    ₩{(pricePerHour * pkg.value).toLocaleString()}
                  </AppText>
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
    hallPrices,
    pricePerHour,
    hallName,
    hallAddress,
    images,
    C.onSurface,
    C.outline,
    C.accentPrimary,
    C.accentPrimaryGlow,
    C.border,
    C.borderSubtle,
    C.surface,
    C.surfaceHigh,
    C.shadowColor,
    C.onSurfaceVariant,
    C.white,
    C.backgroundColor,
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
    C.white,
    C.backgroundColor,
    hallName,
    hallAddress,
    images,
    confirmationDetails,
    selectedTier,
    hours,
    totalPrice,
    serviceFee,
    grandTotal,
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
        <OwnActivaterIndicator />
      </View>
    );
  }

  if (isWaiting) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: C.backgroundColor,
        }}
      >
        <OwnActivaterIndicator />
      </View>
    );
  }

  // ── DETAIL MODE ─────────────────────────────────────────────────────────────
  if (!isBooking) {
    return (
      <View style={[detS.flex, { backgroundColor: C.backgroundColor }]}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <Animated.ScrollView
          style={{ backgroundColor: C.backgroundColor }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        >
          {/* Image Carousel */}
          <View style={[detS.carouselWrap, { backgroundColor: C.surfaceHigh }]}>
            <Carousel
              ref={imageRef}
              width={width}
              height={400}
              loop={false}
              data={images.length > 0 ? images : [""]}
              scrollAnimationDuration={500}
              onProgressChange={(p) => {
                progress.value = p;
              }}
              renderItem={({ item }) => (
                <Image
                  source={
                    item
                      ? { uri: item }
                      : require("@/assets/images/computerImage/regular.png")
                  }
                  style={detS.carouselImg}
                />
              )}
            />
            <Pagination.Custom
              progress={progress}
              data={
                images.length > 0
                  ? images
                  : [require("@/assets/images/computerImage/regular.png")]
              }
              dotStyle={{
                width: 25,
                height: 4,
                backgroundColor: C.onSurface,
              }}
              activeDotStyle={{
                width: 25,
                height: 4,
                overflow: "hidden",
                backgroundColor: C.accentPrimary,
              }}
              containerStyle={detS.dotContainer}
              horizontal
              onPress={(i) =>
                imageRef.current?.scrollTo({
                  count: i - progress.value,
                  animated: true,
                })
              }
            />
            <View style={detS.iconBtnWrap}>
              <TouchableOpacity
                style={[detS.iconBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}
                onPress={() => router.back()}
              >
                <Feather name="arrow-left" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[detS.iconBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}
              >
                <AntDesign name="heart" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.6)"]}
              style={detS.imgGradient}
            />
          </View>

          {/* Title Card */}
          <View
            style={[
              detS.titleCard,
              {
                backgroundColor: C.surfaceHighest,
                shadowColor: C.shadowColor,
              },
            ]}
          >
            <LinearGradient
              colors={[C.accentPrimary, C.accentPrimaryBorder]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={detS.titleAccent}
            />
            <AppText style={[detS.hallName, { color: C.onSurface }]}>
              {hallName}
            </AppText>
            <View style={detS.ratingRow}>
              <AntDesign name="star" size={14} color="#FFD700" />
              <AppText style={[detS.ratingText, { color: C.onSurfaceVariant }]}>
                {rating > 0 ? rating.toFixed(1) : "4.8"}{" "}
                <AppText style={{ color: C.outline }}>
                  ({count > 0 ? count : 120} reviews)
                </AppText>
              </AppText>
            </View>
            <View style={detS.addrRow}>
              <Ionicons name="location-sharp" size={14} color={C.outline} />
              <AppText
                style={[detS.addrText, { color: C.outline }]}
                numberOfLines={1}
              >
                {hallAddress}
              </AppText>
            </View>
          </View>

          {/* Tabs */}
          <LinearGradient
            colors={[C.backgroundColor, C.surfaceHigh]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={detS.gradientWrap}
          >
            <View style={detS.contentPad}>
              {/* Tab bar */}
              <View style={[detS.tabRow, { borderBottomColor: C.border }]}>
                {tabs.map((t) => (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => setActiveTab(t.key as HallDetailSeparator)}
                    style={[
                      detS.tabItem,
                      activeTab === t.key && {
                        borderBottomWidth: 2,
                        borderBottomColor: C.accentPrimary,
                      },
                    ]}
                  >
                    <AppText
                      style={[
                        detS.tabLabel,
                        {
                          color:
                            activeTab === t.key ? C.accentPrimary : C.outline,
                        },
                        activeTab === t.key && { fontWeight: "700" },
                      ]}
                    >
                      {t.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tab content */}
              {(
                detailContent[activeTab] as {
                  label?: string;
                  value?: string;
                  component?: React.ReactNode;
                  resolve?: React.ReactNode[];
                }[]
              )?.map((item: any, i: number) => (
                <View style={detS.sectionBlock} key={i}>
                  {item.label && (
                    <AppText
                      style={[detS.sectionTitle, { color: C.onSurface }]}
                    >
                      {item.label}
                    </AppText>
                  )}
                  {"component" in item ? (
                    <View style={detS.sectionContent}>{item.component}</View>
                  ) : "resolve" in item ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={detS.sectionContent}
                    >
                      {item.resolve}
                    </ScrollView>
                  ) : (
                    <AppText
                      style={[detS.sectionValue, { color: C.onSurfaceVariant }]}
                    >
                      {item.value}
                    </AppText>
                  )}
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.ScrollView>

        {/* Bottom Bar */}
        <View
          style={[
            detS.bottomBar,
            {
              backgroundColor: C.surfaceHighest,
              borderTopColor: C.accentPrimary,
              borderTopWidth: 2,
            },
          ]}
        >
          <View>
            <AppText style={[detS.priceSmall, { color: C.outline }]}>
              Starting from
            </AppText>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <AppText style={[detS.priceBig, { color: C.accentPrimary }]}>
                ₩{hallPrices ? formatPrice(hallPrices.pcHall.oneHour) : "0"}
              </AppText>
              <AppText style={[detS.priceUnit, { color: C.outline }]}>
                {" "}
                / hour
              </AppText>
            </View>
          </View>
          <TouchableOpacity
            style={[detS.bookBtn, { backgroundColor: C.accentPrimary }]}
            onPress={() => setIsBooking(true)}
          >
            <AppText style={detS.bookBtnText}>Book Now →</AppText>
          </TouchableOpacity>
        </View>
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
            step > 0 ? setStep(0) : setIsBooking(false);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={C.accentPrimary} />
        </TouchableOpacity>
        {stepDots}
        <View style={{ width: 32 }} />
      </View>

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
              <AppText style={[bkS.footerPrice, { color: C.onSurface }]}>
                ₩{totalPrice.toLocaleString()}
              </AppText>
            </View>
            <TouchableOpacity
              style={[bkS.primaryBtn, { backgroundColor: C.accentPrimary }]}
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
          hasScheduled={hasScheduled.current}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Detail Styles ───────────────────────────────────────────────────────────
const detS = StyleSheet.create({
  flex: { flex: 1 },
  carouselWrap: {
    height: 350,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  carouselImg: { width: "100%", height: "100%" },
  iconBtnWrap: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: { padding: 10, borderRadius: 25 },
  imgGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  dotContainer: { gap: 12, bottom: 120 },
  titleCard: {
    marginHorizontal: 20,
    marginTop: -60,
    borderRadius: 30,
    padding: 22,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  titleAccent: {
    width: "30%",
    height: 3,
    borderRadius: 2,
    marginBottom: 14,
  },
  hallName: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 13, fontWeight: "600" },
  addrRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  addrText: { fontSize: 13, flex: 1 },
  gradientWrap: { flex: 1 },
  contentPad: { marginHorizontal: 16, flex: 1 },
  tabRow: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabLabel: { fontSize: 14 },
  sectionBlock: { paddingVertical: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 2 },
  sectionContent: { paddingVertical: 6 },
  sectionValue: { fontSize: 14, lineHeight: 20 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  priceLabel: { fontWeight: "500", fontSize: 13 },
  priceValue: { fontWeight: "600", fontSize: 13 },
  facilityItem: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    gap: 3,
  },
  facilityIcon: { borderRadius: 22, padding: 8 },
  facilityLabel: { textAlign: "center", fontSize: 11 },
  loadingWrap: { justifyContent: "center", alignItems: "center", height: 180 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    elevation: 8,
  },
  priceSmall: { fontSize: 11 },
  priceBig: { fontSize: 22, fontWeight: "800" },
  priceUnit: { fontSize: 13, fontWeight: "400" },
  bookBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 22,
  },
  bookBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});

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
  headerTitle: { fontSize: 17, fontWeight: "700" },

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
  tick: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },

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
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
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
});

export default BookingBoardGame;
