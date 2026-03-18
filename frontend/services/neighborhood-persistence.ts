import AsyncStorage from '@react-native-async-storage/async-storage';
import { FamilyDetail } from '@/types/neighborhood';

const LAST_SELECTED_NEIGHBORHOOD_KEY = 'last_selected_neighborhood_id';

/**
 * Save the last selected neighborhood ID to AsyncStorage
 */
export const saveLastSelectedNeighborhood = async (neighborhoodId: string): Promise<void> => {
  try {
    console.log('💾 [persistence] Saving neighborhood ID:', neighborhoodId);
    await AsyncStorage.setItem(LAST_SELECTED_NEIGHBORHOOD_KEY, neighborhoodId);
    console.log('✅ [persistence] Successfully saved:', neighborhoodId);
  } catch (error) {
    console.error('❌ [persistence] Failed to save last selected neighborhood:', error);
  }
};

/**
 * Get the last selected neighborhood ID from AsyncStorage
 */
export const getLastSelectedNeighborhood = async (): Promise<string | null> => {
  try {
    const neighborhoodId = await AsyncStorage.getItem(LAST_SELECTED_NEIGHBORHOOD_KEY);
    console.log('📂 [persistence] Retrieved neighborhood ID:', neighborhoodId);
    return neighborhoodId;
  } catch (error) {
    console.error('❌ [persistence] Failed to get last selected neighborhood:', error);
    return null;
  }
};

/**
 * Clear the last selected neighborhood ID from AsyncStorage
 */
export const clearLastSelectedNeighborhood = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LAST_SELECTED_NEIGHBORHOOD_KEY);
    console.log('Cleared last selected neighborhood');
  } catch (error) {
    console.error('Failed to clear last selected neighborhood:', error);
  }
};

// ────────────────────────────────────────────────────────────────────
// Family Details Local Fallback Persistence
// ────────────────────────────────────────────────────────────────────

const FAMILY_DETAILS_KEY_PREFIX = 'neighborhood_family_details_';

export type PersistedFamilyDetail = FamilyDetail;

/**
 * Save family details to AsyncStorage as local fallback cache.
 * Data structure matches backend expectation: { familyName: string, members: string[] }[]
 */
export const saveFamilyDetails = async (
  neighborhoodId: string,
  families: PersistedFamilyDetail[],
): Promise<void> => {
  try {
    const key = `${FAMILY_DETAILS_KEY_PREFIX}${neighborhoodId}`;
    console.log('💾 [family-cache] Saving family details for:', neighborhoodId);
    console.log('💾 [family-cache] Data:', JSON.stringify(families, null, 2));
    await AsyncStorage.setItem(key, JSON.stringify(families));
    console.log('✅ [family-cache] Successfully saved family details');
  } catch (error) {
    console.error('❌ [family-cache] Failed to save family details:', error);
  }
};

/**
 * Load family details from AsyncStorage local fallback cache.
 */
export const loadFamilyDetails = async (
  neighborhoodId: string,
): Promise<PersistedFamilyDetail[]> => {
  try {
    const key = `${FAMILY_DETAILS_KEY_PREFIX}${neighborhoodId}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      console.log('📂 [family-cache] Loaded family details:', parsed);
      return parsed;
    }
    console.log('📂 [family-cache] No family details found');
    return [];
  } catch (error) {
    console.error('❌ [family-cache] Failed to load family details:', error);
    return [];
  }
};

/**
 * Clear family details from AsyncStorage
 */
export const clearFamilyDetails = async (neighborhoodId: string): Promise<void> => {
  try {
    const key = `${FAMILY_DETAILS_KEY_PREFIX}${neighborhoodId}`;
    await AsyncStorage.removeItem(key);
    console.log('🗑️ [family-cache] Cleared family details for:', neighborhoodId);
  } catch (error) {
    console.error('❌ [family-cache] Failed to clear family details:', error);
  }
};
