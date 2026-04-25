import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
import { ChildInfo } from '../../types/database';

interface ChildSelectorProps {
  children: ChildInfo[];
  selected: ChildInfo | null;
  onSelect: (child: ChildInfo) => void;
}

export function ChildSelector({ children, selected, onSelect }: ChildSelectorProps) {
  const theme = useTheme();

  if (children.length === 0) return null;

  if (children.length === 1) {
    const child = children[0];
    return (
      <View style={styles.singleChild}>
        <Avatar name={child.full_name} size={36} />
        <Text style={[Typography.bodyMedium, { color: theme.text, marginLeft: 12 }]}>
          {child.full_name}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {children.map((child) => {
        const isSelected = selected?.id === child.id;
        return (
          <Pressable
            key={child.id}
            onPress={() => onSelect(child)}
            style={[
              styles.card,
              {
                backgroundColor: isSelected ? theme.primary : theme.surface,
                borderColor: isSelected ? theme.primary : theme.borderLight,
                borderWidth: 1,
              },
            ]}
          >
            <Avatar name={child.full_name} size={32} />
            <Text
              style={[
                Typography.bodySemiBold,
                {
                  color: isSelected ? '#FFFFFF' : theme.text,
                  marginLeft: 10,
                },
              ]}
            >
              {child.full_name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  singleChild: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scrollContainer: {
    gap: 12,
    paddingVertical: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
