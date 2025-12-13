import { NeighborhoodData } from "@/types/neighborhood";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Pencil, Radio, X } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

interface AnimatedHeaderProps {
  scrollY: SharedValue<number>;
  neighborhoodData: NeighborhoodData;
  isEditMode: boolean;
  onEditPress: () => void;
  onCancelEdit?: () => void;
  onSubmitEdit?: () => void;
}

export const AnimatedHeader = ({
  scrollY,
  neighborhoodData,
  isEditMode,
  onEditPress,
  onCancelEdit,
  onSubmitEdit,
}: AnimatedHeaderProps) => {
  // Sticky header background/border style (only shows when scrolled)
  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 80],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      backgroundColor: "#111827",
      borderBottomWidth: 1,
      borderBottomColor: "#374151",
      paddingVertical: 10,
    };
  });

  // Collapsed navbar opacity (fade in when scrolling)
  const collapsedOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50],
      [0, 1],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  return (
    <Animated.View
      style={[
        stickyHeaderStyle,
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          height: 90,
        },
      ]}
    >
      {/* Collapsed Navbar Content - Only visible when scrolling */}
      <Animated.View
        style={[
          collapsedOpacity,
          {
            paddingHorizontal: 24,
            paddingVertical: 20,
            height: 70,
          },
        ]}
        pointerEvents={scrollY.value > 25 ? "auto" : "none"}
      >
        <View className="flex-row items-center gap-3">
          <View className="bg-gray-700 rounded-lg p-3">
            <Radio size={22} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-geist-semibold">
              {neighborhoodData.name}
            </Text>
            <Text className="text-gray-400 text-sm font-geist-regular mt-1">
              {neighborhoodData.coordinates.latitude},{" "}
              {neighborhoodData.coordinates.longitude}
            </Text>
          </View>
          {/* Edit Button or Cancel/Submit Buttons */}
          {!isEditMode ? (
            <TouchableOpacity
              className="bg-blue-500 rounded-lg p-3"
              onPress={onEditPress}
              activeOpacity={0.7}
            >
              <Pencil size={20} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="bg-gray-600 rounded-lg p-3"
                onPress={onCancelEdit}
                activeOpacity={0.7}
              >
                <X size={18} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-500 rounded-lg p-3"
                onPress={onSubmitEdit}
                activeOpacity={0.7}
              >
                <Check size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

interface StaticHeaderProps {
  neighborhoodData: NeighborhoodData;
  isEditMode: boolean;
  onEditPress: () => void;
  onCancelEdit?: () => void;
  onSubmitEdit?: () => void;
}

export const StaticHeader = ({
  neighborhoodData,
  isEditMode,
  onEditPress,
  onCancelEdit,
  onSubmitEdit,
}: StaticHeaderProps) => {
  return (
    <View className="px-6 pb-4">
      <View className="rounded-xl overflow-hidden border border-gray-700">
        <LinearGradient
          colors={["#2A426B", "#335082"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="bg-white-700 rounded-lg p-3">
              <Radio size={22} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-2xl font-geist-semibold">
                {neighborhoodData.name}
              </Text>
              <Text className="text-gray-400 text-sm font-geist-regular mt-1">
                {neighborhoodData.coordinates.latitude},{" "}
                {neighborhoodData.coordinates.longitude}
              </Text>
            </View>
            {/* Edit Button or Cancel/Submit Buttons */}
            {!isEditMode ? (
              <TouchableOpacity
                className="bg-blue-500 rounded-lg p-3"
                onPress={onEditPress}
                activeOpacity={0.7}
              >
                <Pencil size={20} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="bg-gray-600 rounded-lg p-3"
                  onPress={onCancelEdit}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-green-500 rounded-lg p-3"
                  onPress={onSubmitEdit}
                  activeOpacity={0.7}
                >
                  <Check size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};
