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
    { label: "5-10 households", value: "5-10" },
    { label: "10-15 households", value: "10-15" },
    { label: "15-20 households", value: "15-20" },
  ],
  residents: [
    { label: "5-10 residents", value: "5-10" },
    { label: "10-15 residents", value: "10-15" },
    { label: "15-20 residents", value: "15-20" },
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
