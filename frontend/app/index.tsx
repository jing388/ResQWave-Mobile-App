import { BottomButtonContainer } from '@/components/ui/bottom-button-container';
import CustomButton from '@/components/ui/custom-button';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={colors.gradients.background}
      start={{ x: 0.5, y: 0.2 }}
      end={{ x: 0.8, y: 0.8 }}
      className="flex-1"
    >
      <View className="flex-1 px-6 relative">
        {/* Main content - centered */}
        <View className="flex-1 items-center justify-center">
          <Image
            source={require('@/assets/images/resqwave-logo.png')}
            className="w-16 h-16 mb-4"
          />
          <Text className="font-geist-semibold text-text-primary text-4xl leading-[1.5] text-center mb-12">
            Stronger Signals,{'\n'}Safer Communities.
          </Text>
        </View>

        {/* Fixed Bottom Area */}
        <BottomButtonContainer>
          <CustomButton
            title="Login"
            onPress={() => router.push('/login')}
            variant="gradient-accent"
            size="lg"
            width="full"
          />
        </BottomButtonContainer>
      </View>
    </LinearGradient>
  );
}
