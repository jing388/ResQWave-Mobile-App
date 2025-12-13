import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Dropdown } from '@/components/ui/dropdown';
import { EditableCheckbox } from '@/components/ui/editable-checkbox';
import { EditInfoCard } from '@/components/ui/edit-info-card';
import { EditedData, NeighborhoodData } from '@/types/neighborhood';
import { NeighborhoodDropdownOptions } from '@/constants/neighborhood-options';
import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface DropdownOption {
  label: string;
  value: string;
}

interface NeighborhoodEditProps {
  neighborhoodData: NeighborhoodData;
  editedData: EditedData;
  dropdownOptions: NeighborhoodDropdownOptions;
  onDropdownChange: (field: string, value: string) => void;
  onHazardToggle: (index: number) => void;
  onNotableInfoChange: (text: string) => void;
  onAlternativeFocalChange: (field: string, text: string) => void;
}

const EditableDropdown = ({
  label,
  value,
  options,
  onChange,
  showCustomInput = false,
  onCustomValue,
}: {
  label: string;
  value: string | number;
  options: DropdownOption[];
  onChange: (value: string) => void;
  showCustomInput?: boolean;
  onCustomValue?: (value: string) => void;
}) => {
  // For households and residents, the value is a number but options are ranges
  // We need to find the matching range or use the value as-is for custom values
  const getSelectedOption = () => {
    if (typeof value === 'string' && value.includes('(custom)')) {
      // Handle custom values
      return { label: value, value: 'custom' };
    }
    
    if (typeof value === 'number') {
      // Find the range that contains this number
      return options.find(option => {
        if (option.value === 'custom') return false;
        
        const [min, max] = option.value.split('-').map(v => parseInt(v.replace(/,/g, '')));
        return value >= min && value <= max;
      });
    }
    
    // For string values (like floodwater subsidence), do exact match
    return options.find(option => option.value === String(value));
  };

  const selectedOption = getSelectedOption();
  const hasValue = value && value !== 0;
  
  // Create better placeholders based on the field type
  const getPlaceholder = () => {
    if (hasValue && selectedOption) {
      return selectedOption.label;
    }
    
    switch(label) {
      case 'Approximate No. of Households':
        return 'Select number of households';
      case 'Approx. No. of Residents':
        return 'Select number of residents';
      case 'Floodwater Subsidence Duration':
        return 'Select floodwater duration';
      default:
        return `Select ${label.toLowerCase()}`;
    }
  };

  const handleCustomValue = (customValue: string) => {
    if (onCustomValue) {
      // Create a custom display label
      const customLabel = label.includes('Households') 
        ? `${customValue} households (custom)`
        : `${customValue} residents (custom)`;
      onCustomValue(customLabel);
    }
  };

  // Use the selected option's value if found, otherwise use the original value
  const dropdownValue = selectedOption?.value || String(value);

  return (
    <View className="mb-4">
      <Text className="text-gray-300 text-base font-geist-medium mb-2">
        {label}
      </Text>
      <Dropdown
        options={options}
        selectedValue={dropdownValue}
        onValueChange={onChange}
        placeholder={getPlaceholder()}
        showCustomInput={showCustomInput}
        onCustomValue={handleCustomValue}
      />
    </View>
  );
};

const EditableTextField = ({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}) => (
  <View className="mb-4">
    <Text className="text-gray-300 text-base font-geist-medium mb-2">
      {label}
    </Text>
    <TextInput
      className="border border-gray-600 rounded-lg bg-gray-800 px-3 py-3 text-white text-base"
      value={value}
      onChangeText={onChange}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType}
    />
  </View>
);

export const NeighborhoodEdit: React.FC<NeighborhoodEditProps> = ({
  neighborhoodData,
  editedData,
  dropdownOptions,
  onDropdownChange,
  onHazardToggle,
  onNotableInfoChange,
  onAlternativeFocalChange,
}) => {
  return (
    <>
      {/* Neighborhood Information - Editable */}
      <View className="px-6">
        <EditInfoCard title="NEIGHBORHOOD INFORMATION">
          <EditableDropdown
            label="Approximate No. of Households"
            value={String(editedData.approxHouseholds)}
            options={dropdownOptions.households}
            onChange={(value) => onDropdownChange('approxHouseholds', value)}
            showCustomInput={true}
            onCustomValue={(customLabel) => onDropdownChange('approxHouseholds', customLabel)}
          />
          <EditableDropdown
            label="Approx. No. of Residents"
            value={String(editedData.approxResidents)}
            options={dropdownOptions.residents}
            onChange={(value) => onDropdownChange('approxResidents', value)}
            showCustomInput={true}
            onCustomValue={(customLabel) => onDropdownChange('approxResidents', customLabel)}
          />
          <EditableDropdown
            label="Floodwater Subsidence Duration"
            value={editedData.floodwaterSubsidence}
            options={dropdownOptions.subsidenceDuration}
            onChange={(value) =>
              onDropdownChange('floodwaterSubsidence', value)
            }
          />

          <View className="mt-4">
            <Text className="text-gray-300 text-base font-geist-medium mb-3">
              Flood Related Hazards
            </Text>
            {editedData.floodRelatedHazards.map((hazard, index) => (
              <EditableCheckbox
                key={index}
                label={hazard.label}
                checked={hazard.checked}
                onToggle={() => onHazardToggle(index)}
              />
            ))}
          </View>

          <View className="mt-4">
            <AutosizeTextarea
              label="Other Notable Information"
              value={editedData.notableInfo}
              onChangeText={onNotableInfoChange}
              placeholder="Enter any additional information about the neighborhood..."
              minHeight={120}
              maxHeight={350}
              showResizeHandle={true}
              helperText="You can resize this textarea by dragging the handle"
            />
          </View>
        </EditInfoCard>
      </View>

      {/* Alternative Focal Person - Editable */}
      <View className="px-6 mb-8">
        <EditInfoCard title="ALTERNATIVE FOCAL PERSON">
          <EditableTextField
            label="First Name"
            value={editedData.alternativeFocalPerson.firstName}
            onChange={(value) => onAlternativeFocalChange('firstName', value)}
            placeholder="Enter first name"
          />
          <EditableTextField
            label="Last Name"
            value={editedData.alternativeFocalPerson.lastName}
            onChange={(value) => onAlternativeFocalChange('lastName', value)}
            placeholder="Enter last name"
          />
          <EditableTextField
            label="Contact Number"
            value={editedData.alternativeFocalPerson.contactNo}
            onChange={(value) => onAlternativeFocalChange('contactNo', value)}
            placeholder="Enter contact number"
            keyboardType="phone-pad"
          />
          <EditableTextField
            label="Email"
            value={editedData.alternativeFocalPerson.email}
            onChange={(value) => onAlternativeFocalChange('email', value)}
            placeholder="Enter email address"
            keyboardType="email-address"
          />
        </EditInfoCard>
      </View>
    </>
  );
};
