import { NeighborhoodData } from '@/types/neighborhood';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp, User } from 'lucide-react-native';
import { formatDate } from '@/utils/formatters';
import { API_BASE_URL } from '@/lib/api-client';

// All available hazard keys in display order
const ALL_HAZARD_KEYS = [
  'strong-water-current',
  'risk-landslide',
  'drainage-overflow',
  'roads-impassable',
  'electrical-wires',
];

// Short display labels (without Filipino translations)
const HAZARD_SHORT_LABELS: Record<string, string> = {
  'strong-water-current': 'Strong water current',
  'risk-landslide': 'Risk of landslide or erosion',
  'drainage-overflow': 'Drainage overflow / canal blockage',
  'roads-impassable': 'Roads become impassable',
  'electrical-wires': 'Electrical wires or exposed cables',
};

interface NeighborhoodViewProps {
  neighborhoodData: NeighborhoodData;
  // Kept for backward-compatibility but not used directly in this component
  DetailRow?: React.ComponentType<any>;
  InfoCard?: React.ComponentType<any>;
  Separator?: React.ComponentType;
  onPrimaryFocalPersonPress?: () => void;
  onAlternativeFocalPersonPress?: () => void;
}

// ─────────────────────────────────────────────
// Internal sub-components
// ─────────────────────────────────────────────

const SectionHeader = ({ title }: { title: string }) => (
  <Text
    style={{
      color: '#9CA3AF',
      fontSize: 11,
      fontFamily: 'Geist-Medium',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginTop: 16,
      marginBottom: 8,
    }}
  >
    {title}
  </Text>
);

const InfoDetailRow = ({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 14,
      ...(isLast ? {} : { borderBottomWidth: 1, borderBottomColor: '#2A2A2A' }),
    }}
  >
    <Text
      style={{
        color: '#9CA3AF',
        fontSize: 14,
        fontFamily: 'Geist-Regular',
        flex: 1,
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Geist-Regular',
        flex: 1,
        textAlign: 'right',
      }}
    >
      {value || 'Not specified'}
    </Text>
  </View>
);

