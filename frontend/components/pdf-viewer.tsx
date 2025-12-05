import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { X, Download, Share2 } from 'lucide-react-native';

interface PDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
  title?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, onClose, title = 'PDF Document' }) => {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const downloadResumableRef = useRef<any>(null);

  // Add debugging for the received URL
  console.log('PDFViewer initialized with URL:', pdfUrl);

  const checkAndLoadPDF = useCallback(async () => {
    try {
      console.log('checkAndLoadPDF called with URL:', pdfUrl);
      
      // Validate URL
      if (!pdfUrl || typeof pdfUrl !== 'string') {
        throw new Error('Invalid PDF URL provided');
      }
      
      // Check if PDF is online or local
      if (pdfUrl.startsWith('http')) {
        // Online PDF - try to cache it
        await cachePDF(pdfUrl);
        setIsOnline(true);
      } else {
        // Local PDF
        setLocalUri(pdfUrl);
        setIsOnline(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in checkAndLoadPDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load PDF';
      setError(errorMessage);
      setLoading(false);
    }
  }, [pdfUrl]);

  useEffect(() => {
    checkAndLoadPDF();
    
    // Cleanup function
    return () => {
      // Cancel any ongoing download
      if (downloadResumableRef.current) {
        downloadResumableRef.current.pauseAsync();
      }
    };
  }, [checkAndLoadPDF]);

  const cachePDF = async (url: string) => {
    try {
      // Create a unique filename from the URL
      const filename = url.split('/').pop() || 'document.pdf';
      // Use type assertion to access File System properties
      const fs = FileSystem as any;
      const localPath = `${fs.cacheDirectory || fs.documentDirectory || ''}${filename}`;
      
      // Check if file already exists and is not empty
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      
      if (fileInfo.exists && fileInfo.size > 0) {
        // File exists and has content, use it
        console.log('Using cached PDF:', localPath);
        // For WebView, we'll try the online URL first since local files are problematic
        setLocalUri(url); // Use original URL instead of local file
        setLoading(false);
        return;
      }
      
      console.log('Downloading PDF to cache:', localPath);
      // Ensure loading is true during download
      setLoading(true);
      
      // Try using the new downloadAsync method first
      try {
        const downloadResult = await FileSystem.downloadAsync(url, localPath);
        if (downloadResult.status === 200 && downloadResult.uri) {
          console.log('PDF downloaded successfully:', downloadResult.uri);
          setLocalUri(downloadResult.uri);
          setLoading(false);
          return;
        }
      } catch (downloadError) {
        console.warn('downloadAsync failed, trying createDownloadResumable:', downloadError);
      }
      
      // Fallback to createDownloadResumable
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localPath,
        {},
        (downloadProgressInfo) => {
          // Optional: Add progress tracking here
          const progress = downloadProgressInfo.totalBytesWritten / downloadProgressInfo.totalBytesExpectedToWrite;
          console.log(`Download progress: ${Math.round(progress * 100)}%`);
        }
      );
      
      downloadResumableRef.current = downloadResumable;
      
      const result = await downloadResumable.downloadAsync();
      if (result && result.status === 200) {
        console.log('PDF downloaded successfully via resumable:', result.uri);
        setLocalUri(result.uri);
        setLoading(false);
      } else {
        throw new Error(`Download failed with status: ${result?.status || 'unknown'}`);
      }
    } catch (error) {
      console.error('PDF caching error:', error);
      // If caching fails, try to load directly from URL
      console.log('Falling back to direct URL loading');
      setLocalUri(url);
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      let fileToShare = localUri;
      
      // If we don't have a local file, try to download it first
      if (!fileToShare && pdfUrl) {
        const filename = pdfUrl.split('/').pop() || 'document.pdf';
        const fs = FileSystem as any;
        const tempPath = `${fs.cacheDirectory || ''}${filename}`;
        
        try {
          const downloadResult = await FileSystem.downloadAsync(pdfUrl, tempPath);
          if (downloadResult.status === 200) {
            fileToShare = downloadResult.uri;
          }
        } catch (error) {
          console.warn('Could not download for sharing:', error);
          Alert.alert('Error', 'Could not prepare PDF for sharing');
          return;
        }
      }
      
      if (fileToShare) {
        await Sharing.shareAsync(fileToShare, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share PDF',
        });
      } else {
        Alert.alert('Error', 'No PDF available to share');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share PDF');
    }
  };

  const handleDownload = async () => {
    if (!pdfUrl) {
      Alert.alert('Error', 'No PDF URL available for download');
      return;
    }

    try {
      setLoading(true);
      const filename = pdfUrl.split('/').pop() || 'document.pdf';
      
      // For Android, use Downloads directory; for iOS, use Documents directory
      let downloadPath;
      if (Platform.OS === 'android') {
        // Try to use Downloads directory on Android
        const fs = FileSystem as any;
        downloadPath = `${fs.downloadDirectory || fs.documentDirectory || ''}${filename}`;
      } else {
        // iOS - use Documents directory
        const fs = FileSystem as any;
        downloadPath = `${fs.documentDirectory || ''}${filename}`;
      }
      
      console.log('Starting download to:', downloadPath);
      
      // Check if file already exists
      const fileInfo = await FileSystem.getInfoAsync(downloadPath);
      if (fileInfo.exists) {
        Alert.alert(
          'File Exists',
          'This PDF already exists on your device. Would you like to share it instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Share', onPress: handleShare }
          ]
        );
        setLoading(false);
        return;
      }
      
      // Download the PDF
      const downloadResult = await FileSystem.downloadAsync(pdfUrl, downloadPath);
      
      if (downloadResult.status === 200) {
        console.log('Download successful:', downloadResult.uri);
        
        // For Android, make the file accessible
        if (Platform.OS === 'android') {
          try {
            // Request media permissions on Android
            await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'PDFs', { intermediates: true }).catch(() => {});
            const finalPath = `${FileSystem.documentDirectory}PDFs/${filename}`;
            await FileSystem.moveAsync({
              from: downloadResult.uri,
              to: finalPath
            });
            
            Alert.alert(
              'Download Complete',
              `PDF saved as "${filename}" in your device storage.`,
              [
                { text: 'OK' },
                { text: 'Share', onPress: () => handleShare() }
              ]
            );
          } catch (moveError) {
            console.warn('Could not move to PDFs folder, using original location:', moveError);
            Alert.alert('Download Complete', `PDF saved as "${filename}"`);
          }
        } else {
          // iOS
          Alert.alert(
            'Download Complete', 
            `PDF saved as "${filename}" in your Documents folder.`,
            [
              { text: 'OK' },
              { text: 'Share', onPress: () => handleShare() }
            ]
          );
        }
        
        setLoading(false);
      } else {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Download Failed', `Failed to download PDF: ${errorMessage}`);
      setLoading(false);
    }
  };

  const renderPDF = () => {
    console.log('renderPDF called - loading:', loading, 'error:', error, 'localUri:', localUri);
    
    if (error) {
      console.log('Showing error state with retry button');
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              console.log('Retry button pressed, reloading PDF');
              setError(null);
              setLoading(true);
              checkAndLoadPDF();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      );
    }

    if (localUri) {
      console.log('Rendering WebView with URI:', localUri);
      
      // Try Google Docs Viewer for more reliable PDF rendering
      let source;
      if (localUri.startsWith('http')) {
        // Use Google Docs Viewer for online PDFs
        const googleViewerUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(localUri)}`;
        console.log('Using Google Docs Viewer:', googleViewerUrl);
        source = { uri: googleViewerUrl };
      } else {
        // Local PDF - try different approaches
        if (localUri.startsWith('file://')) {
          source = { uri: localUri };
        } else {
          source = { uri: `file://${localUri}` };
        }
      }
      
      console.log('WebView source:', source);
      
      return (
        <WebView
          ref={webViewRef}
          source={source}
          style={styles.webView}
          originWhitelist={['*']}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          scalesPageToFit={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}
          bounces={false}
          scrollEnabled={true}
          onError={(syntheticEvent) => {
            console.error('WebView error:', syntheticEvent);
            const { nativeEvent } = syntheticEvent;
            console.error('WebView native error:', nativeEvent);
            
            // Always set error state when WebView fails
            console.log('Setting error state due to WebView failure');
            setError('Failed to load PDF - Please try again');
            setLoading(false);
          }}
          onLoad={() => {
            console.log('WebView loaded successfully');
            setLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('HTTP Error:', nativeEvent);
            if (nativeEvent.statusCode >= 400) {
              setError(`Failed to load PDF (HTTP ${nativeEvent.statusCode})`);
              setLoading(false);
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading PDF...</Text>
            </View>
          )}
        />
      );
    }

    // If we get here, there's no localUri and no error - show error state
    console.log('No localUri and no error, showing error state');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No PDF to display</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            console.log('Retry button pressed, reloading PDF');
            setError(null);
            setLoading(true);
            checkAndLoadPDF();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {isOnline && (
            <TouchableOpacity onPress={handleDownload} style={styles.actionButton}>
              <Download size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Share2 size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* PDF Content */}
      <View style={styles.content}>
        {renderPDF()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
