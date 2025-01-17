import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
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
        } else {
          console.warn('Course document does not exist.');
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleStartExam = () => {
    navigation.navigate('CourseExam', { courseId });
  };

  const handleViewModule = (moduleId: string) => {
    navigation.navigate('CourseModule', { courseId, moduleId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Join Course</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {course && (
          <>
            <Text style={styles.courseTitle}>{course.name}</Text>
            <Text style={styles.courseDescription}>{course.description}</Text>
            <Text style={styles.modulesHeader}>Modules</Text>
            {modules.length > 0 ? (
              modules.map((module) => (
                <View key={module.id} style={styles.moduleContainer}>
                  <Text style={styles.moduleName}>{module.name}</Text>
                  <TouchableOpacity
                    style={styles.viewModuleButton}
                    onPress={() => handleViewModule(module.id)}
                  >
                    <Text style={styles.buttonText}>View Module</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noModulesText}>No modules available.</Text>
            )}
            {/* Start Exam Button */}
            <TouchableOpacity
              style={styles.startExamButton}
              onPress={handleStartExam}
            >
              <Text style={styles.startExamButtonText}>Start Exam</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#14213D',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFB703',
  },
  container: {
    padding: 16,
    backgroundColor: '#E5E5E5',
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
  moduleContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  moduleName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  viewModuleButton: {
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  startExamButton: {
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  startExamButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noModulesText: {
    fontSize: 16,
    color: '#666',
  },
});