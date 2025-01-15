import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';

export default function Profile() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      {/* Garis Pemisah */}
      <View style={styles.separator} />

      {/* Konten */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.label}>Nama:</Text>
          <Text style={styles.value}></Text>
          <Text style={styles.label}>Kelas:</Text>
          <Text style={styles.value}></Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#ddd',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    width: '100%',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    marginBottom: 16,
  },
});
