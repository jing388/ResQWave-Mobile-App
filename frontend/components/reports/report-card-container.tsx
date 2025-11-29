import { ChevronRight, FileText } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ReportCardContainerProps {
  id: string;
  documentName: string;
  dateAccomplished: string;
  onViewDocument: (id: string, documentName: string) => void;
  type?: string;
}

export function ReportCardContainer({
  id,
  documentName,
  dateAccomplished,
  onViewDocument,
  type
}: ReportCardContainerProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <TouchableOpacity 
      className="bg-gray-800 rounded-xl border border-gray-600 p-4 mb-3"
      onPress={() => onViewDocument(id, documentName)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="bg-primary/20 rounded-lg p-2 mr-3">
          <FileText size={20} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-50 text-base font-geist-medium mb-1">
            {documentName}
          </Text>
          <Text className="text-gray-400 text-xs font-geist-regular">
            Completed on {formatDate(dateAccomplished)}
          </Text>
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}
