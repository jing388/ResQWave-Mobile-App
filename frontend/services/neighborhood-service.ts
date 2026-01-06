import {
  NeighborhoodData,
  BackendOwnNeighborhood,
  BackendOtherNeighborhood,
  BackendNeighborhoodDetails,
  BackendSpecificNeighborhood,
  MarkerData,
} from '@/types/neighborhood';
import { apiFetch } from '@/lib/api-client';

/**
 * Parse address JSON string to extract coordinates
 */
const parseAddress = (
  addressStr: string | null,
): { latitude: number; longitude: number; address: string } | null => {
  if (!addressStr) {
    console.log('📍 parseAddress: No address provided');
    return null;
  }

  console.log('📍 parseAddress received:', addressStr);

  try {
    const parsed = JSON.parse(addressStr);
    console.log('📍 parseAddress parsed as JSON:', parsed);

    // Handle different coordinate formats
    let latitude = 0;
    let longitude = 0;

    // Format 1: coordinates as "lng, lat" string
    if (parsed.coordinates && typeof parsed.coordinates === 'string') {
      const coords = parsed.coordinates
        .split(',')
        .map((c: string) => parseFloat(c.trim()));
      if (coords.length === 2) {
        longitude = coords[0]; // First value is longitude
        latitude = coords[1]; // Second value is latitude
      }
    }
    // Format 2: separate latitude and longitude fields
    else if (parsed.latitude !== undefined || parsed.lat !== undefined) {
      latitude = parseFloat(parsed.latitude || parsed.lat || 0);
      longitude = parseFloat(parsed.longitude || parsed.lng || 0);
    }

    const result = {
      latitude,
      longitude,
      address: parsed.address || parsed.formattedAddress || addressStr,
    };

    console.log('📍 parseAddress result:', result);
    return result;
  } catch {
    console.log(
      '📍 parseAddress: Failed to parse as JSON, treating as plain string',
    );
    console.log('📍 Address string:', addressStr);
    // Address is a plain string, not JSON
    // Return null - coordinates must be stored in JSON format
    return null;
  }
};

/**
 * Fetch own neighborhood data (for map view)
 */
export const fetchOwnNeighborhood = async (): Promise<MarkerData | null> => {
  try {
    console.log('🔍 [fetchOwnNeighborhood] Starting fetch from /neighborhood/map/own...');
    const data = await apiFetch<BackendOwnNeighborhood>(
      '/neighborhood/map/own',
    );
    
    console.log('🔍 [fetchOwnNeighborhood] Response received:', JSON.stringify(data, null, 2));

    const addressData = parseAddress(data.address);
    if (!addressData) {
      console.warn('❌ [fetchOwnNeighborhood] Own neighborhood has no valid coordinates');
      console.warn('❌ [fetchOwnNeighborhood] Address was:', data.address);
      return null;
    }

    const ownMarker = {
      id: data.neighborhoodID,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      neighborhoodID: data.neighborhoodID,
      terminalID: data.terminalID || '',
      address: addressData.address,
      dateRegistered: data.createdDate || '',
      type: 'own' as const,
      focalPersonName: data.focalPerson.name,
      hazards: data.hazards || [],
    };
    
    console.log('✅ [fetchOwnNeighborhood] Created marker with type:', ownMarker.type);
    console.log('✅ [fetchOwnNeighborhood] Neighborhood ID:', ownMarker.neighborhoodID);
    
    return ownMarker;
  } catch (error) {
    console.error('❌ [fetchOwnNeighborhood] Error fetching own neighborhood:', error);
    console.error('❌ [fetchOwnNeighborhood] Error details:', JSON.stringify(error, null, 2));
    return null;
  }
};

/**
 * Fetch other neighborhoods (for map view)
 */
export const fetchOtherNeighborhoods = async (): Promise<MarkerData[]> => {
  try {
    const data = await apiFetch<BackendOtherNeighborhood[]>(
      '/neighborhood/map/others',
    );

    const markers: MarkerData[] = [];

    for (const nb of data) {
      const addressData = parseAddress(nb.address);
      if (!addressData) continue;

      markers.push({
        id: nb.neighborhoodID,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        neighborhoodID: nb.neighborhoodID,
        terminalID: '',
        address: addressData.address,
        dateRegistered: nb.createdDate || '',
        type: 'other',
        focalPersonName: nb.focalPerson,
        hazards: nb.hazards || [],
      });
    }

    return markers;
  } catch (error) {
    console.error('Error fetching other neighborhoods:', error);
    return [];
  }
};

