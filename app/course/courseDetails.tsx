import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CourseDetails() {
  return (
    <View style={styles.container}>
      <Text style={styles.comingSoonText}>Coming Soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
