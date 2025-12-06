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
    const data = await apiFetch<BackendOwnNeighborhood>(
      '/neighborhood/map/own',
    );

    const addressData = parseAddress(data.address);
    if (!addressData) {
      console.warn('Own neighborhood has no valid coordinates');
      return null;
    }

    return {
      id: data.neighborhoodID,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      neighborhoodID: data.neighborhoodID,
      terminalID: data.terminalID || '',
      address: addressData.address,
      dateRegistered: data.createdDate || '',
      type: 'own',
      focalPersonName: data.focalPerson.name,
      hazards: data.hazards || [],
    };
  } catch (error) {
    console.error('Error fetching own neighborhood:', error);
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
    // If neighborhoodId is provided, fetch that specific neighborhood
    // Otherwise, fetch the user's own neighborhood
    const endpoint = neighborhoodId 
      ? `/neighborhood/${neighborhoodId}`
      : '/neighborhood/map/own';
    
    let data: any;
    if (neighborhoodId) {
      // Fetch specific neighborhood - different response structure
      data = await apiFetch<BackendSpecificNeighborhood>(endpoint);
    } else {
      // Fetch own neighborhood - different response structure  
      data = await apiFetch<BackendNeighborhoodDetails>(endpoint);
    }

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
    let neighborhoodIdValue;
    let createdDate, updatedDate;
    
    if (neighborhoodId) {
      // Specific neighborhood response (getNeighborhood)
      households = parseInt(data.noOfHouseholds) || 0;
      residents = parseInt(data.noOfResidents) || 0;
      floodwaterSubsidence = data.floodSubsideHours || '';
      hazards = data.hazards || [];
      otherInfo = data.otherInformation || null;
      neighborhoodIdValue = data.id; // Use the database ID
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
    } else {
      // Own neighborhood response (viewAboutYourNeighborhood)
      households = parseInt(data.noOfHouseholds) || 0;
      residents = parseInt(data.noOfResidents) || 0;
      floodwaterSubsidence = data.floodwaterSubsidenceDuration || '';
      hazards = data.hazards || [];
      otherInfo = data.otherInformation || null;
      neighborhoodIdValue = data.neighborhoodID; // Use neighborhoodID for own neighborhood
      createdDate = data.createdDate;
      updatedDate = data.updatedDate;
      
      // Use existing focal person structure
      focalPersonData = data.focalPerson;
    }

    const avgSize =
      households > 0 ? parseFloat((residents / households).toFixed(1)) : 0;

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
  } catch (error) {
    console.error('Error fetching neighborhood details:', error);
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
    console.log('Submitting edited data:', params);

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
  } catch (error) {
    console.error('Error updating neighborhood data:', error);
    throw error;
  }
};