/**
 * Fetch detailed neighborhood information (for info sheet)
 */
export const fetchNeighborhoodDetails = async (
  neighborhoodId?: string | null,
): Promise<NeighborhoodData | null> => {
  try {
    console.log('🌐 [neighborhood-service] ========================================');
    console.log('🌐 [neighborhood-service] fetchNeighborhoodDetails called');
    console.log('🌐 [neighborhood-service] Input neighborhoodId:', neighborhoodId);
    console.log('🌐 [neighborhood-service] Type:', typeof neighborhoodId);
    
    // If neighborhoodId is provided, fetch that specific neighborhood
    // Otherwise, fetch the user's own neighborhood
    const endpoint = neighborhoodId 
      ? `/neighborhood/${neighborhoodId}`
      : '/neighborhood/own';
    
    console.log('🔍 [neighborhood-service] Endpoint:', endpoint);
    
    let data: any;
    let isOwnEndpoint = !neighborhoodId;
    
    // Fetch the data
    console.log('📡 [neighborhood-service] Fetching from endpoint:', endpoint);
    data = await apiFetch<any>(endpoint);
    console.log('✅ [neighborhood-service] Response received:', JSON.stringify(data, null, 2));

    // Validation: Ensure we got the correct neighborhood
    // Handle different response structures
    const fetchedId = isOwnEndpoint ? data.neighborhoodID : data.id;
    if (neighborhoodId && fetchedId !== neighborhoodId) {
      console.error('❌ [neighborhood-service] MISMATCH! Requested:', neighborhoodId, 'but got:', fetchedId);
    } else {
      console.log('✅ [neighborhood-service] Correct neighborhood:', fetchedId);
    }
    console.log('🌐 [neighborhood-service] ========================================');

    const addressData = parseAddress(data.address);

    // If address parsing fails, use default coordinates for Manila area
    let coordinates = addressData;
    if (!coordinates) {
      console.warn('Address parsing failed for neighborhood:', neighborhoodId || 'own', '- Address was:', data.address);
      coordinates = {
        latitude: 14.765, // Default Manila area coordinates
        longitude: 121.0392,
        address: data.address || `${neighborhoodId || 'Unknown Neighborhood'} - Address not available`
      };
    }

    // Handle different response structures based on the endpoint
    let households, residents, floodwaterSubsidence, hazards, otherInfo, focalPersonData;
    let neighborhoodIdValue, createdDate, updatedDate;
    
    if (isOwnEndpoint) {
      // /neighborhood/own endpoint response structure (viewAboutYourNeighborhood)
      households = parseInt(data.noOfHouseholds) || 0;
      residents = parseInt(data.noOfResidents) || 0;
      floodwaterSubsidence = data.floodwaterSubsidenceDuration || '';
      hazards = data.hazards || [];
      otherInfo = data.otherInformation || null;
      neighborhoodIdValue = data.neighborhoodID;
      createdDate = data.createdDate;
      updatedDate = data.updatedDate;
      
      // focalPerson is already in the correct structure
      focalPersonData = {
        name: data.focalPerson?.name || '',
        number: data.focalPerson?.number || '',
        email: data.focalPerson?.email || '',
        photo: data.focalPerson?.photo || null,
        alternativeFPFirstName: data.focalPerson?.alternativeFPFirstName || null,
        alternativeFPLastName: data.focalPerson?.alternativeFPLastName || null,
        alternativeFPNumber: data.focalPerson?.alternativeFPNumber || null,
        alternativeFPEmail: data.focalPerson?.alternativeFPEmail || null,
        alternativeFPImage: data.focalPerson?.alternativeFPImage || null,
      };
    } else {
      // /neighborhood/:id endpoint response structure (getNeighborhood)
      households = parseInt(data.noOfHouseholds) || 0;
      residents = parseInt(data.noOfResidents) || 0;
      floodwaterSubsidence = data.floodSubsideHours || '';
      hazards = data.hazards || [];
      otherInfo = data.otherInformation || null;
      neighborhoodIdValue = data.id;
      createdDate = data.createdAt;
      updatedDate = data.updatedAt;
      
      // Map focal person data from getNeighborhood structure
      focalPersonData = {
        name: data.focalPerson ? [data.focalPerson.firstName, data.focalPerson.lastName].filter(Boolean).join(' ') : '',
        number: data.focalPerson?.contactNumber || '',
        email: data.focalPerson?.email || '',
        photo: data.focalPerson?.photo || null,
        alternativeFPFirstName: data.focalPerson?.altFirstName || null,
        alternativeFPLastName: data.focalPerson?.altLastName || null,
        alternativeFPNumber: data.focalPerson?.altContactNumber || null,
        alternativeFPEmail: data.focalPerson?.altEmail || null,
        alternativeFPImage: data.focalPerson?.alternativeFPImage || null,
      };
    }
    
    // Calculate average household size
    const avgSize = households > 0 ? parseFloat((residents / households).toFixed(2)) : 0;

    return {
      id: neighborhoodIdValue,
      name: neighborhoodIdValue,
      registeredAt: createdDate || '',
      lastUpdatedAt: updatedDate || '',
      terminalID: data.terminalID || '',
      terminalAddress: coordinates.address || '',
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      approxHouseholds: households,
      approxResidents: residents,
      avgHouseholdSize: avgSize,
      floodwaterSubsidence: floodwaterSubsidence,
      floodRelatedHazards: hazards,
      notableInfo: otherInfo ? [otherInfo] : [],
      focalPerson: {
        name: focalPersonData.name || '',
        contactNo: focalPersonData.number || '',
        email: focalPersonData.email || '',
        avatar: focalPersonData.photo,
      },
      alternativeFocalPerson: {
        name:
          [
            focalPersonData.alternativeFPFirstName,
            focalPersonData.alternativeFPLastName,
          ]
            .filter(Boolean)
            .join(' ') || '',
        contactNo: focalPersonData.alternativeFPNumber || '',
        email: focalPersonData.alternativeFPEmail || '',
        avatar: focalPersonData.alternativeFPImage,
      },
    };
  } catch (error: any) {
    console.error('❌ [neighborhood-service] Error fetching neighborhood details:', error);
    console.error('❌ [neighborhood-service] Error message:', error.message);
    console.error('❌ [neighborhood-service] Error status:', error.status);
    
    // If it's a 404, the neighborhood doesn't exist
    if (error.message && error.message.includes('404')) {
      console.error('❌ [neighborhood-service] Neighborhood not found in database:', neighborhoodId);
    }
    
    return null;
  }
};

