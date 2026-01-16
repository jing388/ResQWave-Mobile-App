import { BottomButtonContainer } from '@/components/ui/bottom-button-container';
import { colors } from '@/constants/colors';
import { authService } from '@/services/auth-service';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    View,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    PanResponder,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const userName = params.userName as string || 'User';
    
    // Parse neighborhoodName if it's a JSON string
    let neighborhoodName = params.neighborhoodName as string || 'your neighborhood';
    try {
        if (neighborhoodName && (neighborhoodName.startsWith('{') || neighborhoodName.startsWith('['))) {
            const addressObj = JSON.parse(neighborhoodName);
            neighborhoodName = addressObj.address || addressObj.name || neighborhoodName;
        }
    } catch (e) {
        // If parsing fails, use as-is
        console.log('NeighborhoodName is not JSON, using as-is');
    }
    
    const userAddress = params.userAddress as string || '';

    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Create animated values for each indicator with proper initial values
    const indicatorAnimations = useRef(
        Array.from({ length: 6 }, (_, index) => ({
            opacity: new Animated.Value(index === 0 ? 1 : 0.3),
        }))
    ).current;

    // Animate indicators when page changes
    useEffect(() => {
        indicatorAnimations.forEach((anim, index) => {
            if (index === currentPage) {
                // Active indicator: full opacity
                Animated.timing(anim.opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            } else {
                // Inactive indicator: reduced opacity
                Animated.timing(anim.opacity, {
                    toValue: 0.3,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }
        });
    }, [currentPage]);

    // Swipe gesture handler
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return Math.abs(gestureState.dx) > 10;
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dx > 50 && currentPage > 0) {
                // Swipe right - go back
                setCurrentPage(currentPage - 1);
            } else if (gestureState.dx < -50 && currentPage < onboardingPages.length - 1) {
                // Swipe left - go forward
                setCurrentPage(currentPage + 1);
            }
        },
    });

    const onboardingPages = [
        {
            id: 1,
            title: `Welcome, ${userName}!`,
            subtitle: `You're the focal person for\n${neighborhoodName}`,
            image: require('@/assets/images/onboardingPic.png'),
        },
        {
            id: 2,
            title: 'Stronger Signals, Safer Communities',
            subtitle: 'Welcome to ResQWave!\nYour community\'s emergency response partner.',
            image: require('@/assets/images/onboardingPic.png'),
        },
        {
            id: 3,
            title: 'See What\'s Happening',
            subtitle: 'View emergency alerts from neighboring communities. Stay aware of flooding and emergencies around you.',
            image: require('@/assets/images/onboardingPic.png'),
        },
        {
            id: 4,
            title: 'Manage Your Community Information',
            subtitle: 'Update your neighborhood details anytime. Accurate information helps your barangay respond faster during emergencies.',
            image: require('@/assets/images/onboardingPic.png'),
        },
        {
            id: 5,
            title: 'View Official Barangay Reports',
            subtitle: 'Check how your barangay responded to past emergencies, including rescue operations and resources used.',
            image: require('@/assets/images/onboardingPic.png'),
        },
        {
            id: 6,
            title: 'Meet Reskwie, Your AI Assistant',
            subtitle: 'Have questions about the app or your terminal? Chat with Reskwie anytime for quick help.',
            image: require('@/assets/images/onboardingPic.png'),
        },
    ];

    const handleNext = async () => {
        if (currentPage < onboardingPages.length - 1) {
            setCurrentPage(currentPage + 1);
        } else {
            // Complete onboarding and navigate to main app
            setIsLoading(true);
            try {
                await authService.completeOnboarding();
                router.replace('/(tabs)');
            } catch (error: any) {
                console.error('Failed to complete onboarding:', error);
                Alert.alert(
                    'Error',
                    'Failed to complete onboarding. Please try again.',
                );
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSkip = async () => {
        // Also complete onboarding when skipping
        setIsLoading(true);
        try {
            await authService.completeOnboarding();
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Failed to complete onboarding:', error);
            // Navigate anyway even if API fails
            router.replace('/(tabs)');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-900" edges={['top', 'left', 'right']}>
            {/* Gradient Background */}
            <LinearGradient
                colors={colors.gradients.background}
                className="absolute inset-0"
            />

            <StatusBar style="light" />

            <View className="flex-1">
                {/* Skip Button */}
                {currentPage < onboardingPages.length - 1 && (
                    <View className="items-end px-5 pt-2">
                        <TouchableOpacity
                            onPress={handleSkip}
                            disabled={isLoading}
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                            }}
                        >
                            <Text style={{ color: '#2A5A9F', fontSize: 16, fontWeight: '500' }}>
                                Skip
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Content */}
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1 items-center justify-center px-6 pt-10" {...panResponder.panHandlers}>
                        {/* Mascot Image */}
                        <View className="mb-6">
                            <Image
                                source={onboardingPages[currentPage].image}
                                style={{ width: width * 0.7, height: width * 0.7 }}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Title */}
                        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
                            {onboardingPages[currentPage].title}
                        </Text>

                        {/* Subtitle */}
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 }}>
                            {onboardingPages[currentPage].subtitle}
                        </Text>
                    </View>
                </ScrollView>
            </View>

            {/* Page Indicators - Positioned above button */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 130,
                    left: 0,
                    right: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                }}
            >
                {onboardingPages.map((_, index) => (
                    <Animated.View
                        key={index}
                        style={{
                            height: 8,
                            width: 8,
                            borderRadius: 4,
                            backgroundColor: index === currentPage ? '#3B82F6' : 'rgba(255, 255, 255, 0.3)',
                            opacity: indicatorAnimations[index].opacity,
                        }}
                    />
                ))}
            </View>

            {/* Bottom Button */}
            <BottomButtonContainer>
                <View style={{ paddingHorizontal: 12 }}>
                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={isLoading}
                        activeOpacity={0.8}
                        style={{
                            width: '100%',
                            borderRadius: 5,
                            overflow: 'hidden',
                        }}
                    >
                        <LinearGradient
                            colors={['#70A6FF', '#3B82F6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={{
                                paddingVertical: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text className="text-white text-base font-geist-semibold">
                                    {currentPage < onboardingPages.length - 1 ? 'Next' : 'Get Started'}
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </BottomButtonContainer>
        </SafeAreaView>
    );
}
