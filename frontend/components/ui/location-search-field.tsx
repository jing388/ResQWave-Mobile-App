import { ChevronDown, MapPin, Search, X } from 'lucide-react-native';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Text, TouchableOpacity, View, TextInput, Pressable, Keyboard, useWindowDimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

interface LocationItem {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: 'own' | 'other';
}

interface SearchFieldProps {
  placeholder?: string;
  onLocationSelect?: (location: LocationItem) => void;
  locations?: LocationItem[];
  className?: string;
  onDropdownOpen?: (isOpen: boolean) => void;
}

export function SearchField({
  placeholder = 'Search location',
  onLocationSelect,
  locations = [],
  className = '',
  onDropdownOpen,
}: SearchFieldProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [dropdownTop, setDropdownTop] = useState(0);
  const textInputRef = useRef<TextInput>(null);
  const containerRef = useRef<View>(null);

  const maxDropdownHeight = useMemo(() => {
    // Keep the list above the keyboard and still allow scrolling.
    const available = windowHeight - keyboardHeight - dropdownTop - 12;
    return Math.max(140, Math.min(360, available));
  }, [dropdownTop, keyboardHeight, windowHeight]);

  const updateDropdownTop = () => {
    containerRef.current?.measureInWindow((_x, y, _w, h) => {
      setDropdownTop(y + h + 4);
    });
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      if (isOpen) {
        requestAnimationFrame(updateDropdownTop);
      }
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      if (isOpen) {
        requestAnimationFrame(updateDropdownTop);
      }
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(updateDropdownTop);
    }
  }, [isOpen, windowHeight]);

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) {
      return locations;
    }
    const query = searchQuery.toLowerCase();
    return locations.filter(
      (location) =>
        location.title.toLowerCase().includes(query) ||
        location.address.toLowerCase().includes(query)
    );
  }, [searchQuery, locations]);

  const handleLocationSelect = (location: LocationItem) => {
    setSelectedLocation(location);
    setSearchQuery('');
    setIsOpen(false);
    onDropdownOpen?.(false);
    Keyboard.dismiss();
    onLocationSelect?.(location);
  };

  const handleSearchBarPress = () => {
    setIsOpen(true);
    onDropdownOpen?.(true);
    textInputRef.current?.focus();
  };

  const handleChevronPress = () => {
    // Toggle dropdown
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onDropdownOpen?.(newIsOpen);
    
    if (newIsOpen) {
      // When opening, focus the input and dismiss any keyboard
      Keyboard.dismiss();
      setSearchQuery('');
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    } else {
      // When closing, clear search
      setSearchQuery('');
      Keyboard.dismiss();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    textInputRef.current?.focus();
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery('');
    onDropdownOpen?.(false);
    Keyboard.dismiss();
  };

  // Determine display text - only show static text when dropdown is closed
  const displayText = isOpen || searchQuery.trim() ? '' : (selectedLocation ? selectedLocation.title : placeholder);
  const displayTextColor = selectedLocation && !isOpen && !searchQuery ? 'text-white' : 'text-gray-400';

  return (
    <View ref={containerRef} className="flex-1 mr-3 relative" onLayout={updateDropdownTop}>
      {/* Overlay to dismiss dropdown when tapping outside - must be rendered first */}
      {isOpen && (
        <Pressable
          style={{
            position: 'absolute',
            top: -500,
            left: -500,
            right: -500,
            bottom: -2000,
            zIndex: 40,
          }}
          onPress={closeDropdown}
        />
      )}

      {/* Unified Search Bar with integrated dropdown button */}
      <View>
        <TouchableOpacity
          className={`flex-row items-center bg-default-black rounded-xl px-4 ${className}`}
          style={{ height: 52 }}
          onPress={handleSearchBarPress}
          activeOpacity={0.7}
        >
        <Search size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
        
        {/* Display selected location or placeholder only when dropdown is closed */}
        {!isOpen && !searchQuery.trim() ? (
          <Text className={`flex-1 text-md font-geist-regular ${displayTextColor}`}>
            {displayText}
          </Text>
        ) : null}

        {/* TextInput always rendered, becomes visible when dropdown opens or user types */}
        <TextInput
          ref={textInputRef}
          style={{
            flex: 1,
            color: '#FFFFFF',
            fontSize: 16,
            fontFamily: 'geist-regular',
            opacity: isOpen || searchQuery.trim() ? 1 : 0,
            position: isOpen || searchQuery.trim() ? 'relative' : 'absolute',
          }}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => {
            setIsOpen(true);
            onDropdownOpen?.(true);
          }}
        />

        {searchQuery && (
          <TouchableOpacity onPress={handleClearSearch} activeOpacity={0.7} style={{ marginRight: 8 }}>
            <X size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Chevron dropdown button integrated into search bar */}
        <TouchableOpacity
          onPress={handleChevronPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronDown
            size={16}
            color="#9CA3AF"
            style={{
              transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
            }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
      </View>

      {/* Absolute positioned Dropdown List */}
      {isOpen && filteredLocations.length > 0 && (
        <View
          className="absolute top-full left-0 right-0 bg-default-black rounded-xl border border-gray-600 mt-1"
          style={{
            maxHeight: maxDropdownHeight,
            elevation: 50,
            zIndex: 50,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
          pointerEvents="auto"
        >
          {/* Header with count and search info */}
          <View className="px-4 py-2 border-b border-gray-700">
            <Text className="text-gray-400 text-xs font-geist-medium">
              {searchQuery.trim() ? `${filteredLocations.length} result${filteredLocations.length !== 1 ? 's' : ''} found` : `${filteredLocations.length} neighborhood${filteredLocations.length !== 1 ? 's' : ''} available`}
            </Text>
          </View>
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
            nestedScrollEnabled={true}
            indicatorStyle="white"
            renderItem={({ item: location, index }) => (
              (() => {
                const isOwnNeighborhood = location.type === 'own';
                const isSelected = selectedLocation?.id === location.id;
                const iconBgClass = isOwnNeighborhood ? 'bg-emerald-500/20' : 'bg-blue-500/20';
                const iconColor = isOwnNeighborhood ? '#34D399' : '#60A5FA';
                const rowSelectedClass = isSelected
                  ? (isOwnNeighborhood ? 'bg-emerald-500/15' : 'bg-blue-500/15')
                  : '';
                const titleClass = isSelected
                  ? (isOwnNeighborhood ? 'text-emerald-400' : 'text-blue-400')
                  : (isOwnNeighborhood ? 'text-emerald-300' : 'text-white');

                return (
              <TouchableOpacity
                className={`px-4 py-2.5 flex-row items-center gap-3 ${
                  index !== filteredLocations.length - 1
                    ? 'border-b border-gray-700'
                    : ''
                } ${rowSelectedClass}`}
                onPress={() => handleLocationSelect(location)}
                activeOpacity={0.6}
              >
                <View className={`${iconBgClass} rounded-lg p-1.5`}>
                  <MapPin size={12} color={iconColor} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-sm font-geist-semibold ${titleClass}`}
                  >
                    {location.title}
                  </Text>
                  <Text className="text-gray-400 text-xs font-geist-regular mt-0.5">
                    {location.address}
                  </Text>
                </View>
              </TouchableOpacity>
                );
              })()
            )}
          />
        </View>
      )}

      {/* Empty state message */}
      {isOpen && searchQuery.trim() && filteredLocations.length === 0 && (
        <View
          className="absolute top-full left-0 right-0 bg-default-black rounded-xl border border-gray-600 mt-1"
          style={{
            elevation: 50,
            zIndex: 50,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
          pointerEvents="auto"
        >
          <View className="px-4 py-6 items-center">
            <Text className="text-gray-400 text-sm font-geist-regular">
              No neighborhoods found
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
