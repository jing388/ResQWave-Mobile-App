import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

interface FocalPersonData {
  name: string;
  role: 'Main Focal Person' | 'Alternative Focal Person';
  avatar?: string;
  contactNo: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface FocalPersonModalProps {
  visible: boolean;
  focalPerson: FocalPersonData | null;
  onClose: () => void;
  heroImage?: string;
}

const AvatarCircle: React.FC<{ url?: string; name: string; size?: number }> = ({
  url,
  name,
  size = 80,
}) => {
  const getInitials = (n: string) =>
    n
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const colors = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const bgColor = colors[name.charCodeAt(0) % colors.length];

  if (url && typeof url === 'string' && url.startsWith(('http' as any))) {
    return (
      <Image
        source={{ uri: url }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: size * 0.35,
          fontFamily: 'Geist-SemiBold',
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

export const FocalPersonModal: React.FC<FocalPersonModalProps> = ({
  visible,
  focalPerson,
  onClose,
  heroImage,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        // you can adjust opacity for a slightly darker or lighter fade
      />
    ),
    []
  );

  useEffect(() => {
    if (visible && focalPerson) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible, focalPerson]);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      onClose();
    }
  };

  if (!focalPerson) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enableDynamicSizing
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      enableOverDrag={false}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: '#4B5563',
        width: 40,
        height: 4,
      }}
      backgroundStyle={{
        backgroundColor: '#171717',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Hero Image */}
        {heroImage && (
          <View style={{ height: 100, backgroundColor: '#E5E7EB', marginBottom: 0 }}>
            <Image
              source={{ uri: heroImage }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Avatar + Title Section */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 20,
            paddingHorizontal: 16,
            backgroundColor: '#171717',
          }}
        >
          <AvatarCircle
            url={focalPerson.avatar}
            name={focalPerson.name}
            size={80}
          />
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 20,
              fontFamily: 'Geist-Bold',
              marginTop: 16,
            }}
          >
            {focalPerson.name}
          </Text>
          <Text
            style={{
              color: '#9CA3AF',
              fontSize: 14,
              fontFamily: 'Geist-Regular',
              marginTop: 4,
            }}
          >
            {focalPerson.role}
          </Text>
        </View>

        {/* Details Section */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          {/* First Name */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#2A2A2A',
            }}
          >
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 14,
                fontFamily: 'Geist-Regular',
              }}
            >
              First Name
            </Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontFamily: 'Geist-Medium',
              }}
            >
              {focalPerson.firstName || extractFirstName(focalPerson.name)}
            </Text>
          </View>

          {/* Last Name */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#2A2A2A',
            }}
          >
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 14,
                fontFamily: 'Geist-Regular',
              }}
            >
              Last Name
            </Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontFamily: 'Geist-Medium',
              }}
            >
              {focalPerson.lastName || extractLastName(focalPerson.name)}
            </Text>
          </View>

          {/* Phone Number */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#2A2A2A',
            }}
          >
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 14,
                fontFamily: 'Geist-Regular',
              }}
            >
              Phone Number
            </Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontFamily: 'Geist-Medium',
              }}
            >
              {focalPerson.contactNo || 'N/A'}
            </Text>
          </View>

          {/* Email */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 14,
            }}
          >
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 14,
                fontFamily: 'Geist-Regular',
              }}
            >
              Email
            </Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontFamily: 'Geist-Medium',
                textAlign: 'right',
                flex: 1,
                marginLeft: 12,
              }}
            >
              {focalPerson.email || 'N/A'}
            </Text>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

// Helper functions
const extractFirstName = (fullName: string): string => {
  return fullName.split(' ')[0] || '';
};

const extractLastName = (fullName: string): string => {
  const parts = fullName.split(' ');
  return parts.length > 1 ? parts.slice(1).join(' ') : '';
};
