import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUser } from '@/hooks/useUser';

export default function Profile() {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;
      const userData = await getUser(user.uid);
      if (userData?.name) {
        setUserName(userData.name);
      }
    };
    fetchUserName();
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <View style={styles.separator} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.label}>Nama:</Text>
          <Text style={styles.value}>{userName}</Text>
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
