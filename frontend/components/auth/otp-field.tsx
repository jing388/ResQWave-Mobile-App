import { colors } from '@/constants/colors';
import React from 'react';
import { OtpInput } from 'react-native-otp-entry';

interface OtpFieldProps {
  value: string;
  onChange: (text: string) => void;
  onFilled?: (text: string) => void;
  disabled?: boolean;
}

const OtpField: React.FC<OtpFieldProps> = ({
  value,
  onChange,
  onFilled,
  disabled = false,
}) => {
  const isCodeComplete = value.length === 6;
  return (
    <OtpInput
      numberOfDigits={6}
      focusColor={colors.brand.primary}
      focusStickBlinkingDuration={500}
      onTextChange={onChange}
      onFilled={onFilled}
      textInputProps={{
        accessibilityLabel: 'One-Time Password',
        editable: !disabled,
      }}
      theme={{
        containerStyle: {
          width: '100%',
        },
        inputsContainerStyle: {
          gap: 8,
          justifyContent: 'center',
        },
        pinCodeContainerStyle: {
          backgroundColor: colors.background.secondary,
          borderColor: isCodeComplete
            ? colors.brand.primary
            : colors.card.border,
          borderWidth: 1,
          borderRadius: 8,
          width: 46,
          height: 60,
        },
        pinCodeTextStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.text.primary,
        },
        focusStickStyle: {
          backgroundColor: colors.brand.primary,
          width: 2,
          height: 32,
        },
        focusedPinCodeContainerStyle: {
          borderColor: colors.brand.primary,
          backgroundColor: colors.background.secondary,
        },
      }}
      // value and editable props are not supported by OtpInput
    />
  );
};

export default OtpField;
