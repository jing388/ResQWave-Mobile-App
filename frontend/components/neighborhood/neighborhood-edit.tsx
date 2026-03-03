import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Dropdown } from '@/components/ui/dropdown';
import { EditableCheckbox } from '@/components/ui/editable-checkbox';
import { EditedData, Family, NeighborhoodData } from '@/types/neighborhood';
import { NeighborhoodDropdownOptions } from '@/constants/neighborhood-options';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp, Pencil, Trash2, Plus } from 'lucide-react-native';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface NeighborhoodEditProps {
  neighborhoodData: NeighborhoodData;
  editedData: EditedData;
  dropdownOptions: NeighborhoodDropdownOptions;
  onDropdownChange: (field: string, value: string) => void;
  onHazardToggle: (index: number) => void;
  onNotableInfoChange: (text: string) => void;
  onAlternativeFocalChange: (field: string, text: string) => void;
  onAddFamily: () => void;
  onDeleteFamily: (id: string) => void;
  onRenameFamilyStart: (id: string) => void;
  onRenameFamilyCommit: (id: string, newName: string) => void;
  onToggleFamilyExpand: (id: string) => void;
  onAddMember: (familyId: string) => void;
  onDeleteMember: (familyId: string, memberId: string) => void;
  onRenameMemberStart: (familyId: string, memberId: string) => void;
  onRenameMemberCommit: (familyId: string, memberId: string, newName: string) => void;
}

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

const SectionHeader = ({ title }: { title: string }) => (
  <Text
    style={{
      color: '#9CA3AF',
      fontSize: 11,
      fontFamily: 'Geist-Medium',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginTop: 20,
      marginBottom: 10,
    }}
  >
    {title}
  </Text>
);

