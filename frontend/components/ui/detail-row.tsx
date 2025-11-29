import { Text, View } from "react-native";

interface DetailRowProps {
  label: string;
  value: string | number;
  showAvatar?: boolean;
}

export const DetailRow = ({ label, value, showAvatar }: DetailRowProps) => (
  <View className="flex-row justify-between gap-4">
    <Text
      className="text-white text-base font-geist-medium flex-shrink-0"
      style={{ width: "35%" }}
    >
      {label}
    </Text>
    <View className="flex-1 flex-row items-center justify-end gap-2">
      {showAvatar && (
        <View className="w-6 h-6 rounded-full bg-gray-600 items-center justify-center">
          <Text className="text-white text-xs font-geist-semibold">
            {String(value).charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text className="text-white text-base font-geist-regular text-right">
        {value}
      </Text>
    </View>
  </View>
);
