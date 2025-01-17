import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getDocs, collection, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

interface ExamData {
  id: string;
  questions: string;
  answers: string[];
  correct_answer: number;
}

export default function CourseExam() {
  const route = useRoute();
  const { courseId } = route.params as { courseId: string };

  const [exams, setExams] = useState<ExamData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const examCollection = collection(db, 'courses', courseId, 'exam');
        const examSnapshot: QuerySnapshot<DocumentData> = await getDocs(examCollection);
        if (!examSnapshot.empty) {
          const examData: ExamData[] = examSnapshot.docs.map(doc => ({
            id: doc.id,
            questions: doc.data().questions,
            answers: doc.data().answers,
            correct_answer: doc.data().correct_answer,
          }));
          setExams(examData);
        } else {
          console.warn('No exam data found.');
        }
      } catch (err) {
        console.error('Error fetching exam data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [courseId]);

  const handleAnswerSelect = (examId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [examId]: answerIndex,
    }));
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    exams.forEach((exam) => {
      if (selectedAnswers[exam.id] === exam.correct_answer) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (exams.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No exams available for this course.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Course Exam</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {exams.map((exam, index) => (
          <View key={exam.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>{`${index + 1}. ${exam.questions}`}</Text>
            {exam.answers.map((answer, answerIndex) => (
              <TouchableOpacity
                key={answerIndex}
                style={[
                  styles.answerButton,
                  selectedAnswers[exam.id] === answerIndex && styles.selectedAnswerButton,
                ]}
                onPress={() => handleAnswerSelect(exam.id, answerIndex)}
              >
                <Text style={styles.answerText}>{answer}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Exam</Text>
        </TouchableOpacity>
        {score !== null && (
          <Text style={styles.scoreText}>
            You scored {score} out of {exams.length}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
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
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedAnswerButton: {
    backgroundColor: '#d0eaff',
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
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});