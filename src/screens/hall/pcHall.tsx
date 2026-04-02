import { EsportHallDataType } from "@/interfaces/listing";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/themeContext";
import { router } from "expo-router";
import { AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import AppText from "@/constants/appTextDefault";
import SportHallReviewPage, { Review } from "@/src/utils/review/[zaalReview]";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import {
  HallDetailSeparator,
  HallTypesSeparator,
} from "@/interfaces/hallTypes";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import OwnActivaterIndicator from "@/constants/loaderAnimation";

interface PC_HallsProps {
  listing: EsportHallDataType;
  hallID: string;
  hallType: HallTypesSeparator;
}

const Pc_Halls = ({ listing, hallType, hallID }: PC_HallsProps) => {
  const { colors: Colors, theme } = useTheme();

  const imageRef = useRef<ICarouselInstance>(null);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [rating, setRating] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [noMoreReviews, setNoMoreReviews] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { width } = Dimensions.get("window");
  const featureIcons = {
    wifi: {
      label: "Wi-Fi",
      icon: (
        <Feather
          name="wifi"
          size={24}
          color={theme === "dark" ? Colors.white : Colors.white}
        />
      ),
    },
    parking: {
      label: "Parking",
      icon: (
        <FontAwesome5
          name="parking"
          size={24}
          color={theme === "dark" ? Colors.white : Colors.white}
        />
      ),
    },
  };

  const reviewFetchRef = useRef<boolean>(false);

  const progress = useSharedValue(0);
  const scrollY = useSharedValue(0);

  const [activeTab, setActiveTab] = useState<HallDetailSeparator>(
    HallDetailSeparator.DETAILS,
  );
  const tabs = [
    { key: HallDetailSeparator.DETAILS, label: "Details" },
    { key: HallDetailSeparator.AMENTITIES, label: "Amentities" },
    { key: HallDetailSeparator.REVIEW, label: "Review" },
  ];

  const fetch_zaal_review = async () => {
    try {
      setLoading(true);
      const response = await axiosInstanceRegular.get(
        `/zaal-review/${listing.sportHallID}?page=${page}`,
      );
      if (response.status === 200 && response.data.success) {
        const returnData = response.data.data;
        if (returnData === null) return;
        setReviews((prev) => {
          let changed = false;
          const newMap = { ...prev };
          const existingReviews = new Set(Object.keys(prev));
          returnData.reviews.forEach((review: Review) => {
            if (!existingReviews.has(review._id)) {
              newMap[review._id] = review;
              changed = true;
            }
          });
          return changed ? newMap : prev;
        });
        if (
          (returnData.reviews.length > 0 && returnData.reviews.length < 10) ||
          returnData.reviews.length === 0
        ) {
          setNoMoreReviews(true);
        }
        setRating(returnData.avg_rating);
        setCount(returnData.review_count);

        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (activeTab !== "review") return;
    if (!reviewFetchRef.current && !noMoreReviews) {
      fetch_zaal_review();
      reviewFetchRef.current = true;
    }
  }, [page, activeTab]);

  const priceGenerator = (type: "hour" | "wholeDay") => {
    if (!listing.hall_details.hall_price) return;
    return Object.entries(listing.hall_details.hall_price).map(
      ([key, value], index) => (
        <View
          key={`price-${index}`}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginVertical: 5,
          }}
        >
          <AppText style={{ fontWeight: "500" }}>
            {key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
          </AppText>
          {type === "hour" ? (
            <AppText>${value.oneHour} tugrug</AppText>
          ) : (
            <AppText>${value.wholeDay} tugrug</AppText>
          )}
        </View>
      ),
    );
  };

  const detailGenerate = {
    details: [
      {
        label: "Details",
        value: "DETAIL DATA",
      },
      {
        label: "Facilities",
        resolve: Object.values(featureIcons).map((item, index) => (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
              gap: 3,
            }}
            key={`facility${index}`}
          >
            <View
              style={{
                borderRadius: 25,
                backgroundColor:
                  theme === "dark" ? Colors.shadowColor : Colors.primary,
                padding: 10,
              }}
              key={`icon${index}`}
            >
              {item.icon}
            </View>
            <AppText style={{ textAlign: "center", fontSize: 12 }}>
              {item.label}
            </AppText>
          </View>
        )),
      },
      {
        label: "Opening Hours",
        value: `${listing.hall_details.hall_work_time.start_time} - ${listing.hall_details.hall_work_time.end_time}`,
      },
      {
        label: "Price Details Per Hour",
        component: priceGenerator("hour"),
      },
      {
        label: "Price Details Per Whole Day",
        component: priceGenerator("wholeDay"),
      },
    ],
    amentities: [
      {
        label: "Amentities",
        value: "AMENTITIES DATA",
      },
    ],
    review: [
      {
        label: undefined,
        component: (
          <View style={{ flex: 1, width: width }}>
            {loading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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
            )}
          </View>
        ),
      },
    ],
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.backgroundColor }}
      edges={["left", "right", "top"]}
    >
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <View
          style={{
            height: 350,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            overflow: "hidden",
          }}
        >
          <Carousel
            ref={imageRef}
            width={width}
            height={400}
            loop={true}
            autoPlay={false}
            data={listing.hall_details.hall_imageURLs}
            scrollAnimationDuration={500}
            onProgressChange={(absoluteProgress) => {
              progress.value = absoluteProgress;
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            )}
          />
          <Pagination.Custom
            progress={progress}
            data={listing.hall_details.hall_imageURLs ?? []}
            dotStyle={{
              width: 25,
              height: 4,
              backgroundColor: Colors.themeColorTextPure,
            }}
            activeDotStyle={{
              overflow: "hidden",
              backgroundColor: Colors.primary,
            }}
            containerStyle={{
              gap: 12,
              bottom: 120,
            }}
            horizontal
            onPress={(index: number) => {
              imageRef.current?.scrollTo({
                count: index - progress.value,
                animated: true,
              });
            }}
          />
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={22} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
              <AntDesign name="hearto" size={22} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={[
            styles.titleCard,
            { backgroundColor: Colors.backgroundColor },
          ]}
        >
          <AppText
            style={{
              fontSize: 22,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            {listing.hall_details.hall_name}
          </AppText>
          <View style={styles.ratingRow}>
            <AntDesign name="star" size={16} color="#FFD700" />
            <AppText style={styles.ratingText}>
              4.8 <AppText style={{ color: "gray" }}>(124 reviews)</AppText>
            </AppText>
          </View>
        </View>

        <LinearGradient
          colors={
            theme === "dark"
              ? [Colors.backgroundColor, Colors.primary]
              : [Colors.backgroundColor, Colors.primary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1, paddingBottom: 100 }}
        >
          <View
            style={{ marginHorizontal: 10, flex: 1, justifyContent: "center" }}
          >
            {/* TABS SECTION */}
            <View
              style={[
                styles.tabContainer,
                { borderBottomColor: Colors.backgroundColor },
              ]}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[
                    styles.tabItem,
                    activeTab === tab.key && styles.activeTabBorder,
                  ]}
                >
                  <AppText
                    style={[
                      styles.tabLabel,
                      activeTab === tab.key && styles.activeTabLabel,
                    ]}
                  >
                    {tab.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
            {/* DETAIL SECTION */}
            <View style={{}}>
              {detailGenerate[activeTab].map((item, index) => (
                <View
                  style={{ paddingVertical: 10 }}
                  key={`${index}-${item.label}`}
                >
                  {item.label && (
                    <AppText style={{ fontSize: 20, fontWeight: "bold" }}>
                      {item.label}
                    </AppText>
                  )}
                  <View style={{ paddingVertical: 10 }} key={index}>
                    {"component" in item ? (
                      <View>{item.component}</View>
                    ) : "resolve" in item ? (
                      <ScrollView key={`${index}${item.label}`} horizontal>
                        {item.resolve}
                      </ScrollView>
                    ) : (
                      <AppText>{item.value}</AppText>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </Animated.ScrollView>
      {/* Stick Button */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor:
              theme === "dark"
                ? Colors.backgroundColor
                : Colors.backgroundColor,
          },
        ]}
      >
        <View>
          <AppText
            style={{
              color: "grey",
              fontSize: 12,
            }}
          >
            Total Price
          </AppText>
          <AppText
            style={[
              styles.priceText,
              {
                color: Colors.primary,
              },
            ]}
          >
            ₮80k
            <AppText
              style={{
                fontSize: 14,
                fontWeight: "normal",
                color: "grey",
              }}
            >
              / hour
            </AppText>
          </AppText>
        </View>
        <TouchableOpacity
          style={[
            styles.bookButton,
            {
              backgroundColor: Colors.primary,
            },
          ]}
          onPress={() => {
            const zaal_id = listing.sportHallID;
            router.push(`/listing/book/esport/${zaal_id}`);
          }}
        >
          <AppText
            style={[
              styles.bookButtonText,
              {
                color: Colors.backgroundColor,
              },
            ]}
          >
            Book Now →
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    height: 350,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  headerButtons: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconCircle: {
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 10,
    borderRadius: 25,
  },
  titleCard: {
    marginHorizontal: 20,
    marginTop: -60,
    borderRadius: 30,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  titleText: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 14, fontWeight: "600" },
  tabContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 10,
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 12 },
  activeTabBorder: { borderBottomWidth: 2, borderBottomColor: "#1A73E8" },
  tabLabel: { color: "gray", fontSize: 15 },
  activeTabLabel: { color: "#1A73E8", fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 10,
  },
  descriptionText: { color: "#666", lineHeight: 22 },
  facilityGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  facilityItem: { alignItems: "center" },
  facilityIconCircle: {
    backgroundColor: "#F0F7FF",
    padding: 15,
    borderRadius: 30,
    marginBottom: 8,
  },
  facilityLabel: { fontSize: 12, color: "gray" },
  hoursCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  statusBadge: { flexDirection: "row", alignItems: "center" },
  timeText: { fontSize: 18, fontWeight: "bold", letterSpacing: 1 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
  },
  priceText: { fontSize: 24, fontWeight: "bold", color: "#1A73E8" },
  bookButton: {
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 25,
  },
  bookButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default Pc_Halls;