const DropdownField = ({
  label,
  value,
  options,
  onChange,
  isLast = false,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
  isLast?: boolean;
}) => (
  <View style={{ marginBottom: isLast ? 0 : 16 }}>
    <Text
      style={{
        color: '#D1D5DB',
        fontSize: 14,
        fontFamily: 'Geist-Medium',
        marginBottom: 8,
      }}
    >
      {label}
    </Text>
    <Dropdown
      options={options}
      selectedValue={value}
      onValueChange={onChange}
      placeholder={`Select ${label.toLowerCase()}`}
    />
  </View>
);

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export const NeighborhoodEdit: React.FC<NeighborhoodEditProps> = ({
  editedData,
  dropdownOptions,
  onDropdownChange,
  onHazardToggle,
  onNotableInfoChange,
  onAddFamily,
  onDeleteFamily,
  onRenameFamilyStart,
  onRenameFamilyCommit,
  onToggleFamilyExpand,
  onAddMember,
  onDeleteMember,
  onRenameMemberStart,
  onRenameMemberCommit,
}) => {
  // Local draft state for family name inputs (keyed by family id)
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  // Local draft state for member name inputs (keyed by "familyId_memberId")
  const [draftMemberNames, setDraftMemberNames] = useState<Record<string, string>>({});

  const getDraft = (id: string, fallback: string) =>
    draftNames[id] !== undefined ? draftNames[id] : fallback;

  const setDraft = (id: string, value: string) =>
    setDraftNames((prev) => ({ ...prev, [id]: value }));

  const commitDraft = (id: string, fallback: string) => {
    const name = draftNames[id] !== undefined ? draftNames[id] : fallback;
    onRenameFamilyCommit(id, name || fallback);
    setDraftNames((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Helper functions for member drafts
  const getMemberDraft = (familyId: string, memberId: string, fallback: string) => {
    const key = `${familyId}_${memberId}`;
    return draftMemberNames[key] !== undefined ? draftMemberNames[key] : fallback;
  };

  const setMemberDraft = (familyId: string, memberId: string, value: string) => {
    const key = `${familyId}_${memberId}`;
    setDraftMemberNames((prev) => ({ ...prev, [key]: value }));
  };

  const commitMemberDraft = (familyId: string, memberId: string, fallback: string) => {
    const key = `${familyId}_${memberId}`;
    const name = draftMemberNames[key] !== undefined ? draftMemberNames[key] : fallback;
    onRenameMemberCommit(familyId, memberId, name || fallback);
    setDraftMemberNames((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const cardStyle = {
    backgroundColor: '#1D1D1D',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  };

  return (
    <View
      style={{
        paddingHorizontal: 24,
        backgroundColor: '#171717',
        paddingBottom: 40,
      }}
    >
      {/* ── ABOUT THE NEIGHBORHOOD ─────────────────────── */}
      <SectionHeader title="ABOUT THE NEIGHBORHOOD" />
      <View style={{ ...cardStyle, paddingVertical: 20 }}>
        <DropdownField
          label="Approx No. of Households"
          value={String(editedData.approxHouseholds)}
          options={dropdownOptions.households}
          onChange={(v) => onDropdownChange('approxHouseholds', v)}
        />
        <DropdownField
          label="Approx No. of Residents"
          value={String(editedData.approxResidents)}
          options={dropdownOptions.residents}
          onChange={(v) => onDropdownChange('approxResidents', v)}
        />
        <DropdownField
          label="Floodwater Subsidence"
          value={editedData.floodwaterSubsidence}
          options={dropdownOptions.subsidenceDuration}
          onChange={(v) => onDropdownChange('floodwaterSubsidence', v)}
          isLast
        />
      </View>

      {/* ── EXISTING FLOOD-RELATED HAZARDS ─────────────── */}
      <SectionHeader title="EXISTING FLOOD-RELATED HAZARDS" />
      <View style={{ ...cardStyle, paddingVertical: 8 }}>
        {editedData.floodRelatedHazards.map((hazard, index) => (
          <EditableCheckbox
            key={index}
            label={hazard.label}
            checked={hazard.checked}
            onToggle={() => onHazardToggle(index)}
          />
        ))}
      </View>

      {/* ── FAMILY DETAILS ──────────────────────────────── */}
      <SectionHeader title="FAMILY DETAILS" />
      <View style={{ backgroundColor: '#1D1D1D', borderRadius: 12, overflow: 'hidden' }}>
        {editedData.families.length === 0 ? (
          <View style={{ paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center' }}>
            <Text style={{ color: '#6B7280', fontSize: 14, fontFamily: 'Geist-Regular', fontStyle: 'italic' }}>
              No families added yet.
            </Text>
          </View>
        ) : (
          editedData.families.map((family, idx) => {
            const isLast = idx === editedData.families.length - 1;
            const isExpanded = !!family.expanded;
            const isEditing = !!family.editing;

            return (
              <View
                key={family.id}
                style={{
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: '#2A2A2A',
                }}
              >
                {isEditing ? (
                  /* Inline name editor row */
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      gap: 10,
                    }}
                  >
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: '#2A2A2A',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: '#FFFFFF',
                        fontSize: 14,
                        fontFamily: 'Geist-Regular',
                      }}
                      value={getDraft(family.id, family.name)}
                      onChangeText={(v) => setDraft(family.id, v)}
                      onBlur={() => commitDraft(family.id, family.name)}
                      onSubmitEditing={() => commitDraft(family.id, family.name)}
                      placeholder="Family name"
                      placeholderTextColor="#6B7280"
                      autoFocus
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      onPress={() => onDeleteFamily(family.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Collapsed / header row */
                  <TouchableOpacity
                    onPress={() => onToggleFamilyExpand(family.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      gap: 8,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        flex: 1,
                        color: '#FFFFFF',
                        fontSize: 14,
                        fontFamily: 'Geist-Medium',
                      }}
                    >
                      {family.name || 'Unnamed Family'}
                    </Text>
                    {isExpanded && (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            setDraft(family.id, family.name);
                            onRenameFamilyStart(family.id);
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Pencil size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => onDeleteFamily(family.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={18} color="#9CA3AF" />
                    ) : (
                      <ChevronDown size={18} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                )}

                {/* Member list (expanded, not editing header) */}
                {isExpanded && !isEditing && (
                  <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                    {/* Existing members */}
                    {family.members.map((member, mIdx) => {
                      const isEditingMember = !!member.editing;
                      return isEditingMember ? (
                        /* Member edit mode */
                        <View
                          key={member.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ color: '#9CA3AF', fontSize: 14, fontFamily: 'Geist-Regular' }}>
                            •
                          </Text>
                          <TextInput
                            style={{
                              flex: 1,
                              backgroundColor: '#2A2A2A',
                              borderRadius: 6,
                              paddingHorizontal: 10,
                              paddingVertical: 8,
                              color: '#FFFFFF',
                              fontSize: 14,
                              fontFamily: 'Geist-Regular',
                            }}
                            value={getMemberDraft(family.id, member.id, member.name)}
                            onChangeText={(v) => setMemberDraft(family.id, member.id, v)}
                            onBlur={() => commitMemberDraft(family.id, member.id, member.name)}
                            onSubmitEditing={() => commitMemberDraft(family.id, member.id, member.name)}
                            placeholder="Member name"
                            placeholderTextColor="#6B7280"
                            autoFocus
                            returnKeyType="done"
                          />
                          <TouchableOpacity
                            onPress={() => onDeleteMember(family.id, member.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Trash2 size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        /* Member view mode */
                        <View
                          key={member.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ color: '#9CA3AF', fontSize: 14, fontFamily: 'Geist-Regular' }}>
                            •
                          </Text>
                          <Text
                            style={{
                              flex: 1,
                              color: '#FFFFFF',
                              fontSize: 14,
                              fontFamily: 'Geist-Regular',
                            }}
                          >
                            {member.name}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              setMemberDraft(family.id, member.id, member.name);
                              onRenameMemberStart(family.id, member.id);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Pencil size={14} color="#9CA3AF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => onDeleteMember(family.id, member.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Trash2 size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}

                    {/* Add Member button */}
                    <TouchableOpacity
                      onPress={() => onAddMember(family.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 8,
                      }}
                      activeOpacity={0.7}
                    >
                      <Plus size={14} color="#3B82F6" />
                      <Text style={{ color: '#3B82F6', fontSize: 13, fontFamily: 'Geist-Medium' }}>
                        Add Member
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Add Family button */}
        <TouchableOpacity
          onPress={onAddFamily}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderTopWidth: editedData.families.length > 0 ? 1 : 0,
            borderTopColor: '#2A2A2A',
          }}
          activeOpacity={0.7}
        >
          <Plus size={16} color="#3B82F6" />
          <Text style={{ color: '#3B82F6', fontSize: 14, fontFamily: 'Geist-Medium' }}>
            Add Family
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── OTHER NOTABLE INFORMATION ───────────────────── */}
      <SectionHeader title="OTHER NOTABLE INFORMATION" />
      <View style={{ ...cardStyle, paddingVertical: 16 }}>
        <AutosizeTextarea
          label=""
          value={editedData.notableInfo}
          onChangeText={onNotableInfoChange}
          placeholder="More info about the neighborhood"
          minHeight={100}
          maxHeight={350}
          showResizeHandle={true}
        />
      </View>
    </View>
  );
};
