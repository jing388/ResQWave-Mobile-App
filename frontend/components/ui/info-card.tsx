import { Text, View } from 'react-native';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const InfoCard = ({ title, children, className }: InfoCardProps) => (
  <View
    className={`bg-gray-800/50 rounded-xl p-6 mb-4 border border-gray-700 ${className || ''}`}
  >
    <Text className="text-text-muted text-sm font-geist-medium spacing-10 tracking-wide">
      {title}
    </Text>
    {children}
  </View>
);
