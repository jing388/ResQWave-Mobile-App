import { InfoSheet } from '@/components/main/info-sheet';
import { LayersButton } from '@/components/main/layers-button';
import MapStyleSheet, { MapStyle } from '@/components/main/map-style-sheet';
import { ChatbotButton } from '@/components/main/chatbot-button';
import { LocationButton } from '@/components/main/your-location-button';
import { Avatar } from '@/components/ui/avatar';
import { SearchField } from '@/components/ui/location-search-field';
import { ThemedView } from '@/components/ui/themed-view';
import { useNeighborhoods } from '@/hooks/use-neighborhoods';
import { MarkerData } from '@/types/neighborhood';
import {
  saveLastSelectedNeighborhood,
  getLastSelectedNeighborhood,
} from '@/services/neighborhood-persistence';
import type { LocationObject } from 'expo-location';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { BottomSheetModalProvider, BottomSheetModal } from '@gorhom/bottom-sheet';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const params = useLocalSearchParams();
  const freshLogin = params.freshLogin === 'true';
  const hasAnimatedRef = useRef(false);

  // Hoisted helper to safely animate map even if ref isn't ready yet
  function animateToRegionSafe(r: Region, duration = 500) {
    if (mapRef.current) {
      mapRef.current.animateToRegion(r, duration);
      return;
    }
    const t = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.animateToRegion(r, duration);
      }
      clearTimeout(t);
    }, 250);
  }

  // Fetch neighborhoods from backend
  const { markers, ownNeighborhood, isLoading } = useNeighborhoods();

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
  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyle>({
    id: 'default',
    name: 'Default',
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    description: 'Standard street map view'
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const mapStyleSheetRef = useRef<BottomSheetModal | null>(null);

  // Pinned locations for search (derived from markers) - memoized to prevent infinite loop
  const pinnedLocations = useMemo(() => {
    const locations = markers.map((marker) => ({
      id: marker.id,
      title: marker.neighborhoodID,
      address: marker.address,
      latitude: marker.latitude,
      longitude: marker.longitude,
    }));
    console.log('📍 Total markers:', markers.length);
    console.log('📍 Pinned locations for search:', locations.length);
    return locations;
  }, [markers]);

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
        // Ensure map centers on the user's assigned (own) neighborhood
        animateToRegionSafe({
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
        animateToRegionSafe({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
      }
    })();
  }, [ownNeighborhood]);

  // Zoom to own neighborhood on fresh login
  useEffect(() => {
    if (freshLogin && ownNeighborhood && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      
      // Start from a wider view, then zoom in to own neighborhood
      const zoomInSequence = async () => {
        // Small delay to ensure map is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Animate to own neighborhood with zoom effect
        mapRef.current?.animateToRegion(
          {
            latitude: ownNeighborhood.latitude,
            longitude: ownNeighborhood.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          },
          1500 // 1.5 second animation
        );
        
        // Set active marker and open bottom sheet after animation
        setTimeout(() => {
          setActiveMarkerId(ownNeighborhood.id);
          setSelectedMarker(ownNeighborhood);
          setSheetVisible(true);
        }, 1500);
      };
      
      zoomInSequence();
    }
  }, [freshLogin, ownNeighborhood]);

  // Load and focus on last selected neighborhood (only if not fresh login)
  useEffect(() => {
    const loadLastSelectedNeighborhood = async () => {
      if (markers.length > 0 && !freshLogin) {
        const lastSelectedId = await getLastSelectedNeighborhood();
        if (lastSelectedId) {
          const lastSelectedMarker = markers.find(marker => marker.id === lastSelectedId);
          if (lastSelectedMarker) {
            console.log('Focusing on last selected neighborhood:', lastSelectedId);
            setRegion({
              latitude: lastSelectedMarker.latitude,
              longitude: lastSelectedMarker.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            });
            setActiveMarkerId(lastSelectedId);
            // Animate the map to the persisted last-selected neighborhood
            animateToRegionSafe({
              latitude: lastSelectedMarker.latitude,
              longitude: lastSelectedMarker.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            });
          }
        }
      }
    };

    loadLastSelectedNeighborhood();
  }, [markers, freshLogin]);

  const handleCenterOnUser = useCallback(() => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  }, [location]);

  const handleMarkerPress = useCallback((marker: MarkerData) => {
    console.log('📍 [handleMarkerPress] Marker pressed:', marker.neighborhoodID);
    console.log('📍 [handleMarkerPress] Marker TYPE:', marker.type);
    console.log('📍 [handleMarkerPress] Full marker:', JSON.stringify(marker, null, 2));
    
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
  }, []);

  const hideBottomSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedMarker(null);
    setActiveMarkerId(null);
  }, []);

  const handleMoreInfo = useCallback(async (markerData: MarkerData) => {
    console.log('🔍 [index] ========================================');
    console.log('🔍 [index] More info requested for:', markerData.neighborhoodID);
    console.log('🔍 [index] Marker ID (database ID):', markerData.id);
    console.log('🔍 [index] Full marker data:', JSON.stringify(markerData, null, 2));

    // Close the info sheet first for better UX
    hideBottomSheet();

    // Save the selected neighborhood ID for persistence
    console.log('💾 [index] Saving neighborhood ID to persistence:', markerData.id);
    await saveLastSelectedNeighborhood(markerData.id);
    console.log('✅ [index] Saved neighborhood ID:', markerData.id);

    // Small delay to ensure state is cleared
    await new Promise(resolve => setTimeout(resolve, 100));

    // Navigate to the About Neighborhood page with the neighborhood ID
    console.log('🔍 [index] Navigating to about-neighborhood with ID:', markerData.id);
    console.log('🔍 [index] ========================================');
    router.push({
      pathname: '/(tabs)/about-neighborhood',
      params: { neighborhoodId: markerData.id }
    });
  }, [hideBottomSheet]);

  const handleLocationSelect = (location: any) => {
    // Find the marker from our markers array
    const marker = markers.find((m) => m.id === location.id);
    if (marker) {
      handleMarkerPress(marker);
    }
  };

  const handleMapStyleSelect = (style: MapStyle) => {
    setCurrentMapStyle(style);
  };

  const handleLayersPress = () => {
    mapStyleSheetRef.current?.present();
  };


  return (
    <BottomSheetModalProvider>
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

        {/* Map */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          mapType={currentMapStyle.id === 'satellite' ? 'satellite' : 'standard'}
          scrollEnabled={!isDropdownOpen}
          zoomEnabled={!isDropdownOpen}
          pitchEnabled={!isDropdownOpen}
          rotateEnabled={!isDropdownOpen}
        >
          {/* Custom Map Tiles for terrain style only */}
          {currentMapStyle.id === 'terrain' && (
            <UrlTile
              urlTemplate={currentMapStyle.urlTemplate}
              maximumZ={19}
              flipY={false}
              zIndex={-1}
            />
          )}
          
          {/* Dynamically render all markers and their circles */}
          {markers.map((marker) => {
            // Get marker color based on type (keep owned neighborhoods green even when selected)
            const getMarkerColor = () => {
              // Keep green (own) neighborhoods green even when selected
              if (marker.type === 'own') {
                return '#34D399'; // Green for own neighborhood (always)
              }
              // For other neighborhoods, show blue when selected
              if (activeMarkerId === marker.id) {
                return '#007AFF'; // Blue for selected neighborhood
              }
              // Default gray for unselected other neighborhoods
              return '#9CA3AF'; // Gray for other neighborhoods
            };

            const markerColor = getMarkerColor();

            // Circle colors for active marker - match the marker color
            const circleColors = {
              fill:
                marker.type === 'own'
                  ? 'rgba(52, 211, 153, 0.1)' // Green for own (always)
                  : activeMarkerId === marker.id
                    ? 'rgba(0, 122, 255, 0.1)' // Blue for selected other
                    : 'rgba(156, 163, 175, 0.1)', // Gray for unselected other
              stroke:
                marker.type === 'own'
                  ? 'rgba(52, 211, 153, 0.3)' // Green for own (always)
                  : activeMarkerId === marker.id
                    ? 'rgba(0, 122, 255, 0.3)' // Blue for selected other
                    : 'rgba(156, 163, 175, 0.3)', // Gray for unselected other
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
                  key={`${marker.id}-${activeMarkerId === marker.id ? 'active' : 'inactive'}`}
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
              onDropdownOpen={setIsDropdownOpen}
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
          <LayersButton onPress={handleLayersPress} />
          <ChatbotButton
            onPress={() => {
              router.push('/chatbot' as any);
            }}
          />
        </View>

        {/* Info Sheet */}
        <InfoSheet
          visible={sheetVisible}
          markerData={selectedMarker}
          onClose={hideBottomSheet}
          onMoreInfo={handleMoreInfo}
        />

        {/* Map Style Bottom Sheet */}
        <MapStyleSheet
          bottomSheetRef={mapStyleSheetRef}
          onStyleSelect={handleMapStyleSelect}
          currentStyleId={currentMapStyle.id}
        />
      </ThemedView>
    </BottomSheetModalProvider>
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
