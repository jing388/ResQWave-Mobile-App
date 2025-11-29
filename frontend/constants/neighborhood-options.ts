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

// Dropdown options - can be fetched from backend config
export const dropdownOptions: NeighborhoodDropdownOptions = {
  households: [
    { label: "10,000", value: "10000" },
    { label: "12,000", value: "12000" },
    { label: "15,000", value: "15000" },
    { label: "15,800", value: "15800" },
    { label: "16,500", value: "16500" },
    { label: "17,000", value: "17000" },
    { label: "18,000", value: "18000" },
    { label: "20,000", value: "20000" },
  ],
  residents: [
    { label: "50,000", value: "50000" },
    { label: "60,000", value: "60000" },
    { label: "70,000", value: "70000" },
    { label: "71,726", value: "71726" },
    { label: "73,000", value: "73000" },
    { label: "75,000", value: "75000" },
    { label: "80,000", value: "80000" },
    { label: "90,000", value: "90000" },
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
