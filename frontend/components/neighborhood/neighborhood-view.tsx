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
    <>
      {/* Neighborhood Information - Consolidated Section */}
      <View className="px-6" style={{ backgroundColor: '#171717' }}>
        <View className="rounded-xl p-6 mb-4" style={{ backgroundColor: '#1D1D1D' }}>
          <View className="gap-4">
            {/* Neighborhood ID */}
            <DetailRow label="Neighborhood ID" value={neighborhoodData.id} />

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

            {/* Terminal Address */}
            <DetailRow
              label="Terminal Address"
              value={neighborhoodData.terminalAddress}
            />

            {/* Coordinates */}
            <DetailRow
              label="Coordinates"
              value={`${neighborhoodData.coordinates.latitude}, ${neighborhoodData.coordinates.longitude}`}
            />

            {/* Approx. Residents */}
            <DetailRow
              label="Approximate Number of Residents"
              value={neighborhoodData.approxResidents || 'Not specified'}
            />

            {/* Approx. Households */}
            <DetailRow
              label="Approximate Number of Households"
              value={neighborhoodData.approxHouseholds || 'Not specified'}
            />

            {/* Floodwater Subsidence */}
            <DetailRow
              label="Floodwater Subsidence"
              value={neighborhoodData.floodwaterSubsidence}
            />
          </View>

          {/* Flood-Related Hazards */}
          <View className="mt-6">
            <Text className="text-gray-400 text-xs font-geist-medium tracking-widest uppercase mb-3">
              FLOOD-RELATED HAZARDS
            </Text>
            {neighborhoodData.floodRelatedHazards.map(
              (hazard: string, index: number) => (
                <View key={index} className="flex-row mb-2">
                  <Text className="text-white text-md font-geist-regular mr-2">
                    •
                  </Text>
                  <Text className="text-white text-md font-geist-regular flex-1 leading-6">
                    {getHazardLabel(hazard)}
                  </Text>
                </View>
              ),
            )}
          </View>

          {/* Other Notable Information */}
          <View className="mt-6">
            <Text className="text-gray-400 text-xs font-geist-medium tracking-widest uppercase mb-3">
              OTHER NOTABLE INFORMATION
            </Text>
            {neighborhoodData.notableInfo.map((info: string, index: number) => (
              <View key={index} className="flex-row mb-2">
                <Text className="text-white text-md font-geist-regular mr-2">
                  •
                </Text>
                <Text className="text-white text-md font-geist-regular flex-1 leading-6">
                  {info}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Focal Person Information */}
      <View className="px-6 pb-6" style={{ backgroundColor: '#171717' }}>
        <InfoCard title="FOCAL PERSON">
          <View className="gap-4">
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
              value={neighborhoodData.alternativeFocalPerson.name || 'Not specified'}
              showAvatar={!!neighborhoodData.alternativeFocalPerson.name}
            />
            <DetailRow
              label="Contact No."
              value={neighborhoodData.alternativeFocalPerson.contactNo || 'Not specified'}
            />
            <DetailRow
              label="Email"
              value={neighborhoodData.alternativeFocalPerson.email || 'Not specified'}
            />
          </View>
        </InfoCard>
      </View>
    </>
  );
};