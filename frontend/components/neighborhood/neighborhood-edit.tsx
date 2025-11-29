import { Dropdown } from '@/components/ui/dropdown';
import { EditableCheckbox } from '@/components/ui/editable-checkbox';
import { EditInfoCard } from '@/components/ui/edit-info-card';
import { EditedData, NeighborhoodData } from '@/types/neighborhood';
import { Check, X } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { formatDate } from '@/utils/formatters';

interface DropdownOption {
  label: string;
  value: string;
}

interface NeighborhoodEditProps {
  neighborhoodData: NeighborhoodData;
  editedData: EditedData;
  dropdownOptions: {
    households: DropdownOption[];
    residents: DropdownOption[];
    householdSize: DropdownOption[];
    subsidenceDuration: DropdownOption[];
  };
  onDropdownChange: (field: string, value: string) => void;
  onHazardToggle: (index: number) => void;
  onNotableInfoChange: (text: string) => void;
  onAlternativeFocalChange: (field: string, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const EditableDropdown = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number;
  options: DropdownOption[];
  onChange: (value: string) => void;
}) => (
  <View className="mb-4">
    <Text className="text-gray-300 text-base font-geist-medium mb-2">
      {label}
    </Text>
    <Dropdown
      options={options}
      selectedValue={String(value)}
      onValueChange={onChange}
      placeholder={`Select ${label.toLowerCase()}`}
    />
  </View>
);

const EditableTextArea = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
}) => (
  <View>
    <Text className="text-gray-300 text-base font-geist-medium mb-2">
      {label}
    </Text>
    <TextInput
      className="border border-gray-600 rounded-lg font-geist-light bg-gray-800 px-3 py-3 text-white text-base min-h-[80px]"
      value={value}
      onChangeText={onChange}
      multiline
      textAlignVertical="top"
      placeholder="Enter information..."
      placeholderTextColor="#9CA3AF"
    />
  </View>
);

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
  onCancel,
  onSubmit,
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
          />
          <EditableDropdown
            label="Approx. No. of Residents"
            value={String(editedData.approxResidents)}
            options={dropdownOptions.residents}
            onChange={(value) => onDropdownChange('approxResidents', value)}
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
            <EditableTextArea
              label="Other Notable Information"
              value={editedData.notableInfo}
              onChange={onNotableInfoChange}
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

      {/* Submit/Cancel Buttons */}
      <View className="px-6 mb-8">
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-gray-600 rounded-xl py-4 items-center"
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <X size={18} color="#ffffff" />
              <Text className="text-white text-base font-geist-semibold">
                Cancel
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-green-500 rounded-xl py-4 items-center"
            onPress={onSubmit}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <Check size={18} color="#ffffff" />
              <Text className="text-white text-base font-geist-semibold">
                Submit
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};
