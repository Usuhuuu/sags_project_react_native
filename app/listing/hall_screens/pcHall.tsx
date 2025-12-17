import { EsportHallDataType, SportHallDataType } from "@/interfaces/listing";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { FormData } from "../detail";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/app/(modals)/context/themeContext";
import { router } from "expo-router";
import { EvilIcons, Feather, FontAwesome5 } from "@expo/vector-icons";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import AppText from "@/constants/appTextDefault";
import SportHallReviewPage, { Review } from "../review/[zaalReview]";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import {
  HallDetailSeparator,
  HallTypesSeparator,
} from "@/interfaces/hallTypes";
import OrderScreenPC from "../details/pcdetails";
import LinearGradient from "react-native-linear-gradient";

interface PC_HallsProps {
  listing: EsportHallDataType;
  sportHallID: string;
  hallType: HallTypesSeparator;
}

const Pc_Halls = ({ listing, hallType }: PC_HallsProps) => {
  const { colors: Colors, theme } = useTheme();

  const imageRef = useRef<ICarouselInstance>(null);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [rating, setRating] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [noMoreReviews, setNoMoreReviews] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOrderScreenVisible, setIsOrderScreenVisible] =
    useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    sportHallID: "",
    name: "",
    date: "",
    price: {
      oneHour: "",
      wholeDay: "",
    },
    workTime: "",
    image: [] as string[],
    location: {
      latitude: "",
      longitude: "",
      smart_location: "",
    },
  });
  const { width } = Dimensions.get("window");
  const featureIcons = {
    wifi: {
      label: "Wi-Fi",
      icon: (
        <Feather
          name="wifi"
          size={24}
          color={theme === "dark" ? Colors.dark : Colors.white}
        />
      ),
    },
    parking: {
      label: "Parking",
      icon: (
        <FontAwesome5
          name="parking"
          size={24}
          color={theme === "dark" ? Colors.dark : Colors.white}
        />
      ),
    },
  };

  const reviewFetchRef = useRef<boolean>(false);

  const progress = useSharedValue(0);
  const [activeTab, setActiveTab] = useState<HallDetailSeparator>(
    HallDetailSeparator.DETAILS
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
        `/zaal-review/${listing.sportHallID}?page=${page}`
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
    if (!listing.prices) return;
    return Object.entries(listing.prices).map(([key, value], index) => (
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
    ));
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
        value: `${listing.workTime.startTime} - ${listing.workTime.endTime}`,
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
                <ActivityIndicator />
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

  const handleZaalId = (
    input: any,
    name: any,
    price: any,
    workTime: string | undefined,
    imageUrls: string[] | undefined,
    location?: {
      latitude: string;
      longitude: string;
      smart_location?: string | undefined;
    }
  ) => {
    setFormData((prev) => ({
      ...prev,
      sport_hall_id: input,
      name: name,
      price: price,
      workTime: workTime,
      image: imageUrls,
      location: location ? location : prev.location,
    }));
  };

  useEffect(() => {
    handleZaalId(
      listing.sportHallID,
      listing.name,
      listing.prices,
      `${listing.workTime.startTime} - ${listing.workTime.endTime}`,
      listing.imageUrls,
      listing.location
    );
  }, [listing]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
      <ScrollView style={{ flex: 1, height: "90%" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 5,
            position: "absolute",
            zIndex: 10,
            width: width - 10,
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            style={{
              padding: 7,
              borderRadius: 25,
              backgroundColor:
                theme === "dark" ? Colors.shadowColor : Colors.primary,
            }}
            onPress={() => {
              router.back();
            }}
          >
            <Feather
              name="arrow-left"
              size={24}
              color={
                theme === "dark" ? Colors.themeColorTextPure : Colors.white
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor:
                theme === "dark" ? Colors.shadowColor : Colors.primary,
              padding: 7,
              borderRadius: 25,
            }}
          >
            <EvilIcons
              name="heart"
              size={24}
              color={
                theme === "dark" ? Colors.themeColorTextPure : Colors.white
              }
            />
          </TouchableOpacity>
        </View>
        <View>
          <Carousel
            ref={imageRef}
            width={width}
            height={250}
            loop={true}
            autoPlay={false}
            data={listing.imageUrls}
            scrollAnimationDuration={500}
            onProgressChange={(absoluteProgress) => {
              progress.value = absoluteProgress;
            }}
            renderItem={({ item }) => (
              <View style={{ flex: 1 }}>
                <Image
                  source={{ uri: item }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
            )}
          />
          <Pagination.Custom
            progress={progress}
            data={listing.imageUrls}
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
              bottom: 10,
            }}
            horizontal
            onPress={(index: number) => {
              imageRef.current?.scrollTo({
                count: index - progress.value,
                animated: true,
              });
            }}
          />
        </View>
        <LinearGradient
          colors={[Colors.themeColorTextPure, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          <View style={{ marginHorizontal: 10, flex: 1 }}>
            {/* HEADER HALL TITLE */}
            <View style={{ paddingTop: 10 }}>
              <AppText style={{ fontSize: 25, fontWeight: "bold" }}>
                {listing.name}
              </AppText>
            </View>
            {/* TABS SECTION */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                paddingVertical: 10,
                width: "100%",
              }}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key as any)}
                  style={{
                    borderBottomWidth: activeTab === tab.key ? 2 : 0,
                    borderColor: Colors.primary,
                    width: "33.3%",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 10,
                  }}
                >
                  <AppText
                    style={{
                      color:
                        activeTab === tab.key
                          ? Colors.themeColorTextPure
                          : Colors.themeColorTextSecondary,
                      fontWeight: activeTab === tab.key ? "bold" : "normal",
                    }}
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
      </ScrollView>
      {/* Stick Button */}
      <View
        style={{
          flexDirection: "row",
          position: "sticky",
          marginHorizontal: 10,
          bottom: 20,
          borderTopColor: Colors.shadowColor,
          borderTopWidth: 1,
          paddingTop: 10,
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <View
          style={{
            width: "20%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText
            style={{
              color: Colors.darkGrey,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            Price
          </AppText>
          {/* <AppText style={{ fontWeight: "bold" }}>
            ${listing.prices.regularPc.oneHour} / hr
          </AppText> */}
        </View>
        <View style={{ width: "80%" }}>
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: Colors.primary,
              borderRadius: 25,
            }}
            onPress={() => setIsOrderScreenVisible(true)}
          >
            <AppText
              style={{
                color: Colors.themeColorTextPure,
                textAlign: "center",
                fontSize: 20,
              }}
            >
              Book Now
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
      {/* Booking TimeSlot Selection */}
      <Modal
        animationType="slide"
        visible={isOrderScreenVisible}
        transparent
        onRequestClose={() => setIsOrderScreenVisible(false)}
      >
        <View
          style={[
            {
              backgroundColor: Colors.shadowColor,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderColor: "black",
              borderWidth: 1,
            },
          ]}
        >
          <View
            style={[
              {
                backgroundColor: Colors.light,
                borderRadius: 10,
                width: "90%",
                height: "90%",
              },
            ]}
          >
            <OrderScreenPC
              listing={listing}
              orderModelVisible={isOrderScreenVisible}
              setOrderModelVisible={setIsOrderScreenVisible}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Pc_Halls;
