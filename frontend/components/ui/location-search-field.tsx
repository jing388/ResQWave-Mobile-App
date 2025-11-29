import { ChevronDown, MapPin, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

interface LocationItem {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface SearchFieldProps {
  placeholder?: string;
  onLocationSelect?: (location: LocationItem) => void;
  locations?: LocationItem[];
  className?: string;
}

export function SearchField({
  placeholder = 'Search location',
  onLocationSelect,
  locations = [],
  className = '',
}: SearchFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(
    null,
  );

  const handleLocationSelect = (location: LocationItem) => {
    setSelectedLocation(location);
    setIsOpen(false);
    onLocationSelect?.(location);
  };

  const displayText = selectedLocation ? selectedLocation.title : placeholder;

  return (
    <View className="flex-1 mr-3 relative">
      {/* Dropdown Trigger */}
      <TouchableOpacity
        className={`flex-row items-center bg-default-black rounded-xl px-4 py-4 ${className}`}
        onPress={() => setIsOpen(!isOpen)}
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

      {/* Dropdown List */}
      {isOpen && locations.length > 0 && (
        <View
          className="absolute top-full left-0 right-0 bg-default-black rounded-xl border border-gray-600 mt-1 z-50"
          style={{ maxHeight: 250 }}
        >
          <FlatList
            data={locations}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 250 }}
            renderItem={({ item: location, index }) => (
              <TouchableOpacity
                className={`px-4 py-3 flex-row items-start gap-3 ${
                  index !== locations.length - 1
                    ? 'border-b border-gray-700'
                    : ''
                } ${selectedLocation?.id === location.id ? 'bg-gray-700' : ''}`}
                onPress={() => handleLocationSelect(location)}
              >
                <View className="bg-blue-500/20 rounded-lg p-2 mt-0.5">
                  <MapPin size={14} color="#60A5FA" />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-geist-semibold mb-1 ${
                      selectedLocation?.id === location.id
                        ? 'text-blue-400'
                        : 'text-white'
                    }`}
                  >
                    {location.title}
                  </Text>
                  <Text className="text-gray-400 text-sm font-geist-regular">
                    {location.address}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}
