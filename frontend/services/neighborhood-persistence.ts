import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SELECTED_NEIGHBORHOOD_KEY = 'last_selected_neighborhood_id';

/**
 * Save the last selected neighborhood ID to AsyncStorage
 */
export const saveLastSelectedNeighborhood = async (neighborhoodId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAST_SELECTED_NEIGHBORHOOD_KEY, neighborhoodId);
    console.log('Saved last selected neighborhood:', neighborhoodId);
  } catch (error) {
    console.error('Failed to save last selected neighborhood:', error);
  }
};

/**
 * Get the last selected neighborhood ID from AsyncStorage
 */
export const getLastSelectedNeighborhood = async (): Promise<string | null> => {
  try {
    const neighborhoodId = await AsyncStorage.getItem(LAST_SELECTED_NEIGHBORHOOD_KEY);
    console.log('Retrieved last selected neighborhood:', neighborhoodId);
    return neighborhoodId;
  } catch (error) {
    console.error('Failed to get last selected neighborhood:', error);
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
