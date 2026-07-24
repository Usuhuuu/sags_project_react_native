import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import StarRating from "@/components/hall_components/review/star_rating";
import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";

export interface Review {
  _id: string;
  rating: number;
  review_message: string;
  user_unique_name: string;
  imageURL: string[];
  updatedAt: string;
  stars: {
    star_count_1: number;
    star_count_2: number;
    star_count_3: number;
    star_count_4: number;
    star_count_5: number;
  };
}
interface SportHallReviewPageProps {
  sport_hall_id: string;
  reviews: Record<string, Review>;
  rating: number;
  count: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const STAR_FILTERS = ["All", 5, 4, 3, 2, 1] as const;

const SportHallReviewPage = ({
  sport_hall_id,
  reviews,
  rating,
  count,
  setPage,
}: SportHallReviewPageProps) => {
  const { colors: Colors, theme } = useTheme();
  const [filterRating, setFilterRating] = useState<number | "All">("All");
  const navigation = useNavigation();

  // Memoize reviews array once
  const reviewsArr = useMemo(() => Object.values(reviews), [reviews]);
  const totalReviews = reviewsArr.length;

  // Memoize filtered reviews
  const filteredReviews = useMemo(() => {
    if (filterRating === "All") return reviewsArr;
    return reviewsArr.filter((review) => review.rating === filterRating);
  }, [reviewsArr, filterRating]);

  // Memoize star distribution
  const starDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const starCount = reviewsArr.filter((r) => r.rating === star).length;
      return {
        star,
        count: starCount,
        percentage: totalReviews > 0 ? starCount / totalReviews : 0,
      };
    });
  }, [reviewsArr, totalReviews]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/",
              params: {
                zaalId: sport_hall_id,
                hallName: sport_hall_id,
                currentRating: rating,
              },
            })
          }
        >
          <AntDesign name="edit" size={24} color={Colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [sport_hall_id, rating, Colors.primary]);

  const keyExtractor = useCallback((item: Review) => item._id, []);

  const renderItem = useCallback(
    ({ item }: { item: Review }) => (
      <View
        style={{
          marginVertical: 8,
          padding: 10,
          borderRadius: 8,
          borderColor: Colors.littleDarkGrey,
          borderWidth: 1,
        }}
      >
        <AppText style={{ fontWeight: "bold" }}>
          {item.user_unique_name}
        </AppText>
        <StarRating rating={item.rating} starSize={20} />
        <AppText>{item.review_message}</AppText>
        <AppText style={{ fontSize: 12, color: Colors.darkGrey }}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </AppText>
      </View>
    ),
    [Colors],
  );

  const emptyComponent = useCallback(
    () => (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{ color: theme === "dark" ? Colors.dark : Colors.darkGrey }}
        >
          No reviews available
        </Text>
      </View>
    ),
    [theme, Colors.dark, Colors.darkGrey],
  );

  const footerComponent = useCallback(
    () => (
      <View style={{ padding: 10, alignItems: "center" }}>
        <Text
          style={{ color: theme === "dark" ? Colors.dark : Colors.darkGrey }}
        >
          {totalReviews >= 10 ? <OwnActivaterIndicator /> : "No more reviews"}
        </Text>
      </View>
    ),
    [theme, Colors.dark, Colors.darkGrey, totalReviews],
  );

  return (
    <View style={{ backgroundColor: "transparent", width: "95%" }}>
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <Text
              style={{
                color:
                  theme === "dark" ? Colors.themeColorTextPure : Colors.dark,
                fontSize: 40,
                fontWeight: "600",
              }}
            >
              {rating || 0}
            </Text>
            <StarRating rating={rating} starSize={20} />
            <Text style={{ color: Colors.darkGrey }}>{count || 0} review</Text>
          </View>
          <View style={{ width: "50%" }}>
            {starDistribution.map(({ star, count, percentage }) => (
              <View
                key={star}
                style={{
                  gap: 3,
                  flexDirection: "row",
                  alignItems: "center",
                  maxWidth: "100%",
                }}
              >
                <Entypo name="star" size={18} color={"gold"} />
                <Text style={{ color: Colors.primary }}>{star}</Text>
                {/* PROGRESS */}
                <View
                  style={{
                    width: 100,
                    height: 6,
                    backgroundColor: Colors.borderSubtle,
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${Math.min(Math.max(percentage, 0), 1) * 100}%`,
                      height: "100%",
                      backgroundColor: Colors.primary,
                      borderRadius: 999,
                    }}
                  />
                </View>
                <Text style={{ marginLeft: 5, color: Colors.secondary }}>
                  {Math.round(percentage * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ paddingTop: 20 }}>
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <View style={{ flexDirection: "column", width: "100%", flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-evenly",
                }}
              >
                {STAR_FILTERS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={{
                      flexDirection: "row",
                      borderWidth: 1,
                      padding: 2,
                      borderColor: Colors.darkGrey,
                      borderRadius: 10,
                      alignItems: "center",
                      width: "15%",
                      justifyContent: "center",
                      backgroundColor:
                        filterRating === item ? Colors.primary : Colors.white,
                    }}
                    onPress={() => setFilterRating(item)}
                  >
                    <Entypo
                      name="star"
                      size={15}
                      color={filterRating === item ? Colors.white : Colors.dark}
                    />
                    <Text
                      style={{
                        color:
                          filterRating === item ? Colors.white : Colors.dark,
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-between",
                  paddingTop: 10,
                }}
              >
                <Text
                  style={{
                    color:
                      theme === "dark"
                        ? Colors.themeColorTextPure
                        : Colors.dark,
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  Comment
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Entypo name="star" size={24} color="gold" />
                  <Text>{rating || 0}</Text>
                  <Text style={{ color: Colors.darkGrey }}>({count || 0})</Text>
                </View>
              </View>
            </View>
          </View>
          <View>
            {filteredReviews.length === 0
              ? emptyComponent()
              : filteredReviews.map((item) => (
                  <React.Fragment key={item._id}>
                    {renderItem({ item })}
                  </React.Fragment>
                ))}
            {footerComponent()}
            {totalReviews >= 10 && (
              <TouchableOpacity
                style={{ alignItems: "center", padding: 12 }}
                onPress={() => setPage((prev) => prev + 1)}
              >
                <AppText style={{ color: Colors.primary }}>Load more</AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default SportHallReviewPage;
