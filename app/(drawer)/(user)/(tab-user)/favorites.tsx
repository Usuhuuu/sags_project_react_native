import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ListRenderItemInfo,
  Image,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/context/theme_context";
import { useHallInfo } from "@/context/hall_info_context";
import { useFavoritesStore } from "@/context/store/favorites_store";
import type {
  SportHallDataType,
  EsportHallDataType,
} from "@/types/hall_info_type";

// ─── Constants ────────────────────────────────────────────────────────────────

type HallItem = SportHallDataType | EsportHallDataType;
const FILTERS = ["All", "Sports", "Esports", "Nearby", "Top Rated"] as const;
const PAGE_SIZE = 10;
const MIN_CARD_IMG_W = 96;
const MAX_CARD_IMG_W = 150;
const responsiveHeight = (h: number) =>
  Math.round(Math.min(178, Math.max(132, h * 0.18)));

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getPrice = (item: HallItem): string => {
  const p = item.hall_details?.hall_price;
  if (!p) return "0";
  if ("oneHour" in p) return (p as any).oneHour;
  if ("pcHall" in p) return (p as any).pcHall?.oneHour ?? "0";
  return "0";
};

const formatSubType = (t: string) =>
  t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const isSport = (item: HallItem) => item.hall_types?.main === "sport_hall";

const ItemSeparator = memo(() => <View style={s.separator} />);
ItemSeparator.displayName = "ItemSeparator";

// ─── Filter Chips ─────────────────────────────────────────────────────────────

