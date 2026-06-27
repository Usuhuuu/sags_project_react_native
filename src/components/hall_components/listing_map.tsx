import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import * as Location from "expo-location";
import {
  EsportHallDataType,
  EsportHallPrices,
  HallCategoryType,
  SportHallDataType,
  SportHallPrice,
} from "@/types/hall_info_type";
import { useIsFocused, useRouter } from "expo-router";
import MapViewClustering from "react-native-map-clustering";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as SecureStorage from "expo-secure-store";
import { useTheme } from "@/context/theme_context";
import { ThemeColors } from "@/theme/colors";
import OwnActivaterIndicator from "../ui/loader_indicator";

const INITIAL_REGION = {
  latitude: 47.918873,
  longitude: 106.917701,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

type MarkerStyles = ReturnType<typeof createMarkerStyle>;

interface HallMarkerProps {
  item: SportHallDataType | EsportHallDataType;
  ms: MarkerStyles;
  colors: ThemeColors;
  onNavigate: (id: string, type: string) => void;
  onFocus: (lat: number, lng: number) => void;
}

const HallMarker = memo(
  ({ item, ms, colors, onNavigate, onFocus }: HallMarkerProps) => {
    const subtitle =
      item?.hall_locations?.smart_location ?? item.hall_details.hall_address;
    const workTime = `${item.hall_details.hall_work_time.start_time} – ${item.hall_details.hall_work_time.end_time}`;
    const pricePerHour =
      (item.hall_details?.hall_price as SportHallPrice)?.oneHour ??
      (item?.hall_details.hall_price as EsportHallPrices)?.pcHall?.oneHour;

    // Stable handlers – recreated only when item location or callbacks change.
    const handleMarkerPress = useCallback(() => {
      onFocus(
        parseFloat(item.hall_locations?.latitude),
        parseFloat(item.hall_locations?.longitude),
      );
    }, [item.hall_locations, onFocus]);

    const handleCalloutPress = useCallback(() => {
      const type = item.hall_types.main.split("_")[0];
      onNavigate(item.sportHallID, type);
    }, [item.sportHallID, onNavigate]);

    return (
      <Marker
        coordinate={{
          latitude: parseFloat(item.hall_locations?.latitude),
          longitude: parseFloat(item.hall_locations?.longitude),
        }}
        tracksViewChanges={false}
        tracksInfoWindowChanges={false}
        onPress={handleMarkerPress}
      >
        <View style={ms.pin}>
          <View style={ms.pinDot} />
        </View>

        <Callout tooltip onPress={handleCalloutPress}>
          <View style={ms.calloutWrapper}>
            <View style={ms.card}>
              <Text style={ms.hallName} numberOfLines={1}>
                {item.hall_details.hall_name}
              </Text>

              {item.hall_types.sub.length > 0 && (
                <View style={ms.badgeRow}>
                  {item.hall_types.sub.slice(0, 2).map((type) => (
                    <View key={type} style={ms.badge}>
                      <Text style={ms.badgeText}>
                        {type.replace(/_/g, " ")}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={ms.infoRow}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={colors.darkGrey}
                />
                <Text style={ms.infoText} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>

              <View style={ms.infoRow}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={colors.darkGrey}
                />
                <Text style={ms.infoText}>{workTime}</Text>
              </View>

              <View style={ms.footer}>
                {pricePerHour ? (
                  <Text style={ms.price}>₮{pricePerHour}/цаг</Text>
                ) : (
                  <View />
                )}
                <View style={ms.ctaButton}>
                  <Text style={ms.ctaText}>View</Text>
                  <Ionicons name="arrow-forward" size={11} color="#fff" />
                </View>
              </View>
            </View>
          </View>
        </Callout>
      </Marker>
    );
  },
);

// ─── ListingsMap ──────────────────────────────────────────────────────────────

const ListingsMap = memo(
  ({
    listings,
    selectedCategory,
  }: {
    listings: (SportHallDataType | EsportHallDataType)[];
    selectedCategory: string;
  }) => {
    const { colors, theme } = useTheme();

    const styles = useMemo(() => createStyle(colors), [colors]);
    const markerStyles = useMemo(() => createMarkerStyle(colors), [colors]);

    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [region, setRegion] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

    const router = useRouter();
    const mapRef = React.useRef<MapView | null>(null);

    const filteredHalls = useMemo(() => {
      if (selectedCategory === "all") return listings;
      const key = selectedCategory.toLowerCase() as HallCategoryType;
      const temp = listings.filter((hall) => hall.hall_types.sub.includes(key));
      return temp;
    }, [selectedCategory, listings]);

    // Only render markers within visible bounds
    const visibleHalls = useMemo(() => {
      if (!region) return filteredHalls;
      const north = region.latitude + region.latitudeDelta / 2;
      const south = region.latitude - region.latitudeDelta / 2;
      const east = region.longitude + region.longitudeDelta / 2;
      const west = region.longitude - region.longitudeDelta / 2;
      return filteredHalls.filter((hall) => {
        const lat = parseFloat(hall.hall_locations?.latitude);
        const lng = parseFloat(hall.hall_locations?.longitude);
        return lat >= south && lat <= north && lng >= west && lng <= east;
      });
    }, [region, filteredHalls]);

    const isFocused = useIsFocused();

    // ── Stable callbacks ────────────────────────────────────────────────────

    const onNavigate = useCallback(
      (id: string, type: string) => {
        router.push(`/book/${id}`);
      },
      [router],
    );

    const setMapRef = useCallback((ref: any) => {
      mapRef.current = ref as unknown as MapView;
    }, []);

    const focusMarker = useCallback((lat: number, lng: number) => {
      mapRef.current?.animateCamera(
        { center: { latitude: lat, longitude: lng }, zoom: 16 },
        { duration: 400 },
      );
    }, []);

    const goToUserLocation = useCallback(() => {
      if (!userLocation) return;
      mapRef.current?.animateToRegion({
        latitude:
          typeof userLocation.latitude === "number"
            ? userLocation.latitude
            : Number(userLocation.latitude),
        longitude:
          typeof userLocation.longitude === "number"
            ? userLocation.longitude
            : Number(userLocation.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }, [userLocation]);

    // ── Location init (runs once) ───────────────────────────────────────────

    useEffect(() => {
      const init = async () => {
        const stored = await SecureStorage.getItemAsync("userLocation");
        if (stored) {
          setUserLocation(JSON.parse(stored));
          return;
        }
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            setHasLocationPermission(true);
            const loc = await Location.getCurrentPositionAsync();
            const coords = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            await SecureStorage.setItemAsync(
              "userLocation",
              JSON.stringify(coords),
            );
            setUserLocation(coords);
          } else {
            setHasLocationPermission(false);
          }
        } catch (e) {
          console.error("Location error:", e);
        }
      };
      init();

      return () => {
        mapRef.current = null;
      };
    }, []);
    const renderCluster = useCallback(
      (cluster: any) => {
        const { id, geometry, onPress, properties } = cluster;
        return (
          <Marker
            key={`cluster-${id}`}
            tracksViewChanges={false}
            onPress={onPress}
            coordinate={{
              longitude: geometry.coordinates[0],
              latitude: geometry.coordinates[1],
            }}
          >
            <View style={styles.clusterMarker}>
              <Text style={styles.clusterText}>
                {properties.point_count ?? 0}
              </Text>
            </View>
          </Marker>
        );
      },
      [styles],
    );
    useEffect(() => {
      console.log("ListingsMap mounted");

      return () => {
        console.log("ListingsMap unmounted");
      };
    }, []);

    const handleRegionChange = useCallback((r: any) => {
      setRegion({
        latitude: r.latitude,
        longitude: r.longitude,
        latitudeDelta: r.latitudeDelta,
        longitudeDelta: r.longitudeDelta,
      });
    }, []);
    return isFocused ? (
      <View style={styles.container}>
        <MapViewClustering
          mapRef={setMapRef}
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={false}
          initialRegion={
            // userLocation
            //   ? {
            //       ...userLocation,
            //       latitudeDelta: 0.1,
            //       longitudeDelta: 0.1,
            //     }
            //   :
            INITIAL_REGION
          }
          renderCluster={renderCluster}
          mapType="standard"
          userInterfaceStyle={theme}
          onRegionChangeComplete={handleRegionChange}
          tracksViewChanges={false}
        >
          {visibleHalls.map((item) => (
            <HallMarker
              key={item.sportHallID}
              item={item}
              ms={markerStyles}
              colors={colors}
              onNavigate={onNavigate}
              onFocus={focusMarker}
            />
          ))}
        </MapViewClustering>

        <TouchableOpacity style={styles.change} onPress={goToUserLocation}>
          <Ionicons
            name="swap-horizontal"
            size={24}
            color={colors.themeColorTextPure}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={goToUserLocation}
        >
          <FontAwesome
            name="location-arrow"
            size={24}
            color={colors.themeColorTextPure}
          />
        </TouchableOpacity>
      </View>
    ) : (
      <OwnActivaterIndicator />
    );
  },
);

const createMarkerStyle = (colors: any) =>
  StyleSheet.create({
    pin: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primary,
      borderWidth: 3,
      borderColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 3,
      elevation: 5,
    },
    pinDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#fff",
    },
    calloutWrapper: {
      alignItems: "center",
      width: 230,
    },
    card: {
      backgroundColor: colors.containerColor,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 10,
      width: 230,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 10,
    },
    hallName: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.themeColorTextPure,
      marginBottom: 6,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 6,
    },
    badge: {
      backgroundColor: colors.primary + "22",
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
      marginRight: 4,
      marginBottom: 2,
    },
    badgeText: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    infoText: {
      fontSize: 11,
      color: colors.darkGrey,
      flex: 1,
      marginLeft: 4,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.lightGrey,
    },
    price: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
    },
    ctaButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    ctaText: {
      fontSize: 11,
      color: "#fff",
      fontWeight: "600",
      marginRight: 3,
    },
    arrow: {
      width: 0,
      height: 0,
      borderLeftWidth: 9,
      borderRightWidth: 9,
      borderTopWidth: 10,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderTopColor: colors.containerColor,
    },
  });

const createStyle = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    clusterMarker: {
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      width: 40,
      height: 40,
    },
    clusterText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "bold",
    },
    locationButton: {
      position: "absolute",
      bottom: 40,
      right: 10,
      backgroundColor: colors.primary,
      borderRadius: 25,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    change: {
      position: "absolute",
      bottom: 100,
      right: 10,
      backgroundColor: colors.primary,
      borderRadius: 25,
      borderColor: colors.primary,
      borderWidth: 2,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
  });

export default ListingsMap;
