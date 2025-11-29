import { LogCard, LogChange } from '@/components/profile/log-card';
import { Dropdown } from '@/components/ui/dropdown';
import { SearchField } from '@/components/ui/search-field';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Animated,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LogEntry {
  id: string;
  userName: string;
  time: string;
  changes: LogChange[];
}

interface DailyLogs {
  [date: string]: LogEntry[];
}

export default function LogsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('11'); // November
  const [selectedYear, setSelectedYear] = useState('2025');
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [rotationValues, setRotationValues] = useState<{
    [key: string]: Animated.Value;
  }>({});

  const handleGoBack = () => {
    router.back();
  };

  // Sample data structure - logs grouped by date
  const sampleLogs: DailyLogs = {
    '2025-11-01': [
      {
        id: '1',
        userName: 'Juan Dela Cruz',
        time: '2:30 PM',
        changes: [
          {
            field: 'Approximate Households',
            oldValue: '150',
            newValue: '165',
          },
          {
            field: 'Notable Information',
            oldValue: 'Chapel under construction',
            newValue: 'New chapel built',
          },
        ],
      },
      {
        id: '2',
        userName: 'Maria Santos',
        time: '10:15 AM',
        changes: [
          {
            field: 'Floodwater Subsidence',
            oldValue: '2-4 hours',
            newValue: '4-6 hours',
          },
        ],
      },
      {
        id: '3',
        userName: 'Pedro Reyes',
        time: '8:45 AM',
        changes: [
          {
            field: 'Approximate Residents',
            oldValue: '580',
            newValue: '620',
          },
          {
            field: 'Average Household Size',
            oldValue: '3.8',
            newValue: '3.9',
          },
        ],
      },
    ],
    '2025-10-31': [
      {
        id: '4',
        userName: 'Rosa Martinez',
        time: '4:20 PM',
        changes: [
          {
            field: 'Flood Related Hazards',
            oldValue: 'Heavy rainfall, Poor drainage',
            newValue: 'Heavy rainfall, Poor drainage, Landslide risk',
          },
        ],
      },
      {
        id: '5',
        userName: 'Carlos Fernandez',
        time: '11:30 AM',
        changes: [
          {
            field: 'Alternative Focal Person Name',
            oldValue: 'Jose Gonzales',
            newValue: 'Ana Gonzales',
          },
          {
            field: 'Alternative Focal Person Contact',
            oldValue: '+63 912 345 6789',
            newValue: '+63 923 456 7890',
          },
        ],
      },
    ],
    '2025-10-28': [
      {
        id: '6',
        userName: 'Linda Garcia',
        time: '3:15 PM',
        changes: [
          {
            field: 'Notable Information',
            oldValue: 'Street lights installed',
            newValue: 'Street lights installed, New basketball court',
          },
        ],
      },
    ],
    '2025-10-15': [
      {
        id: '7',
        userName: 'Miguel Torres',
        time: '1:45 PM',
        changes: [
          {
            field: 'Approximate Households',
            oldValue: '145',
            newValue: '150',
          },
        ],
      },
    ],
  };

  const monthOptions = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const yearOptions = [
    { label: '2025', value: '2025' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
  ];

  const toggleSection = (sectionKey: string) => {
    // Initialize rotation value if it doesn't exist
    if (!rotationValues[sectionKey]) {
      const newRotationValue = new Animated.Value(0);
      setRotationValues((prev) => ({
        ...prev,
        [sectionKey]: newRotationValue,
      }));
    }

    const currentlyCollapsed = collapsedSections[sectionKey] ?? true;
    const willBeCollapsed = !currentlyCollapsed;

    // Animate rotation
    const rotationValue = rotationValues[sectionKey] || new Animated.Value(0);
    Animated.timing(rotationValue, {
      toValue: willBeCollapsed ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Update collapsed state
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: willBeCollapsed,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Filter logs based on selected month/year and search query
  const filteredLogs = Object.entries(sampleLogs).filter(([date, logs]) => {
    const [year, month] = date.split('-');

    // Filter by selected month and year
    if (year !== selectedYear || month !== selectedMonth) {
      return false;
    }

    // Filter by search query (search in field names)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return logs.some((log) =>
        log.changes.some((change) =>
          change.field.toLowerCase().includes(query),
        ),
      );
    }

    return true;
  });

  return (
    <View className="flex-1 bg-black">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={['#1F2937', '#171717']}
        className="absolute inset-0"
      />

      {/* Content */}
      <View className="flex-1">
        {/* Header */}
        <View style={{ paddingTop: insets.top + 16 }} className="px-5">
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={handleGoBack}
              className="p-2"
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color="#F9FAFB" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-geist-semibold">Logs</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-6">
          {/* Search and Filters */}
          <View className="gap-4 mb-6">
            {/* Search Field */}
            <SearchField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by field name..."
            />

            {/* Month and Year Dropdowns */}
            <View className="flex-row gap-3">
              {/* Month Dropdown */}
              <Dropdown
                options={monthOptions}
                selectedValue={selectedMonth}
                onValueChange={setSelectedMonth}
                placeholder="Select Month"
              />

              {/* Year Dropdown */}
              <Dropdown
                options={yearOptions}
                selectedValue={selectedYear}
                onValueChange={setSelectedYear}
                placeholder="Select Year"
              />
            </View>
          </View>

          {/* Logs List */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {filteredLogs.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Text className="text-gray-400 text-base font-geist-regular">
                  No logs found for the selected period
                </Text>
              </View>
            ) : (
              filteredLogs.map(([dateKey, logs]) => {
                const isCollapsed = collapsedSections[dateKey] ?? true;

                // Initialize rotation value if it doesn't exist
                if (!rotationValues[dateKey]) {
                  const newRotationValue = new Animated.Value(0);
                  setRotationValues((prev) => ({
                    ...prev,
                    [dateKey]: newRotationValue,
                  }));
                }

                const rotationValue =
                  rotationValues[dateKey] || new Animated.Value(0);
                const rotateInterpolate = rotationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['180deg', '0deg'],
                });

                // Filter logs by search query
                const filteredDayLogs = searchQuery.trim()
                  ? logs.filter((log) =>
                      log.changes.some((change) =>
                        change.field
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                      ),
                    )
                  : logs;

                if (filteredDayLogs.length === 0) return null;

                return (
                  <View key={dateKey} className="mb-3">
                    {/* Date Header */}
                    <TouchableOpacity
                      className="flex-row items-center justify-between bg-gray-800 rounded-xl p-4 mb-3"
                      onPress={() => toggleSection(dateKey)}
                    >
                      <View className="flex-row items-center gap-3">
                        <Text className="text-white text-lg font-geist-semibold">
                          {formatDate(dateKey)}
                        </Text>
                        <View className="bg-gray-700 rounded-full px-3 py-1">
                          <Text className="text-gray-300 text-sm font-geist-medium">
                            {filteredDayLogs.length}{' '}
                            {filteredDayLogs.length === 1 ? 'log' : 'logs'}
                          </Text>
                        </View>
                      </View>
                      <Animated.View
                        style={{ transform: [{ rotate: rotateInterpolate }] }}
                      >
                        <ChevronDown size={20} color="#9CA3AF" />
                      </Animated.View>
                    </TouchableOpacity>

                    {/* Collapsible Logs */}
                    <Collapsible collapsed={isCollapsed}>
                      <View>
                        {filteredDayLogs.map((log) => (
                          <LogCard
                            key={log.id}
                            userName={log.userName}
                            time={log.time}
                            changes={log.changes}
                          />
                        ))}
                      </View>
                    </Collapsible>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