const AvatarIcon = ({
  url,
  name,
  size = 44,
}: {
  url?: string;
  name: string;
  size?: number;
}) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (url && typeof url === 'string') {
    const imgUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    return (
      <Image
        source={{ uri: imgUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#374151',
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
        backgroundColor: '#374151',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {initials ? (
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: size * 0.35,
            fontFamily: 'Geist-SemiBold',
          }}
        >
          {initials}
        </Text>
      ) : (
        <User size={size * 0.5} color="#9CA3AF" />
      )}
    </View>
  );
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export const NeighborhoodView: React.FC<NeighborhoodViewProps> = ({
  neighborhoodData,
  onPrimaryFocalPersonPress,
  onAlternativeFocalPersonPress,
}) => {
  const [expandedFamilies, setExpandedFamilies] = useState<
    Record<number, boolean>
  >({});

  const toggleFamily = (idx: number) =>
    setExpandedFamilies((prev) => ({ ...prev, [idx]: !prev[idx] }));

  // Build the info rows for "About the Neighborhood", filtering out empty values
  const aboutRows: { label: string; value: string }[] = [
    { label: 'Registered At', value: formatDate(neighborhoodData.registeredAt) },
    { label: 'Terminal ID', value: neighborhoodData.terminalID },
    ...(neighborhoodData.terminalName
      ? [{ label: 'Terminal Name', value: neighborhoodData.terminalName }]
      : []),
    { label: 'Terminal Address', value: neighborhoodData.terminalAddress },
    { label: 'Approx. No. of Households', value: neighborhoodData.approxHouseholds },
    { label: 'Approx. No. of Residents', value: neighborhoodData.approxResidents },
    {
      label: 'Floodwater Subsidence Duration',
      value: neighborhoodData.floodwaterSubsidence,
    },
  ];

  return (
    <View style={{ paddingHorizontal: 24, backgroundColor: '#171717', paddingBottom: 24 }}>
      {/* ── ABOUT THE NEIGHBORHOOD ─────────────────────── */}
      <SectionHeader title="ABOUT THE NEIGHBORHOOD" />
      <View style={{ backgroundColor: '#1D1D1D', borderRadius: 12, paddingHorizontal: 16 }}>
        {aboutRows.map((row, idx) => (
          <InfoDetailRow
            key={row.label}
            label={row.label}
            value={row.value}
            isLast={idx === aboutRows.length - 1}
          />
        ))}
      </View>

      {/* ── EXISTING FLOOD-RELATED HAZARDS ─────────────── */}
      <SectionHeader title="EXISTING FLOOD-RELATED HAZARDS" />
      <View style={{ backgroundColor: '#1D1D1D', borderRadius: 12, paddingHorizontal: 16 }}>
        {ALL_HAZARD_KEYS.map((key, idx) => {
          const active = neighborhoodData.floodRelatedHazards.includes(key);
          const isLast = idx === ALL_HAZARD_KEYS.length - 1;
          return (
            <View
              key={key}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
                ...(isLast
                  ? {}
                  : { borderBottomWidth: 1, borderBottomColor: '#2A2A2A' }),
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontFamily: 'Geist-Regular',
                  flex: 1,
                }}
              >
                {HAZARD_SHORT_LABELS[key] || key}
              </Text>
              <Text
                style={{
                  color: active ? '#FFFFFF' : '#6B7280',
                  fontSize: 14,
                  fontFamily: 'Geist-Medium',
                  minWidth: 28,
                  textAlign: 'right',
                }}
              >
                {active ? 'Yes' : 'No'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* ── OTHER NOTABLE INFORMATION ───────────────────── */}
      <SectionHeader title="OTHER NOTABLE INFORMATION" />
      <View
        style={{
          backgroundColor: '#1D1D1D',
          borderRadius: 12,
          padding: 16,
        }}
      >
        {neighborhoodData.notableInfo.length > 0 ? (
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 14,
              fontFamily: 'Geist-Regular',
              lineHeight: 22,
            }}
          >
            {neighborhoodData.notableInfo.join('; ')}
          </Text>
        ) : (
          <Text
            style={{
              color: '#6B7280',
              fontSize: 14,
              fontFamily: 'Geist-Regular',
              fontStyle: 'italic',
            }}
          >
            No notable information specified.
          </Text>
        )}
      </View>

      {/* ── FAMILY DETAILS ──────────────────────────────── */}
      <SectionHeader title="FAMILY DETAILS" />
      <View style={{ backgroundColor: '#1D1D1D', borderRadius: 12, overflow: 'hidden' }}>
        {/* 
          Placeholder: family detail data is not yet returned by the backend.
          When a families array is available on neighborhoodData, replace this
          block with an accordion list similar to the pattern below (commented).
        */}
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 14,
              fontFamily: 'Geist-Regular',
              fontStyle: 'italic',
            }}
          >
            No family data registered yet.
          </Text>
        </View>

        {/*
          ── Example accordion pattern (uncomment when backend provides families) ──
          {families.map((family, idx) => (
            <View key={idx}>
              <TouchableOpacity
                onPress={() => toggleFamily(idx)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: expandedFamilies[idx] ? 1 : 0,
                  borderBottomColor: '#2A2A2A',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Geist-Medium' }}>
                  {family.name}
                </Text>
                {expandedFamilies[idx]
                  ? <ChevronUp size={18} color="#9CA3AF" />
                  : <ChevronDown size={18} color="#9CA3AF" />}
              </TouchableOpacity>
              {expandedFamilies[idx] &&
                family.members.map((member, mIdx) => (
                  <View
                    key={mIdx}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      gap: 10,
                      borderBottomWidth: mIdx < family.members.length - 1 ? 1 : 0,
                      borderBottomColor: '#2A2A2A',
                    }}
                  >
                    <View style={{ width: 18, height: 18, borderRadius: 3, backgroundColor: '#374151' }} />
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Geist-Regular' }}>
                      {member}
                    </Text>
                  </View>
                ))}
            </View>
          ))}
        */}
      </View>

      {/* ── FOCAL PERSONS ───────────────────────────────── */}
      <SectionHeader title="FOCAL PERSONS" />
      <View
        style={{
          backgroundColor: '#1D1D1D',
          borderRadius: 12,
          padding: 16,
          gap: 4,
        }}
      >
        {/* Primary focal person */}
        {neighborhoodData.focalPerson.name ? (
          <TouchableOpacity
            onPress={onPrimaryFocalPersonPress}
            activeOpacity={0.7}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 6,
              }}
            >
              <AvatarIcon
                url={neighborhoodData.focalPerson.avatar}
                name={neighborhoodData.focalPerson.name}
                size={44}
              />
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontFamily: 'Geist-Regular',
                  flex: 1,
                }}
              >
                {neighborhoodData.focalPerson.name}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text
            style={{
              color: '#6B7280',
              fontSize: 14,
              fontFamily: 'Geist-Regular',
              fontStyle: 'italic',
              paddingVertical: 6,
            }}
          >
            No primary focal person assigned.
          </Text>
        )}

        {/* Divider */}
        {neighborhoodData.focalPerson.name &&
          neighborhoodData.alternativeFocalPerson.name ? (
          <View
            style={{ height: 1, backgroundColor: '#2A2A2A', marginVertical: 6 }}
          />
        ) : null}

        {/* Alternative focal person */}
        {neighborhoodData.alternativeFocalPerson.name ? (
          <TouchableOpacity
            onPress={onAlternativeFocalPersonPress}
            activeOpacity={0.7}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 6,
              }}
            >
              <AvatarIcon
                url={neighborhoodData.alternativeFocalPerson.avatar}
                name={neighborhoodData.alternativeFocalPerson.name}
                size={44}
              />
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontFamily: 'Geist-Regular',
                  flex: 1,
                }}
              >
                {neighborhoodData.alternativeFocalPerson.name}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};