import { useHallInfo } from "@/context/hall_info_context";
import { EsportBookingData, useBookingStore } from "@/context/store/book_store";
import { useTheme } from "@/context/theme_context";
import {
  Feather,
  FontAwesome5,
  Fontisto,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { openCheckoutBrowser } from "@/utils/paymentBrowser";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import AppText from "@/components/ui/app_text";
import { EsportHallDataType } from "@/types/hall_info_type";
import { HallTypesSeparator } from "@/types/hall_separator_type";
import axiosInstance from "@/hooks/axiosInstance";
import { showToast } from "@/utils/toast";
import { saveToken } from "@/components/book/session";
import Confirm_Modal from "@/components/book/confirmation";
import { format } from "date-fns";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { bookingNotificationSchedule } from "@/context/store/notification_store";
import { queryClient } from "@/hooks/queryClient";
import Step_one_pc from "@/components/book/esport_component.tsx/step1_pc";
import Step_two_pc from "@/components/book/esport_component.tsx/step2_pc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateDurationPrice } from "@/utils/duration_price";

// ─── Props ───────────────────────────────────────────────────────────────────
export interface CombinedEsportHallProps {
  listing?: EsportHallDataType;
  hallID?: string;
  hallType?: HallTypesSeparator;
}

// ─── Constants ────────────────────────────────────────────────────────────────
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

const dFmt = "MMM d, yyyy";

// ══════════════════════════════════════════════════════════════════════════════
const CombinedEsportHall = ({
  listing: pList,
  hallID: pHID,
}: CombinedEsportHallProps) => {
  const { colors: C } = useTheme();
  const { hall_id: routeId } = useLocalSearchParams();
  const { getSpecificHall } = useHallInfo();

  const hid = pHID ?? String(routeId ?? "");
  const listing =
    pList ?? (getSpecificHall(hid) as EsportHallDataType | undefined);
  const imgs = listing?.hall_details?.hall_imageURLs ?? [];
  const hName = listing?.hall_details?.hall_name ?? "PC Bang";
  const hPrices = listing?.hall_details?.hall_price;

  // ── Booking state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [tInit, setTInit] = useState(false);
  const [wait, setWait] = useState(false);
  const [waitingText, setWaitingText] = useState("");
  const [suc, setSuc] = useState(false);
  const [modal, setModal] = useState(false);
  const sched = useRef(false);

  // ── Zustand store for step components ──────────────────────────────────
  const bookingDetails = useBookingStore((s) => s.esportBookingDetails);
  const setBookingDetails = useBookingStore((s) => s.setEsportBookingDetails);
  const initRef = useRef(false);

  const selectedDate =
    bookingDetails?.bookingDate ?? bookingDetails?.date ?? new Date();
  const selectedTier = bookingDetails?.tier ?? "regular";
  const apiTier = selectedTier === "regular" ? "hall" : selectedTier;
  const selectedHours = Number(bookingDetails?.hours ?? 1);
  const selectedStartTime = bookingDetails?.startTime ?? new Date();

  // ── Derived pricing ────────────────────────────────────────────────────────
  const totalPrice =
    calculateDurationPrice(hPrices?.esport, selectedHours * 60) ?? 0;
  const serviceFee = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + serviceFee;

  useEffect(() => {
    if (initRef.current || !listing || bookingDetails) return;
    initRef.current = true;
    setBookingDetails({
      name: hName,
      date: selectedDate as Date,
      sportHallID: listing?.sportHallID ?? "",
      price: hPrices?.esport,
      imageUrls: imgs,
      location: listing?.hall_locations ?? { latitude: "", longitude: "" },
      tier: selectedTier,
      hours: selectedHours,
      startTime: selectedStartTime,
      bookingDate: selectedDate,
    } as EsportBookingData);
  }, [
    listing,
    hName,
    hPrices,
    imgs,
    bookingDetails,
    selectedDate,
    selectedTier,
    selectedHours,
    selectedStartTime,
    setBookingDetails,
  ]);

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
            date: selectedDate,
            timezone: tz,
            tier: apiTier,
            hours: selectedHours,
            startTime: selectedStartTime,
          },
        });
        const session = paymentRes.data?.result;
        if (session?.error) {
          setWait(false);
          showToast({
            title: "Payment Failed",
            description: session.error,
            alertType: "warn",
          });
          return;
        }
        const checkoutUrl = session?.checkout_url ?? session?.url ?? null;
        paymentIntentId = session?.payment_intent ?? null;
        if (!paymentIntentId) {
          setWait(false);
          showToast({
            title: "Payment Failed",
            description: "Could not start payment. Please try again.",
            alertType: "warn",
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
          showToast({
            title: "Payment Not Completed",
            description:
              outcome === "failed"
                ? "The payment was canceled or expired. Press book to try again."
                : outcome === "timeout"
                  ? "We couldn't confirm the payment yet. Check your orders shortly."
                  : "Payment canceled. Press book to try again.",
            alertType: "warn",
          });
          return;
        }
      } catch (err: any) {
        setWait(false);
        if (err.response?.status === 409) {
          showToast({
            title: "Time Slot Taken",
            description:
              err.response.data?.message ||
              "This time slot is no longer available. Please choose another.",
            alertType: "warn",
          });
          return;
        }
        if (err.message === "could't find Token") {
          showToast({
            title: "Please Login",
            description: "Please Login to process to book",
            alertType: "warn",
          });
          return;
        }
        showToast({
          title: "Payment Failed",
          description: "Could not start payment. Please try again.",
          alertType: "warn",
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
      showToast({
        title: "Payment Successful",
        description:
          "Your booking is being confirmed. Check the Order section shortly.",
        alertType: "success",
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
        showToast({
          title: "Payment Not Completed",
          description:
            err.response.data?.message ||
            "Please complete the payment and try again.",
          alertType: "warn",
        });
      } else if ([409, 401].includes(err.response?.status)) {
        showToast({
          title: "Booking Exists",
          description:
            err.response.data.message ||
            "Conflict. Please choose a different time.",
          alertType: "warn",
        });
      } else {
        showToast({
          title: "Booking Failed",
          description: "An error occurred. Please try again.",
          alertType: "warn",
        });
      }
    } finally {
      setWait(false);
    }
  }, [
    selectedDate,
    selectedTier,
    selectedHours,
    selectedStartTime,
    bookingDetails,
    listing,
    hName,
    grandTotal,
  ]);

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
        value: format(new Date(selectedDate), dFmt),
        icon: <Fontisto name="date" size={22} color={C.accentPrimary} />,
      },
      {
        label: "Zone",
        value: TIERS.find((t) => t.id === selectedTier)?.label ?? selectedTier,
        icon: (
          <MaterialIcons name="monitor" size={22} color={C.accentPrimary} />
        ),
      },
      {
        label: "Duration",
        value: `${selectedHours} Hour${selectedHours > 1 ? "s" : ""}`,
        icon: (
          <Ionicons name="time-outline" size={22} color={C.accentPrimary} />
        ),
      },
    ],
    [hName, selectedDate, selectedTier, selectedHours, C.accentPrimary],
  );

  // ── Step indicator ───────────────────────────────────────────────────────
  const stepDots = (
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
  );

  // ── Loading / no listing ────────────────────────────────────────────────
  if (wait || !listing) {
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

  // ── Common booking header ───────────────────────────────────────────────
  const bkHeader = (
    <View style={[bS.header, { borderBottomColor: C.border }]}>
      <TouchableOpacity
        onPress={() => {
          setStep(step - 1);
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
          subtotal={totalPrice}
          serviceFee={serviceFee}
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
                {TIERS.find((t) => t.id === selectedTier)?.label ?? "Zone"}
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
