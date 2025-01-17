import React, { useState, useCallback } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCourseExam } from '@/hooks/useCourseExam';

export default function CourseExam() {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId } = route.params as { courseId: string };

  const { exams, loading, error, submitExam, refetch } = useCourseExam(courseId);

  useFocusEffect(
    useCallback(() => {
      if (refetch) {
        refetch();
      }
    }, [refetch])
  );

  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [score, setScore] = useState<number | null>(null);
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  const handleAnswerSelect = (examId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [examId]: answerIndex,
    }));
  };

  const handleSubmit = async () => {
    const calculatedScore = await submitExam(selectedAnswers);
    if (calculatedScore !== null) {
      setScore(calculatedScore);
      setExamSubmitted(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Exam</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading exam...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : exams.length === 0 ? (
        <View style={styles.container}>
          <Text style={styles.errorText}>No exams available for this course.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {exams.map((exam, index) => (
            <View key={exam.id} style={styles.questionContainer}>
              <Text style={styles.questionText}>{`${index + 1}. ${exam.question}`}</Text>
              {exam.answers.map((answer, answerIndex) => (
                <TouchableOpacity
                  key={answerIndex}
                  style={[
                    styles.answerButton,
                    selectedAnswers[exam.id] === answerIndex && styles.selectedAnswerButton,
                    examSubmitted && answerIndex === exam.correct_answer && styles.correctAnswerButton,
                  ]}
                  onPress={() => handleAnswerSelect(exam.id, answerIndex)}
                  disabled={examSubmitted}
                >
                  <Text style={styles.answerText}>{answer}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          {!examSubmitted ? (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Exam</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.scoreText}>
              You scored {score} out of {exams.length}
            </Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 12,
    color: '#14213D',
  },
  answerButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedAnswerButton: {
    backgroundColor: '#d0eaff',
  },
  correctAnswerButton: {
    backgroundColor: '#4CAF50',
  },
  answerText: {
    fontSize: 16,
    color: '#14213D',
  },
  submitButton: {
    padding: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    textAlign: 'center',
  },
});