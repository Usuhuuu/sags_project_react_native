import React, { useEffect } from "react";
import { View, Animated, Easing, Dimensions, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/theme_context";

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const SHIMMER_WIDTH = 200;

// One shared value drives every SkeletonBox — single animation on the native thread
const shimmerX = new Animated.Value(-SHIMMER_WIDTH);

const SkeletonBox = ({
  style,
  baseColor,
  highlightOpacity,
}: {
  style: ViewStyle;
  baseColor: string;
  highlightOpacity: number;
}) => (
  <View
    style={[
      { backgroundColor: baseColor, borderRadius: 4, overflow: "hidden" },
      style,
    ]}
  >
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: SHIMMER_WIDTH,
        transform: [{ translateX: shimmerX }],
      }}
    >
      <LinearGradient
        colors={[
          "rgba(255,255,255,0)",
          `rgba(255,255,255,${highlightOpacity})`,
          "rgba(255,255,255,0)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  </View>
);

const ReviewSkeleton = () => {
  const { colors: C, theme } = useTheme();

  const baseColor = theme === "dark" ? "#272D3A" : "#C8CDD8";
  const highlightOpacity = theme === "dark" ? 0.1 : 0.65;

  useEffect(() => {
    shimmerX.setValue(-SHIMMER_WIDTH);
    const loop = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: SCREEN_WIDTH + SHIMMER_WIDTH,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Shared props shorthand
  const sp = { baseColor, highlightOpacity };

  return (
    // Matches SportHallReviewPage root: flex:1, paddingHorizontal:10, paddingTop:10
    <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
      {/* ── Overview card ── mirrors overviewCard ───────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.border,
          padding: 20,
          marginBottom: 16,
          gap: 20,
        }}
      >
        {/* Left column: big score + stars + count ── mirrors flex:1, alignItems:"center" */}
        <View style={{ alignItems: "center", flex: 1, gap: 8 }}>
          {/* ratingScore: fontSize 52, lineHeight 56 */}
          <SkeletonBox
            {...sp}
            style={{ width: 80, height: 56, borderRadius: 8 }}
          />
          {/* StarRating starSize 18: ~5 stars wide */}
          <SkeletonBox
            {...sp}
            style={{ width: 100, height: 18, borderRadius: 4 }}
          />
          {/* ratingLabel: fontSize 12 */}
          <SkeletonBox
            {...sp}
            style={{ width: 70, height: 12, borderRadius: 4 }}
          />
        </View>

        {/* Right column: bar chart ── mirrors flex:2 */}
        <View style={{ flex: 2 }}>
          {[5, 4, 3, 2, 1].map((star) => (
            // Mirrors barRow: flexDirection:"row", alignItems:"center", gap:6, marginBottom:4
            <View
              key={star}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              {/* barLabel: width:10, fontSize:12 */}
              <SkeletonBox
                {...sp}
                style={{ width: 10, height: 12, borderRadius: 2 }}
              />
              {/* star icon: size 11 */}
              <SkeletonBox
                {...sp}
                style={{ width: 11, height: 11, borderRadius: 999 }}
              />
              {/* barTrack: flex:1, height:6, borderRadius:999 */}
              <SkeletonBox
                {...sp}
                style={{ flex: 1, height: 6, borderRadius: 999 }}
              />
              {/* barPct: width:28, fontSize:11 */}
              <SkeletonBox
                {...sp}
                style={{ width: 28, height: 12, borderRadius: 2 }}
              />
            </View>
          ))}
        </View>
      </View>

      {/* ── Filter chips ── mirrors chipRow: flexDirection:"row", gap:8, marginBottom:20 ── */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {/* 6 chips: "All" | 5 | 4 | 3 | 2 | 1 — mirrors chip: paddingH:12, paddingV:6, borderRadius:20 */}
        {[44, 36, 36, 36, 36, 36].map((w, i) => (
          <SkeletonBox
            key={i}
            {...sp}
            style={{ width: w, height: 32, borderRadius: 20 }}
          />
        ))}
      </View>

      {/* ── Section header ── mirrors sectionHeader: row, space-between, marginBottom:12 ── */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {/* sectionTitle: fontSize:16, fontWeight:600 */}
        <SkeletonBox
          {...sp}
          style={{ width: 90, height: 20, borderRadius: 4 }}
        />
        {/* headerMeta: star + rating + count */}
        <SkeletonBox
          {...sp}
          style={{ width: 65, height: 16, borderRadius: 4 }}
        />
      </View>

      {/* ── Review cards (3 placeholders) ── mirrors reviewCard ─────────── */}
      {[0].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: C.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: C.border,
            padding: 14,
            marginBottom: 10,
          }}
        >
          {/* reviewHeader: row, space-between, marginBottom:4 */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            {/* reviewName: fontSize:14, fontWeight:700 */}
            <SkeletonBox
              {...sp}
              style={{ width: 120, height: 14, borderRadius: 4 }}
            />
            {/* reviewDate: fontSize:11 */}
            <SkeletonBox
              {...sp}
              style={{ width: 65, height: 11, borderRadius: 4 }}
            />
          </View>

          {/* StarRating starSize:15 */}
          <SkeletonBox
            {...sp}
            style={{
              width: 80,
              height: 15,
              borderRadius: 4,
              marginVertical: 6,
            }}
          />

          {/* reviewBody: fontSize:14, lineHeight:20, marginTop:6 — two lines */}
          <SkeletonBox
            {...sp}
            style={{
              width: "100%",
              height: 14,
              borderRadius: 4,
              marginBottom: 6,
            }}
          />
          <SkeletonBox
            {...sp}
            style={{ width: "70%", height: 14, borderRadius: 4 }}
          />
        </View>
      ))}
    </View>
  );
};

export default ReviewSkeleton;
