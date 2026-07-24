import { EsportHallDataType } from "@/types/hall_info_type";
import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { useTheme } from "@/context/theme_context";
import { router } from "expo-router";
import { AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import AppText from "@/components/ui/app_text";
import SportHallReviewPage, { Review } from "@/app/review/hall_review";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import {
  HallDetailSeparator,
  HallTypesSeparator,
} from "@/types/hall_separator_type";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue } from "react-native-reanimated";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { useWindowDimensions } from "react-native";

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
    <View style={[s.tabRow, { borderBottomColor: colors.border }]}>
      {tabs.map((t) => (
        <TouchableOpacity
          key={t.key}
          onPress={() => onPress(t.key)}
          style={[
            s.tabItem,
            active === t.key && {
              borderBottomWidth: 2,
              borderBottomColor: colors.accentPrimary,
            },
          ]}
        >
          <AppText
            style={[
              s.tabLabel,
              {
                color: active === t.key ? colors.accentPrimary : colors.outline,
              },
              active === t.key && { fontWeight: "700" },
            ]}
          >
            {t.label}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  ),
);

const s = StyleSheet.create({
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
  imgGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  iconBtn: { padding: 10, borderRadius: 25 },
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
  hallName: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  titleAccent: {
    width: "30%",
    height: 3,
    borderRadius: 2,
    marginBottom: 14,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 13, fontWeight: "600" },
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
  bookBtn: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 22 },
  bookBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});

const featureIcons: Record<string, { label: string; icon: React.ReactNode }> = {
  wifi: {
    label: "Wi-Fi",
    icon: <Feather name="wifi" size={20} color="#FFF" />,
  },
  parking: {
    label: "Parking",
    icon: <FontAwesome5 name="parking" size={20} color="#FFF" />,
  },
};

interface PC_HallsProps {
  listing: EsportHallDataType;
  hallID: string;
  hallType: HallTypesSeparator;
}

