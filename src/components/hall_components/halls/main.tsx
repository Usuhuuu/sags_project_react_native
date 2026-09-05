import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import {
  EsportHallDataType,
  SportHallDataType,
  SportHallPrice,
} from "@/types/hall_info_type";
import {
  AntDesign,
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { router } from "expo-router";
import React, { useEffect, useRef, useState, memo } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import OrderScreen, { FormData } from "@/components/book/detail";
import SportHallReviewPage, { Review } from "@/app/review/hall_review";
import axiosInstance, { axiosInstanceRegular } from "@/hooks/axiosInstance";
import {
  HallDetailSeparator,
  HallTypesSeparator,
} from "@/types/hall_separator_type";
import { LinearGradient } from "expo-linear-gradient";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { useHallInfo } from "@/context/hall_info_context";
import { hallPriceMap } from "@/utils/duration_price";
import { useFavoritesStore } from "@/context/store/favorites_store";

const TabBar = memo(
  ({
    tabs,
    active,
    onPress,
    colors,
  }: {
    tabs: { key: string; label: string }[];
    active: string;
    onPress: (k: string) => void;
    colors: any;
  }) => (
    <View style={[s.tabRow, { borderBottomColor: "#2A2D34" }]}>
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => onPress(t.key)}
            style={[
              s.tabItem,
              isActive && {
                borderBottomWidth: 2,
                borderBottomColor: colors.accentPrimary || "#A4C2FF",
              },
            ]}
          >
            <AppText
              style={[
                s.tabLabel,
                { color: isActive ? "#FFFFFF" : "#8C93A3" },
                isActive && { fontWeight: "700" },
              ]}
            >
              {t.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  ),
);

const featureIcons = [
  {
    key: "changingRoom",
    label: "Ceiling light",
    bgColor: "#B3C5FF",
    icon: (
      <MaterialCommunityIcons name="ceiling-light" size={20} color="#121418" />
    ),
  },
  {
    key: "shower",
    label: "Shower Room",
    bgColor: "#52D669",
    icon: <FontAwesome name="shower" size={20} color="#121418" />,
  },
  {
    key: "lighting",
    label: "Lighting",
    bgColor: "#B3C5FF",
    icon: (
      <MaterialCommunityIcons name="ceiling-light" size={20} color="#121418" />
    ),
  },
  {
    key: "spectatorSeats",
    label: "Spectator Seats",
    bgColor: "#52D669",
    icon: (
      <MaterialCommunityIcons name="ceiling-light" size={20} color="#121418" />
    ),
  },
  {
    key: "parking",
    label: "Parking",
    bgColor: "#B3C5FF",
    icon: <FontAwesome5 name="parking" size={20} color="#121418" />,
  },
  {
    key: "freeWifi",
    label: "Free WiFi",
    bgColor: "#52D669",
    icon: <AntDesign name="wifi" size={20} color="#121418" />,
  },
  {
    key: "scoreboard",
    label: "Scoreboard",
    bgColor: "#B3C5FF",
    icon: (
      <MaterialCommunityIcons
        name="scoreboard-outline"
        size={20}
        color="#121418"
      />
    ),
  },
  {
    key: "speaker",
    label: "Speaker",
    bgColor: "#52D669",
    icon: <FontAwesome name="volume-up" size={20} color="#121418" />,
  },
  {
    key: "microphone",
    label: "Microphone",
    bgColor: "#B3C5FF",
    icon: <FontAwesome name="microphone" size={20} color="#121418" />,
  },
];

const fetchZaalReview = async (id: string, page: number) => {
  try {
    const res = await axiosInstanceRegular.get(
      `/zaal-review/${id}?page=${page}`,
    );
    if (res.status === 200 && res.data.success && res.data.data)
      return res.data.data;
    return null;
  } catch {
    return null;
  }
};

interface SportHallProps {
  listing: SportHallDataType | EsportHallDataType;
  sportHallID: string;
  hallType: HallTypesSeparator;
}

const MainHallComponent = ({
  listing,
  sportHallID,
  hallType,
}: SportHallProps) => {
  const { colors: C } = useTheme();
  const { width } = useWindowDimensions();
  const [isOrderVisible, setOrderVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    date: "",
    price: [],
    workTime: "",
    image: [],
    location: { latitude: "", longitude: "", smart_location: "" },
    reference_hall_id: "",
  });
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [rating, setRating] = useState(4.8);
  const [count, setCount] = useState(124);
  const [page, setPage] = useState(0);
  const [noMore, setNoMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);
  const imageRef = useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);
  const [activeTab, setActiveTab] = useState(HallDetailSeparator.DETAILS);

  const isFavorite = useFavoritesStore((state) =>
    state.favoriteIds.has(sportHallID),
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggle);

  const tabs = React.useMemo(
    () => [
      { key: HallDetailSeparator.DETAILS, label: "Details" },
      { key: HallDetailSeparator.AMENTITIES, label: "Amenities" },
      { key: HallDetailSeparator.REVIEW, label: "Review" },
    ],
    [],
  );

  const hallMapValue = hallPriceMap[hallType];

  const { getHallTimeSlots } = useHallInfo();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...(hallType === HallTypesSeparator.SPORTHALL && {
        sport_hall_id: sportHallID,
        name: listing?.hall_details?.hall_name,
        price: listing?.hall_details.hall_price[hallMapValue],
        workTime: `${listing?.hall_details?.hall_work_time?.start_time}~${listing?.hall_details?.hall_work_time?.end_time}`,
        image: listing?.hall_details?.hall_imageURLs,
        location: listing?.hall_locations ?? prev.location,
        reference_hall_id: listing?.reference_hallId ?? "",
      }),
    }));
  }, [sportHallID, listing]);

  useEffect(() => {
    if (activeTab !== HallDetailSeparator.REVIEW || fetched.current || noMore)
      return;
    fetched.current = true;
    setLoading(true);
    let mounted = true;
    fetchZaalReview(listing?.sportHallID, page).then((d) => {
      fetched.current = false;
      if (!mounted) return;
      if (!d) {
        setLoading(false);
        return;
      }
      setReviews((prev) => {
        const m = { ...prev };
        let c = false;
        d.reviews.forEach((r: Review) => {
          if (!prev[r._id]) {
            m[r._id] = r;
            c = true;
          }
        });
        const keys = Object.keys(m);
        if (keys.length > 50) {
          keys.slice(0, keys.length - 50).forEach((k) => delete m[k]);
        }
        return c ? m : prev;
      });
      if (d.reviews?.length < 10) setNoMore(true);
      if (d.avg_rating) setRating(d.avg_rating);
      if (d.review_count) setCount(d.review_count);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [page, activeTab, listing?.sportHallID]);

  useEffect(() => {
    setReviews({});
    setPage(0);
    setNoMore(false);
    fetched.current = false;
  }, [sportHallID]);

  const imgs = listing?.hall_details?.hall_imageURLs ?? [];

  const det = {
    [HallDetailSeparator.DETAILS]: [
      { label: "Details", value: "DETAIL DATA" },
      {
        label: "Facilities",
        resolve: featureIcons.map((item, i) => (
          <View style={s.facilityItem} key={item.key || i}>
            <View
              style={[s.facilityIconCircle, { backgroundColor: item.bgColor }]}
            >
              {item.icon}
            </View>
            <AppText style={s.facilityLabel}>{item.label}</AppText>
          </View>
        )),
      },
      {
        label: "Opening Hours",
        value: `${listing?.hall_details?.hall_work_time?.start_time || "06:00"} - ${listing?.hall_details?.hall_work_time?.end_time || "23:59"}`,
      },
    ],
    [HallDetailSeparator.AMENTITIES]: [
      { label: "Amenities", value: "AMENITIES DATA" },
    ],
    [HallDetailSeparator.REVIEW]: [
      {
        label: undefined,
        component: loading ? (
          <View style={s.loadingWrap}>
            <OwnActivaterIndicator />
          </View>
        ) : (
          <SportHallReviewPage
            sport_hall_id={listing?.sportHallID}
            reviews={reviews}
            rating={rating}
            count={count}
            setPage={setPage}
          />
        ),
      },
    ],
  };

  const dynamicPrice = listing?.hall_details?.hall_price?.[hallMapValue]?.find(
    (p) => p.durationMinutes === 60,
  )?.price;

  return (
    <View style={s.flex}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Animated.ScrollView
        style={s.flex}
        contentContainerStyle={s.scrollContent}
        bounces={false}
      >
        {/* Carousel & Top Controls */}
        <View style={s.carouselWrap}>
          {imgs.length > 0 ? (
            <Carousel
              ref={imageRef}
              width={width}
              height={360}
              loop={false}
              data={imgs}
              scrollAnimationDuration={500}
              onProgressChange={(p) => {
                progress.value = p;
              }}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={s.carouselImg} />
              )}
            />
          ) : (
            <View style={[s.carouselImg, { backgroundColor: "#1A1C20" }]} />
          )}

          <Pagination.Custom
            progress={progress}
            data={imgs}
            dotStyle={{
              width: 25,
              height: 4,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
            activeDotStyle={{
              width: 25,
              height: 4,
              overflow: "hidden",
              backgroundColor: C.accentPrimary || "#A0C0FF",
            }}
            containerStyle={s.dotContainer}
            horizontal
            onPress={(i) =>
              imageRef.current?.scrollTo({
                count: i - progress.value,
                animated: true,
              })
            }
          />

          <LinearGradient
            colors={["transparent", "#121418"]}
            style={s.imgGradient}
          />

          <View style={s.topNav}>
            <TouchableOpacity
              style={s.iconCircle}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.iconCircle}
              onPress={() => {
                toggleFavorite(sportHallID);
              }}
            >
              <AntDesign
                name={isFavorite ? "heart" : "heart"}
                size={20}
                color={isFavorite ? "#FF5A5F" : "#FFF"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Title Card */}
        <View style={s.titleCard}>
          <View style={s.handleBar} />
          <AppText style={s.hallName}>
            {listing?.hall_details?.hall_name || "Royal хурлын заал"}
          </AppText>
          <View style={s.ratingRow}>
            <AntDesign name="star" size={14} color="#FFD700" />
            <AppText style={s.ratingText}>
              {rating} <AppText style={s.reviewText}>({count} reviews)</AppText>
            </AppText>
          </View>
        </View>

        {/* Content Body */}
        <View style={s.contentPad}>
          <TabBar
            tabs={tabs}
            active={activeTab}
            onPress={(k: string) => setActiveTab(k as HallDetailSeparator)}
            colors={C}
          />

          <View style={s.sectionBlockWrap}>
            {det[activeTab]?.map((item: any, i: number) => (
              <View style={s.sectionBlock} key={i}>
                {item.label && (
                  <AppText style={s.sectionTitle}>{item.label}</AppText>
                )}
                {"component" in item ? (
                  <View style={s.sectionContent}>{item.component}</View>
                ) : "resolve" in item ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={s.sectionContent}
                  >
                    {item.resolve}
                  </ScrollView>
                ) : (
                  <AppText style={s.sectionValue}>{item.value}</AppText>
                )}
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Dynamic Bottom Booking Bar */}
      <View style={s.bottomBar}>
        <View>
          <AppText style={s.priceSmall}>Total Price</AppText>
          <View style={s.priceRow}>
            <AppText style={s.priceBig}>{dynamicPrice}</AppText>
            <AppText style={s.priceUnit}> / hour</AppText>
          </View>
        </View>
        <TouchableOpacity
          style={s.bookBtn}
          onPress={() => {
            switch (hallType) {
              case HallTypesSeparator.SPORTHALL:
                setOrderVisible(true);
                break;
              case HallTypesSeparator.COMPUTERGAMESHALL:
                router.push(`/book/esport/${listing?.sportHallID}`);
                return;
              default:
                break;
            }
          }}
        >
          <AppText style={s.bookBtnText}>Book Now →</AppText>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      {isOrderVisible && (
        <Modal
          animationType="slide"
          visible={isOrderVisible}
          transparent
          onRequestClose={() => setOrderVisible(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <OrderScreen
                formData={formData}
                sportHallID={listing?.sportHallID ?? ""}
                hallType={hallType}
                setIsOrderScreenVisible={setOrderVisible}
                baseTimeSlot={getHallTimeSlots(sportHallID)}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#121418",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  carouselWrap: {
    height: 360,
    position: "relative",
  },
  carouselImg: {
    width: "100%",
    height: 360,
  },
  imgGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  dotContainer: {
    position: "absolute",
    bottom: 80,
    gap: 8,
  },
  topNav: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  gearButton: {
    position: "absolute",
    right: 20,
    bottom: 110,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  titleCard: {
    marginHorizontal: 20,
    marginTop: -50,
    borderRadius: 24,
    backgroundColor: "#2A2D34",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 20,
  },
  handleBar: {
    width: 38,
    height: 3.5,
    backgroundColor: "#8C93A3",
    borderRadius: 2,
    marginBottom: 12,
  },
  hallName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  reviewText: {
    color: "#9CA3AF",
    fontWeight: "normal",
  },
  contentPad: {
    paddingHorizontal: 20,
  },
  tabRow: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  tabLabel: {
    fontSize: 14,
  },
  sectionBlockWrap: {
    marginTop: 16,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  sectionContent: {
    paddingVertical: 4,
  },
  sectionValue: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  facilityItem: {
    alignItems: "center",
    marginRight: 16,
    width: 72,
  },
  facilityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  facilityLabel: {
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
  },
  loadingWrap: {
    justifyContent: "center",
    alignItems: "center",
    height: 180,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1E2127",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
  },
  priceSmall: {
    fontSize: 12,
    color: "#8C93A3",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceBig: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  priceUnit: {
    fontSize: 13,
    color: "#8C93A3",
  },
  bookBtn: {
    backgroundColor: "#A0C0FF",
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 30,
  },
  bookBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: "#121418",
    borderRadius: 20,
    width: "92%",
    height: "90%",
    overflow: "hidden",
  },
});

export default memo(MainHallComponent);
