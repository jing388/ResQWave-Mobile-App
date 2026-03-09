import {
  availableHazards,
  dropdownOptions,
} from '@/constants/neighborhood-options';
import {
  fetchNeighborhoodData,
  updateNeighborhoodData,
} from '@/services/neighborhood-service';
import {
  loadFamilyDetails,
  saveFamilyDetails,
  PersistedFamilyDetail,
} from '@/services/neighborhood-persistence';
import {
  EditedData,
  Family,
  FamilyMember,
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
  isSubmitting: boolean;
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
  // family handlers
  handleAddFamily: () => void;
  handleDeleteFamily: (id: string) => void;
  handleRenameFamilyStart: (id: string) => void;
  handleRenameFamilyCommit: (id: string, newName: string) => void;
  handleToggleFamilyExpand: (id: string) => void;
  // family member handlers
  handleAddMember: (familyId: string) => void;
  handleDeleteMember: (familyId: string, memberId: string) => void;
  handleRenameMemberStart: (familyId: string, memberId: string) => void;
  handleRenameMemberCommit: (familyId: string, memberId: string, newName: string) => void;
}

export const useNeighborhoodData = (neighborhoodId?: string | null): UseNeighborhoodDataReturn => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    families: [] as Family[],
    alternativeFocalPerson: {
      firstName: '',
      lastName: '',
      contactNo: '',
      email: '',
    },
  });

  const mapPersistedFamiliesToEditable = (persistedFamilies: PersistedFamilyDetail[]): Family[] => {
    return persistedFamilies.map((family, familyIdx) => ({
      id: `family_${familyIdx}_${Date.now()}`,
      name: family.familyName,
      members: family.members.map((member, memberIdx) => ({
        id: `member_${familyIdx}_${memberIdx}_${Date.now()}`,
        name: member,
        editing: false,
      })),
      expanded: false,
      editing: false,
    }));
  };

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

        const persistedFamilyDetails = await loadFamilyDetails(data.id);
        const editableFamilies = mapPersistedFamiliesToEditable(persistedFamilyDetails);

        setNeighborhoodData({
          ...data,
          familyDetails: persistedFamilyDetails,
        });

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
          families: editableFamilies,
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
      const persistedFamilies = neighborhoodData.familyDetails || [];
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
        families: mapPersistedFamiliesToEditable(persistedFamilies),
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
    if (isSubmitting) return;
    setIsSubmitting(true);

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
        alternativeFocalPerson: editedData.alternativeFocalPerson,
      };

      const normalizedCurrentHazards = [...neighborhoodData.floodRelatedHazards]
        .map((h) => h.split(' (')[0])
        .sort();
      const normalizedNextHazards = [...updatedDataParams.floodRelatedHazards].sort();
      const normalizedCurrentNotableInfo = neighborhoodData.notableInfo
        .map((line) => line.trim())
        .filter(Boolean);
      const normalizedNextNotableInfo = updatedDataParams.notableInfo
        .map((line) => line.trim())
        .filter(Boolean);

      const currentAltFullName = neighborhoodData.alternativeFocalPerson.name.trim();
      const nextAltFullName = [
        editedData.alternativeFocalPerson.firstName,
        editedData.alternativeFocalPerson.lastName,
      ]
        .map((v) => v.trim())
        .filter(Boolean)
        .join(' ');

      const hasChanges =
        String(neighborhoodData.approxHouseholds) !==
          String(updatedDataParams.approxHouseholds) ||
        String(neighborhoodData.approxResidents) !==
          String(updatedDataParams.approxResidents) ||
        neighborhoodData.floodwaterSubsidence !==
          updatedDataParams.floodwaterSubsidence ||
        JSON.stringify(normalizedCurrentHazards) !==
          JSON.stringify(normalizedNextHazards) ||
        JSON.stringify(normalizedCurrentNotableInfo) !==
          JSON.stringify(normalizedNextNotableInfo) ||
        currentAltFullName !== nextAltFullName ||
        neighborhoodData.alternativeFocalPerson.contactNo.trim() !==
          editedData.alternativeFocalPerson.contactNo.trim() ||
        neighborhoodData.alternativeFocalPerson.email.trim() !==
          editedData.alternativeFocalPerson.email.trim();

      // Serialize family details for persistence (backend-ready format)
      const familyDetailsPayload: PersistedFamilyDetail[] = editedData.families
        .filter((f) => f.name.trim())
        .map((f) => ({
          familyName: f.name.trim(),
          members: f.members
            .map((m) => m.name.trim())
            .filter(Boolean),
        }));

      console.log('💾 [handleSubmitEdit] Family details to save:', JSON.stringify(familyDetailsPayload, null, 2));
      console.log('ℹ️ [handleSubmitEdit] Backend integration note: familyDetails field exists in backend but is not yet wired to PUT /neighborhood/:id endpoint');
      console.log('ℹ️ [handleSubmitEdit] When backend is ready, add familyDetails to updateNeighborhoodData params');

      // Save family details to AsyncStorage (mock persistence for demonstration)
      await saveFamilyDetails(neighborhoodData.id, familyDetailsPayload);

      setNeighborhoodData((prev) =>
        prev
          ? {
              ...prev,
              familyDetails: familyDetailsPayload,
            }
          : prev,
      );

      // Avoid an unnecessary network request when nothing changed.
      if (!hasChanges) {
        console.log('✅ [handleSubmitEdit] No neighborhood field changes, exiting edit mode');
        setIsEditMode(false);
        setNotification({
          visible: true,
          type: 'success',
          title: 'Update Successful',
          message: 'Family details saved successfully.',
        });
        return;
      }

      await updateNeighborhoodData(updatedDataParams);

      // Prepare alternative focal person name for local state
      const alternativeFocalPersonName = [
        editedData.alternativeFocalPerson.firstName,
        editedData.alternativeFocalPerson.lastName,
      ]
        .filter(Boolean)
        .join(' ');

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
        familyDetails: familyDetailsPayload,
        alternativeFocalPerson: {
          name: alternativeFocalPersonName,
          contactNo: editedData.alternativeFocalPerson.contactNo,
          email: editedData.alternativeFocalPerson.email,
          avatar: neighborhoodData.alternativeFocalPerson.avatar, // Preserve existing avatar
        },
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
    } finally {
      setIsSubmitting(false);
    }
  }; 

  const dismissNotification = () => {
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  const handleDropdownChange = (field: string, value: string) => {
    console.log('🔄 [handleDropdownChange] field:', field, 'value:', value, 'type:', typeof value);
    
    const processedValue = field === 'approxHouseholds' || field === 'approxResidents'
      ? value.includes('(custom)') 
        ? value // Keep custom values as-is
        : value.includes('-') 
          ? value // Keep range values as strings
          : parseInt(value) // Convert individual numbers
      : field === 'avgHouseholdSize'
        ? parseFloat(value)
        : value;
    
    console.log('🔄 [handleDropdownChange] processedValue:', processedValue, 'type:', typeof processedValue);
    
    setEditedData((prev) => ({
      ...prev,
      [field]: processedValue,
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

  const normalizeFamilyName = (value: string) => {
    const trimmed = value.trim().replace(/\s+/g, ' ');
    if (!trimmed) return '';

    const baseName = trimmed.replace(/\s+family$/i, '').trim();
    if (!baseName) return '';

    return `${baseName} Family`;
  };

  // ─── Family handlers ───────────────────────────────────────────
  const handleAddFamily = () => {
    const newFamily: Family = {
      id: Date.now().toString(),
      name: '',
      members: [
        { id: Date.now().toString() + '1', name: '' },
        { id: Date.now().toString() + '2', name: '' },
      ],
      expanded: true,
      editing: true,
    };
    setEditedData((prev) => ({
      ...prev,
      families: [...prev.families, newFamily],
    }));
  };

  const handleDeleteFamily = (id: string) => {
    setEditedData((prev) => ({
      ...prev,
      families: prev.families.filter((f) => f.id !== id),
    }));
  };

  const handleRenameFamilyStart = (id: string) => {
    setEditedData((prev) => ({
      ...prev,
      families: prev.families.map((f) =>
        f.id === id ? { ...f, editing: true, expanded: true } : { ...f, editing: false },
      ),
    }));
  };

  const handleRenameFamilyCommit = (id: string, newName: string) => {
    const normalizedName = normalizeFamilyName(newName);
    setEditedData((prev) => ({
      ...prev,
      families: prev.families
        .map((f) =>
          f.id === id
            ? {
                ...f,
                name: normalizedName,
                editing: false,
              }
            : f,
        )
        .filter((f) => f.id !== id || f.name.trim().length > 0),
    }));
  };

  const handleToggleFamilyExpand = (id: string) => {
    setEditedData((prev) => ({
      ...prev,
      families: prev.families.map((f) =>
        f.id === id ? { ...f, expanded: !f.expanded, editing: false } : f,
      ),
    }));
  };

  // ─── Family member handlers ───────────────────────────────────────────
  const handleAddMember = (familyId: string) => {
    setEditedData((prev) => ({
      ...prev,
      families: prev.families.map((f) =>
        f.id === familyId
          ? {
              ...f,
              members: [
                ...f.members,
                {
                  id: Date.now().toString(),
                  name: '',
                  editing: true,
                },
              ],
            }
          : f,
      ),
    }));
  };

  const handleDeleteMember = (familyId: string, memberId: string) => {
    setEditedData((prev) => ({
      ...prev,
      families: prev.families.map((f) =>
        f.id === familyId
          ? {
              ...f,
              members: f.members.filter((m) => m.id !== memberId),
            }
          : f,
      ),
    }));
  };

  const handleRenameMemberStart = (familyId: string, memberId: string) => {
    setEditedData((prev) => ({
      ...prev,
      families: prev.families.map((f) =>
        f.id === familyId
          ? {
              ...f,
              members: f.members.map((m) =>
                m.id === memberId ? { ...m, editing: true } : m,
              ),
            }
          : f,
      ),
    }));
  };

  const handleRenameMemberCommit = (familyId: string, memberId: string, newName: string) => {
    setEditedData((prev) => ({
      ...prev,
      families: prev.families.map((f) =>
        f.id === familyId
          ? {
              ...f,
              members: f.members.map((m) =>
                m.id === memberId ? { ...m, name: newName.trim(), editing: false } : m,
              ),
            }
          : f,
      ),
    }));
  };

  return {
    isEditMode,
    isLoading,
    isSubmitting,
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
    handleAddFamily,
    handleDeleteFamily,
    handleRenameFamilyStart,
    handleRenameFamilyCommit,
    handleToggleFamilyExpand,
    handleAddMember,
    handleDeleteMember,
    handleRenameMemberStart,
    handleRenameMemberCommit,
  }; 
};
