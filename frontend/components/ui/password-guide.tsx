import { Check, X } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface PasswordGuideProps {
  password: string;
}

interface ValidationRule {
  label: string;
  validate: (password: string) => boolean;
}

export default function PasswordGuide({ password }: PasswordGuideProps) {
  const rules: ValidationRule[] = [
    {
      label: 'A minimum of 8 characters',
      validate: (pwd) => pwd.length >= 8
    },
    {
      label: 'At least one uppercase',
      validate: (pwd) => /[A-Z]/.test(pwd)
    },
    {
      label: 'At least one lowercase',
      validate: (pwd) => /[a-z]/.test(pwd)
    },
    {
      label: 'At least one number',
      validate: (pwd) => /[0-9]/.test(pwd)
    },
    {
      label: 'At least one special character eg. !@#$%^',
      validate: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
  ];

  return (
    <View className="bg-gray-800 border border-gray-600 rounded-xl p-4">
      <Text className="text-gray-300 text-sm font-geist-medium mb-3">
        Password Requirements:
      </Text>
      <View className="gap-2">
        {rules.map((rule, index) => {
          const isValid = rule.validate(password);
          return (
            <View key={index} className="flex-row items-center">
              <View className="mr-2">
                {isValid ? (
                  <Check size={16} color="#10B981" strokeWidth={3} />
                ) : (
                  <X size={16} color="#EF4444" strokeWidth={3} />
                )}
              </View>
              <Text 
                className="text-sm font-geist-regular flex-1"
                style={{ color: isValid ? '#10B981' : '#9CA3AF' }}
              >
                {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