const Pc_Halls = ({ listing }: PC_HallsProps) => {
  const { colors: C } = useTheme();
  const { width, height } = useWindowDimensions();
  const imageRef = useRef<ICarouselInstance>(null);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [noMore, setNoMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);
  const progress = useSharedValue(0);
  const [activeTab, setActiveTab] = useState(HallDetailSeparator.DETAILS);
  const tabs = [
    { key: HallDetailSeparator.DETAILS, label: "Details" },
    { key: HallDetailSeparator.AMENTITIES, label: "Amenities" },
    { key: HallDetailSeparator.REVIEW, label: "Review" },
  ];

  useEffect(() => {
    if (activeTab !== "review" || fetched.current || noMore) return;
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
          let c = false;
          d.reviews.forEach((r: Review) => {
            if (!prev[r._id]) {
              m[r._id] = r;
              c = true;
            }
          });
          // Cap at 50 reviews to bound memory
          const keys = Object.keys(m);
          if (keys.length > 50) {
            keys.slice(0, keys.length - 50).forEach((k) => delete m[k]);
          }
          return c ? m : prev;
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
  }, [page, activeTab]);

  useEffect(() => {
    setReviews({});
    setPage(0);
    setNoMore(false);
    fetched.current = false;
  }, [listing.sportHallID]);

  const priceGen = useCallback(
    (t: "hour" | "wholeDay") => {
      if (!listing.hall_details.hall_price) return null;
      return Object.entries(listing.hall_details.hall_price).map(
        ([k, v]: [string, any], i) => (
          <View key={i} style={s.priceRow}>
            <AppText style={[s.priceLabel, { color: C.onSurface }]}>
              {k
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase())}
            </AppText>
            <AppText style={[s.priceValue, { color: C.accentPrimary }]}>
              ${t === "hour" ? v.oneHour : v.wholeDay} tugrug
            </AppText>
          </View>
        ),
      );
    },
    [listing, C],
  );

  const imgs: string[] = listing.hall_details.hall_imageURLs;
  const det = {
    [HallDetailSeparator.DETAILS]: [
      { label: "Details", value: "DETAIL DATA" },
      {
        label: "Facilities",
        resolve: Object.values(featureIcons).map((item, i) => (
          <View style={s.facilityItem} key={i}>
            <View
              style={[
                s.facilityIcon,
                {
                  backgroundColor: i === 0 ? C.accentPrimary : C.successColor,
                },
              ]}
            >
              {item.icon}
            </View>
            <AppText style={[s.facilityLabel, { color: C.outline }]}>
              {item.label}
            </AppText>
          </View>
        )),
      },
      {
        label: "Opening Hours",
        value: `${listing.hall_details.hall_work_time.start_time} - ${listing.hall_details.hall_work_time.end_time}`,
      },
      { label: "Price Per Hour", component: <>{priceGen("hour")}</> },
      { label: "Price Per Day", component: <>{priceGen("wholeDay")}</> },
    ],
    [HallDetailSeparator.AMENTITIES]: [
      { label: "Amenities", value: "AMENTITIES DATA" },
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

  return (
    <View style={[s.flex, { backgroundColor: C.backgroundColor }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Animated.ScrollView
        style={{ backgroundColor: C.backgroundColor }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 120,
        }}
      >
        <View style={[s.carouselWrap, { backgroundColor: C.surfaceHigh }]}>
          <Carousel
            ref={imageRef}
            width={width}
            height={400}
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
          <Pagination.Custom
            progress={progress}
            data={imgs ?? []}
            dotStyle={{ width: 25, height: 4, backgroundColor: C.onSurface }}
            activeDotStyle={{
              width: 25,
              height: 4,
              overflow: "hidden",
              backgroundColor: C.accentPrimary,
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
          <View style={s.iconBtnWrap}>
            <TouchableOpacity
              style={[s.iconBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.iconBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}
            >
              <AntDesign name="heart" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={s.imgGradient}
          />
        </View>

        <View
          style={[
            s.titleCard,
            { backgroundColor: C.surfaceHighest, shadowColor: C.shadowColor },
          ]}
        >
          <LinearGradient
            colors={[C.accentPrimary, C.accentPrimaryBorder]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.titleAccent}
          />
          <AppText style={[s.hallName, { color: C.onSurface }]}>
            {listing.hall_details.hall_name}
          </AppText>
          <View style={s.ratingRow}>
            <AntDesign name="star" size={14} color="#FFD700" />
            <AppText style={[s.ratingText, { color: C.onSurfaceVariant }]}>
              4.8 <AppText style={{ color: C.outline }}>(124 reviews)</AppText>
            </AppText>
          </View>
        </View>

        <LinearGradient
          colors={[C.backgroundColor, C.surfaceHigh]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={s.gradientWrap}
        >
          <View style={s.contentPad}>
            <TabBar
              tabs={tabs}
              active={activeTab}
              onPress={(key: string) =>
                setActiveTab(key as HallDetailSeparator)
              }
              colors={C}
            />
            {det[activeTab]?.map((item: any, i: number) => (
              <View style={s.sectionBlock} key={i}>
                {item.label && (
                  <AppText style={[s.sectionTitle, { color: C.onSurface }]}>
                    {item.label}
                  </AppText>
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
                  <AppText
                    style={[s.sectionValue, { color: C.onSurfaceVariant }]}
                  >
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
          s.bottomBar,
          {
            backgroundColor: C.surfaceHighest,
            borderTopColor: C.accentPrimary,
            borderTopWidth: 2,
          },
        ]}
      >
        <View>
          <AppText style={[s.priceSmall, { color: C.outline }]}>
            Total Price
          </AppText>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <AppText style={[s.priceBig, { color: C.accentPrimary }]}>
              ₮80k
            </AppText>
            <AppText style={[s.priceUnit, { color: C.outline }]}>
              {" "}
              / hour
            </AppText>
          </View>
        </View>
        <TouchableOpacity
          style={[s.bookBtn, { backgroundColor: C.accentPrimary }]}
          onPress={() => router.push(`/book/esport/${listing.sportHallID}`)}
        >
          <AppText style={s.bookBtnText}>Book Now →</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Pc_Halls;
