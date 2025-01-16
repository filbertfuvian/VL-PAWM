import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Image, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';

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
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {filteredCourses.map(course => (
          <TouchableOpacity key={course.id} onPress={() => handleCoursePress(course.id)}>
            <View style={styles.courseCard}>
              <Image
                source={{ uri: `data:image/png;base64,${course.image}` }}
                style={styles.courseImage}
              />
              <Text style={styles.courseName}>{course.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  courseCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  courseImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
