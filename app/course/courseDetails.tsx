import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getDoc, doc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/hooks/useAuth';

interface ModuleData {
  id: string;
  name: string;
}

export default function CourseDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId } = route.params as { courseId: string };
  const { user } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          setCourse(courseData);

          const modulSnapshot = await getDocs(collection(db, 'courses', courseId, 'modul'));
          const modulData = modulSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setModules(modulData);
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleModulePress = (moduleId: string) => {
    navigation.navigate('CourseModule', { courseId, moduleId });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {course && (
        <>
          <Text style={styles.courseTitle}>{course.name}</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>
          <Text style={styles.modulesHeader}>Modules</Text>
          {modules.length > 0 ? (
            modules.map(module => (
              <TouchableOpacity
                key={module.id}
                onPress={() => handleModulePress(module.id)}
                style={styles.moduleButton}
              >
                <Text style={styles.moduleText}>{module.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noModulesText}>No modules available.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
  modulesHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  moduleButton: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  moduleText: {
    fontSize: 18,
  },
  noModulesText: {
    fontSize: 16,
    color: '#666',
  },
});