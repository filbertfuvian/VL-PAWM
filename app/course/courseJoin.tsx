import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';

export default function CourseJoin() {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId } = route.params as { courseId: string };
  const { courses, joinCourse } = useCourses();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCourse = useCallback(() => {
    const selectedCourse = courses.find(c => c.id === courseId);
    if (selectedCourse) {
      setCourse(selectedCourse);
    }
    setLoading(false);
  }, [courses, courseId]);

  useFocusEffect(
    useCallback(() => {
      fetchCourse();
    }, [fetchCourse])
  );

  const handleJoinCourse = async () => {
    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to join a course.');
      return;
    }

    try {
      await joinCourse(user.uid, courseId);
      Alert.alert('Success', 'You have successfully joined the course!');
      navigation.navigate('CourseDetails', { courseId });
    } catch (error) {
      console.error('Error joining course:', error);
      Alert.alert('Error', 'Failed to join the course. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading course details...</Text>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Course not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Course Image */}
        <Image source={{ uri: `data:image/png;base64,${course.image}` }} style={styles.courseImage} />

        {/* Course Name */}
        <Text style={styles.courseName}>{course.name}</Text>

        {/* Course Description */}
        <Text style={styles.courseDescription}>{course.description}</Text>

        {/* Join Button */}
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinCourse}>
          <Text style={styles.joinButtonText}>Join Course</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  courseImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  courseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#14213D',
    marginBottom: 12,
    textAlign: 'center',
  },
  courseDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});