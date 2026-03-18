import { LogCard } from '@/components/profile/log-card';
import { Dropdown } from '@/components/ui/dropdown';
import { AuthLoadingOverlay } from '@/components/ui/auth-loading-overlay';
import { SearchField } from '@/components/ui/search-field';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
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
import { logService, DailyLog } from '@/services/log-service';

export default function LogsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, '0')); // Current month
  const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear())); // Current year
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [rotationValues, setRotationValues] = useState<{
    [key: string]: Animated.Value;
  }>({});
  const [logsData, setLogsData] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleGoBack = () => {
    router.back();
  };

  // Fetch logs from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await logService.getOwnLogs();
        setLogsData(response.days);
      } catch (err: any) {
        setError(err.message || 'Failed to load logs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

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

  // Generate dynamic year options (current year and past years only)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    // Add current year
    years.push({ label: String(currentYear), value: String(currentYear) });

    // Add past years (up to 5 years back)
    for (let i = 1; i <= 5; i++) {
      years.push({ label: String(currentYear - i), value: String(currentYear - i) });
    }

    return years;
  };

  const yearOptions = generateYearOptions();

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
    return dateString; // Backend already returns formatted date
  };

  const monthNameToNumber: Record<string, string> = {
    January: '01',
    February: '02',
    March: '03',
    April: '04',
    May: '05',
    June: '06',
    July: '07',
    August: '08',
    September: '09',
    October: '10',
    November: '11',
    December: '12',
  };

  function extractMonthYearFromLabel(dateLabel: string): {
    month: string | null;
    year: string | null;
  } {
    // Expected format from backend: "February 2, 2026" (en-PH, month long)
    const parts = String(dateLabel || '').trim().split(/\s+/);
    if (parts.length >= 3) {
      const monthName = parts[0];
      const year = parts[2];
      const month = monthNameToNumber[monthName] ?? null;
      return { month, year: year || null };
    }

    // Fallback: try Date parsing (may fail on Hermes)
    const parsed = new Date(dateLabel);
    if (Number.isNaN(parsed.getTime())) {
      return { month: null, year: null };
    }
    return {
      month: String(parsed.getMonth() + 1).padStart(2, '0'),
      year: String(parsed.getFullYear()),
    };
  }

  // Filter logs based on selected month/year and search query
  const filteredLogs = logsData.filter((dayLog) => {
    const { month, year } = extractMonthYearFromLabel(dayLog.date);

    // Filter by selected month and year
    if (!month || !year || year !== selectedYear || month !== selectedMonth) {
      return false;
    }

    // Filter by search query (search in field names)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return dayLog.actions.some((action) =>
        action.fields.some((field) =>
          field.field.toLowerCase().includes(query),
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
            {isLoading ? null : error ? (
              <View className="items-center justify-center py-12 px-6">
                <Text className="text-red-400 text-base font-geist-regular text-center mb-4">
                  {error}
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    setIsLoading(true);
                    setError(null);
                    try {
                      const response = await logService.getOwnLogs();
                      setLogsData(response.days);
                    } catch (err: any) {
                      setError(err.message || 'Failed to load logs. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="bg-blue-500 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-geist-medium">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : filteredLogs.length === 0 ? (
              <View className="items-center justify-center py-12 px-6">
                <Text className="text-gray-400 text-base font-geist-regular text-center mb-2">
                  No logs found for {selectedMonth === '01' && 'January'}{selectedMonth === '02' && 'February'}{selectedMonth === '03' && 'March'}{selectedMonth === '04' && 'April'}{selectedMonth === '05' && 'May'}{selectedMonth === '06' && 'June'}{selectedMonth === '07' && 'July'}{selectedMonth === '08' && 'August'}{selectedMonth === '09' && 'September'}{selectedMonth === '10' && 'October'}{selectedMonth === '11' && 'November'}{selectedMonth === '12' && 'December'} {selectedYear}
                </Text>
                {logsData.length > 0 && (
                  <Text className="text-gray-500 text-sm font-geist-regular text-center mt-2">
                    You have {logsData.length} log{logsData.length !== 1 ? 's' : ''} in other months. Try selecting a different month.
                  </Text>
                )}
              </View>
            ) : (
              filteredLogs.map((dayLog) => {
                const dateKey = dayLog.date;
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

                // Filter actions by search query
                const filteredActions = searchQuery.trim()
                  ? dayLog.actions.filter((action) =>
                    action.fields.some((field) =>
                      field.field
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                    ),
                  )
                  : dayLog.actions;

                if (filteredActions.length === 0) return null;

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
                            {dayLog.count}{' '}
                            {dayLog.count === 1 ? 'change' : 'changes'}
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
                        {filteredActions.map((action, index) => (
                          <LogCard
                            key={`${action.createdAt}-${index}`}
                            userName={action.actorName}
                            message={action.message}
                            time={action.time}
                            changes={action.fields.map(field => ({
                              field: field.field,
                              oldValue: field.oldValue || '',
                              newValue: field.newValue || '',
                            }))}
                          />
                        ))}
                      </View>
                    </Collapsible>
                  </View>
                );
              })
            )}
          </ScrollView>

          <AuthLoadingOverlay visible={isLoading} message="Loading logs..." />
        </View>
      </View>
    </View>
  );
}
