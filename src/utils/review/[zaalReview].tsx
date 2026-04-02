import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import StarRating from "@/src/utils/review/star_rating";
import * as Progress from "react-native-progress";
import { useTheme } from "@/src/context/themeContext";
import AppText from "@/constants/appTextDefault";
import OwnActivaterIndicator from "@/constants/loaderAnimation";

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

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/listing/review/util/inner_zaal_review",
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
  }, []);

  const filterReviews = (rating: number | "All") => {
    if (rating === "All") {
      return Object.values(reviews);
    }
    return Object.values(reviews).filter((review) => review.rating === rating);
  };

  return (
    <View
      style={{
        backgroundColor: "transparent",
        width: "95%",
      }}
    >
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color:
                  theme === "dark" ? Colors.themeColorTextPure : Colors.dark,
                fontSize: 40,
                fontWeight: "600",
              }}
            >
              {rating ? rating : 0}
            </Text>
            <StarRating rating={rating} starSize={20} />
            <Text style={{ color: Colors.darkGrey }}>
              {count ? count : 0} review
            </Text>
          </View>
          <View style={{ width: "50%" }}>
            {[5, 4, 3, 2, 1].map((item) => {
              const count = Object.values(reviews).reduce((acc, review) => {
                return acc + (review.rating === item ? 1 : 0);
              }, 0);
              const percentage =
                Object.values(reviews).length > 0
                  ? (count / Object.values(reviews).length).toFixed(1)
                  : 0;

              return (
                <View
                  style={{
                    gap: 3,
                    flexDirection: "row",
                    alignItems: "center",
                    maxWidth: "100%",
                  }}
                  key={item}
                >
                  <Entypo name="star" size={18} color={"gold"} />
                  <Text style={{ color: Colors.primary }}>{item}</Text>
                  <Progress.Bar
                    progress={Number(percentage)}
                    width={100}
                    color={Colors.primary}
                  />
                  <Text style={{ marginLeft: 5, color: Colors.secondary }}>
                    {Number(percentage) * 100}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ paddingTop: 20 }}>
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <View
              style={{
                flexDirection: "column",
                width: "100%",
                flex: 1,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-evenly",
                }}
              >
                {["All", 5, 4, 3, 2, 1].map((item) => {
                  return (
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
                      onPress={() => {
                        item === "All"
                          ? setFilterRating("All")
                          : setFilterRating(item as number);
                      }}
                    >
                      <Entypo
                        name="star"
                        size={15}
                        color={
                          filterRating === item ? Colors.white : Colors.dark
                        }
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
                  );
                })}
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
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <Entypo name="star" size={24} color="gold" />
                  <Text>{rating ? rating : 0}</Text>
                  <Text style={{ color: Colors.darkGrey }}>
                    ({count ? count : 0})
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <FlatList
            data={filterReviews(filterRating)}
            keyExtractor={(item) => item._id}
            style={{ height: "80%" }}
            scrollEnabled={false}
            renderItem={({ item }) => (
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
            )}
            ListEmptyComponent={() => (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme === "dark" ? Colors.dark : Colors.darkGrey,
                  }}
                >
                  No reviews available
                </Text>
              </View>
            )}
            onEndReached={() => {
              if (Object.keys(reviews).length >= 10) {
                setPage((prev) => prev + 1);
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => {
              return (
                <View style={{ padding: 10, alignItems: "center" }}>
                  <Text
                    style={{
                      color: theme === "dark" ? Colors.dark : Colors.darkGrey,
                    }}
                  >
                    {Object.keys(reviews).length >= 10 ? (
                      <OwnActivaterIndicator />
                    ) : (
                      "No more reviews"
                    )}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default SportHallReviewPage;
