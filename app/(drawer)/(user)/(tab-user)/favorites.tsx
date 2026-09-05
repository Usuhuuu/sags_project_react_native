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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
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
const ITEM_HEIGHT = 128;
const FILTERS = ["All", "Sports", "Esports", "Nearby", "Top Rated"] as const;
const PAGE_SIZE = 10;

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getPrice = (item: HallItem): string => {
  const p = item.hall_details?.hall_price;
  if (!p) return "0";
  if ("oneHour" in p) return (p as any).oneHour;
  if ("pcHall" in p) return (p as any).pcHall?.oneHour ?? "0";
  return "0";
};

// ─── Filter C hips ──────────────────────────────────────────────────────────────

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
    <ScrollView style={s.filterRow} horizontal>
      {FILTERS.map((f) => {
        const isActive = active === f;
        return (
          <TouchableOpacity
            key={f}
            activeOpacity={0.7}
            onPress={() => onSelect(f)}
            style={[
              s.chip,
              {
                backgroundColor: isActive
                  ? colors.accentPrimary
                  : colors.surface,
                borderColor: isActive ? colors.accentPrimary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                s.chipLabel,
                {
                  color: isActive ? "#FFF" : colors.onSurface,
                  fontWeight: isActive ? "700" : "500",
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

// ─── Empty State ───────────────────────────────────────────────────────────────

const EmptyState = memo(
  ({ colors, onExplore }: { colors: any; onExplore: () => void }) => (
    <View style={s.emptyWrap}>
      <View
        style={[s.emptyIconWrap, { backgroundColor: colors.accentPrimaryGlow }]}
      >
        <Ionicons name="heart-outline" size={52} color={colors.accentPrimary} />
      </View>
      <Text style={[s.emptyTitle, { color: colors.onSurface }]}>
        No favorites yet
      </Text>
      <Text style={[s.emptySub, { color: colors.outline }]}>
        Start exploring and save the halls you love
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onExplore}
        style={[s.exploreBtn, { backgroundColor: colors.accentPrimary }]}
      >
        <Ionicons name="search" size={18} color="#FFF" />
        <Text style={s.exploreBtnText}>Explore Halls</Text>
      </TouchableOpacity>
    </View>
  ),
);

// ─── Favorite Card ─────────────────────────────────────────────────────────────

const FavoriteCard = memo(
  ({
    item,
    isFav,
    colors,
    onToggleFav,
    onBook,
  }: {
    item: HallItem;
    isFav: boolean;
    colors: any;
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
    const heartScale = useSharedValue(isFav ? 1 : 0.85);

    useEffect(() => {
      heartScale.value = withSpring(isFav ? 1 : 0.85, {
        damping: 8,
        stiffness: 120,
      });
    }, [isFav, heartScale]);

    const heartStyle = useAnimatedStyle(
      () => ({
        transform: [{ scale: heartScale.value }],
      }),
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
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Image */}
        <View style={s.cardImgWrap}>
          {img ? (
            <Image
              source={{ uri: img }}
              style={s.cardImg}
              //contentFit="cover"
              //cachePolicy="memory-disk"
              //placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
              //transition={200}
            />
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
          {/* Favorite toggle */}
          <Animated.View style={[s.favBtn, heartStyle]}>
            <TouchableOpacity onPress={handleFav} hitSlop={8}>
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={22}
                color={isFav ? "#FF3B30" : "#FFF"}
              />
            </TouchableOpacity>
          </Animated.View>
          {/* Distance badge */}
          <View style={[s.distBadge, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
            <Ionicons name="location" size={10} color="#FFF" />
            <Text style={s.distText}>
              {(Math.random() * 5 + 0.5).toFixed(1)} km
            </Text>
          </View>
        </View>

        {/* Info */}
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
              color={colors.outline}
            />
            <Text
              style={[s.addressText, { color: colors.outline }]}
              numberOfLines={1}
            >
              {address}
            </Text>
          </View>

          {/* Sport badges */}
          {subTypes.length > 0 && (
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
                    {t.replace(/_/g, " ")}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom row: price + rating + book */}
          <View style={s.bottomRow}>
            <Text style={[s.price, { color: colors.accentPrimary }]}>
              ₮{Number(price).toLocaleString()}
              <Text style={[s.unit, { color: colors.outline }]}> / hr</Text>
            </Text>
            <View style={s.ratingWrap}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={[s.ratingText, { color: colors.outline }]}>4.8</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBook}
              style={[s.bookBtn, { backgroundColor: colors.accentPrimary }]}
            >
              <Text style={s.bookBtnText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

// ─── Main Screen ───────────────────────────────────────────────────────────────

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

  useEffect(() => {
    loadFavs();
    return () => {
      mountedRef.current = false;
    };
  }, [loadFavs]);

  // Get all halls and filter by favorites
  const allHalls = useMemo(() => Object.values(getAllHalls()), [getAllHalls]);

  const favoriteHalls = useMemo(
    () => allHalls.filter((h) => favoriteIds.has(h.sportHallID)),
    [allHalls, favoriteIds],
  );

  // Search + filter
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
    // "Nearby" and "Top Rated" are placeholders for future geo/rating sort

    return result;
  }, [favoriteHalls, search, filter]);

  // Pagination
  const displayed = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page],
  );
  const hasMore = displayed.length < filtered.length;

  const loadMore = useCallback(() => {
    if (hasMore) setPage((p) => p + 1);
  }, [hasMore]);

  const handleToggleFav = useCallback(
    (id: string) => {
      toggleFav(id);
    },
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
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HallItem>) => (
      <FavoriteCard
        item={item}
        isFav={favoriteIds.has(item.sportHallID)}
        colors={C}
        onToggleFav={handleToggleFav}
        onBook={handleBook}
      />
    ),
    [favoriteIds, C, handleToggleFav, handleBook],
  );

  const listHeader = useMemo(
    () => (
      <>
        {/* Search bar */}
        <View
          style={[
            s.searchWrap,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <Ionicons name="search" size={18} color={C.outline} />
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
        {/* Filter chips */}
        <FilterChips active={filter} onSelect={setFilter} colors={C} />
      </>
    ),
    [C, search, filter],
  );

  const emptyComponent = useMemo(
    () => <EmptyState colors={C} onExplore={handleExplore} />,
    [C, handleExplore],
  );

  const footerComponent = useMemo(
    () =>
      hasMore ? (
        <View style={s.footer}>
          <Text style={[s.footerText, { color: C.outline }]}>
            Loading more...
          </Text>
        </View>
      ) : null,
    [hasMore, C.outline],
  );

  if (!isLoaded) return null;

  return (
    <View style={[s.screen, { backgroundColor: C.backgroundColor }]}>
      {favoriteHalls.length === 0 ? (
        emptyComponent
      ) : (
        <Animated.FlatList
          data={displayed}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeader}
          ListFooterComponent={footerComponent}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          getItemLayout={getItemLayout}
          initialNumToRender={6}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
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
  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  // Filter chips
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipLabel: { fontSize: 13 },
  // Card
  card: {
    flexDirection: "row",
    height: ITEM_HEIGHT,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardImgWrap: {
    width: 120,
    height: "100%",
    position: "relative",
  },
  cardImg: {
    width: "100%",
    height: "100%",
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  favBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  distBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  distText: { color: "#FFF", fontSize: 10, fontWeight: "600" },
  cardInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  cardName: { fontSize: 14, fontWeight: "700" },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  addressText: { fontSize: 11, flex: 1 },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeLabel: { fontSize: 9, fontWeight: "600", textTransform: "capitalize" },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  price: { fontSize: 13, fontWeight: "800" },
  unit: { fontSize: 10, fontWeight: "400" },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: { fontSize: 11, fontWeight: "600" },
  bookBtn: {
    marginLeft: "auto",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bookBtnText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  // Empty
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  // Footer
  footer: { paddingVertical: 16, alignItems: "center" },
  footerText: { fontSize: 12, fontWeight: "600" },
});
