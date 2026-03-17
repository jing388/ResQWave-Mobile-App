import { Text, View } from 'react-native';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const InfoCard = ({ title, children, className }: InfoCardProps) => (
  <View
    className={`rounded-xl p-6 mb-4 ${className || ''}`}
    style={{ backgroundColor: '#1D1D1D' }}
  >
    <Text className="text-gray-400 text-xs font-geist-medium tracking-widest uppercase mb-4">
      {title}
    </Text>
    {children}
  </View>
);
