import type { HallCategoryType } from "@/types/hall_info_type";
import AppText from "@/components/ui/app_text";
import { useTheme } from "@/context/theme_context";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  FontAwesome,
  FontAwesome5,
} from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "@/utils/toast";
import MapView, { Marker } from "react-native-maps";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const UB_CENTER = { latitude: 47.918873, latitudeDelta: 0.05, longitude: 106.917701, longitudeDelta: 0.05 };

// ── Persistence ────────────────────────────────────────────────────────────
const SAVED_HALL_KEY = "saved_hall";
export type HallFormValues = {
  mainType: "sport_hall" | "esport_hall";
  subCategories: HallCategoryType[];
  hall_name: string;
  hall_address: string;
  hall_phone_number: string;
  start_time: string;
  end_time: string;
  latitude: string;
  longitude: string;
  imageURIs: string[];
  features: {
    changing_room: boolean;
    shower: boolean;
    lighting: boolean;
    spectator_seats: boolean;
    parking: boolean;
    free_wifi: boolean;
    scoreboard: boolean;
    speaker: boolean;
    microphone: boolean;
  };
  prices: { label: string; durationMinutes: number; price: string }[];
  esportAvailability: string[];
  esportPrices: Record<string, string>;
};

export const emptyHallValues = (): HallFormValues => ({
  mainType: "sport_hall",
  subCategories: [],
  hall_name: "",
  hall_address: "",
  hall_phone_number: "",
  start_time: "09:00",
  end_time: "22:00",
  latitude: "",
  longitude: "",
  imageURIs: [],
  features: {
    changing_room: false,
    shower: false,
    lighting: false,
    spectator_seats: false,
    parking: false,
    free_wifi: false,
    scoreboard: false,
    speaker: false,
    microphone: false,
  },
  prices: [
    { label: "1 hour", durationMinutes: 60, price: "" },
    { label: "2 hours", durationMinutes: 120, price: "" },
    { label: "Whole day", durationMinutes: 1440, price: "" },
  ],
  esportAvailability: [],
  esportPrices: {},
});

export async function loadSavedHall(): Promise<HallFormValues | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_HALL_KEY);
    return raw ? (JSON.parse(raw) as HallFormValues) : null;
  } catch {
    return null;
  }
}

export async function saveHallToStorage(values: HallFormValues): Promise<void> {
  await AsyncStorage.setItem(SAVED_HALL_KEY, JSON.stringify(values));
}

// ── Category + feature definitions ─────────────────────────────────────────
const SPORT_CATEGORIES: { id: HallCategoryType; label: string; icon: string }[] =
  [
    { id: "basket_ball", label: "Basketball", icon: "basketball" },
    { id: "volley_ball", label: "Volleyball", icon: "volleyball" },
    { id: "foot_ball", label: "Football", icon: "football" },
    { id: "tennis", label: "Tennis", icon: "tennis" },
    { id: "bowling", label: "Bowling", icon: "bowling" },
    { id: "golf", label: "Golf", icon: "golf" },
  ];

const ESPORT_CATEGORIES: { id: HallCategoryType; label: string; icon: string }[] =
  [
    { id: "computer", label: "PC Room", icon: "desktop-classic" },
    { id: "billiards", label: "Billiards", icon: "billiards" },
    { id: "playstation", label: "PlayStation", icon: "gamepad-variant" },
  ];

const ESPORT_TIERS: { id: string; label: string; icon: string }[] = [
  { id: "hall", label: "Hall", icon: "grid-outline" },
  { id: "vip", label: "VIP", icon: "star-outline" },
  { id: "stage", label: "Stage", icon: "easel-outline" },
];

type FeatureKey = keyof HallFormValues["features"];
const FEATURE_ITEMS: {
  key: FeatureKey;
  label: string;
  family: "ion" | "mci" | "fa" | "fa5";
  icon: string;
}[] = [
  { key: "changing_room", label: "Changing room", family: "ion", icon: "shirt-outline" },
  { key: "shower", label: "Shower", family: "fa", icon: "shower" },
  { key: "lighting", label: "Lighting", family: "mci", icon: "ceiling-light" },
  { key: "spectator_seats", label: "Spectator seats", family: "mci", icon: "scoreboard-outline" },
  { key: "parking", label: "Parking", family: "fa5", icon: "parking" },
  { key: "free_wifi", label: "Free Wi-Fi", family: "ion", icon: "wifi-outline" },
  { key: "scoreboard", label: "Scoreboard", family: "mci", icon: "scoreboard-outline" },
  { key: "speaker", label: "Speaker", family: "fa", icon: "volume-up" },
  { key: "microphone", label: "Microphone", family: "fa", icon: "microphone" },
];

