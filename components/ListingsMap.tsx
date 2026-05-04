import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { HallCategoryType, SportHallDataType } from "@/interfaces/listing";
import { useRouter } from "expo-router";
import MapViewClustering from "react-native-map-clustering";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as SecureStorage from "expo-secure-store";
import { useTheme } from "@/src/context/themeContext";

const INITIAL_REGION = {
  latitude: 47.918873,
  longitude: 106.917701,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const ListingsMap = memo(
  ({
    listings,
    selectedCategory,
  }: {
    listings: SportHallDataType[];
    selectedCategory: string;
  }) => {
    const { colors, theme } = useTheme();
    const styles = useMemo(() => createStyle(colors), [colors]);

    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [filteredHalls, setFilteredHalls] = useState<SportHallDataType[]>([]);
    const [userLocation, setUserLocation] = useState<{
      latitude: number;
      longitude: number;
    } | null>(null);
    const router = useRouter();
    const mapRef = React.useRef<MapView | null>(null);

    const onMarkerSelected = (item: SportHallDataType) => {
      router.push(`/listing/${item.sportHallID}`);
    };

    const goToUserLocation = () => {
      if (userLocation) {
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
      }
    };

    useEffect(() => {
      if (selectedCategory === "all") {
        setFilteredHalls(listings);
      } else {
        const categoryKey = selectedCategory.toLowerCase();
        const filtered = listings.filter((hall) =>
          hall.hall_types.sub.includes(categoryKey as HallCategoryType),
        );
        console.log("MAP LENGTH", filtered.length);
        setFilteredHalls(filtered);
      }
    }, [selectedCategory, listings]);

    useEffect(() => {
      const requestLocationPermission = async () => {
        const userLocation = await SecureStorage.getItemAsync("userLocation");
        if (!userLocation) {
          try {
            const { status } =
              await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
              setHasLocationPermission(true);
              const location = await Location.getCurrentPositionAsync();
              console.log("Location:", location);
              const userLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };
              await SecureStorage.setItemAsync(
                "userLocation",
                JSON.stringify(userLocation),
              );
              setUserLocation(userLocation);
            } else {
              setHasLocationPermission(false);
            }
          } catch (error) {
            console.error("Error fetching location:", error);
          }
        } else {
          setUserLocation(JSON.parse(userLocation));
        }
      };

      requestLocationPermission();
    }, []);

    const renderCluster = useCallback(
      (cluster: any) => {
        const { id, geometry, onPress, properties } = cluster;
        const points = properties.point_count || 0;

        return (
          <Marker
            key={`cluster-${id}`}
            onPress={onPress}
            coordinate={{
              longitude: geometry.coordinates[0],
              latitude: geometry.coordinates[1],
            }}
          >
            <View style={[styles.clusterMarker, {}]}>
              <Text style={styles.clusterText}>{points}</Text>
            </View>
          </Marker>
        );
      },
      [], // Dependencies are empty since renderCluster doesn't depend on props/state
    );
    return (
      <View style={styles.container}>
        <MapViewClustering
          mapRef={(ref) => {
            mapRef.current = ref as unknown as MapView;
          }}
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={false} // Disable default button
          initialRegion={
            userLocation
              ? {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }
              : INITIAL_REGION
          }
          clusterColor=""
          renderCluster={renderCluster}
          mapType="standard"
          userInterfaceStyle={theme}
          onRegionChangeComplete={(region, markers) => {}}
        >
          {filteredHalls.map((item: SportHallDataType) => {
            return (
              <Marker
                key={item.sportHallID}
                onPress={() => onMarkerSelected(item)}
                coordinate={{
                  latitude: parseFloat(item.hall_location?.latitude),
                  longitude: parseFloat(item.hall_location?.longitude),
                }}
                title={item.hall_details.hall_name}
                //description={item.properties.summary ?? undefined}
              />
            );
          })}
        </MapViewClustering>
        <TouchableOpacity style={styles.change} onPress={goToUserLocation}>
          <Ionicons
            name="swap-horizontal"
            size={24}
            color={colors.themeColorTextPure}
          />
        </TouchableOpacity>
        {/* Custom Location Button */}
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
    );
  },
);

const createStyle = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
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
