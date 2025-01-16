import React from 'react';
import { SafeAreaView, View, StyleSheet, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useCourses } from '@/hooks/useCourses';

export default function CourseDetails() {
  const route = useRoute();
  const { courseId } = route.params as { courseId: string };
  const { courses } = useCourses();
  const course = courses.find(c => c.id === courseId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {course ? (
          <>
            <Text style={styles.title}>{course.name}</Text>
            <Text style={styles.description}>
              This is the details page for {course.name}.
            </Text>
          </>
        ) : (
          <Text style={styles.description}>Course not found.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
  },
});