const FeatureIcon = ({ item, active }: { item: (typeof FEATURE_ITEMS)[number]; active: boolean }) => {
  const color = active ? "#1877F2" : "#767676";
  const size = 20;
  switch (item.family) {
    case "mci":
      return <MaterialCommunityIcons name={item.icon as any} size={size} color={color} />;
    case "fa":
      return <FontAwesome name={item.icon as any} size={size} color={color} />;
    case "fa5":
      return <FontAwesome5 name={item.icon as any} size={size} color={color} />;
    default:
      return <Ionicons name={item.icon as any} size={size} color={color} />;
  }
};

// ── Styles ─────────────────────────────────────────────────────────────────
const createStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.backgroundColor },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: Colors.surfaceHigh,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTextWrap: { flex: 1, marginLeft: 14 },
    headerTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: Colors.onSurface,
      letterSpacing: -0.4,
    },
    headerSubtitle: { fontSize: 13, color: Colors.outline, marginTop: 2 },
    scrollContent: { padding: 20, paddingBottom: 120 },
    sectionCard: {
      backgroundColor: Colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: 18,
      marginBottom: 16,
    },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    sectionBadge: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: Colors.accentPrimaryGlow,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.onSurface },
    sectionHint: { fontSize: 12, color: Colors.outline, marginTop: 2 },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 14,
      borderWidth: 1,
      paddingLeft: 14,
      height: 52,
      marginBottom: 14,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: 52, fontSize: 15, paddingHorizontal: 0, color: Colors.onSurface },
    row: { flexDirection: "row", gap: 12 },
    col: { flex: 1 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      height: 42,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.surfaceHigh,
    },
    chipActive: {
      backgroundColor: Colors.accentPrimaryGlow,
      borderColor: Colors.accentPrimaryBorder,
    },
    chipText: { fontSize: 13, fontWeight: "600", color: Colors.onSurfaceVariant },
    chipTextActive: { color: Colors.accentPrimary },
    mainTypeRow: { flexDirection: "row", gap: 12 },
    mainTypeCard: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.surfaceHigh,
      padding: 16,
      alignItems: "center",
      gap: 8,
    },
    mainTypeActive: {
      borderColor: Colors.accentPrimaryBorder,
      backgroundColor: Colors.accentPrimaryGlow,
    },
    mainTypeLabel: { fontSize: 13, fontWeight: "600", color: Colors.onSurface },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
    },
    featureLabelWrap: { flexDirection: "row", alignItems: "center", flex: 1 },
    featureLabel: { fontSize: 15, color: Colors.onSurface, marginLeft: 10 },
    priceHeader: { flexDirection: "row", marginBottom: 8 },
    priceColHead: {
      fontSize: 11,
      fontWeight: "700",
      color: Colors.outline,
      textTransform: "uppercase",
    },
    priceRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
    priceName: { flex: 1 },
    priceInputWrap: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 12,
      backgroundColor: Colors.surfaceHigh,
      paddingHorizontal: 12,
      height: 46,
      width: 110,
    },
    priceInput: { flex: 1, fontSize: 15, color: Colors.onSurface, textAlign: "right" },
    currency: { fontSize: 13, color: Colors.outline, marginLeft: 6 },
    cta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 54,
      borderRadius: 16,
      backgroundColor: Colors.accentPrimary,
    },
    ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
    imagePicker: {
      height: 120,
      borderRadius: 16,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: Colors.accentPrimaryBorder,
      backgroundColor: Colors.accentPrimaryGlow,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    imagePickerText: { fontSize: 14, fontWeight: "600", color: Colors.accentPrimary },
    imageThumb: {
      width: 84,
      height: 84,
      borderRadius: 14,
      backgroundColor: Colors.surfaceHigh,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
  });

