import React from 'react';
import { Text, View } from 'react-native';

export interface LogChange {
  field: string;
  oldValue: string;
  newValue: string;
}

interface LogCardProps {
  userName: string;
  time: string;
  changes: LogChange[];
}

export function LogCard({ userName, time, changes }: LogCardProps) {
  return (
    <View className="bg-gray-800 rounded-xl p-4 mb-3 border border-gray-700">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-50 text-base font-geist-medium flex-1">
          {userName} updated neighborhood information.
        </Text>
        <Text className="text-gray-400 text-sm font-geist-regular ml-2">
          {time}
        </Text>
      </View>

      {/* Changes List */}
      <View className="gap-2">
        {changes.map((change, index) => (
          <View key={index} className="flex-row">
            <Text className="text-gray-400 font-geist-regular text-sm">
              {index + 1}.{' '}
            </Text>
            <View className="flex-1">
              <Text className="text-gray-400 font-geist-regular text-sm">
                <Text className="text-gray-300 font-geist-medium">
                  {change.field}:{' '}
                </Text>
                <Text className="text-red-400">{change.oldValue}</Text>
                <Text className="text-gray-500"> → </Text>
                <Text className="text-green-400">{change.newValue}</Text>
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
