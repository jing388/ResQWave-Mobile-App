import { ReportCardContainer } from '@/components/reports/report-card-container';
import { Dropdown } from '@/components/ui/dropdown';
import { PDFViewer } from '@/components/pdf-viewer';
import { RefreshNotification } from '@/components/ui/refresh-notification';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, Search, RefreshCw } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  Animated,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { SafeAreaView } from 'react-native-safe-area-context';
import { reportService, ReportData } from '@/services/report-service';
import { generateReportPDF } from '@/utils/pdf-generator';
import { authService } from '@/services/auth-service';

export default function ReportsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [rotationValues, setRotationValues] = useState<{
    [key: string]: Animated.Value;
  }>({});
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [refreshRotation] = useState(new Animated.Value(0));
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [userNeighborhoodId, setUserNeighborhoodId] = useState<string | null>(null);

  /**
   * Fetch reports from API and filter by user's neighborhood
   * 
   * This ensures that focal persons only see reports from their own neighborhood,
   * not reports from other neighborhoods (e.g., N021, N022, etc.).
   * 
   * The filtering is done on the frontend to avoid modifying backend endpoints
   * that are shared with the web application.
   */
  const fetchReports = async (bypassCache = false): Promise<void> => {
    try {
      setError(null);
      
      // Get user's neighborhood ID
      const user = await authService.getStoredUser();
      const neighborhoodId = (user as any)?.neighborhood?.id || null;
      
      console.log('📊 [Reports] User neighborhood ID:', neighborhoodId);
      setUserNeighborhoodId(neighborhoodId);
      
      // Fetch all reports
      const allReports = await reportService.getAggregatedReports(undefined, bypassCache);
      console.log('📊 [Reports] Total reports fetched:', allReports.length);
      
      // Filter reports to only show those from user's neighborhood
      const filteredReports = neighborhoodId 
        ? allReports.filter(report => {
            const match = report.neighborhoodId === neighborhoodId;
            if (!match) {
              console.log(`🔍 [Reports] Filtering out report from neighborhood ${report.neighborhoodId}`);
            }
            return match;
          })
        : allReports;
      
      console.log('📊 [Reports] Filtered reports (user\'s neighborhood only):', filteredReports.length);
      setReports(filteredReports);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      const errorMessage = err?.message || 'Failed to load reports. Please try again.';
      setError(errorMessage);
      throw err; // Re-throw to handle in calling function
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Bypass cache on initial load to ensure fresh data
    fetchReports(true);
  }, []);

  const startRefreshAnimation = () => {
    refreshRotation.setValue(0);
    Animated.loop(
      Animated.timing(refreshRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRefreshAnimation = () => {
    refreshRotation.stopAnimation();
    Animated.timing(refreshRotation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    startRefreshAnimation();
    
    try {
      // Bypass cache when explicitly refreshing
      await fetchReports(true);
      
      // Success notification
      setNotificationType('success');
      setNotificationTitle('Refresh Successful');
      setNotificationMessage('Reports have been updated with the latest data.');
      setShowNotification(true);
    } catch (error: any) {
      console.error('Refresh error:', error);
      // Error notification with actual error message
      setNotificationType('error');
      setNotificationTitle('Refresh Failed');
      setNotificationMessage(
        error?.message || 'Failed to update reports. Please check your connection and try again.'
      );
      setShowNotification(true);
    } finally {
      stopRefreshAnimation();
      setRefreshing(false);
    }
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

  // Generate year options dynamically
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = (currentYear - i).toString();
    return { label: year, value: year };
  });

  // Transform API data to grouped format by month-year
  const groupedReports = React.useMemo(() => {
    const grouped: {
      [key: string]: {
        id: string;
        documentName: string;
        dateAccomplished: string;
        type: string;
        pdfUrl: string;
        reportData: ReportData;
      }[];
    } = {};

    reports
      .filter(report => {
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch = 
            report.focalFirstName?.toLowerCase().includes(query) ||
            report.focalLastName?.toLowerCase().includes(query) ||
            report.alertType?.toLowerCase().includes(query) ||
            report.focalAddress?.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        // Filter by month and year
        const completionDate = report.completionDate;
        if (!completionDate) return false;

        const date = new Date(completionDate);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();

        if (selectedMonth !== 'all' && month !== selectedMonth) return false;
        if (selectedYear !== 'all' && year !== selectedYear) return false;

        return true;
      })
      .forEach(report => {
        const completionDate = report.completionDate;
        if (!completionDate) return;

        const date = new Date(completionDate);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const key = `${year}-${month}`;

        if (!grouped[key]) {
          grouped[key] = [];
        }

        // Create document name from report data
        const documentName = `${report.alertType || 'Rescue'} Report - ${report.focalFirstName} ${report.focalLastName}`;
        
        grouped[key].push({
          id: report.alertId,
          documentName,
          dateAccomplished: completionDate,
          type: report.alertType?.toLowerCase() || 'rescue',
          pdfUrl: '', // Will be generated when viewing
          reportData: report,
        });
      });

    return grouped;
  }, [reports, searchQuery, selectedMonth, selectedYear]);

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

  const handleViewDocument = async (documentId: string, documentName: string, pdfUrl: string) => {
    try {
      setGeneratingPDF(true);
      
      // Find the report data from our cached reports
      const reportData = reports.find(r => r.alertId === documentId);
      
      if (!reportData) {
        // If not found in cache, fetch detailed data
        console.log('Report not in cache, fetching detailed data...');
        const detailedData = await reportService.getDetailedReportData(documentId);
        
        // Generate PDF from the detailed data
        const pdfUri = await generateReportPDF(detailedData);
        
        setSelectedPDF({
          url: pdfUri,
          title: documentName,
        });
      } else {
        // Generate PDF from cached report data
        const pdfUri = await generateReportPDF(reportData);
        
        setSelectedPDF({
          url: pdfUri,
          title: documentName,
        });
      }
      
      setShowPDFViewer(true);
    } catch (error: any) {
      console.error('Error viewing document:', error);
      setNotificationType('error');
      setNotificationTitle('PDF Generation Failed');
      setNotificationMessage(
        error?.message || 'Failed to generate PDF. Please try again.'
      );
      setShowNotification(true);
    } finally {
      setGeneratingPDF(false);
    }
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
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white text-3xl font-geist-bold flex-1">
              Reports
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              disabled={refreshing}
              className="bg-gray-800 rounded-full p-3 border border-gray-600"
              activeOpacity={0.7}
              style={{
                opacity: refreshing ? 0.7 : 1,
              }}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: refreshRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}
              >
                <RefreshCw 
                  size={20} 
                  color={refreshing ? '#6B7280' : '#3B82F6'} 
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-400 text-base font-geist-regular">
            {userNeighborhoodId 
              ? `Showing reports from your neighborhood (${userNeighborhoodId}) - ${reports.length} total`
              : `View and analyze incident reports (${reports.length} total)`}
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
          {loading || generatingPDF ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-400 mt-4 font-geist-regular">
                {generatingPDF ? 'Generating PDF...' : 'Loading reports...'}
              </Text>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-red-400 text-center font-geist-regular mb-4">
                {error}
              </Text>
              <TouchableOpacity
                onPress={handleRefresh}
                disabled={refreshing}
                className="bg-primary rounded-xl px-6 py-3 flex-row items-center justify-center"
                style={{
                  opacity: refreshing ? 0.7 : 1,
                }}
              >
                {refreshing && (
                  <Animated.View
                    style={{
                      marginRight: 8,
                      transform: [
                        {
                          rotate: refreshRotation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    }}
                  >
                    <RefreshCw size={16} color="white" />
                  </Animated.View>
                )}
                <Text className="text-white font-geist-semibold">
                  {refreshing ? 'Retrying...' : 'Retry'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : Object.keys(groupedReports).length === 0 ? (
            <View className="flex-1 items-center justify-center py-20 px-6">
              <View className="bg-gray-800 rounded-2xl p-8 items-center max-w-md">
                <View className="bg-gray-700 rounded-full w-16 h-16 items-center justify-center mb-4">
                  <Text className="text-4xl">📋</Text>
                </View>
                <Text className="text-white text-xl font-geist-semibold mb-2 text-center">
                  No Reports Yet
                </Text>
                <Text className="text-gray-400 text-center font-geist-regular leading-6">
                  {userNeighborhoodId 
                    ? `Your neighborhood (${userNeighborhoodId}) doesn't have any completed incident reports yet. Reports will appear here once rescue operations are completed and documented.`
                    : 'No incident reports found. Reports will appear here once rescue operations are completed and documented.'}
                </Text>
              </View>
            </View>
          ) : (
            Object.entries(groupedReports)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([monthKey, monthReports]) => {
            const isCollapsed = collapsedSections[monthKey] ?? true;

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
              outputRange: ['180deg', '0deg'],
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
                        {monthReports.length} {monthReports.length === 1 ? 'report' : 'reports'}
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
                    {monthReports.map((report) => (
                      <ReportCardContainer
                        key={report.id}
                        id={report.id}
                        documentName={report.documentName}
                        dateAccomplished={report.dateAccomplished}
                        onViewDocument={handleViewDocument}
                        type={report.type}
                        pdfUrl={report.pdfUrl}
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

      {/* PDF Viewer Modal */}
      <Modal
        visible={showPDFViewer}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {selectedPDF && (
          <PDFViewer
            pdfUrl={selectedPDF.url}
            title={selectedPDF.title}
            onClose={() => {
              setShowPDFViewer(false);
              setSelectedPDF(null);
            }}
          />
        )}
      </Modal>

      {/* Refresh Notification */}
      <RefreshNotification
        visible={showNotification}
        type={notificationType}
        title={notificationTitle}
        message={notificationMessage}
        onDismiss={() => setShowNotification(false)}
      />
    </SafeAreaView>
  );
}