/**
 * Fetch neighborhood data from the backend (deprecated - use fetchNeighborhoodDetails)
 */
export const fetchNeighborhoodData = fetchNeighborhoodDetails;

export interface UpdateNeighborhoodDataParams {
  neighborhoodId: string;
  approxHouseholds: number;
  approxResidents: number;
  avgHouseholdSize: number;
  floodwaterSubsidence: string;
  floodRelatedHazards: string[];
  notableInfo: string[];
}

/**
 * Update neighborhood data on the backend
 */
export const updateNeighborhoodData = async (
  params: UpdateNeighborhoodDataParams,
): Promise<void> => {
  try {
    console.log('📝 [neighborhood-service] Updating neighborhood:', params.neighborhoodId);
    console.log('📝 [neighborhood-service] Update data:', params);

    await apiFetch(`/neighborhood/${params.neighborhoodId}`, {
      method: 'PUT',
      body: JSON.stringify({
        noOfHouseholds: params.approxHouseholds,
        noOfResidents: params.approxResidents,
        floodSubsideHours: params.floodwaterSubsidence,
        hazards: params.floodRelatedHazards,
        otherInformation: params.notableInfo.join('; '),
      }),
    });
    
    console.log('✅ [neighborhood-service] Successfully updated neighborhood:', params.neighborhoodId);
  } catch (error) {
    console.error('❌ [neighborhood-service] Error updating neighborhood:', params.neighborhoodId, error);
    throw error;
  }
};
