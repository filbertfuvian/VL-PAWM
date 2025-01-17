import React, { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface CollapsibleProps extends PropsWithChildren {
  title: string;
}

export function Collapsible({ children, title }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color="#333"
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <Text style={styles.titleText}>{title}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    marginLeft: 6,
    color: '#333',
    fontWeight: 'bold',
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});