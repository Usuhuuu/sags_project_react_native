import { useTheme } from "@/src/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { SportHallDataType } from "@/interfaces/listing";
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
} from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import OrderScreen, { FormData } from "@/src/utils/book/detail";
import SportHallReviewPage, { Review } from "@/src/utils/review/[zaalReview]";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import {
  HallDetailSeparator,
  HallTypesSeparator,
} from "@/interfaces/hallTypes";
import { LinearGradient } from "expo-linear-gradient";
import OwnActivaterIndicator from "@/constants/loaderAnimation";
import { useWindowDimensions } from "react-native";
import { useHallInfo } from "@/src/context/hallInfoContext";

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

const featureIcons = [
  {
    key: "changingRoom",
    label: "Ceiling light",
    icon: (
      <MaterialCommunityIcons name="ceiling-light" size={20} color="#FFF" />
    ),
  },
  {
    key: "shower",
    label: "Shower Room",
    icon: <FontAwesome name="shower" size={20} color="#FFF" />,
  },
  {
    key: "lighting",
    label: "Lighting",
    icon: (
      <MaterialCommunityIcons name="ceiling-light" size={20} color="#FFF" />
    ),
  },
  {
    key: "spectatorSeats",
    label: "Spectator Seats",
    icon: (
      <MaterialCommunityIcons name="ceiling-light" size={20} color="#FFF" />
    ),
  },
  {
    key: "parking",
    label: "Parking",
    icon: <FontAwesome5 name="parking" size={20} color="#FFF" />,
  },
  {
    key: "freeWifi",
    label: "Free WiFi",
    icon: <AntDesign name="wifi" size={20} color="#FFF" />,
  },
  {
    key: "scoreboard",
    label: "Scoreboard",
    icon: (
      <MaterialCommunityIcons name="ceiling-light" size={20} color="#FFF" />
    ),
  },
  {
    key: "speaker",
    label: "Speaker",
    icon: <FontAwesome name="volume-up" size={20} color="#FFF" />,
  },
  {
    key: "microphone",
    label: "Microphone",
    icon: <FontAwesome name="microphone" size={20} color="#FFF" />,
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
  hallName: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  titleAccent: { width: "30%", height: 3, borderRadius: 2, marginBottom: 14 },
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    width: "92%",
    height: "90%",
    overflow: "hidden",
  },
});

interface SportHallProps {
  listing: SportHallDataType;
  sportHallID: string;
  hallType: HallTypesSeparator;
}

const SportHall = ({ listing, sportHallID, hallType }: SportHallProps) => {
  const { colors: C } = useTheme();
  const { width } = useWindowDimensions();
  const [isOrderVisible, setOrderVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    sportHallID: "",
    name: "",
    date: "",
    price: { oneHour: "", wholeDay: "" },
    workTime: "",
    image: [],
    location: { latitude: "", longitude: "", smart_location: "" },
  });
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [noMore, setNoMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);
  const imageRef = useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);
  const [activeTab, setActiveTab] = useState(HallDetailSeparator.DETAILS);
  const tabs = [
    { key: HallDetailSeparator.DETAILS, label: "Details" },
    { key: HallDetailSeparator.AMENTITIES, label: "Amenities" },
    { key: HallDetailSeparator.REVIEW, label: "Review" },
  ];

  const { getHallTimeSlots } = useHallInfo();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      sport_hall_id: sportHallID,
      name: listing?.hall_details.hall_name,
      price: listing?.hall_details.hall_price,
      workTime: `${listing?.hall_details.hall_work_time.start_time}~${listing?.hall_details.hall_work_time.end_time}`,
      image: listing?.hall_details.hall_imageURLs,
      location: listing?.hall_locations ?? prev.location,
    }));
  }, [sportHallID]);

  useEffect(() => {
    if (activeTab !== "review" || fetched.current || noMore) return;
    fetched.current = true;
    setLoading(true);
    fetchZaalReview(listing.sportHallID, page).then((d) => {
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
        return c ? m : prev;
      });
      if (d.reviews.length < 10) setNoMore(true);
      setRating(d.avg_rating);
      setCount(d.review_count);
      setLoading(false);
    });
  }, [page, activeTab]);

  const imgs = listing.hall_details.hall_imageURLs;
  const det = {
    [HallDetailSeparator.DETAILS]: [
      { label: "Details", value: "DETAIL DATA" },
      {
        label: "Facilities",
        resolve: featureIcons.map((item, i) => (
          <View style={s.facilityItem} key={i}>
            <View
              style={[
                s.facilityIcon,
                {
                  backgroundColor:
                    i % 2 === 0 ? C.accentPrimary : C.successColor,
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
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={s.imgGradient}
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
              <AntDesign name="hearto" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
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
              onPress={(k: string) => setActiveTab(k as HallDetailSeparator)}
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
          onPress={() => setOrderVisible(true)}
        >
          <AppText style={s.bookBtnText}>Book Now →</AppText>
        </TouchableOpacity>
      </View>

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

export default SportHall;