const FilterChips = memo(
  ({
    active,
    onSelect,
    colors,
  }: {
    active: string;
    onSelect: (f: string) => void;
    colors: any;
  }) => (
    <ScrollView
      style={s.filterRow}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRowContent}
    >
      {FILTERS.map((f) => {
        const isActive = active === f;
        return (
          <TouchableOpacity
            key={f}
            activeOpacity={0.75}
            onPress={() => onSelect(f)}
            style={[
              s.chip,
              {
                backgroundColor: isActive
                  ? colors.accentPrimary
                  : colors.surfaceHigh,
                borderColor: isActive
                  ? colors.accentPrimary
                  : colors.borderSubtle,
              },
            ]}
          >
            <Text
              style={[
                s.chipLabel,
                {
                  color: isActive ? "#FFF" : colors.onSurfaceVariant,
                  fontWeight: isActive ? "700" : "600",
                },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  ),
);
FilterChips.displayName = "FilterChips";

// ─── Empty State ───────────────────────────────────────────────────────────────

const EmptyState = memo(
  ({
    colors,
    onExplore,
    containerH,
  }: {
    colors: any;
    onExplore: () => void;
    containerH: number;
  }) => {
    const pulse = useSharedValue(1);

    useEffect(() => {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.12, {
            duration: 900,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }, [pulse]);

    const iconStyle = useAnimatedStyle(
      () => ({ transform: [{ scale: pulse.value }] }),
      [],
    );

    return (
      <View
        style={[
          s.emptyCard,
          {
            minHeight: Math.max(220, containerH * 0.34),
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Animated.View
          style={[
            s.emptyIconWrap,
            { backgroundColor: colors.accentPrimaryGlow },
            iconStyle,
          ]}
        >
          <Ionicons name="heart" size={46} color={colors.accentPrimary} />
        </Animated.View>

        <View style={s.emptyTextWrap}>
          <Text style={[s.emptyTitle, { color: colors.onSurface }]}>
            No favorites yet
          </Text>
          <Text style={[s.emptySub, { color: colors.onSurfaceVariant }]}>
            Tap the heart on any hall to save it here for quick access.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onExplore}
          style={[
            s.exploreBtn,
            {
              backgroundColor: colors.accentPrimary,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <Ionicons name="compass-outline" size={18} color="#FFF" />
          <Text style={s.exploreBtnText}>Explore Halls</Text>
        </TouchableOpacity>
      </View>
    );
  },
);
EmptyState.displayName = "EmptyState";

// ─── Favorite Card ─────────────────────────────────────────────────────────────

const FavoriteCard = memo(
  ({
    item,
    isFav,
    colors,
    imgWidth,
    cardH,
    onToggleFav,
    onBook,
  }: {
    item: HallItem;
    isFav: boolean;
    colors: any;
    imgWidth: number;
    cardH: number;
    onToggleFav: (id: string) => void;
    onBook: (id: string) => void;
  }) => {
    const img = item.hall_details?.hall_imageURLs?.[0];
    const name = item.hall_details?.hall_name ?? "Sports Hall";
    const address =
      item.hall_locations?.smart_location ??
      item.hall_details?.hall_address ??
      "";
    const price = getPrice(item);
    const subTypes = item.hall_types?.sub ?? [];
    const wearable = isSport(item);

    const heartScale = useSharedValue(isFav ? 1 : 0.85);
    useEffect(() => {
      heartScale.value = withSpring(isFav ? 1 : 0.85, {
        damping: 8,
        stiffness: 120,
      });
    }, [isFav, heartScale]);

    const heartStyle = useAnimatedStyle(
      () => ({ transform: [{ scale: heartScale.value }] }),
      [],
    );

    const handleFav = useCallback(
      () => onToggleFav(item.sportHallID),
      [item.sportHallID, onToggleFav],
    );
    const handleBook = useCallback(
      () => onBook(item.sportHallID),
      [item.sportHallID, onBook],
    );

    return (
      <View
        style={[
          s.card,
          {
            height: cardH,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        <View style={[s.cardImgWrap, { width: imgWidth }]}>
          {img ? (
            <Image source={{ uri: img }} style={s.cardImg} />
          ) : (
            <View
              style={[
                s.imgPlaceholder,
                { backgroundColor: colors.accentPrimaryGlow },
              ]}
            >
              <Ionicons
                name="business-outline"
                size={28}
                color={colors.accentPrimary}
              />
            </View>
          )}

          <View style={s.imgFade} pointerEvents="none" />

          <Animated.View style={[s.favBtn, heartStyle]}>
            <TouchableOpacity onPress={handleFav} hitSlop={8}>
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={20}
                color={isFav ? "#FF453A" : "#FFF"}
              />
            </TouchableOpacity>
          </Animated.View>

          {wearable && (
            <View style={s.distBadge}>
              <Ionicons name="location" size={10} color="#FFF" />
              <Text style={s.distText}>
                {(item.hall_locations?.distanceKm ?? 1.2).toFixed(1)} km
              </Text>
            </View>
          )}
        </View>

        <View style={s.cardInfo}>
          <Text
            style={[s.cardName, { color: colors.onSurface }]}
            numberOfLines={1}
          >
            {name}
          </Text>

          <View style={s.addressRow}>
            <Ionicons
              name="location-outline"
              size={11}
              color={colors.onSurfaceVariant}
            />
            <Text
              style={[s.addressText, { color: colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {address || "Location coming soon"}
            </Text>
          </View>

          {subTypes.length > 0 ? (
            <View style={s.badgeRow}>
              {subTypes.slice(0, 3).map((t) => (
                <View
                  key={t}
                  style={[
                    s.badge,
                    { backgroundColor: colors.accentPrimaryGlow },
                  ]}
                >
                  <Text style={[s.badgeLabel, { color: colors.accentPrimary }]}>
                    {formatSubType(t)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[s.badge, { backgroundColor: colors.surfaceHigh }]}>
              <Text style={[s.badgeLabel, { color: colors.onSurfaceVariant }]}>
                {wearable ? "Sport Hall" : "Esports Hall"}
              </Text>
            </View>
          )}

          <View style={s.bottomRow}>
            <View style={s.priceWrap}>
              <Text style={[s.price, { color: colors.accentPrimary }]}>
                ₮{Number(price).toLocaleString()}
                <Text style={[s.unit, { color: colors.outline }]}> /hr</Text>
              </Text>
            </View>

            <View
              style={[s.ratingWrap, { backgroundColor: colors.surfaceHigh }]}
            >
              <Ionicons name="star" size={11} color="#F5B301" />
              <Text style={[s.ratingText, { color: colors.onSurfaceVariant }]}>
                {"4.8"}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBook}
              style={[
                s.bookBtn,
                {
                  backgroundColor: colors.accentPrimary,
                  shadowColor: colors.shadowColor,
                },
              ]}
            >
              <Ionicons name="calendar-outline" size={13} color="#FFF" />
              <Text style={s.bookBtnText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);
FavoriteCard.displayName = "FavoriteCard";

export default function FavoritesScreen() {
  const { colors: C } = useTheme();
  const router = useRouter();
  const { getAllHalls } = useHallInfo();
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const loadFavs = useFavoritesStore((s) => s.load);
  const isLoaded = useFavoritesStore((s) => s.isLoaded);
  const toggleFav = useFavoritesStore((s) => s.toggle);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const mountedRef = useRef(true);

  const { width, height } = useWindowDimensions();

  const cardImgWidth = useMemo(
    () =>
      Math.max(
        MIN_CARD_IMG_W,
        Math.min(MAX_CARD_IMG_W, Math.round(width * 0.3)),
      ),
    [width],
  );
  const cardHeight = useMemo(() => responsiveHeight(height), [height]);

  useEffect(() => {
    loadFavs();
    return () => {
      mountedRef.current = false;
    };
  }, [loadFavs]);

  const allHalls = useMemo(() => Object.values(getAllHalls()), [getAllHalls]);

  const favoriteHalls = useMemo(
    () => allHalls.filter((h) => favoriteIds.has(h.sportHallID)),
    [allHalls, favoriteIds],
  );

  const filtered = useMemo(() => {
    let result = favoriteHalls;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (h) =>
          h.hall_details?.hall_name?.toLowerCase().includes(q) ||
          h.hall_locations?.smart_location?.toLowerCase().includes(q),
      );
    }

    if (filter === "Sports") {
      result = result.filter((h) => h.hall_types?.main === "sport_hall");
    } else if (filter === "Esports") {
      result = result.filter((h) => h.hall_types?.main === "esport_hall");
    }

    return result;
  }, [favoriteHalls, search, filter]);

  const displayed = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page],
  );
  const hasMore = displayed.length < filtered.length;

  const loadMore = useCallback(() => {
    if (hasMore) setPage((p) => p + 1);
  }, [hasMore]);

  const handleToggleFav = useCallback(
    (id: string) => toggleFav(id),
    [toggleFav],
  );

  const handleBook = useCallback(
    (id: string) => router.push(`/book/${id}`),
    [router],
  );

  const handleExplore = useCallback(
    () => router.push("/(drawer)/(user)/(tab-user)"),
    [router],
  );

  const keyExtractor = useCallback((item: HallItem) => item.sportHallID, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: cardHeight + 12,
      offset: (cardHeight + 12) * index,
      index,
    }),
    [cardHeight],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HallItem>) => (
      <FavoriteCard
        item={item}
        isFav={favoriteIds.has(item.sportHallID)}
        colors={C}
        imgWidth={cardImgWidth}
        cardH={cardHeight}
        onToggleFav={handleToggleFav}
        onBook={handleBook}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [C, cardImgWidth, cardHeight, handleToggleFav, handleBook],
  );

  const listHeader = useMemo(
    () => (
      <>
        <View style={s.titleRow}>
          <Text style={[s.title, { color: C.onSurface }]}>Favorites</Text>
          {favoriteHalls.length > 0 && (
            <View
              style={[s.countBadge, { backgroundColor: C.accentPrimaryGlow }]}
            >
              <Text style={[s.countText, { color: C.accentPrimary }]}>
                {favoriteHalls.length}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            s.searchWrap,
            {
              backgroundColor: C.surface,
              borderColor: C.borderSubtle,
              shadowColor: C.shadowColor,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={C.onSurfaceVariant} />
          <TextInput
            placeholder="Search favorites..."
            placeholderTextColor={C.outline}
            value={search}
            onChangeText={setSearch}
            style={[s.searchInput, { color: C.onSurface }]}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={C.outline} />
            </TouchableOpacity>
          )}
        </View>

        <FilterChips active={filter} onSelect={setFilter} colors={C} />
      </>
    ),
    [C, search, filter, favoriteHalls.length],
  );

  const EmptyComponent = useMemo(
    () => (
      <EmptyState
        colors={C}
        onExplore={handleExplore}
        containerH={height * 0.4}
      />
    ),
    [C, handleExplore, height],
  );

  const footerComponent = useMemo(
    () =>
      hasMore ? (
        <View style={s.footer}>
          <View
            style={[
              s.footerSpinner,
              { borderTopColor: C.accentPrimary, borderColor: C.borderSubtle },
            ]}
          />
          <Text style={[s.footerText, { color: C.outline }]}>
            Loading more...
          </Text>
        </View>
      ) : displayed.length > 0 ? (
        <View style={s.footer}>
          <Text style={[s.footerEndText, { color: C.outline }]}>
            {"You're all caught up"}
          </Text>
        </View>
      ) : null,
    [hasMore, displayed.length, C],
  );

  if (!isLoaded) return null;

  return (
    <View style={[s.screen, { backgroundColor: C.backgroundColor }]}>
      <Animated.FlatList
        data={displayed}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        ListFooterComponent={footerComponent}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={[
          s.listContent,
          { paddingBottom: Platform.OS === "ios" ? 40 : 32 },
          displayed.length === 0 && s.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        getItemLayout={getItemLayout}
        initialNumToRender={5}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={40}
        ItemSeparatorComponent={ItemSeparator}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  separator: { height: 12 },
  emptyListContent: {
    flexGrow: 1,
  },

  // Header
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: { fontSize: 13, fontWeight: "700" },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },

  // Filter chips
  filterRow: {
    flexGrow: 0,
    paddingVertical: 12,
  },
  filterRowContent: {
    gap: 8,
    paddingHorizontal: 1,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
  },
  chipLabel: { fontSize: 13 },

  // Card
  card: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImgWrap: {
    height: "100%",
    position: "relative",
  },
  cardImg: {
    width: "100%",
    height: "100%",
  },
  imgFade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.32)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
  },
  distBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  distText: { color: "#FFF", fontSize: 10, fontWeight: "600" },
  cardInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  cardName: { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  addressText: { fontSize: 11, flex: 1 },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLabel: { fontSize: 9, fontWeight: "700", textTransform: "capitalize" },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  priceWrap: { flex: 1 },
  price: { fontSize: 14, fontWeight: "800" },
  unit: { fontSize: 10, fontWeight: "400" },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: { fontSize: 10, fontWeight: "700" },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bookBtnText: { color: "#FFF", fontSize: 11, fontWeight: "700" },

  // Empty
  emptyCard: {
    marginTop: 8,
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyIconWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  emptyTextWrap: {
    alignItems: "center",
    marginBottom: 26,
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: 26,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },

  // Footer
  footer: {
    paddingVertical: 18,
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerSpinner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  footerText: { fontSize: 12, fontWeight: "600" },
  footerEndText: { fontSize: 12, fontWeight: "600", opacity: 0.6 },
});
