import { Text, View } from "react-native";

interface DetailRowProps {
  label: string;
  value: string | number;
  showAvatar?: boolean;
  isLast?: boolean;
}

export const DetailRow = ({ label, value, showAvatar, isLast }: DetailRowProps) => (
  <View>
    <View className="flex-row justify-between items-center py-3">
      <Text className="text-white text-sm font-geist-regular flex-shrink leading-5">
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
        <Text className="text-white text-sm font-geist-regular text-right leading-5">
          {value}
        </Text>
      </View>
    </View>
    {!isLast && <View style={{ backgroundColor: '#333333', height: 0.5 }} />}
  </View>
);
