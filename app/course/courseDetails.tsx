import React, { useCallback } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCourseDetails } from '@/hooks/useCourseDetails';

export default function CourseDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId } = route.params as { courseId: string };

  const { course, modules, examCompleted, loading, error, refetch } = useCourseDetails(courseId);

  useFocusEffect(
    useCallback(() => {
      if (refetch) {
        refetch();
      }
    }, [refetch])
  );

  const handleStartExam = () => {
    if (modules.every(mod => mod.completed)) {
      navigation.navigate('CourseExam', { courseId });
    } else {
      Alert.alert('Incomplete Modules', 'Please complete all modules before starting the exam.');
    }
  };

  const handleViewModule = (moduleId: string, index: number) => {
    if (index === 0 || modules[index - 1].completed) {
      navigation.navigate('CourseModule', { courseId, moduleId });
    } else {
      Alert.alert('Access Restricted', 'Please complete the previous module first.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{course ? course.name : 'Course Details'}</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !course ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Course not found.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.courseInfo}>
            <Text style={styles.courseDescription}>{course.description}</Text>
          </View>
          <Text style={styles.modulesHeader}>Modules</Text>
          {modules.length > 0 ? (
            modules.map((module, index) => {
              const isFirstModule = index === 0;
              const isAccessible = isFirstModule || modules[index - 1].completed;

              return (
                <View key={module.id} style={styles.moduleContainer}>
                  <Text style={styles.moduleName}>{module.name}</Text>
                  <TouchableOpacity
                    style={[
                      styles.viewModuleButton,
                      !isAccessible && styles.disabledButton,
                    ]}
                    onPress={() => handleViewModule(module.id, index)}
                    disabled={!isAccessible}
                  >
                    <Text style={styles.buttonText}>
                      {module.completed ? 'Completed' : 'View Module'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text style={styles.noModulesText}>No modules available.</Text>
          )}
          {/* Start Exam Button */}
          <TouchableOpacity
            style={[
              styles.startExamButton,
              (!modules.every(mod => mod.completed) || examCompleted) && styles.disabledButton,
            ]}
            onPress={handleStartExam}
            disabled={!modules.every(mod => mod.completed) || examCompleted}
          >
            <Text style={styles.startExamButtonText}>
              {examCompleted ? 'Exam Completed' : 'Start Exam'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#14213D',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#FFB703',
    fontSize: 16,
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
  courseInfo: {
    marginBottom: 16,
  },
  courseDescription: {
    fontSize: 16,
    color: '#333333',
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
    elevation: 2, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.1, // For iOS shadow
    shadowRadius: 4, // For iOS shadow
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
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  buttonText: {
    color: '#ffffff',
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
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noModulesText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#14213D',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});