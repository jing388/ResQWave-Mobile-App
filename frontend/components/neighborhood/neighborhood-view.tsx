import { NeighborhoodData } from '@/types/neighborhood';
import React from 'react';
import { Text, View } from 'react-native';
import { formatDate } from '@/utils/formatters';

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
      <View className="px-6">
        <InfoCard title="NEIGHBORHOOD INFORMATION">
          <View className="gap-4 mt-4">
            {/* Neighborhood ID */}
            <DetailRow label="Neighborhood ID" value={neighborhoodData.id} />
            <Separator />

            {/* Registered At */}
            <DetailRow
              label="Registered At"
              value={formatDate(neighborhoodData.registeredAt)}
            />
            <Separator />

            {/* Terminal ID */}
            <DetailRow
              label="Terminal ID"
              value={neighborhoodData.terminalID}
            />
            <Separator />

            {/* Terminal Address */}
            <DetailRow
              label="Terminal Address"
              value={neighborhoodData.terminalAddress}
            />
            <Separator />

            {/* Coordinates */}
            <DetailRow
              label="Coordinates"
              value={`${neighborhoodData.coordinates.latitude}, ${neighborhoodData.coordinates.longitude}`}
            />
            <Separator />

            {/* Approx. Residents */}
            <DetailRow
              label="Approximate Number of Residents"
              value={neighborhoodData.approxResidents.toLocaleString()}
            />
            <Separator />

            {/* Avg. Household Size */}
            <DetailRow
              label="Approximate Number of Household"
              value={`${neighborhoodData.avgHouseholdSize} members`}
            />
            <Separator />

            {/* Floodwater Subsidence */}
            <DetailRow
              label="Floodwater Subsidence"
              value={neighborhoodData.floodwaterSubsidence}
            />
          </View>

          {/* Flood-Related Hazards */}
          <View className="mt-6">
            <Text className="text-text-muted text-sm font-geist-medium spacing-10 tracking-wide mb-3">
              FLOOD-RELATED HAZARDS
            </Text>
            {neighborhoodData.floodRelatedHazards.map(
              (hazard: string, index: number) => (
                <View key={index} className="flex-row mb-2">
                  <Text className="text-white text-md font-geist-regular mr-2">
                    •
                  </Text>
                  <Text className="text-white text-md font-geist-regular flex-1 leading-6">
                    {hazard}
                  </Text>
                </View>
              ),
            )}
          </View>

          {/* Other Notable Information */}
          <View className="mt-4">
            <Text className="text-text-muted text-sm font-geist-medium spacing-10 tracking-wide mb-3">
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
        </InfoCard>
      </View>

      {/* Focal Person Information */}
      <View className="px-6 mb-2">
        <InfoCard title="FOCAL PERSON">
          <View className="gap-4 mt-4">
            <DetailRow
              label="Focal Person"
              value={neighborhoodData.focalPerson.name}
              showAvatar={true}
            />
            <Separator />
            <DetailRow
              label="Contact No."
              value={neighborhoodData.focalPerson.contactNo}
            />
            <Separator />
            <DetailRow
              label="Email"
              value={neighborhoodData.focalPerson.email}
            />
            <Separator />
            <DetailRow
              label="Alternative Focal Person"
              value={neighborhoodData.alternativeFocalPerson.name}
              showAvatar={true}
            />
            <Separator />
            <DetailRow
              label="Contact No."
              value={neighborhoodData.alternativeFocalPerson.contactNo}
            />
            <Separator />
            <DetailRow
              label="Email"
              value={neighborhoodData.alternativeFocalPerson.email}
            />
          </View>
        </InfoCard>
      </View>
    </>
  );
};
