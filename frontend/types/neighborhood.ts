// Backend response types
export interface BackendOwnNeighborhood {
  neighborhoodID: string;
  terminalID: string;
  focalPerson: {
    name: string | null;
    alternativeFPFirstName: string | null;
    alternativeFPLastName: string | null;
    alternativeFPEmail: string | null;
    alternativeFPNumber: string | null;
    alternativeFPImage: any | null;
  };
  address: string | null; // JSON string with lat/lng
  hazards: string[];
  createdDate: string | null;
}

export interface BackendOtherNeighborhood {
  neighborhoodID: string;
  hazards: string[];
  createdDate: string | null;
  address: string | null; // JSON string with lat/lng
  focalPerson: string | null;
}

export interface BackendNeighborhoodDetails {
  neighborhoodID: string;
  terminalID: string;
  noOfHouseholds: string;
  noOfResidents: string;
  floodwaterSubsidenceDuration: string;
  hazards: string[];
  otherInformation: string | null;
  focalPerson: {
    name: string | null;
    number: string | null;
    email: string | null;
    photo: any | null;
    alternativeFPFirstName: string | null;
    alternativeFPLastName: string | null;
    alternativeFPEmail: string | null;
    alternativeFPNumber: string | null;
    alternativeFPImage: any | null;
  };
  address: string | null;
  createdDate: string | null;
  updatedDate: string | null;
}

// Response from getNeighborhood endpoint (specific neighborhood by ID)
export interface BackendSpecificNeighborhood {
  id: string;
  terminalID: string;
  noOfHouseholds: string;
  noOfResidents: string;
  floodSubsideHours: string;
  hazards: string[];
  otherInformation: string | null;
  focalPersonID: string;
  focalPerson: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    contactNumber: string | null;
    email: string | null;
    photo: any | null;
    altFirstName: string | null;
    altLastName: string | null;
    altContactNumber: string | null;
    altEmail: string | null;
    alternativeFPImage: any | null;
    address: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// Frontend marker type for map display
export interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  neighborhoodID: string;
  terminalID: string;
  address: string;
  dateRegistered: string;
  type: 'own' | 'other';
  focalPersonName: string | null;
  hazards: string[];
}

// Frontend display types
export interface NeighborhoodData {
  id: string;
  name: string;
  registeredAt: string;
  lastUpdatedAt: string;
  terminalID: string;
  terminalAddress: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  approxHouseholds: number;
  approxResidents: number;
  avgHouseholdSize: number;
  floodwaterSubsidence: string;
  floodRelatedHazards: string[];
  notableInfo: string[];
  focalPerson: {
    name: string;
    avatar?: string;
    contactNo: string;
    email: string;
  };
  alternativeFocalPerson: {
    name: string;
    avatar?: string;
    contactNo: string;
    email: string;
  };
}

export interface FloodHazard {
  label: string;
  checked: boolean;
}

export interface EditedData {
  approxHouseholds: number;
  approxResidents: number;
  avgHouseholdSize: number;
  floodwaterSubsidence: string;
  floodRelatedHazards: FloodHazard[];
  notableInfo: string;
  alternativeFocalPerson: {
    firstName: string;
    lastName: string;
    contactNo: string;
    email: string;
    avatar?: string;
  };
}
