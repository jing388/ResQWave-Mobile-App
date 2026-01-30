import { ChevronDown, MapPin, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

interface LocationItem {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: string;
}

interface SearchFieldProps {
  placeholder?: string;
  onLocationSelect?: (location: LocationItem) => void;
  locations?: LocationItem[];
  className?: string;
  onDropdownOpen?: (isOpen: boolean) => void;
  selectedLocationId?: string | null;
}

export function SearchField({
  placeholder = 'Search location',
  onLocationSelect,
  locations = [],
  className = '',
  onDropdownOpen,
  selectedLocationId = null,
}: SearchFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(
    null,
  );
  const listRef = React.useRef<any>(null);
  const ITEM_HEIGHT = 72; // approximate height for each list item (px)
  const handleLocationSelect = (location: LocationItem) => {
    setSelectedLocation(location);
    setIsOpen(false);
    onDropdownOpen?.(false);
    onLocationSelect?.(location);
  };

  // Sync internal selectedLocation when parent-controlled selectedLocationId changes
  React.useEffect(() => {
    if (!selectedLocationId) {
      setSelectedLocation(null);
      return;
    }
    const found = locations.find((l) => l.id === selectedLocationId) || null;
    setSelectedLocation(found as LocationItem | null);
  }, [selectedLocationId, locations]);

  // Scroll the FlatList to the selected item when dropdown opens or selection changes
  const scrollToSelected = (id?: string | null) => {
    if (!id || !listRef.current || locations.length === 0) return;
    const idx = locations.findIndex((l) => l.id === id);
    if (idx === -1) return;
    const viewPosition = idx <= 1 ? 0 : 0.5;
    // Small delay to ensure FlatList has rendered
    setTimeout(() => {
      try {
        listRef.current.scrollToIndex({ index: idx, animated: true, viewPosition });
      } catch (e) {
        // Fallback: calculate offset with small padding so item isn't flush to edge
        const offset = Math.max(0, idx * ITEM_HEIGHT - 8);
        listRef.current.scrollToOffset({ offset, animated: true });
      }
    }, 80);
  };

  React.useEffect(() => {
    if (isOpen) {
      scrollToSelected(selectedLocationId);
    }
  }, [isOpen, selectedLocationId, locations]);

  const handleDropdownToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onDropdownOpen?.(newIsOpen);
  };

  
  const displayText = selectedLocation ? selectedLocation.title : placeholder;

  return (
    <View className="flex-1 mr-3 relative">
      {/* Dropdown Trigger */}
      <TouchableOpacity
        className={`flex-row items-center bg-default-black rounded-xl px-4 py-4 ${className}`}
        onPress={handleDropdownToggle}
        activeOpacity={0.7}
      >
        <Search size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
        <Text
          className={`flex-1 text-md font-geist-regular ${
            selectedLocation ? 'text-white' : 'text-gray-400'
          }`}
        >
          {displayText}
        </Text>
        <ChevronDown
          size={16}
          color="#9CA3AF"
          style={{
            transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
          }}
        />
      </TouchableOpacity>

      {/* Absolute positioned Dropdown List */}
      {isOpen && locations.length > 0 && (
        <View
          className="absolute top-full left-0 right-0 bg-default-black rounded-xl border border-gray-600 mt-1"
          style={{
            height: 400,
            elevation: 50,
            zIndex: 50,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
          pointerEvents="auto"
        >
          {/* Header with count */}
          <View className="px-4 py-2 border-b border-gray-700">
            <Text className="text-gray-400 text-sm font-geist-medium">
              {locations.length} neighborhood{locations.length !== 1 ? 's' : ''} available
            </Text>
          </View>
          <View style={{ height: 350 }}>
            <FlatList
              data={locations}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              style={{ height: 350 }}
              indicatorStyle="white"
              nestedScrollEnabled={true}
              scrollEnabled={true}
              ref={listRef}
              getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
              contentContainerStyle={{ paddingTop: 6, paddingBottom: 12 }}
              onScrollToIndexFailed={({ index, highestMeasuredFrameIndex, averageItemLength }) => {
                const offset = Math.max(0, index * (averageItemLength || ITEM_HEIGHT) - 8);
                listRef.current?.scrollToOffset({ offset, animated: true });
              }}
              renderItem={({ item: location, index }) => (
                <TouchableOpacity
                  className={`px-4 py-3 flex-row items-start gap-3 ${
                    index !== locations.length - 1
                      ? 'border-b border-gray-700'
                      : ''
                  } ${selectedLocation?.id === location.id
                    ? location.type === 'own'
                      ? 'bg-green-800'
                      : 'bg-blue-800'
                    : ''
                  }`}
                  onPress={() => handleLocationSelect(location)}
                >
                  <View className={`${location.type === 'own' ? 'bg-green-500/20' : 'bg-blue-500/20'} rounded-lg p-2 mt-0.5`}>
                    <MapPin size={14} color={location.type === 'own' ? '#34D399' : '#60A5FA'} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-base font-geist-semibold mb-1 ${
                        selectedLocation?.id === location.id
                          ? location.type === 'own'
                            ? 'text-green-300'
                            : 'text-blue-300'
                          : 'text-white'
                      }`}
                    >
                      {location.title}
                    </Text>
                    <Text
                      className={`text-sm font-geist-regular ${
                        selectedLocation?.id === location.id ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {location.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}
    </View>
  );
}
