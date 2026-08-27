import { useHallInfo } from "@/context/hall_info_context";
import { EsportBookingData, useBookingStore } from "@/context/store/book_store";
import { useTheme } from "@/context/theme_context";
import {
  AntDesign,
  Feather,
  FontAwesome5,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
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
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { openCheckoutBrowser } from "@/utils/paymentBrowser";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import { LinearGradient } from "expo-linear-gradient";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import AppText from "@/components/ui/app_text";
import { EsportHallDataType } from "@/types/hall_info_type";
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
import Step_one_pc from "@/components/book/esport_component.tsx/step1_pc";
import Step_two_pc from "@/components/book/esport_component.tsx/step2_pc";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Props ───────────────────────────────────────────────────────────────────
export interface CombinedEsportHallProps {
  listing?: EsportHallDataType;
  hallID?: string;
  hallType?: HallTypesSeparator;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const FEATURE_ICONS: Record<string, { label: string; icon: React.ReactNode }> =
  {
    wifi: {
      label: "Wi-Fi",
      icon: <Feather name="wifi" size={18} color="#FFF" />,
    },
    parking: {
      label: "Parking",
      icon: <FontAwesome5 name="parking" size={18} color="#FFF" />,
    },
    free_wifi: {
      label: "Free Wi-Fi",
      icon: <Feather name="wifi" size={18} color="#FFF" />,
    },
  };

const TIERS = [
  {
    id: "hall" as const,
    label: "Regular Zone",
    icon: "🖥️",
    desc: "Social & Energetic",
  },
  {
    id: "vip" as const,
    label: "VIP Zone",
    icon: "🔒",
    desc: "Quiet & Focused",
  },
  {
    id: "stage" as const,
    label: "Stage Zone",
    icon: "🎤",
    desc: "Performance & Events",
  },
];

const PACKAGES = [
  { label: "1 Hour", value: 1, price: 1200 },
  { label: "3 Hours", value: 3, price: 3000, popular: true },
  { label: "5 Hours", value: 5, price: 9000 },
  {
    label: "Night Pass",
    value: 8,
    price: 12000,
    isSpecial: true,
    night: "10PM-6AM",
  },
];

const fmtP = (p: string) => {
  const n = parseInt(p, 10);
  return isNaN(n) ? "0" : n.toLocaleString();
};
const fmtK = (k: string) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

const dFmt = "MMM d, yyyy";

// ══════════════════════════════════════════════════════════════════════════════
const CombinedEsportHall = ({
  listing: pList,
  hallID: pHID,
}: CombinedEsportHallProps) => {
  const { colors: C } = useTheme();
  const { width } = useWindowDimensions();
  const { hall_id: routeId } = useLocalSearchParams();
  const { getSpecificHall } = useHallInfo();

  const hid = pHID ?? String(routeId ?? "");
  const listing =
    pList ?? (getSpecificHall(hid) as EsportHallDataType | undefined);
  const imgs = listing?.hall_details?.hall_imageURLs ?? [];
  const hName = listing?.hall_details?.hall_name ?? "PC Bang";
  const hAddr = listing?.hall_details?.hall_address ?? "";
  const hPrices = listing?.hall_details?.hall_price;
  const hWork = listing?.hall_details?.hall_work_time;
  const hFeat = listing?.hall_details?.hall_feature;

  // ── Detail state ───────────────────────────────────────────────────────────
  const imgRef = useRef<ICarouselInstance>(null);
  const prog = useSharedValue(0);
  const rFetched = useRef(false);
  const [tab, setTab] = useState(HallDetailSeparator.DETAILS);
  const [revs, setRevs] = useState<Record<string, Review>>({});
  const [rRating, setRRating] = useState(0);
  const [rCount, setRCount] = useState(0);
  const [rPage, setRPage] = useState(0);
  const [rEnd, setREnd] = useState(false);
  const [rLoad, setRLoad] = useState(false);

  const tabs = [
    { key: HallDetailSeparator.DETAILS, label: "Details" },
    { key: HallDetailSeparator.AMENTITIES, label: "Amenities" },
    { key: HallDetailSeparator.REVIEW, label: "Review" },
  ];

  // ── Booking state ──────────────────────────────────────────────────────────
  const [book, setBook] = useState(false);
  const [step, setStep] = useState(0);
  const [sDate, setSDate] = useState(new Date());
  const [sTier, setSTier] = useState<"regular" | "vip" | "stage">("regular");
  const [hours, setHours] = useState(1);
  const [sTime, setSTime] = useState<Date | string>(new Date());
  const [tInit, setTInit] = useState(false);
  const [wait, setWait] = useState(false);
  const [waitingText, setWaitingText] = useState("");
  const [suc, setSuc] = useState(false);
  const [modal, setModal] = useState(false);
  const sched = useRef(false);

  // ── Derived pricing ────────────────────────────────────────────────────────
  const totalPrice = PACKAGES.find((p) => p.value === hours)?.price ?? 0;
  const serviceFee = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + serviceFee;

  // ── Zustand store for step components ──────────────────────────────────
  const bookingDetails = useBookingStore((s) => s.esportBookingDetails);
  const setBookingDetails = useBookingStore((s) => s.setEsportBookingDetails);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || !listing) return;
    initRef.current = true;
    setBookingDetails({
      name: hName,
      date: sDate,
      sportHallID: listing?.sportHallID ?? "",
      price: hPrices ?? {
        pcHall: { oneHour: "0", wholeDay: "0" },
        pcVipHall: { oneHour: "0", wholeDay: "0" },
        pcStageHall: { oneHour: "0", wholeDay: "0" },
      },
      imageUrls: imgs,
      location: listing?.hall_locations ?? { latitude: "", longitude: "" },
      tier: sTier,
      hours: 1,
      startTime: sTime,
      bookingDate: sDate,
    } as EsportBookingData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Review fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (tab !== "review" || rFetched.current || rEnd || !listing) return;
    rFetched.current = true;
    setRLoad(true);
    let mounted = true;
    axiosInstanceRegular
      .get(`/zaal-review/${listing.sportHallID}?page=${rPage}`)
      .then((res) => {
        rFetched.current = false;
        if (!mounted) return;
        if (!res.data?.success || !res.data.data) {
          setRLoad(false);
          return;
        }
        const d = res.data.data;
        setRevs((prev) => {
          const m = { ...prev };
          d.reviews.forEach((r: Review) => {
            if (!prev[r._id]) m[r._id] = r;
          });
          const keys = Object.keys(m);
          if (keys.length > 50)
            keys.slice(0, keys.length - 50).forEach((k) => delete m[k]);
          return m;
        });
        if (d.reviews.length < 10) setREnd(true);
        setRRating(d.avg_rating);
        setRCount(d.review_count);
        setRLoad(false);
      })
      .catch(() => {
        rFetched.current = false;
        if (mounted) setRLoad(false);
      });
    return () => {
      mounted = false;
    };
  }, [rPage, tab, listing]);

  useEffect(() => {
    setRevs({});
    setRPage(0);
    setREnd(false);
    rFetched.current = false;
  }, [listing?.sportHallID]);

  // ── Detail price gen ───────────────────────────────────────────────────────
  const priceGen = useCallback(
    (t: "hour" | "wholeDay") => {
      if (!hPrices) return null;
      return Object.entries(hPrices).map(([k, v]: [string, any], i) => (
        <View key={i} style={dS.priceRow}>
          <AppText style={[dS.priceLabel, { color: C.onSurface }]}>
            {fmtK(k)}
          </AppText>
          <AppText style={[dS.priceValue, { color: C.accentPrimary }]}>
            ₩{t === "hour" ? fmtP(v.oneHour) : fmtP(v.wholeDay)}
          </AppText>
        </View>
      ));
    },
    [hPrices, C],
  );

  // ── Detail content ─────────────────────────────────────────────────────────
  const aFeat = hFeat
    ? Object.entries(FEATURE_ICONS).filter(
        ([k]) => hFeat[k as keyof typeof hFeat],
      )
    : [];
  const detContent = useMemo(() => {
    if (!listing) return {};
    return {
      [HallDetailSeparator.DETAILS]: [
        {
          label: "About",
          value: `Premium gaming center with high-spec PCs, ergonomic chairs, and a competitive atmosphere. ${hName} offers the ultimate experience for gamers.`,
        },
        {
          label: "Opening Hours",
          value: `${hWork?.start_time ?? "00:00"} - ${hWork?.end_time ?? "23:59"}`,
        },
        {
          label: "Phone",
          value: listing.hall_details.hall_phone_number ?? "N/A",
        },
        ...(aFeat.length > 0
          ? [
              {
                label: "Facilities",
                resolve: aFeat.map(([, v], i) => (
                  <View style={dS.facItem} key={i}>
                    <View
                      style={[dS.facIcon, { backgroundColor: C.accentPrimary }]}
                    >
                      {v.icon}
                    </View>
                    <AppText style={[dS.facLabel, { color: C.outline }]}>
                      {v.label}
                    </AppText>
                  </View>
                )),
              },
            ]
          : []),
        { label: "Prices Per Hour", component: <>{priceGen("hour")}</> },
        { label: "Whole Day Rates", component: <>{priceGen("wholeDay")}</> },
      ],
      [HallDetailSeparator.AMENTITIES]: [
        {
          label: "Amenities",
          value:
            "High-speed fiber internet, free coffee & snacks, comfortable seating, air conditioning, and 24/7 operation.",
        },
      ],
      [HallDetailSeparator.REVIEW]: [
        {
          label: undefined,
          component: rLoad ? (
            <View style={dS.loading}>
              <OwnActivaterIndicator />
            </View>
          ) : (
            <SportHallReviewPage
              sport_hall_id={listing.sportHallID}
              reviews={revs}
              rating={rRating}
              count={rCount}
              setPage={setRPage}
            />
          ),
        },
      ],
    };
  }, [listing, aFeat, C, rLoad, revs, rRating, rCount, priceGen]);

  // ── Booking handler ───────────────────────────────────────────────────────
  // The server pre-checks the slot (conflict + security) when creating the
  // payment link, stores the pending booking, and the Wire webhook processes
  // it via BullMQ after the payment succeeds — the user never waits for the
  // booking itself, only for the checkout link.
  const handleBook = useCallback(async () => {
    try {
      setWait(true);
      const tz = encodeURIComponent(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      let paymentIntentId: string | null = null;
      let bookingSession: string | null = null;

      // ── 1) Payment — pre-check + create Wire payment intent & open checkout ──
      setWaitingText("Creating payment…");
      try {
        const sessionId = `intent_sessions`;
        const sessions = await AsyncStorage.getItem(sessionId);
        const parsedSessions: any = sessions ? JSON.parse(sessions) : [];
        let activeSessions: any[] = parsedSessions.filter(
          (i: any) => Date.now() < i.expiresAt,
        );

        console.log("activeSession", activeSessions.length);

        const paymentRes = await axiosInstance.post("/auth/book/intent", {
          amount: Math.round(grandTotal),
          booking: {
            type: "esport",
            sport_hall_id: listing?.sportHallID,
            date: bookingDetails?.bookingDate ?? sDate,
            timezone: tz,
            tier: bookingDetails?.tier ?? sTier,
            hours: bookingDetails?.hours ?? hours,
            startTime: bookingDetails?.startTime ?? sTime,
          },
        });
        const session = paymentRes.data?.result;
        if (session?.error) {
          setWait(false);
          Notifier.showNotification({
            title: "Payment Failed",
            description: session.error,
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
          return;
        }
        const checkoutUrl = session?.checkout_url ?? session?.url ?? null;
        paymentIntentId = session?.payment_intent ?? null;
        if (!paymentIntentId) {
          setWait(false);
          Notifier.showNotification({
            title: "Payment Failed",
            description: "Could not start payment. Please try again.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
          return;
        } else {
          const identifier = `${bookingDetails?.sportHallID}_${bookingDetails?.date}`;
          if (session.reused) {
            const exists = activeSessions.some(
              (s) => s.intentId === paymentIntentId,
            );
            if (exists) {
              activeSessions = activeSessions.map((s) =>
                s.intentId === paymentIntentId
                  ? { ...s, expiresAt: Date.now() + 10 * 60 * 1000, identifier }
                  : s,
              );
            } else {
              activeSessions.push({
                intentId: paymentIntentId,
                expiresAt: Date.now() + 10 * 60 * 1000,
                identifier,
              });
            }
          } else {
            activeSessions.push({
              intentId: paymentIntentId,
              expiresAt: Date.now() + 10 * 60 * 1000,
              identifier,
            });
          }

          if (activeSessions.length > 0) {
            await AsyncStorage.setItem(
              sessionId,
              JSON.stringify(activeSessions),
            );
          } else {
            await AsyncStorage.removeItem(sessionId);
          }
        }
        // ── Wait for the user to pay (QPay / bank / …) ──
        const waitForPayment = async (
          intentId: string,
          maxPolls: number,
        ): Promise<"paid" | "failed" | "timeout"> => {
          setWaitingText("Confirming payment…");
          for (let i = 0; i < maxPolls; i++) {
            try {
              const stRes = await axiosInstance.get(
                `/auth/payment/status/${intentId}`,
              );
              const status = stRes.data?.status;
              bookingSession = stRes.data?.session ?? null;
              switch (status) {
                case "succeeded":
                  return "paid";

                case "canceled":
                  return "failed";

                case "requires_action":
                  return "failed";

                case "new":
                case "processing":
                case "requires_capture":
                  // Not finished yet → continue polling
                  break;
                case "requires_payment_method":
                  // Payment wasn't successfully completed.
                  return "failed";
                default:
                  // Unknown status → don't incorrectly mark payment as failed.
                  console.warn("Unknown payment status:", status);
                  break;
              }
            } catch (err) {
              console.log("Payment status request failed", err);
              return "failed";
            }
            await new Promise((r) => setTimeout(r, 2000));
          }
          return "timeout";
        };

        // Open the checkout page in the system browser. The deep-link
        // redirect (projectSags://payment-result?payment_intent=...) plus the
        // app returning to the foreground tells us success vs. cancel. If the
        // user closes it without paying (pressed Done), treat it as canceled:
        // stop polling right away and let them re-tap the book button to pay
        // again.
        let outcome: "paid" | "failed" | "timeout" = "timeout";
        if (checkoutUrl) {
          let maxPolls = 15;
          try {
            let browserResult: "success" | "cancel" | "error" = "error";
            try {
              if (await InAppBrowser.isAvailable()) {
                await InAppBrowser.open(checkoutUrl, {
                  ephemeralWebSession: false,
                  dismissButtonStyle: "cancel",
                  showTitle: true,
                  enableUrlBarHiding: true,
                  enableDefaultShare: false,
                  forceCloseOnRedirection: true,
                });
                browserResult = "cancel";
              } else {
                browserResult = await openCheckoutBrowser(checkoutUrl);
              }
            } catch {
              browserResult = await openCheckoutBrowser(checkoutUrl);
            }
            if (browserResult === "success") {
              // the webhook/worker to finish and grab the session.
              maxPolls = 10;
            } else if (browserResult === "cancel") {
              // User closed the browser without paying — stop fast.
              maxPolls = 3;
            } else {
              outcome = "failed";
            }
          } catch {
            outcome = "failed";
          }
          if (outcome !== "failed") {
            outcome = await waitForPayment(paymentIntentId, maxPolls);
          }
        }
        if (outcome !== "paid") {
          setWait(false);
          Notifier.showNotification({
            title: "Payment Not Completed",
            description:
              outcome === "failed"
                ? "The payment was canceled or expired. Press book to try again."
                : outcome === "timeout"
                  ? "We couldn't confirm the payment yet. Check your orders shortly."
                  : "Payment canceled. Press book to try again.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
          return;
        }
      } catch (err: any) {
        setWait(false);
        if (err.response?.status === 409) {
          Notifier.showNotification({
            title: "Time Slot Taken",
            description:
              err.response.data?.message ||
              "This time slot is no longer available. Please choose another.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
          return;
        }
        if (err.message === "could't find Token") {
          Notifier.showNotification({
            title: "Please Login",
            description: "Please Login to process to book",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
          return;
        }
        Notifier.showNotification({
          title: "Payment Failed",
          description: "Could not start payment. Please try again.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
        return;
      }

      // ── 2) Payment confirmed — the server webhook processes the booking ──
      setWaitingText("Finalizing…");
      if (bookingSession) {
        await saveToken(bookingSession);
        if (!sched.current) {
          await bookingNotificationSchedule({
            title: `Booking Confirmed for ${hName}`,
            body: "Your booking is being confirmed. Check the Order section.",
            bookingToken: bookingSession,
          });
          sched.current = true;
        }
      }
      Notifier.showNotification({
        title: "Payment Successful",
        description:
          "Your booking is being confirmed. Check the Order section shortly.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "success" },
      });
      // Refresh orders once now and again shortly after so webhook-processed
      // bookings show up in the list.
      queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "booked_order",
      });
      setTimeout(() => {
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) && q.queryKey[0] === "booked_order",
        });
      }, 8000);
      setSuc(true);
      setModal(true);
    } catch (err: any) {
      if (err.response?.status === 402) {
        Notifier.showNotification({
          title: "Payment Not Completed",
          description:
            err.response.data?.message ||
            "Please complete the payment and try again.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
      } else if ([409, 401].includes(err.response?.status)) {
        Notifier.showNotification({
          title: "Booking Exists",
          description:
            err.response.data.message ||
            "Conflict. Please choose a different time.",
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
      setWait(false);
    }
  }, [sDate, sTier, hours, sTime, bookingDetails, listing, hName, grandTotal]);

  // ── Confirmation details (memoized) ──────────────────────────────────────
  const confirmItems = useMemo(
    () => [
      {
        label: "Venue",
        value: hName,
        icon: <FontAwesome5 name="monitor" size={22} color={C.accentPrimary} />,
      },
      {
        label: "Date",
        value: format(sDate, dFmt),
        icon: <Fontisto name="date" size={22} color={C.accentPrimary} />,
      },
      {
        label: "Zone",
        value: TIERS.find((t) => t.id === sTier)?.label ?? sTier,
        icon: (
          <MaterialIcons name="monitor" size={22} color={C.accentPrimary} />
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
    [hName, sDate, sTier, hours, C.accentPrimary],
  );

  // ── Step indicator (memoized, tiny) ──────────────────────────────────────
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
    [step, C],
  );

  // ── Loading / no listing ────────────────────────────────────────────────
  if (wait || !listing) {
    return (
      <View
        style={[dS.flex, dS.center, { backgroundColor: C.backgroundColor }]}
      >
        <OwnActivaterIndicator />
        {waitingText ? (
          <Text
            style={{
              color: C.themeColorTextSecondary,
              fontSize: 14,
              fontWeight: "500",
              marginTop: 4,
            }}
          >
            {waitingText}
          </Text>
        ) : null}
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  DETAIL MODE
  // ═══════════════════════════════════════════════════════════════════════════
  if (!book) {
    return (
      <View style={[dS.flex, { backgroundColor: C.backgroundColor }]}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <Animated.ScrollView
          style={{ backgroundColor: C.backgroundColor }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        >
          <View style={[dS.cWrap, { backgroundColor: C.surfaceHigh }]}>
            <Carousel
              ref={imgRef}
              width={width}
              height={400}
              loop={false}
              data={imgs.length > 0 ? imgs : [""]}
              scrollAnimationDuration={500}
              onProgressChange={(p) => {
                prog.value = p;
              }}
              renderItem={({ item }) => (
                <Image
                  source={
                    item
                      ? { uri: item }
                      : require("@/assets/images/computerImage/regular.png")
                  }
                  style={dS.cImg}
                />
              )}
            />
            <Pagination.Custom
              progress={prog}
              data={imgs.length > 0 ? imgs : [""]}
              dotStyle={{ width: 25, height: 4, backgroundColor: C.onSurface }}
              activeDotStyle={{
                width: 25,
                height: 4,
                overflow: "hidden",
                backgroundColor: C.accentPrimary,
              }}
              containerStyle={dS.dots}
              horizontal
              onPress={(i) =>
                imgRef.current?.scrollTo({
                  count: i - prog.value,
                  animated: true,
                })
              }
            />
            <View style={dS.iconRow}>
              <TouchableOpacity
                style={[dS.iconBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}
                onPress={() => router.back()}
              >
                <Feather name="arrow-left" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[dS.iconBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}
              >
                <AntDesign name="heart" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.6)"]}
              style={dS.imgGrad}
            />
          </View>

          <View
            style={[
              dS.titleCard,
              { backgroundColor: C.surfaceHighest, shadowColor: C.shadowColor },
            ]}
          >
            <LinearGradient
              colors={[C.accentPrimary, C.accentPrimaryBorder]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={dS.accent}
            />
            <AppText style={[dS.hName, { color: C.onSurface }]}>
              {hName}
            </AppText>
            <View style={dS.ratingRow}>
              <AntDesign name="star" size={14} color="#FFD700" />
              <AppText style={[dS.ratingTxt, { color: C.onSurfaceVariant }]}>
                {rRating > 0 ? rRating.toFixed(1) : "4.8"}{" "}
                <AppText style={{ color: C.outline }}>
                  ({rCount > 0 ? rCount : 124} reviews)
                </AppText>
              </AppText>
            </View>
            <View style={dS.addrRow}>
              <Ionicons name="location-sharp" size={14} color={C.outline} />
              <AppText
                style={[dS.addrTxt, { color: C.outline }]}
                numberOfLines={1}
              >
                {hAddr}
              </AppText>
            </View>
          </View>

          <LinearGradient
            colors={[C.backgroundColor, C.surfaceHigh]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={dS.gWrap}
          >
            <View style={dS.cPad}>
              <View style={[dS.tabRow, { borderBottomColor: C.border }]}>
                {tabs.map((t) => (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => setTab(t.key as HallDetailSeparator)}
                    style={[
                      dS.tabItem,
                      tab === t.key && {
                        borderBottomWidth: 2,
                        borderBottomColor: C.accentPrimary,
                      },
                    ]}
                  >
                    <AppText
                      style={[
                        dS.tabLabel,
                        { color: tab === t.key ? C.accentPrimary : C.outline },
                        tab === t.key && { fontWeight: "700" },
                      ]}
                    >
                      {t.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
              {(detContent[tab] as any[])?.map((item: any, i: number) => (
                <View style={dS.sBlock} key={i}>
                  {item.label && (
                    <AppText style={[dS.sTitle, { color: C.onSurface }]}>
                      {item.label}
                    </AppText>
                  )}
                  {"component" in item ? (
                    <View style={dS.sCont}>{item.component}</View>
                  ) : "resolve" in item ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={dS.sCont}
                    >
                      {item.resolve}
                    </ScrollView>
                  ) : (
                    <AppText style={[dS.sVal, { color: C.onSurfaceVariant }]}>
                      {item.value}
                    </AppText>
                  )}
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.ScrollView>

        <View
          style={[
            dS.bBar,
            {
              backgroundColor: C.surfaceHighest,
              borderTopColor: C.accentPrimary,
              borderTopWidth: 2,
            },
          ]}
        >
          <View>
            <AppText style={[dS.priceS, { color: C.outline }]}>
              Starting from
            </AppText>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <AppText style={[dS.priceB, { color: C.accentPrimary }]}>
                ₩{hPrices ? fmtP(hPrices.pcHall.oneHour) : "0"}
              </AppText>
              <AppText style={[dS.priceU, { color: C.outline }]}>
                {" "}
                / hour
              </AppText>
            </View>
          </View>
          <TouchableOpacity
            style={[dS.bookBtn, { backgroundColor: C.accentPrimary }]}
            onPress={() => setBook(true)}
          >
            <AppText style={{ color: "#FFF", fontWeight: "700", fontSize: 15 }}>
              Book Now →
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Common booking header ───────────────────────────────────────────────
  const bkHeader = (
    <View style={[bS.header, { borderBottomColor: C.border }]}>
      <TouchableOpacity
        onPress={() => {
          step > 0 ? setStep(step - 1) : setBook(false);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color={C.accentPrimary} />
      </TouchableOpacity>
      {stepDots}
      <View style={{ width: 32 }} />
    </View>
  );

  return (
    <SafeAreaView style={[bS.flex, { backgroundColor: C.backgroundColor }]}>
      {bkHeader}
      {step === 0 ? (
        <Step_one_pc initTime={tInit} setInitTime={setTInit} />
      ) : (
        <Step_two_pc
          listing={
            bookingDetails
              ? (bookingDetails as unknown as EsportBookingData)
              : undefined
          }
          grandTotal={grandTotal}
        />
      )}

      {/* Footer */}
      <View
        style={[
          bS.footer,
          { backgroundColor: C.surface, borderTopColor: C.border },
        ]}
      >
        {step === 0 ? (
          <>
            <View>
              <AppText style={[bS.fFootLabel, { color: C.outline }]}>
                Total for{" "}
                {TIERS.find((t) => t.id === (bookingDetails?.tier ?? sTier))
                  ?.label ?? "Zone"}
              </AppText>
              <AppText style={[bS.fFootPrice, { color: C.onSurface }]}>
                ₩{totalPrice.toLocaleString()}
              </AppText>
            </View>
            <TouchableOpacity
              style={[bS.btn, { backgroundColor: C.accentPrimary }]}
              onPress={() => setStep(1)}
            >
              <AppText
                style={{ color: "#FFF", fontSize: 15, fontWeight: "700" }}
              >
                Continue
              </AppText>
              <Ionicons name="arrow-forward" size={18} color={C.white} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[bS.btn2, { backgroundColor: C.surfaceHigh }]}
              onPress={() => setStep(0)}
            >
              <AppText style={[bS.btn2T, { color: C.onSurface }]}>Back</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[bS.btn, { backgroundColor: C.accentPrimary }]}
              onPress={handleBook}
            >
              <Ionicons name="card" size={16} color={C.white} />
              <AppText
                style={{ color: "#FFF", fontSize: 15, fontWeight: "700" }}
              >
                Pay & Confirm
              </AppText>
            </TouchableOpacity>
          </>
        )}
      </View>

      {suc && (
        <Confirm_Modal
          confirmModal={modal}
          setConfirmModal={setModal}
          confirmationDetails={confirmItems.map((d) => ({
            ...d,
            value: d.value ?? "",
          }))}
          addToCalendar={() => console.log("Add to calendar")}
          hasScheduled={sched.current}
        />
      )}
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  DETAIL STYLES
// ══════════════════════════════════════════════════════════════════════════════
const dS = StyleSheet.create({
  flex: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  cWrap: {
    height: 350,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  cImg: { width: "100%", height: "100%" },
  iconRow: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: { padding: 10, borderRadius: 25 },
  imgGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: 120 },
  dots: { gap: 12, bottom: 120 },
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
  accent: { width: "30%", height: 3, borderRadius: 2, marginBottom: 14 },
  hName: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingTxt: { fontSize: 13, fontWeight: "600" },
  addrRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  addrTxt: { fontSize: 13, flex: 1 },
  gWrap: { flex: 1 },
  cPad: { marginHorizontal: 16, flex: 1 },
  tabRow: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabLabel: { fontSize: 14 },
  sBlock: { paddingVertical: 10 },
  sTitle: { fontSize: 17, fontWeight: "700", marginBottom: 2 },
  sCont: { paddingVertical: 6 },
  sVal: { fontSize: 14, lineHeight: 20 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  priceLabel: { fontWeight: "500", fontSize: 13 },
  priceValue: { fontWeight: "600", fontSize: 13 },
  facItem: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    gap: 3,
  },
  facIcon: { borderRadius: 22, padding: 8 },
  facLabel: { textAlign: "center", fontSize: 11 },
  loading: { justifyContent: "center", alignItems: "center", height: 180 },
  bBar: {
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
  priceS: { fontSize: 11 },
  priceB: { fontSize: 22, fontWeight: "800" },
  priceU: { fontSize: 13, fontWeight: "400" },
  bookBtn: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 22 },
});

// ══════════════════════════════════════════════════════════════════════════════
//  BOOKING STYLES
// ══════════════════════════════════════════════════════════════════════════════
const bS = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sCont: { paddingBottom: 40 },

  // Mini hero — flat overlay, no LinearGradient
  mHero: { height: 140, position: "relative" },
  mImg: { width: "100%", height: "100%" },
  mOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  mText: { position: "absolute", left: 16, right: 16, bottom: 12 },
  mName: { fontSize: 20, fontWeight: "800" },
  mMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  mAddr: { fontSize: 12, flex: 1 },

  sec: { paddingHorizontal: 16, marginTop: 20 },
  secT: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  secSub: { fontSize: 13, marginBottom: 10 },

  // Calendar
  calShadow: {
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderRadius: 14,
  },
  cal: { flex: 1, width: "100%", height: "100%" },

  // Tiers
  tCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    position: "relative",
  },
  tLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  tIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tLabel: { fontSize: 15, fontWeight: "700" },
  tDesc: { fontSize: 11, marginTop: 1 },
  tPrice: { fontSize: 17, fontWeight: "800" },
  tUnit: { fontSize: 11 },
  tick: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  // Time
  fLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  tBox: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },

  // Packages
  pkgRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pkgCard: {
    width: "30%",
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  pkgFull: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  pkgInner: {
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    position: "relative",
  },
  pkgL: { fontSize: 12, fontWeight: "600", marginBottom: 3 },
  pkgP: { fontSize: 16, fontWeight: "800" },
  popBadge: {
    position: "absolute",
    top: -7,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 10,
  },
  moon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3b296c",
    justifyContent: "center",
    alignItems: "center",
  },
  pkgRight: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    alignItems: "flex-end",
  },

  // Review step
  rCard: { margin: 16, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  rImg: { width: "100%", height: 140 },
  rInfo: { padding: 12, gap: 2 },
  rName: { fontSize: 18, fontWeight: "700" },
  rAddr: { fontSize: 12 },
  secTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  dCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  dRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  dIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  dLabel: { fontSize: 11, marginBottom: 1 },
  dVal: { fontSize: 14, fontWeight: "600" },
  edit: { fontSize: 12, fontWeight: "700" },
  sumR: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  sumL: { fontSize: 13 },
  sumV: { fontSize: 13, fontWeight: "600" },
  div: { height: 1, marginVertical: 4 },
  totalR: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 2,
  },
  totL: { fontSize: 16, fontWeight: "700" },
  totV: { fontSize: 18, fontWeight: "800" },
  terms: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 20,
    marginBottom: 80,
  },

  // Footer (shared)
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fFootLabel: { fontSize: 11 },
  fFootPrice: { fontSize: 18, fontWeight: "800" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btn2: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  btn2T: { fontSize: 14, fontWeight: "700" },

  // Payment step
  payScroll: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  payCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    shadowOpacity: 0.08,
    shadowOffset: { height: 2, width: 0 },
    shadowRadius: 10,
    elevation: 3,
  },
  payTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  paySub: { fontSize: 14, marginTop: -8 },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  payLabel: { fontSize: 15, fontWeight: "500" },
  payVal: { fontSize: 15, fontWeight: "600", flexShrink: 1, marginLeft: 12 },
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
  methodTitle: { fontSize: 15, fontWeight: "700" },
  methodDesc: { fontSize: 12, marginTop: 2 },
  secureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  secureText: { fontSize: 11, fontWeight: "700" },
  amountWrap: {
    alignItems: "center",
    paddingVertical: 18,
    gap: 6,
    borderTopWidth: 1,
  },
  amountLabel: { fontSize: 13, fontWeight: "600", letterSpacing: 0.6 },
  amountValue: { fontSize: 34, fontWeight: "800", letterSpacing: -0.5 },
  amountUnit: { fontSize: 15, fontWeight: "600" },
  payNote: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 8,
  },
});

export default CombinedEsportHall;
