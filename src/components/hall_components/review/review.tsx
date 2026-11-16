import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import StarRating from "@/components/hall_components/review/star_rating";
import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";

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
  reviewFetchFunc: () => void;
}

const STAR_FILTERS = ["All", 5, 4, 3, 2, 1] as const;
const R2_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_URL;

const SportHallReviewPage = ({
  sport_hall_id,
  reviews,
  rating,
  count,
  reviewFetchFunc,
}: SportHallReviewPageProps) => {
  const { colors: C } = useTheme();
  const [filterRating, setFilterRating] = useState<number | "All">("All");

  const reviewsArr = useMemo(() => Object.values(reviews), [reviews]);
  const totalReviews = reviewsArr.length;

  const filteredReviews = useMemo(() => {
    if (filterRating === "All") return reviewsArr;
    return reviewsArr.filter((r) => r.rating === filterRating);
  }, [reviewsArr, filterRating]);

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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // ── Rating overview ──────────────────────────────────────────────
        overviewCard: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.border,
          padding: 20,
          marginBottom: 16,
          gap: 20,
        },
        ratingScore: {
          fontSize: 52,
          fontWeight: "700",
          color: C.themeColorTextPure,
          lineHeight: 56,
        },
        ratingLabel: {
          fontSize: 12,
          color: C.outline,
          marginTop: 4,
        },
        barRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        },
        barLabel: {
          fontSize: 12,
          color: C.outline,
          width: 10,
          textAlign: "right",
        },
        barTrack: {
          flex: 1,
          height: 6,
          backgroundColor: C.borderSubtle,
          borderRadius: 999,
          overflow: "hidden",
        },
        barFill: {
          height: "100%",
          borderRadius: 999,
          backgroundColor: C.primary,
        },
        barPct: {
          fontSize: 11,
          color: C.outline,
          width: 28,
          textAlign: "right",
        },

        // ── Filter chips ─────────────────────────────────────────────────
        chipRow: {
          flexDirection: "row",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        },
        chip: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          borderWidth: 1,
        },
        chipText: {
          fontSize: 13,
        },

        // ── Section header ────────────────────────────────────────────────
        sectionHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: "600",
          color: C.themeColorTextPure,
        },
        headerMeta: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        },

        // ── Review card ──────────────────────────────────────────────────
        reviewCard: {
          backgroundColor: C.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: C.border,
          padding: 14,
          marginBottom: 10,
        },
        reviewHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        },
        reviewName: {
          fontWeight: "700",
          color: C.onSurface,
          fontSize: 14,
        },
        reviewDate: {
          fontSize: 11,
          color: C.outline,
        },
        reviewBody: {
          color: C.onSurfaceVariant,
          fontSize: 14,
          lineHeight: 20,
          marginTop: 6,
        },

        // ── Empty / footer ───────────────────────────────────────────────
        emptyWrap: {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 48,
          gap: 10,
        },
        emptyText: {
          color: C.outline,
          fontSize: 14,
        },
        loadMoreBtn: {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 12,
          marginTop: 4,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: C.accentPrimaryBorder,
          backgroundColor: C.accentPrimaryGlow,
        },
        loadMoreText: {
          color: C.primary,
          fontWeight: "600",
          fontSize: 14,
        },
      }),
    [C],
  );

  return (
    <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
      {/* ── Rating overview card ── */}
      <View style={styles.overviewCard}>
        {/* Big score + stars + count */}
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={styles.ratingScore}>{rating?.toFixed(1) ?? "0.0"}</Text>
          <StarRating rating={rating} starSize={18} />
          <Text style={styles.ratingLabel}>{count ?? 0} reviews</Text>
        </View>

        {/* Bar chart */}
        <View style={{ flex: 2 }}>
          {starDistribution.map(({ star, percentage }) => (
            <View key={star} style={styles.barRow}>
              <Text style={styles.barLabel}>{star}</Text>
              <Entypo name="star" size={11} color="#FBBF24" />
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.round(
                        Math.min(Math.max(percentage, 0), 1) * 100,
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barPct}>{Math.round(percentage * 100)}%</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/review/inner_review",
            params: {
              zaalId: sport_hall_id,
              hallName: sport_hall_id, // Use the actual hall name if you have it
              currentRating: String(rating),
            },
          })
        }
        style={{
          backgroundColor: C.primary,
          padding: 12,
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: C.white, fontWeight: "600" }}>
          Write a review
        </Text>
      </TouchableOpacity>
      {/* ── Filter chips ── */}
      <View style={styles.chipRow}>
        {STAR_FILTERS.map((item) => {
          const active = filterRating === item;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => setFilterRating(item)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? C.primary : C.surfaceHighest,
                  borderColor: active ? C.primary : C.border,
                },
              ]}
            >
              {item !== "All" && (
                <Entypo
                  name="star"
                  size={12}
                  color={active ? C.white : "#FBBF24"}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  {
                    color: active ? C.white : C.onSurfaceVariant,
                    fontWeight: active ? "600" : "400",
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Section header ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Comments</Text>
        <View style={styles.headerMeta}>
          <Entypo name="star" size={16} color="#FBBF24" />
          <AppText style={{ fontWeight: "600", color: C.themeColorTextPure }}>
            {rating?.toFixed(1) ?? "0.0"}
          </AppText>
          <AppText style={{ color: C.outline }}>({count ?? 0})</AppText>
        </View>
      </View>

      {/* ── Reviews ── */}
      {filteredReviews.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Entypo name="star-outlined" size={40} color={C.borderSubtle} />
          <Text style={styles.emptyText}>No reviews yet</Text>
        </View>
      ) : (
        <>
          {filteredReviews.map((item) => (
            <View key={item._id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{item.user_unique_name}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              <StarRating rating={item.rating} starSize={15} />
              <Text style={styles.reviewBody}>{item.review_message}</Text>
              {item.imageURL?.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 10 }}
                >
                  {item.imageURL.map((imageUrl, index) => {
                    const uri = imageUrl.startsWith("http")
                      ? imageUrl
                      : `${R2_PUBLIC_BASE_URL}/${imageUrl}`;

                    return (
                      <Image
                        key={`${item._id}-${index}`}
                        source={{ uri }}
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 10,
                          marginRight: 8,
                        }}
                        resizeMode="cover"
                      />
                    );
                  })}
                </ScrollView>
              )}
            </View>
          ))}

          {/* Footer */}
          {totalReviews >= 10 ? (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => reviewFetchFunc}
            >
              <Text style={styles.loadMoreText}>Load more</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <Text style={{ color: C.outline, fontSize: 13 }}>
                All reviews loaded
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default SportHallReviewPage;
