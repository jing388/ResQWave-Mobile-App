export interface DropdownOption {
  label: string;
  value: string;
}

export interface NeighborhoodDropdownOptions {
  households: DropdownOption[];
  residents: DropdownOption[];
  householdSize: DropdownOption[];
  subsidenceDuration: DropdownOption[];
}

// Available hazard options (can also come from backend)
export const availableHazards = [
  "Strong Water Current (Malakas na agos ng tubig)",
  "Risk of landslide or erosion (Panganib ng landslide o erosion)",
  "Drainage overflow or canal blockage (Pag-apaw ng drainage o bara sa kanal)",
  "Roads became impassable (Mga kalsada ay hindi madaanan)",
  "Electrical wires or exposed cables (Mga kable o wire na nakalantad)",
];

// Map backend hazard keys to display labels
export const hazardKeyToLabelMap: Record<string, string> = {
  "strong-water-current": "Strong Water Current (Malakas na agos ng tubig)",
  "risk-landslide": "Risk of landslide or erosion (Panganib ng landslide o erosion)",
  "drainage-overflow": "Drainage overflow or canal blockage (Pag-apaw ng drainage o bara sa kanal)",
  "roads-impassable": "Roads became impassable (Mga kalsada ay hindi madaanan)",
  "electrical-wires": "Electrical wires or exposed cables (Mga kable o wire na nakalantad)",
};

// Function to get the proper label for a hazard key
export const getHazardLabel = (hazardKey: string): string => {
  return hazardKeyToLabelMap[hazardKey] || hazardKey;
};

// Dropdown options - can be fetched from backend config
export const dropdownOptions: NeighborhoodDropdownOptions = {
  households: [
    { label: "1-50 households", value: "1-50" },
    { label: "51-100 households", value: "51-100" },
    { label: "101-200 households", value: "101-200" },
    { label: "201-500 households", value: "201-500" },
    { label: "501-1,000 households", value: "501-1000" },
    { label: "1,001-2,000 households", value: "1001-2000" },
    { label: "2,001-5,000 households", value: "2001-5000" },
    { label: "5,001-10,000 households", value: "5001-10000" },
    { label: "10,001-20,000 households", value: "10001-20000" },
    { label: "20,001-50,000 households", value: "20001-50000" },
    { label: "Custom (specify number)", value: "custom" },
  ],
  residents: [
    { label: "1-100 residents", value: "1-100" },
    { label: "101-250 residents", value: "101-250" },
    { label: "251-500 residents", value: "251-500" },
    { label: "501-1,000 residents", value: "501-1000" },
    { label: "1,001-2,500 residents", value: "1001-2500" },
    { label: "2,501-5,000 residents", value: "2501-5000" },
    { label: "5,001-10,000 residents", value: "5001-10000" },
    { label: "10,001-25,000 residents", value: "10001-25000" },
    { label: "25,001-50,000 residents", value: "25001-50000" },
    { label: "50,001-100,000 residents", value: "50001-100000" },
    { label: "Custom (specify number)", value: "custom" },
  ],
  householdSize: [
    { label: "3.0 members", value: "3.0" },
    { label: "3.5 members", value: "3.5" },
    { label: "4.0 members", value: "4.0" },
    { label: "4.5 members", value: "4.5" },
    { label: "5.0 members", value: "5.0" },
    { label: "5.5 members", value: "5.5" },
    { label: "6.0 members", value: "6.0" },
  ],
  subsidenceDuration: [
    { label: "Less than 1 hour", value: "Less than 1 hour" },
    { label: "1-2 hours", value: "1-2 hours" },
    { label: "2-4 hours", value: "2-4 hours" },
    { label: "4-6 hours", value: "4-6 hours" },
    { label: "6-8 hours", value: "6-8 hours" },
    { label: "8-12 hours", value: "8-12 hours" },
    { label: "More than 12 hours", value: "More than 12 hours" },
  ],
};
