import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/src/context/themeContext";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

interface Props {
  listings: any[];
  category: string;
  refresh: number;
}

const ITEMS_PER_PAGE = 15;
const INCREMENT = 7;
const ITEM_HEIGHT = 105;

const ListingItem = memo(
  ({ item, onPress }: { item: any; onPress: (id: string) => void }) => {
    const { colors: C } = useTheme();
    const price =
      item.hall_details?.hall_price?.oneHour ??
      item.hall_details?.hall_price?.pcHall?.oneHour;
    const img = item.hall_details?.hall_imageURLs?.[0];

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress(item.sportHallID ?? item.reference_hallId)}
        style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}
      >
        <View style={[s.cardAccent, { backgroundColor: C.accentPrimary }]} />
        {img ? (
          <View style={[s.imgWrap, { borderColor: C.borderSubtle }]}>
            <Image source={{ uri: img }} style={s.img} />
          </View>
        ) : (
          <View
            style={[s.imgPlaceholder, { backgroundColor: C.accentPrimaryGlow }]}
          >
            <Ionicons
              name="business-outline"
              size={28}
              color={C.accentPrimary}
            />
          </View>
        )}
        <View style={s.info}>
          <Text style={[s.name, { color: C.onSurface }]} numberOfLines={1}>
            {item.hall_details?.hall_name ?? "Sports Hall"}
          </Text>
          <View style={s.row}>
            <Ionicons name="location-outline" size={11} color={C.outline} />
            <Text style={[s.sub, { color: C.outline }]} numberOfLines={1}>
              {item.hall_location?.smart_location ??
                item.hall_details?.hall_address ??
                "Ulaanbaatar"}
            </Text>
          </View>
          <View style={s.bottomRow}>
            <Text style={[s.price, { color: C.accentPrimary }]}>
              ₮{(price ?? 0).toLocaleString()}
              <Text style={[s.unit, { color: C.outline }]}> / hr</Text>
            </Text>
            <View style={[s.badge, { backgroundColor: C.accentPrimaryGlow }]}>
              <Ionicons name="star" size={10} color="#FFD700" />
              <Text style={[s.badgeText, { color: C.accentPrimary }]}>4.8</Text>
            </View>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={C.outline}
          style={s.chev}
        />
      </TouchableOpacity>
    );
  },
);

const categories = [
  { key: "nearby", label: "Nearby" },
  { key: "top", label: "Top Rated" },
  { key: "recommended", label: "Recommended" },
];

const ListingComponent = ({ listings: items }: Props) => {
  const { colors: C } = useTheme();
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selected, setSelected] = useState<string | null>(null);

  const displayedItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [items]);

  const onPress = useCallback(
    (id: string) => router.push(`/listing/${id}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => <ListingItem item={item} onPress={onPress} />,
    [onPress],
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

  return (
    <View style={s.container} pointerEvents="box-none">
      <View style={s.filterRow}>
        {categories.map((cat) => {
          const active = selected === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              activeOpacity={0.7}
              onPress={() =>
                setSelected((prev) => (prev === cat.key ? null : cat.key))
              }
              style={[
                s.filterBtn,
                {
                  backgroundColor: active ? C.accentPrimary : C.surface,
                  borderColor: active ? C.accentPrimary : C.border,
                },
              ]}
            >
              <Text
                style={[
                  s.filterText,
                  { color: active ? "#FFF" : C.onSurface },
                  active && { fontWeight: "700" },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <BottomSheetFlatList
        data={displayedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={[s.emptyText, { color: C.outline }]}>
              No halls found
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <View style={s.footer}>
              <Text style={[s.footerText, { color: C.outline }]}>
                Loading more...
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        getItemLayout={getItemLayout}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={3}
      />
    </View>
  );
};

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
  emptyText: { fontSize: 14 },
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