// ── Form field ─────────────────────────────────────────────────────────────
const Field = React.memo(
  ({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    colors,
    styles,
    textArea,
  }: {
    icon: string;
    placeholder: string;
    value: string;
    onChangeText: (t: string) => void;
    keyboardType?: "default" | "numeric" | "phone-pad";
    colors: any;
    styles: any;
    textArea?: boolean;
  }) => {
    const [focused, setFocused] = useState(false);
    return (
      <View
        style={[
          styles.inputWrapper,
          textArea && { height: 90, alignItems: "flex-start", paddingTop: 12 },
          {
            backgroundColor: colors.surfaceHigh,
            borderColor: focused ? colors.accentPrimary : colors.border,
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={focused ? colors.accentPrimary : colors.outline}
          style={styles.inputIcon}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={textArea}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, textArea && { height: 70, paddingTop: 4 }]}
        />
      </View>
    );
  },
);

// ── Main form ──────────────────────────────────────────────────────────────
type HallFormProps = {
  initialData?: Partial<HallFormValues>;
  mode: "create" | "edit";
};

export default function HallForm({ initialData, mode }: HallFormProps) {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const [mainType, setMainType] = useState<"sport_hall" | "esport_hall">(
    initialData?.mainType ?? "sport_hall",
  );
  const [subCategories, setSubCategories] = useState<HallCategoryType[]>(
    initialData?.subCategories ?? [],
  );
  const [hallName, setHallName] = useState(initialData?.hall_name ?? "");
  const [hallAddress, setHallAddress] = useState(initialData?.hall_address ?? "");
  const [phone, setPhone] = useState(initialData?.hall_phone_number ?? "");
  const [startTime, setStartTime] = useState(initialData?.start_time ?? "09:00");
  const [endTime, setEndTime] = useState(initialData?.end_time ?? "22:00");
  const [latitude, setLatitude] = useState(initialData?.latitude ?? "");
  const [longitude, setLongitude] = useState(initialData?.longitude ?? "");
  const [locationQuery, setLocationQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const mapRef = useRef<MapView>(null);

  type PlaceSuggestion = {
    place_id: string;
    description: string;
  };

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    setSearching(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&key=${GOOGLE_MAPS_API_KEY}&components=country:MN`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "OK") {
        const list = (data.predictions ?? []).map((p: any) => ({
          place_id: p.place_id,
          description: p.description,
        }));
        setSuggestions(list);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleLocationSearch = useCallback(async () => {
    const q = locationQuery.trim();
    if (!q) return;
    setSearching(true);
    setShowSuggestions(false);
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        mapRef.current?.animateToRegion(
          { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          300,
        );
      } else {
        showToast({ title: "Location not found", description: "Try a different address", alertType: "warn" });
      }
    } catch {
      showToast({ title: "Search failed", description: "Could not reach Google Maps API", alertType: "error" });
    } finally {
      setSearching(false);
    }
  }, [locationQuery]);

  const selectSuggestion = useCallback(async (placeId: string, description: string) => {
    setLocationQuery(description);
    setShowSuggestions(false);
    setSearching(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "OK" && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        mapRef.current?.animateToRegion(
          { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          300,
        );
      }
    } catch {
      /* ignore */
    } finally {
      setSearching(false);
    }
  }, []);
  const [features, setFeatures] = useState<HallFormValues["features"]>(
    initialData?.features ?? emptyHallValues().features,
  );
  const [prices, setPrices] = useState(
    initialData?.prices ?? emptyHallValues().prices,
  );
  const [esportAvailability, setEsportAvailability] = useState<string[]>(
    initialData?.esportAvailability ?? emptyHallValues().esportAvailability,
  );
  const [esportPrices, setEsportPrices] = useState<Record<string, string>>(
    initialData?.esportPrices ?? emptyHallValues().esportPrices,
  );
  const [images, setImages] = useState<string[]>(initialData?.imageURIs ?? []);
  const [saving, setSaving] = useState(false);

  const categories = mainType === "sport_hall" ? SPORT_CATEGORIES : ESPORT_CATEGORIES;

  const toggleCategory = useCallback((id: HallCategoryType) => {
    setSubCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }, []);

  const toggleFeature = useCallback((key: FeatureKey) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleMainType = useCallback((type: "sport_hall" | "esport_hall") => {
    setMainType(type);
    setSubCategories([]);
  }, []);

  const addImage = useCallback(() => {
    setImages((prev) => {
      if (prev.length >= 5) return prev;
      const uri = `https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80&v=${prev.length + 1}`;
      return [...prev, uri];
    });
  }, []);

  const updatePrice = useCallback(
    (idx: number, field: "durationMinutes" | "price", value: string) => {
      setPrices((prev) =>
        prev.map((p, i) =>
          i === idx
            ? {
                ...p,
                [field]: field === "durationMinutes" ? Number(value) || 0 : value,
              }
            : p,
        ),
      );
    },
    [],
  );

  const toggleEsportTier = useCallback((tier: string) => {
    setEsportAvailability((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier],
    );
  }, []);

  const updateEsportPrice = useCallback((tier: string, v: string) => {
    setEsportPrices((prev) => ({ ...prev, [tier]: v }));
  }, []);

  const canSubmit = useCallback(
    () => hallName.trim().length > 0 && subCategories.length > 0 && phone.trim().length > 0,
    [hallName, subCategories, phone],
  );

  const handleAddImageFromPicker = useCallback(() => {
    showToast({
      title: "Image picker",
      description: "Wire react-native-image-picker here",
      alertType: "info",
    });
  }, []);

  const value: HallFormValues = {
    mainType,
    subCategories,
    hall_name: hallName,
    hall_address: hallAddress,
    hall_phone_number: phone,
    start_time: startTime,
    end_time: endTime,
    latitude,
    longitude,
    imageURIs: images,
    features,
    prices,
    esportAvailability,
    esportPrices,
  };

  const handleSave = useCallback(async () => {
    if (!canSubmit()) {
      showToast({
        title: "Missing info",
        description: "Name, phone and at least one category are required",
        alertType: "warn",
      });
      return;
    }
    setSaving(true);
    try {
      await saveHallToStorage(value);
      console.log(mode === "create" ? "CREATE HALL" : "EDIT HALL", value);
      showToast({
        title: mode === "create" ? "Hall Registered" : "Hall Updated",
        description: `${value.hall_name} was ${mode === "create" ? "registered" : "saved"}`,
        alertType: "success",
      });
      setTimeout(() => router.back(), 400);
    } catch (err) {
      showToast({
        title: "Save failed",
        description: "Could not save the hall. Please try again.",
        alertType: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [mode, value, canSubmit]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={18} color={Colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <AppText style={styles.headerTitle}>
              {mode === "create" ? "Register Zaal" : "Edit Zaal"}
            </AppText>
            <AppText style={styles.headerSubtitle}>
              {mode === "create"
                ? "Add a new sport hall to your business"
                : "Keep your hall details up to date"}
            </AppText>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hall type ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Ionicons name="home-outline" size={18} color={Colors.accentPrimary} />
              </View>
              <View>
                <AppText style={styles.sectionTitle}>Hall type</AppText>
                <AppText style={styles.sectionHint}>Choose what kind of hall this is</AppText>
              </View>
            </View>

            <View style={styles.mainTypeRow}>
              <TouchableOpacity
                style={[styles.mainTypeCard, mainType === "sport_hall" && styles.mainTypeActive]}
                onPress={() => toggleMainType("sport_hall")}
              >
                <Ionicons
                  name="basketball-outline"
                  size={26}
                  color={mainType === "sport_hall" ? Colors.accentPrimary : Colors.outline}
                />
                <AppText style={styles.mainTypeLabel}>Sport hall</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mainTypeCard, mainType === "esport_hall" && styles.mainTypeActive]}
                onPress={() => toggleMainType("esport_hall")}
              >
                <Ionicons
                  name="game-controller-outline"
                  size={26}
                  color={mainType === "esport_hall" ? Colors.accentPrimary : Colors.outline}
                />
                <AppText style={styles.mainTypeLabel}>Esport hall</AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Categories ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Ionicons name="grid-outline" size={18} color={Colors.accentPrimary} />
              </View>
              <View>
                <AppText style={styles.sectionTitle}>Categories</AppText>
                <AppText style={styles.sectionHint}>Pick the sports available</AppText>
              </View>
            </View>
            <View style={styles.chipRow}>
              {categories.map((cat) => {
                const active = subCategories.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleCategory(cat.id)}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={18}
                      color={active ? Colors.accentPrimary : Colors.outline}
                    />
                    <AppText style={[styles.chipText, active && styles.chipTextActive]}>
                      {cat.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Basic info ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Ionicons name="information-circle-outline" size={18} color={Colors.accentPrimary} />
              </View>
              <View>
                <AppText style={styles.sectionTitle}>Basic information</AppText>
                <AppText style={styles.sectionHint}>Name, address and contact</AppText>
              </View>
            </View>

            <Field
              icon="business-outline"
              placeholder="Hall name"
              value={hallName}
              onChangeText={setHallName}
              colors={Colors}
              styles={styles}
            />
            <Field
              icon="location-outline"
              placeholder="Address"
              value={hallAddress}
              onChangeText={setHallAddress}
              colors={Colors}
              styles={styles}
              textArea
            />
            <Field
              icon="call-outline"
              placeholder="Phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              colors={Colors}
              styles={styles}
            />
            <View style={styles.row}>
              <View style={styles.col}>
                <Field
                  icon="time-outline"
                  placeholder="Open"
                  value={startTime}
                  onChangeText={setStartTime}
                  colors={Colors}
                  styles={styles}
                />
              </View>
              <View style={styles.col}>
                <Field
                  icon="time-outline"
                  placeholder="Close"
                  value={endTime}
                  onChangeText={setEndTime}
                  colors={Colors}
                  styles={styles}
                />
              </View>
            </View>
          </View>

          {/* ── Photos ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Ionicons name="images-outline" size={18} color={Colors.accentPrimary} />
              </View>
              <View>
                <AppText style={styles.sectionTitle}>Photos</AppText>
                <AppText style={styles.sectionHint}>Add up to 5 photos</AppText>
              </View>
            </View>

            {images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                {images.map((uri, i) => (
                  <View key={i} style={styles.imageThumb}>
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 14,
                        backgroundColor: Colors.surfaceHigh,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="image-outline" size={28} color={Colors.outline} />
                    </View>
                    <TouchableOpacity
                      onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name="x" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {images.length < 5 && (
              <TouchableOpacity style={styles.imagePicker} onPress={addImage}>
                <Ionicons name="add-circle-outline" size={32} color={Colors.accentPrimary} />
                <AppText style={styles.imagePickerText}>Add photo</AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Features ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Ionicons name="sparkles-outline" size={18} color={Colors.accentPrimary} />
              </View>
              <View>
                <AppText style={styles.sectionTitle}>Features & amenities</AppText>
                <AppText style={styles.sectionHint}>Toggle what your hall offers</AppText>
              </View>
            </View>

            {FEATURE_ITEMS.map((feat) => (
              <View key={feat.key} style={styles.featureRow}>
                <View style={styles.featureLabelWrap}>
                  <FeatureIcon item={feat} active={features[feat.key]} />
                  <AppText style={styles.featureLabel}>{feat.label}</AppText>
                </View>
                <Switch
                  value={features[feat.key]}
                  onValueChange={() => toggleFeature(feat.key)}
                  trackColor={{ false: Colors.border, true: Colors.accentPrimary }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>

          {/* ── Pricing ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Ionicons name="pricetag-outline" size={18} color={Colors.accentPrimary} />
              </View>
              <View>
                <AppText style={styles.sectionTitle}>Pricing</AppText>
                <AppText style={styles.sectionHint}>
                  {mainType === "esport_hall"
                    ? "Select available tiers and set each price (₮)"
                    : "Set prices per duration (₮)"}
                </AppText>
              </View>
            </View>

            {mainType === "esport_hall" ? (
              <>
                <View style={styles.priceHeader}>
                  <View style={styles.priceName}>
                    <AppText style={styles.priceColHead}>Available Tier</AppText>
                  </View>
                  <View style={{ width: 110, paddingLeft: 12 }}>
                    <AppText style={styles.priceColHead}>Price</AppText>
                  </View>
                </View>

                {ESPORT_TIERS.map((tier) => {
                  const active = esportAvailability.includes(tier.id);
                  return (
                    <View key={tier.id} style={styles.priceRow}>
                      <TouchableOpacity
                        style={[styles.chip, active && styles.chipActive, { flex: 1 }]}
                        onPress={() => toggleEsportTier(tier.id)}
                      >
                        <Ionicons
                          name={tier.icon as any}
                          size={18}
                          color={active ? Colors.accentPrimary : Colors.outline}
                        />
                        <AppText style={[styles.chipText, active && styles.chipTextActive]}>
                          {tier.label}
                        </AppText>
                        <Ionicons
                          name={active ? "checkbox" : "square-outline"}
                          size={18}
                          color={active ? Colors.accentPrimary : Colors.outline}
                          style={{ marginLeft: "auto" }}
                        />
                      </TouchableOpacity>
                      <View style={[styles.priceInputWrap, { opacity: active ? 1 : 0.4 }]}>
                        <TextInput
                          placeholder="0"
                          placeholderTextColor={Colors.outline}
                          value={esportPrices[tier.id] ?? ""}
                          keyboardType="numeric"
                          editable={active}
                          onChangeText={(t) => updateEsportPrice(tier.id, t)}
                          style={styles.priceInput}
                        />
                        <AppText style={styles.currency}>₮</AppText>
                      </View>
                    </View>
                  );
                })}
              </>
            ) : (
              <>
                <View style={styles.priceHeader}>
                  <View style={styles.priceName} />
                  <View style={{ width: 110, paddingLeft: 12 }}>
                    <AppText style={styles.priceColHead}>Amount</AppText>
                  </View>
                </View>

                {prices.map((p, idx) => (
                  <View key={idx} style={styles.priceRow}>
                    <View style={styles.priceName}>
                      <AppText style={{ fontSize: 15, color: Colors.onSurface }}>{p.label}</AppText>
                    </View>
                    <View style={styles.priceInputWrap}>
                      <TextInput
                        placeholder="0"
                        placeholderTextColor={Colors.outline}
                        value={p.price}
                        keyboardType="numeric"
                        onChangeText={(t) => updatePrice(idx, "price", t)}
                        style={styles.priceInput}
                      />
                      <AppText style={styles.currency}>₮</AppText>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* ── Location ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Ionicons name="navigate-outline" size={18} color={Colors.accentPrimary} />
              </View>
              <View>
                <AppText style={styles.sectionTitle}>Location</AppText>
                <AppText style={styles.sectionHint}>Drag the marker or search an address</AppText>
              </View>
            </View>

            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: Colors.surfaceHigh, borderColor: Colors.border },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={18}
                color={Colors.outline}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Search address..."
                placeholderTextColor={Colors.outline}
                value={locationQuery}
                onChangeText={(t) => {
                  setLocationQuery(t);
                  if (searchTimeout.current) clearTimeout(searchTimeout.current);
                  if (t.trim().length > 0) {
                    searchTimeout.current = setTimeout(() => fetchSuggestions(t), 400);
                  } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onSubmitEditing={handleLocationSearch}
                returnKeyType="search"
                style={styles.input}
              />
              {searching ? (
                <ActivityIndicator size="small" color={Colors.accentPrimary} style={{ marginRight: 14 }} />
              ) : (
                <TouchableOpacity
                  onPress={handleLocationSearch}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ marginRight: 14 }}
                >
                  <Ionicons name="arrow-forward-circle" size={22} color={Colors.accentPrimary} />
                </TouchableOpacity>
              )}
            </View>

            {showSuggestions && suggestions.length > 0 && (
              <View
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  backgroundColor: Colors.surfaceHigh,
                  marginBottom: 12,
                  overflow: "hidden",
                }}
              >
                {suggestions.map((sugg, i) => (
                  <TouchableOpacity
                    key={sugg.place_id}
                    onPress={() => selectSuggestion(sugg.place_id, sugg.description)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderBottomWidth: i < suggestions.length - 1 ? 1 : 0,
                      borderBottomColor: Colors.border,
                    }}
                  >
                    <Ionicons name="location-outline" size={16} color={Colors.outline} style={{ marginRight: 10 }} />
                    <AppText style={{ fontSize: 14, color: Colors.onSurface, flex: 1 }}>
                      {sugg.description}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
              <MapView
                ref={mapRef}
                style={{ height: 220, width: "100%" }}
                initialRegion={UB_CENTER}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
                onPress={(e) => {
                  setLatitude(e.nativeEvent.coordinate.latitude.toString());
                  setLongitude(e.nativeEvent.coordinate.longitude.toString());
                }}
              >
                <Marker
                  coordinate={
                    latitude && longitude
                      ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
                      : UB_CENTER
                  }
                  draggable
                  onDragEnd={(e) => {
                    setLatitude(e.nativeEvent.coordinate.latitude.toString());
                    setLongitude(e.nativeEvent.coordinate.longitude.toString());
                  }}
                />
              </MapView>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.outline} />
              <AppText style={{ fontSize: 13, color: Colors.outline }}>
                Tap the map or drag the marker to set the location
              </AppText>
            </View>
          </View>

          {/* ── Actions ── */}
          <TouchableOpacity
            style={[styles.cta, saving && { opacity: 0.6 }]}
            activeOpacity={0.85}
            disabled={saving}
            onPress={handleSave}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <AppText style={styles.ctaText}>
              {saving ? "Saving..." : mode === "create" ? "Register Hall" : "Save Changes"}
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}