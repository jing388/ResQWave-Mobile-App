import { InfoSheet } from '@/components/main/info-sheet';
import { LayersButton } from '@/components/main/layers-button';
import { getPinColors } from '@/components/main/pin';
import { LocationButton } from '@/components/main/your-location-button';
import { Avatar } from '@/components/ui/avatar';
import { SearchField } from '@/components/ui/location-search-field';
import { ThemedView } from '@/components/ui/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNeighborhoods } from '@/hooks/use-neighborhoods';
import { MarkerData } from '@/types/neighborhood';
import type { LocationObject } from 'expo-location';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import MapView, { Circle, Marker, Region, UrlTile } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function HomeScreen() {
  const colorScheme = useColorScheme() || 'light';
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const colors = Colors[colorScheme];

  // Fetch neighborhoods from backend
  const { markers, ownNeighborhood, isLoading, error, refetch } =
    useNeighborhoods();

  const [location, setLocation] = useState<LocationObject | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 14.765,
    longitude: 121.0392,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  // Pinned locations for search (derived from markers)
  const pinnedLocations = markers.map((marker) => ({
    id: marker.id,
    title: marker.neighborhoodID,
    address: marker.address,
    latitude: marker.latitude,
    longitude: marker.longitude,
  }));

  console.log('📍 Total markers:', markers.length);
  console.log('📍 Pinned locations for search:', pinnedLocations.length);

  // Request location permission and center map
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Permission to access location was denied');
          return;
        }
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // If own neighborhood is available, center on it
      if (ownNeighborhood) {
        setRegion({
          latitude: ownNeighborhood.latitude,
          longitude: ownNeighborhood.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
      } else {
        // Otherwise center on user location
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
      }
    })();
  }, [ownNeighborhood]);

  const onRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  const handleCenterOnUser = () => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  };

  const handleMarkerPress = (marker: MarkerData) => {
    setActiveMarkerId(marker.id);

    mapRef.current?.animateToRegion(
      {
        latitude: marker.latitude,
        longitude: marker.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );

    setSelectedMarker(marker);
    setSheetVisible(true);
  };

  const hideBottomSheet = () => {
    setSheetVisible(false);
    setSelectedMarker(null);
    setActiveMarkerId(null);
  };

  const handleGetDirections = (markerData: MarkerData) => {
    console.log('Get directions to:', markerData.neighborhoodID);
  };

  const handleMoreInfo = (markerData: MarkerData) => {
    console.log('More info about:', markerData.neighborhoodID);
  };

  const handleLocationSelect = (location: any) => {
    // Find the marker from our markers array
    const marker = markers.find((m) => m.id === location.id);
    if (marker) {
      handleMarkerPress(marker);
    }
  };

  const handleEdit = (markerData: MarkerData) => {
    console.log('Edit location:', markerData.neighborhoodID);
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 z-50 bg-black/50 items-center justify-center">
          <ActivityIndicator size="large" color="#34D399" />
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        loadingEnabled={true}
        loadingIndicatorColor={colors.tint}
        loadingBackgroundColor={colors.background}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />

        {/* Dynamically render all markers and their circles */}
        {markers.map((marker) => {
          // Get marker color based on type
          const getMarkerColor = () => {
            switch (marker.type) {
              case 'own':
                return '#34D399'; // Green for own neighborhood
              case 'other':
                return '#9CA3AF'; // Gray for other neighborhoods
              default:
                return '#007AFF'; // Blue fallback
            }
          };

          const markerColor = getMarkerColor();

          // Circle colors for active marker
          const circleColors = {
            fill:
              marker.type === 'own'
                ? 'rgba(52, 211, 153, 0.1)'
                : 'rgba(156, 163, 175, 0.1)',
            stroke:
              marker.type === 'own'
                ? 'rgba(52, 211, 153, 0.3)'
                : 'rgba(156, 163, 175, 0.3)',
          };

          return (
            <React.Fragment key={marker.id}>
              {/* Range Circle - only show if this marker is active */}
              {activeMarkerId === marker.id && (
                <Circle
                  center={{
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                  }}
                  radius={100}
                  fillColor={circleColors.fill}
                  strokeColor={circleColors.stroke}
                  strokeWidth={2}
                />
              )}

              {/* Marker with custom color */}
              <Marker
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                onPress={() => handleMarkerPress(marker)}
                pinColor={markerColor}
              />
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Top Bar */}
      <View
        className="absolute top-0 left-0 right-0 px-5 z-10 items-center"
        style={{ paddingTop: insets.top + 10 }}
        pointerEvents="box-none"
      >
        <View className="flex-row items-center w-full" pointerEvents="auto">
          <SearchField
            placeholder="Search locations"
            locations={pinnedLocations}
            onLocationSelect={handleLocationSelect}
          />
          <Avatar
            size="md"
            imageSource={require('@/assets/images/sample-profile-picture.jpg')}
            onPress={() => {
              router.push('/profile');
            }}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View
        className="absolute right-5 items-end gap-3 pb-4"
        style={{ bottom: 0 }}
      >
        <LocationButton onPress={handleCenterOnUser} />
        <LayersButton
          onPress={() => {
            console.log('Layers pressed');
          }}
        />
      </View>

      {/* Info Sheet */}
      <InfoSheet
        visible={sheetVisible}
        markerData={selectedMarker}
        onClose={hideBottomSheet}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
