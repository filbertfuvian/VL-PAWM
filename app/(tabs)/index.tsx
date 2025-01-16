import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { getDocs, collection, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [ongoingCourses, setOngoingCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserName();
      fetchUserCourses();
    }
  }, [user]);

  const fetchUserName = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().name);
      }
    } catch (err) {
      console.error('Error fetching user name:', err);
    }
  };

  const fetchUserCourses = async () => {
    try {
      const ongoingQuery = query(
        collection(db, 'users', user.uid, 'courses'),
        where('completed', '==', false)
      );
      const completedQuery = query(
        collection(db, 'users', user.uid, 'courses'),
        where('completed', '==', true)
      );

      const ongoingSnapshot = await getDocs(ongoingQuery);
      const completedSnapshot = await getDocs(completedQuery);

      const ongoingCoursesData = await Promise.all(
        ongoingSnapshot.docs.map(async (document) => {
          const courseDoc = await getDoc(doc(db, 'courses', document.id));
          return {
            id: document.id,
            ...(courseDoc.data() || {}),
          };
        })
      );

      const completedCoursesData = await Promise.all(
        completedSnapshot.docs.map(async (document) => {
          const courseDoc = await getDoc(doc(db, 'courses', document.id));
          return {
            id: document.id,
            ...courseDoc.data(),
          };
        })
      );

      setOngoingCourses(ongoingCoursesData);
      setCompletedCourses(completedCoursesData);
    } catch (err) {
      console.error('Error fetching user courses:', err);
    }
  };

  const handleCoursePress = (courseId) => {
    navigation.navigate('CourseStack', {
      screen: 'CourseDetails',
      params: { courseId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <View style={styles.separator} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.label}>Hello, {userName}</Text>
          <Text style={styles.value}></Text>
          <Text style={styles.label}>Your Courses</Text>
          {ongoingCourses.map(course => (
            <TouchableOpacity key={course.id} onPress={() => handleCoursePress(course.id)}>
              <View style={styles.courseCard}>
                <Image source={{ uri: `data:image/png;base64,${course.image}` }} style={styles.courseImage} />
                <Text style={styles.courseName}>{course.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Completed Courses</Text>
          {completedCourses.map(course => (
            <TouchableOpacity key={course.id} onPress={() => handleCoursePress(course.id)}>
              <View style={styles.courseCard}>
                <Image source={{ uri: `data:image/png;base64,${course.image}` }} style={styles.courseImage} />
                <Text style={styles.courseName}>{course.name}</Text>
              </View>
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
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
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
