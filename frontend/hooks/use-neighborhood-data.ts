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

export interface NotificationState {
  visible: boolean;
  type: 'success' | 'error';
  message: string;
  title?: string;
}

export interface UseNeighborhoodDataReturn {
  isEditMode: boolean;
  isLoading: boolean;
  neighborhoodData: NeighborhoodData | null;
  editedData: EditedData;
  dropdownOptions: typeof dropdownOptions;
  notification: NotificationState;
  dismissNotification: () => void;
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
  const [notification, setNotification] = useState<NotificationState>({
    visible: false,
    type: 'success',
    message: '',
    title: '',
  });

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
  // For data privacy compliance, we ALWAYS fetch the user's OWN neighborhood
  // The neighborhoodId parameter is only used to verify it matches the user's own neighborhood
  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 [use-neighborhood-data] ========================================');
      console.log('🔄 [use-neighborhood-data] Effect triggered with neighborhoodId:', neighborhoodId);
      
      // Don't fetch if neighborhoodId is still being determined
      if (neighborhoodId === undefined) {
        console.log('🔍 [use-neighborhood-data] NeighborhoodId is undefined, skipping fetch');
        console.log('🔄 [use-neighborhood-data] ========================================');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Clear previous data to prevent showing stale data
        setNeighborhoodData(null);
        
        // IMPORTANT: For data privacy, we ALWAYS fetch the user's OWN neighborhood
        // by passing null/undefined, which uses the /neighborhood/own endpoint
        console.log('🔍 [use-neighborhood-data] Fetching user\'s OWN neighborhood data');
        console.log('🔍 [use-neighborhood-data] Requested ID:', neighborhoodId);
        console.log('🔍 [use-neighborhood-data] Calling fetchNeighborhoodData with null (own neighborhood)...');
        
        // Always fetch own neighborhood for data privacy compliance
        const data = await fetchNeighborhoodData(null);

        if (!data) {
          console.error('❌ No neighborhood data returned for user\'s own neighborhood');
          setNeighborhoodData(null);
          return;
        }

        // Verify if the requested neighborhood matches the user's own neighborhood
        if (neighborhoodId && data.id !== neighborhoodId) {
          console.warn('⚠️ [use-neighborhood-data] User requested:', neighborhoodId, 'but owns:', data.id);
          console.warn('⚠️ [use-neighborhood-data] Access denied - can only view own neighborhood');
          // Still show own neighborhood data (don't allow viewing other neighborhoods)
        }

        console.log('✅ [use-neighborhood-data] Successfully fetched data for:', data.id, data.name);
        console.log('📊 [use-neighborhood-data] Full data:', JSON.stringify({
          id: data.id,
          name: data.name,
          terminalID: data.terminalID,
          approxResidents: data.approxResidents,
          focalPerson: data.focalPerson.name
        }, null, 2));
        console.log('🔄 [use-neighborhood-data] ========================================');
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
          },
        });
      } catch (error: any) {
        console.error('❌ [use-neighborhood-data] Error fetching neighborhood data:', error);
        console.error('❌ [use-neighborhood-data] Error message:', error?.message);
        
        // Check if it's a 404 error (neighborhood doesn't exist)
        if (error instanceof Error && (error.message.includes('Neighborhood Not Found') || error.message.includes('404'))) {
          console.error('❌ [use-neighborhood-data] Neighborhood not found:', neighborhoodId);
          console.error('❌ [use-neighborhood-data] This neighborhood may not exist in the database');
        } else {
          console.error('❌ [use-neighborhood-data] Unexpected error:', error);
        }
        
        // Set neighborhood data to null to show "No Neighborhood Selected" message
        setNeighborhoodData(null);
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
        approxHouseholds: typeof editedData.approxHouseholds === 'string' 
          ? parseInt(editedData.approxHouseholds) || 0
          : editedData.approxHouseholds,
        approxResidents: typeof editedData.approxResidents === 'string' 
          ? parseInt(editedData.approxResidents) || 0
          : editedData.approxResidents,
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
        approxHouseholds: typeof updatedDataParams.approxHouseholds === 'number' 
          ? updatedDataParams.approxHouseholds
          : parseInt(updatedDataParams.approxHouseholds) || 0,
        approxResidents: typeof updatedDataParams.approxResidents === 'number'
          ? updatedDataParams.approxResidents
          : parseInt(updatedDataParams.approxResidents) || 0,
        avgHouseholdSize: updatedDataParams.avgHouseholdSize,
        floodwaterSubsidence: updatedDataParams.floodwaterSubsidence,
        floodRelatedHazards: updatedDataParams.floodRelatedHazards,
        notableInfo: updatedDataParams.notableInfo,
        lastUpdatedAt: now,
      });

      setIsEditMode(false);
      
      // Show success notification
      setNotification({
        visible: true,
        type: 'success',
        title: 'Update Successful',
        message: 'Neighborhood information updated successfully.',
      });
    } catch (error) {
      console.error('Error updating neighborhood data:', error);
      
      // Show error notification
      setNotification({
        visible: true,
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update neighborhood information. Please try again.',
      });
    }
  };

  const dismissNotification = () => {
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  const handleDropdownChange = (field: string, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]:
        field === 'approxHouseholds' || field === 'approxResidents'
          ? value.includes('(custom)') 
            ? value // Keep custom values as-is
            : value.includes('-') 
              ? value // Keep range values as strings
              : parseInt(value) // Convert individual numbers
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
    notification,
    dismissNotification,
    handleEditPress,
    handleCancelEdit,
    handleSubmitEdit,
    handleDropdownChange,
    handleHazardToggle,
    handleNotableInfoChange,
    handleAlternativeFocalChange,
  };
};
