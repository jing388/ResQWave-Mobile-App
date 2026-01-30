import { NeighborhoodData } from '@/types/neighborhood';
import React from 'react';
import { Text, View } from 'react-native';
import { formatDate } from '@/utils/formatters';
import { getHazardLabel } from '@/constants/neighborhood-options';

interface NeighborhoodViewProps {
  neighborhoodData: NeighborhoodData;
  DetailRow: React.ComponentType<{
    label: string;
    value: string | number;
    showAvatar?: boolean;
  }>;
  InfoCard: React.ComponentType<{
    title: string;
    children: React.ReactNode;
    className?: string;
  }>;
  Separator: React.ComponentType;
}

export const NeighborhoodView: React.FC<NeighborhoodViewProps> = ({
  neighborhoodData,
  DetailRow,
  InfoCard,
  Separator,
}) => {
  return (
    <View className="pb-6">
      {/* About The Neighborhood Section */}
      <View className="px-5 mb-4">
        <Text className="text-gray-400 text-xs font-geist-semibold tracking-widest uppercase mb-4">
          ABOUT THE NEIGHBORHOOD
        </Text>
        
        <View style={{ backgroundColor: '#1D1D1D' }} className="px-5 py-3">
          {/* Registered At */}
          <DetailRow
            label="Registered At"
            value={formatDate(neighborhoodData.registeredAt)}
          />

          {/* Terminal ID */}
          <DetailRow
            label="Terminal ID"
            value={neighborhoodData.terminalID}
          />

          {/* Terminal Name */}
          <DetailRow
            label="Terminal Name"
            value={neighborhoodData.name}
          />

          {/* Terminal Address */}
          <DetailRow
            label="Terminal Address"
            value={neighborhoodData.terminalAddress}
          />

          {/* Approx. No. of Households */}
          <DetailRow
            label="Approx. No. of Households"
            value={neighborhoodData.avgHouseholdSize.toString()}
          />

          {/* Approx. No. of Residents */}
          <DetailRow
            label="Approx. No. of Residents"
            value={neighborhoodData.approxResidents.toLocaleString()}
          />

          {/* Floodwater Subsidence Duration */}
          <DetailRow
            label="Floodwater Subsidence Duration"
            value={neighborhoodData.floodwaterSubsidence}
            isLast={true}
          />
        </View>
      </View>

      {/* Existing Flood-Related Hazards */}
      <View className="px-5 mb-4">
        <Text className="text-gray-400 text-xs font-geist-semibold tracking-widest uppercase mb-4">
          EXISTING FLOOD-RELATED HAZARDS
        </Text>
        {neighborhoodData.floodRelatedHazards && neighborhoodData.floodRelatedHazards.length > 0 ? (
          <View style={{ backgroundColor: '#1D1D1D' }} className="px-5 py-3 gap-2">
            {neighborhoodData.floodRelatedHazards.map(
              (hazard: string, index: number) => (
                <View key={index} className="flex-row items-start">
                  <View className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 mr-3" />
                  <Text className="text-gray-300 text-sm font-geist-regular flex-1 leading-5">
                    {getHazardLabel(hazard)}
                  </Text>
                </View>
              ),
            )}
          </View>
        ) : (
          <Text className="text-gray-400 text-sm font-geist-regular italic">
            No hazards reported
          </Text>
        )}
      </View>

      {/* Other Notable Information */}
      {neighborhoodData.notableInfo && neighborhoodData.notableInfo.length > 0 && (
        <View className="px-5 mb-4">
          <Text className="text-gray-400 text-xs font-geist-semibold tracking-widest uppercase mb-4">
            OTHER NOTABLE INFORMATION
          </Text>
          <View style={{ backgroundColor: '#1D1D1D' }} className="px-5 py-3 gap-2">
            {neighborhoodData.notableInfo.map((info: string, index: number) => (
              <View key={index} className="flex-row items-start">
                <View className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 mr-3" />
                <Text className="text-gray-300 text-sm font-geist-regular flex-1 leading-5">
                  {info}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Focal Person Information */}
      <View className="px-5 mb-4">
        <Text className="text-gray-400 text-xs font-geist-semibold tracking-widest uppercase mb-4">
          FOCAL PERSON
        </Text>
        
        <View style={{ backgroundColor: '#1D1D1D' }} className="px-5 py-3">
          <DetailRow
            label="Focal Person"
            value={neighborhoodData.focalPerson.name}
            showAvatar={true}
          />
          <DetailRow
            label="Contact No."
            value={neighborhoodData.focalPerson.contactNo}
          />
          <DetailRow
            label="Email"
            value={neighborhoodData.focalPerson.email}
          />
          <DetailRow
            label="Alternative Focal Person"
            value={neighborhoodData.alternativeFocalPerson.name}
            showAvatar={true}
          />
          <DetailRow
            label="Contact No."
            value={neighborhoodData.alternativeFocalPerson.contactNo}
          />
          <DetailRow
            label="Email"
            value={neighborhoodData.alternativeFocalPerson.email}
            isLast={true}
          />
        </View>
      </View>
    </View>
  );
};
