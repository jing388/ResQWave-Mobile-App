import { ReportCardContainer } from '@/components/reports/report-card-container';
import { Dropdown } from '@/components/ui/dropdown';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Animated,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2023');
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [rotationValues, setRotationValues] = useState<{
    [key: string]: Animated.Value;
  }>({});

  // Sample data structure
  const sampleReports = {
    '2023-10': [
      {
        id: '1',
        documentName: 'Monthly Fire Safety Report',
        dateAccomplished: '2023-10-15',
        type: 'safety',
      },
      {
        id: '2',
        documentName: 'Emergency Response Drill Summary',
        dateAccomplished: '2023-10-12',
        type: 'emergency',
      },
      {
        id: '3',
        documentName: 'Equipment Maintenance Log',
        dateAccomplished: '2023-10-08',
        type: 'maintenance',
      },
    ],
    '2023-09': [
      {
        id: '4',
        documentName: 'Quarterly Incident Analysis',
        dateAccomplished: '2023-09-28',
        type: 'analysis',
      },
      {
        id: '5',
        documentName: 'Training Completion Report',
        dateAccomplished: '2023-09-20',
        type: 'training',
      },
    ],
    '2023-08': [
      {
        id: '6',
        documentName: 'Community Outreach Summary',
        dateAccomplished: '2023-08-25',
        type: 'outreach',
      },
      {
        id: '7',
        documentName: 'Resource Allocation Report',
        dateAccomplished: '2023-08-15',
        type: 'resource',
      },
      {
        id: '8',
        documentName: 'Weather Impact Assessment',
        dateAccomplished: '2023-08-05',
        type: 'assessment',
      },
    ],
  };

  const monthOptions = [
    { label: 'All Months', value: 'all' },
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
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' },
  ];

  const toggleSection = (sectionKey: string) => {
    // Initialize rotation value if it doesn't exist
    if (!rotationValues[sectionKey]) {
      const newRotationValue = new Animated.Value(0); // Start at 0 (collapsed/up)
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
      toValue: willBeCollapsed ? 0 : 1, // 0 = up (collapsed), 1 = down (expanded)
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Update collapsed state
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: willBeCollapsed,
    }));
  };

  const handleViewDocument = (documentId: string, documentName: string) => {
    console.log(`Viewing document: ${documentName} (ID: ${documentId})`);
    // Implement document viewing logic here
  };

  const formatMonthYear = (key: string) => {
    const [year, month] = key.split('-');
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'left', 'right']}>
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
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="py-6">
          <Text className="text-white text-3xl font-geist-bold mb-2">
            Reports
          </Text>
          <Text className="text-gray-400 text-base font-geist-regular">
            View and analyze incident reports
          </Text>
        </View>

        {/* Search and Filters */}
        <View className="gap-4 mb-6">
          {/* Search Field */}
          <View className="relative">
            <View className="flex-row items-center bg-gray-800 rounded-xl border border-gray-600 h-12 px-4">
              <Search size={20} color="#9CA3AF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search reports..."
                placeholderTextColor="#6B7280"
                className="flex-1 text-gray-50 text-base h-full ml-3 font-geist-regular py-0"
              />
            </View>
          </View>

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

        {/* Reports List */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {Object.entries(sampleReports).map(([monthKey, reports]) => {
            const isCollapsed = collapsedSections[monthKey] ?? true; // Default to collapsed (true)

            // Initialize rotation value if it doesn't exist
            if (!rotationValues[monthKey]) {
              const newRotationValue = new Animated.Value(0);
              setRotationValues((prev) => ({
                ...prev,
                [monthKey]: newRotationValue,
              }));
            }

            const rotationValue =
              rotationValues[monthKey] || new Animated.Value(0);
            const rotateInterpolate = rotationValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['180deg', '0deg'], // 180deg = up, 0deg = down
            });

            return (
              <View key={monthKey} className="">
                {/* Month Header */}
                <TouchableOpacity
                  className="flex-row items-center justify-between bg-gray-800 rounded-xl p-4 mb-3"
                  onPress={() => toggleSection(monthKey)}
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-white text-lg font-geist-semibold">
                      {formatMonthYear(monthKey)}
                    </Text>
                    <View className="bg-gray-700 rounded-full px-3 py-1">
                      <Text className="text-gray-300 text-sm font-geist-medium">
                        {reports.length} reports
                      </Text>
                    </View>
                  </View>
                  <Animated.View
                    style={{ transform: [{ rotate: rotateInterpolate }] }}
                  >
                    <ChevronDown size={20} color="#9CA3AF" />
                  </Animated.View>
                </TouchableOpacity>

                {/* Collapsible Reports */}
                <Collapsible collapsed={isCollapsed}>
                  <View>
                    {reports.map((report) => (
                      <ReportCardContainer
                        key={report.id}
                        id={report.id}
                        documentName={report.documentName}
                        dateAccomplished={report.dateAccomplished}
                        onViewDocument={handleViewDocument}
                        type={report.type}
                      />
                    ))}
                  </View>
                </Collapsible>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
