import React, { useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import { differenceInMinutes, format } from "date-fns";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { NotificationItem } from "@/app/notification/notification";

type SwipeableRowProps = {
  item: NotificationItem;
  itemSave: (id: string) => Promise<void>;
  onDelete: (id: string | number) => void;
  setSelectReady: React.Dispatch<React.SetStateAction<boolean>>;
  selectReady: boolean;
  selectedList: string[];
  setSelectedList: React.Dispatch<React.SetStateAction<string[]>>;
};
type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color: string;
  uncheckedColor?: string;
};

export function Checkbox({
  checked,
  onChange,
  color,
  uncheckedColor = "#9ca3af",
}: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={{
        width: 22,
        height: 22,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: checked ? color : uncheckedColor,
        backgroundColor: checked ? color : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {checked && <Feather name="check" size={15} color="#fff" />}
    </Pressable>
  );
}

// ── Static styles (created once) ───────────────────────────────────────────
const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  card: { flex: 1, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  inner: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 12,
  },
  lead: { width: 20, alignItems: "center", paddingTop: 6, flexShrink: 0 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  col: { flex: 1, minWidth: 0 },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  body: { fontSize: 13, lineHeight: 18 },
  meta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  time: { fontSize: 11 },
  del: {
    marginVertical: 4,
    marginRight: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: 88,
  },
  delInner: { alignItems: "center", gap: 4 },
  delText: { fontSize: 11, fontWeight: "600" },
});

function relTime(time: string): string {
  const d = new Date(Number(time));
  const m = differenceInMinutes(new Date(), d);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  if (m < 10080) return format(d, "EEEE");
  return format(d, "MMM d");
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  item,
  itemSave,
  onDelete,
  selectReady,
  selectedList,
  setSelectedList,
}) => {
  const { colors: C } = useTheme();
  const isNew = differenceInMinutes(new Date(), new Date(item.time)) < 5;
  const deleting = useRef(false);

  const [expanded, setExpanded] = useState(false);
  const chevronDeg = useSharedValue(0);

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const n = !prev;
      chevronDeg.value = withTiming(n ? 90 : 0, { duration: 250 });
      return n;
    });
  }, []);

  const chStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronDeg.value}deg` }],
  }));

  const onPress = useCallback(() => {
    if (!item.seen) {
      item.seen = true;
      void itemSave(item.id);
    }
    toggle();
  }, [item, itemSave, toggle]);

  const onDelete_ = useCallback(() => {
    if (deleting.current) return;
    deleting.current = true;
    Alert.alert("Delete notification", "", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          deleting.current = false;
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleting.current = false;
          onDelete(item.id);
        },
      },
    ]);
  }, [item.id, onDelete]);

  const toggleSel = useCallback(() => {
    setSelectedList?.((p) => {
      const id = item.id.toString();
      return p.includes(id) ? p.filter((i) => i !== id) : [...p, id];
    });
  }, [item.id, setSelectedList]);

  const rightActions = useCallback(
    () => (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[s.del, { backgroundColor: C.errorColor }]}
        onPress={onDelete_}
      >
        <View style={s.delInner}>
          <Ionicons name="trash-outline" size={20} color={C.white} />
          <AppText style={[s.delText, { color: C.white }]}>Delete</AppText>
        </View>
      </TouchableOpacity>
    ),
    [onDelete_, C],
  );

  const checked = selectedList?.includes(item.id.toString());

  return (
    <Swipeable
      renderRightActions={rightActions}
      overshootRight={false}
      overshootFriction={8}
    >
      <View style={s.row}>
        {selectReady && (
          <Checkbox
            checked={checked}
            onChange={toggleSel}
            color={C.primary}
            uncheckedColor={C.outline}
          />
        )}
        <View
          style={[
            s.card,
            {
              backgroundColor: item.seen ? C.surfaceHigh : C.surface,
              borderColor: isNew ? C.accentPrimaryBorder : C.border,
              shadowColor: C.shadowColor,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={s.inner}
          >
            <View style={s.lead}>
              <View
                style={[
                  s.dot,
                  {
                    backgroundColor: item.seen
                      ? "transparent"
                      : C.accentPrimary,
                  },
                ]}
              />
            </View>
            <View style={s.col}>
              <View style={s.top}>
                <AppText
                  numberOfLines={1}
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: item.seen ? C.outline : C.onSurface,
                    flexShrink: 1,
                  }}
                >
                  {item.message?.title}
                </AppText>
                <Animated.View style={chStyle}>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={C.outline}
                  />
                </Animated.View>
              </View>
              <AppText
                numberOfLines={expanded ? 0 : 1}
                style={[
                  s.body,
                  { color: item.seen ? C.outline : C.onSurfaceVariant },
                ]}
              >
                {item.message?.body}
              </AppText>
              <View style={s.meta}>
                {isNew && (
                  <View style={[s.newBadge, { backgroundColor: C.green }]}>
                    <AppText style={[s.newText, { color: C.white }]}>
                      NEW
                    </AppText>
                  </View>
                )}
                <View style={s.timeRow}>
                  <Ionicons name="time-outline" size={11} color={C.outline} />
                  <AppText style={[s.time, { color: C.outline }]}>
                    {relTime(item.time)}
                  </AppText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );
};

export default SwipeableRow;
