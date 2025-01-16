import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Image, View, Text, Dimensions, Platform, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';

const { width } = Dimensions.get('window');

export default function CourseScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { courses, userCourseJoined } = useCourses();

  const handleCoursePress = async (courseId: string) => {
    if (!user) return;
    const isJoined = await userCourseJoined(user.uid, courseId);
    if (isJoined) {
      navigation.navigate('CourseDetails', { courseId });
    } else {
      navigation.navigate('CourseJoin', { courseId });
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Courses</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.grid}>
          {filteredCourses.map(course => (
            <TouchableOpacity key={course.id} onPress={() => handleCoursePress(course.id)} style={styles.courseCard}>
              <Image source={{ uri: `data:image/png;base64,${course.image}` }} style={styles.courseImage} />
              <Text style={styles.courseName}>{course.name}</Text>
            </TouchableOpacity>
          ))}
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
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  contentContainer: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  courseCard: {
    width: Platform.OS === 'web' ? width * 0.22 : width * 0.45, // Adjust the width based on platform
    height: Platform.OS === 'web' ? width * 0.22 : width * 0.45, // Make the height equal to the width for a square shape
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseImage: {
    width: '100%',
    height: '70%', // Adjust the height to fit within the card
    marginBottom: 8,
    resizeMode: 'contain',
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
