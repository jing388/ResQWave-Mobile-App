/**
 * Geocoding Service
 * Handles reverse geocoding to get location names from coordinates
 */

interface ReverseGeocodeResult {
  placeName: string;
  fullAddress: string;
  success: boolean;
}

/**
 * Get nearby place name from coordinates using OpenStreetMap Nominatim API
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ResQWave-Mobile-App/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();
    
    // Extract place name from address components
    const address = data.address || {};
    
    // Priority order for place name: suburb > neighbourhood > village > town > city
    const placeName = 
      address.suburb || 
      address.neighbourhood || 
      address.village || 
      address.town || 
      address.city || 
      address.municipality ||
      'Unknown Location';
    
    // Get the city/municipality for context
    const cityName = address.city || address.municipality || '';
    
    // Create a friendly place name (e.g., "Ilang Ilang, Caloocan")
    const friendlyPlaceName = cityName 
      ? `${placeName}, ${cityName}`
      : placeName;

    return {
      placeName: friendlyPlaceName,
      fullAddress: data.display_name || 'Address not available',
      success: true,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      placeName: 'Unknown Location',
      fullAddress: 'Unable to determine address',
      success: false,
    };
  }
}
