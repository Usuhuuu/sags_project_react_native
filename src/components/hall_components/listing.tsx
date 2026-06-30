import { useState, useCallback, useMemo, memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/theme_context";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

interface Props {
  listings: any[];
  category: string;
  isExpanded: boolean;
}

const ITEMS_PER_PAGE = 8;
const INCREMENT = 3;
const ITEM_HEIGHT = 105;

const FILTER_CATEGORIES = [
  { key: "nearby", label: "Nearby" },
  { key: "top", label: "Top Rated" },
  { key: "recommended", label: "Recommended" },
];

// ─── Image Placeholder ─────────────────────────────────────────────────────────

const ImgPlaceholder = memo(({ color }: { color: string }) => (
  <View style={[s.imgPlaceholder, { backgroundColor: color + "22" }]}>
    <Ionicons name="business-outline" size={28} color={color} />
  </View>
));

// ─── Listing Item ──────────────────────────────────────────────────────────────

const ListingItem = memo(
  ({
    item,
    onPress,
    colors,
  }: {
    item: any;
    onPress: (id: string) => void;
    colors: ReturnType<typeof useTheme>["colors"];
  }) => {
    const price =
      item.hall_details?.hall_price?.oneHour ??
      item.hall_details?.hall_price?.pcHall?.oneHour;
    const img = item.hall_details?.hall_imageURLs?.[0];

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress(item.sportHallID ?? item.reference_hallId)}
        style={[
          s.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View
          style={[s.cardAccent, { backgroundColor: colors.accentPrimary }]}
        />
        {img ? (
          <View style={[s.imgWrap, { borderColor: colors.borderSubtle }]}>
            <Image source={{ uri: img }} style={s.img} />
          </View>
        ) : (
          <ImgPlaceholder color={colors.accentPrimary} />
        )}
        <View style={s.info}>
          <Text style={[s.name, { color: colors.onSurface }]} numberOfLines={1}>
            {item.hall_details?.hall_name ?? "Sports Hall"}
          </Text>
          <View style={s.row}>
            <Ionicons
              name="location-outline"
              size={11}
              color={colors.outline}
            />
            <Text style={[s.sub, { color: colors.outline }]} numberOfLines={1}>
              {item.hall_location?.smart_location ??
                item.hall_details?.hall_address ??
                "Ulaanbaatar"}
            </Text>
          </View>
          <View style={s.bottomRow}>
            <Text style={[s.price, { color: colors.accentPrimary }]}>
              ₮{(price ?? 0).toLocaleString()}
              <Text style={[s.unit, { color: colors.outline }]}> / hr</Text>
            </Text>
            <View
              style={[
                s.badge,
                { backgroundColor: colors.accentPrimary + "22" },
              ]}
            >
              <Ionicons name="star" size={10} color="#FFD700" />
              <Text style={[s.badgeText, { color: colors.accentPrimary }]}>
                4.8
              </Text>
            </View>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.outline}
          style={s.chev}
        />
      </TouchableOpacity>
    );
  },
);

// ─── Filter Button ─────────────────────────────────────────────────────────────

const FilterBtn = memo(
  ({
    cat,
    active,
    onPress,
    colors,
  }: {
    cat: (typeof FILTER_CATEGORIES)[number];
    active: boolean;
    onPress: () => void;
    colors: any;
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        s.filterBtn,
        {
          backgroundColor: active ? colors.accentPrimary : colors.surface,
          borderColor: active ? colors.accentPrimary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          s.filterText,
          { color: active ? "#FFF" : colors.onSurface },
          active && { fontWeight: "700" },
        ]}
      >
        {cat.label}
      </Text>
    </TouchableOpacity>
  ),
);

// ─── Empty State ───────────────────────────────────────────────────────────────

const EmptyList = memo(({ color }: { color: string }) => (
  <View style={s.empty}>
    <Ionicons name="search-outline" size={40} color={color} />
    <Text style={[s.emptyText, { color }]}>No halls found</Text>
  </View>
));

// ─── Main Component ────────────────────────────────────────────────────────────

const ListingComponent = ({ listings: items, isExpanded }: Props) => {
  const { colors: C } = useTheme();
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selected, setSelected] = useState<string | null>(null);

  const displayedItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  const onPress = useCallback(
    (id: string) => router.push(`/book/${id}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <ListingItem item={item} onPress={onPress} colors={C} />
    ),
    [onPress, C],
  );

  const keyExtractor = useCallback(
    (item: any) =>
      String(item.sportHallID ?? item.reference_hallId ?? item._id),
    [],
  );
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );
  const loadMore = useCallback(
    () => setVisibleCount((p) => Math.min(p + INCREMENT, items.length)),
    [items.length],
  );
  const hasMore = visibleCount < items.length;

  const handleFilterPress = useCallback(
    (key: string) => setSelected((prev) => (prev === key ? null : key)),
    [],
  );

  const emptyComponent = useMemo(
    () => <EmptyList color={C.outline} />,
    [C.outline],
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
  const data = useMemo(
    () => (isExpanded ? displayedItems : []),
    [isExpanded, displayedItems],
  );

  return (
    <View style={s.container} pointerEvents="box-none">
      <View style={s.filterRow}>
        {FILTER_CATEGORIES.map((cat) => (
          <FilterBtn
            key={cat.key}
            cat={cat}
            active={selected === cat.key}
            onPress={() => handleFilterPress(cat.key)}
            colors={C}
          />
        ))}
      </View>
      <BottomSheetFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={footerComponent}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        getItemLayout={getItemLayout}
        initialNumToRender={4}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    position: "relative",
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  imgWrap: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
  },
  img: { width: "100%", height: "100%" },
  imgPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, paddingLeft: 12, gap: 4 },
  name: { fontSize: 15, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  sub: { fontSize: 12, flex: 1 },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  price: { fontSize: 14, fontWeight: "800" },
  unit: { fontSize: 11, fontWeight: "400" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: "700" },
  chev: { marginLeft: 4 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: { fontSize: 14, marginTop: 8 },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  filterBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: { fontSize: 12, fontWeight: "600" },
  footer: { paddingVertical: 16, alignItems: "center" },
  footerText: { fontSize: 12, fontWeight: "600" },
});

export default ListingComponent;
