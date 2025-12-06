import {
  availableHazards,
  dropdownOptions,
} from '@/constants/neighborhood-options';
import {
  fetchNeighborhoodData,
  updateNeighborhoodData,
} from '@/services/neighborhood-service';
import {
  EditedData,
  FloodHazard,
  NeighborhoodData,
} from '@/types/neighborhood';
import { useEffect, useState } from 'react';

export interface UseNeighborhoodDataReturn {
  isEditMode: boolean;
  isLoading: boolean;
  neighborhoodData: NeighborhoodData | null;
  editedData: EditedData;
  dropdownOptions: typeof dropdownOptions;
  handleEditPress: () => void;
  handleCancelEdit: () => void;
  handleSubmitEdit: () => Promise<void>;
  handleDropdownChange: (field: string, value: string) => void;
  handleHazardToggle: (index: number) => void;
  handleNotableInfoChange: (text: string) => void;
  handleAlternativeFocalChange: (field: string, value: string) => void;
}

export const useNeighborhoodData = (neighborhoodId?: string | null): UseNeighborhoodDataReturn => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [neighborhoodData, setNeighborhoodData] =
    useState<NeighborhoodData | null>(null);

  // Editable data state
  const [editedData, setEditedData] = useState<EditedData>({
    approxHouseholds: 0,
    approxResidents: 0,
    avgHouseholdSize: 0,
    floodwaterSubsidence: '',
    floodRelatedHazards: [] as FloodHazard[],
    notableInfo: '',
    alternativeFocalPerson: {
      firstName: '',
      lastName: '',
      contactNo: '',
      email: '',
    },
  });

  // Fetch neighborhood data from backend
  useEffect(() => {
    const loadData = async () => {
      // Don't fetch if neighborhoodId is still being determined
      if (neighborhoodId === undefined) {
        console.log('NeighborhoodId is undefined, skipping fetch');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching neighborhood data for:', neighborhoodId);
        const data = await fetchNeighborhoodData(neighborhoodId);

        if (!data) {
          console.error('No neighborhood data returned');
          return;
        }

        setNeighborhoodData(data);

        // Initialize edited data with fetched data
        setEditedData({
          approxHouseholds: data.approxHouseholds,
          approxResidents: data.approxResidents,
          avgHouseholdSize: data.avgHouseholdSize,
          floodwaterSubsidence: data.floodwaterSubsidence,
          floodRelatedHazards: availableHazards.map((hazard) => ({
            label: hazard,
            checked: data.floodRelatedHazards.some(
              (h) => hazard.includes(h) || h.includes(hazard.split(' (')[0]),
            ),
          })),
          notableInfo: data.notableInfo.join('\n'),
          alternativeFocalPerson: {
            firstName: data.alternativeFocalPerson.name.split(' ')[0] || '',
            lastName:
              data.alternativeFocalPerson.name.split(' ').slice(1).join(' ') ||
              '',
            contactNo: data.alternativeFocalPerson.contactNo || '',
            email: data.alternativeFocalPerson.email || '',
            avatar: data.alternativeFocalPerson.avatar,
          },
        });
      } catch (error) {
        console.error('Error fetching neighborhood data:', error);
        // Check if it's a 404 error (no neighborhood assigned)
        if (error instanceof Error && error.message.includes('Neighborhood Not Found')) {
          console.log('User has no neighborhood assigned - this is expected for new users');
        } else {
          console.error('Unexpected error fetching neighborhood data:', error);
        }
        // Don't throw error, just leave neighborhoodData as null
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [neighborhoodId]);

  // Handler functions
  const handleEditPress = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset edited data to original values from fetched data
    if (neighborhoodData) {
      setEditedData({
        approxHouseholds: neighborhoodData.approxHouseholds,
        approxResidents: neighborhoodData.approxResidents,
        avgHouseholdSize: neighborhoodData.avgHouseholdSize,
        floodwaterSubsidence: neighborhoodData.floodwaterSubsidence,
        floodRelatedHazards: availableHazards.map((hazard) => ({
          label: hazard,
          checked: neighborhoodData.floodRelatedHazards.some(
            (h) => hazard.includes(h) || h.includes(hazard.split(' (')[0]),
          ),
        })),
        notableInfo: neighborhoodData.notableInfo.join('\n'),
        alternativeFocalPerson: {
          firstName:
            neighborhoodData.alternativeFocalPerson.name.split(' ')[0] || '',
          lastName:
            neighborhoodData.alternativeFocalPerson.name
              .split(' ')
              .slice(1)
              .join(' ') || '',
          contactNo: neighborhoodData.alternativeFocalPerson.contactNo || '',
          email: neighborhoodData.alternativeFocalPerson.email || '',
          avatar: neighborhoodData.alternativeFocalPerson.avatar,
        },
      });
    }
  };

  const handleSubmitEdit = async () => {
    try {
      if (!neighborhoodData) return;

      // Prepare data for API
      const updatedDataParams = {
        neighborhoodId: neighborhoodData.id,
        approxHouseholds: editedData.approxHouseholds,
        approxResidents: editedData.approxResidents,
        avgHouseholdSize: editedData.avgHouseholdSize,
        floodwaterSubsidence: editedData.floodwaterSubsidence,
        floodRelatedHazards: editedData.floodRelatedHazards
          .filter((h) => h.checked)
          .map((h) => h.label.split(' (')[0]),
        notableInfo: editedData.notableInfo
          .split('\n')
          .filter((line) => line.trim() !== ''),
      };

      await updateNeighborhoodData(updatedDataParams);

      // Update local state with new data
      const now = new Date().toISOString();
      setNeighborhoodData({
        ...neighborhoodData,
        approxHouseholds: updatedDataParams.approxHouseholds,
        approxResidents: updatedDataParams.approxResidents,
        avgHouseholdSize: updatedDataParams.avgHouseholdSize,
        floodwaterSubsidence: updatedDataParams.floodwaterSubsidence,
        floodRelatedHazards: updatedDataParams.floodRelatedHazards,
        notableInfo: updatedDataParams.notableInfo,
        lastUpdatedAt: now,
      });

      setIsEditMode(false);
      // TODO: Show success message to user
    } catch (error) {
      console.error('Error updating neighborhood data:', error);
      // TODO: Show error message to user
    }
  };

  const handleDropdownChange = (field: string, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]:
        field === 'approxHouseholds' || field === 'approxResidents'
          ? parseInt(value)
          : field === 'avgHouseholdSize'
            ? parseFloat(value)
            : value,
    }));
  };

  const handleHazardToggle = (index: number) => {
    setEditedData((prev) => ({
      ...prev,
      floodRelatedHazards: prev.floodRelatedHazards.map((hazard, i) =>
        i === index ? { ...hazard, checked: !hazard.checked } : hazard,
      ),
    }));
  };

  const handleNotableInfoChange = (text: string) => {
    setEditedData((prev) => ({
      ...prev,
      notableInfo: text,
    }));
  };

  const handleAlternativeFocalChange = (field: string, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      alternativeFocalPerson: {
        ...prev.alternativeFocalPerson,
        [field]: value,
      },
    }));
  };

  return {
    isEditMode,
    isLoading,
    neighborhoodData,
    editedData,
    dropdownOptions,
    handleEditPress,
    handleCancelEdit,
    handleSubmitEdit,
    handleDropdownChange,
    handleHazardToggle,
    handleNotableInfoChange,
    handleAlternativeFocalChange,
  };
};
