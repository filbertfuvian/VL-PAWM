import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView, 
  Platform 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { WebView } from 'react-native-webview';

interface QuizData {
  question: string;
  answers: string[];
  correct_answer: number;
}

export default function CourseModule() {
  const route = useRoute();
  const { courseId, moduleId } = route.params as { courseId: string; moduleId: string };

  const [module, setModule] = useState<any>(null);
  const [quiz, setQuiz] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        const moduleDoc = await getDoc(doc(db, 'courses', courseId, 'modul', moduleId));
        if (moduleDoc.exists()) {
          const moduleData = moduleDoc.data();
          setModule(moduleData);
          
          // Check if 'quiz' exists and is an array
          if (moduleData.quiz && Array.isArray(moduleData.quiz)) {
            const quizData: QuizData[] = moduleData.quiz.map((q: any) => ({
              question: q.question,
              answers: q.answers,
              correct_answer: q.correct_answer,
            }));
            setQuiz(quizData);
          } else {
            console.warn('No quiz data found or quiz is not an array.');
          }
        } else {
          console.warn('Module document does not exist.');
        }
      } catch (err) {
        console.error('Error fetching module data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [courseId, moduleId]);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    let calculatedScore = 0;
    quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) { 
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

  if (!module) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Module not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.moduleTitle}>{module.name}</Text>
      
      {module.contentLink ? (
        Platform.OS === 'web' ? (
          <View style={styles.pdfContainerWeb}>
            <iframe 
              src={module.contentLink} 
              style={styles.iframe}
              title="Module PDF"
            />
          </View>
        ) : (
          <View style={styles.pdfContainer}>
            <WebView 
              source={{ uri: module.contentLink }} 
              style={styles.webview} 
            />
          </View>
        )
      ) : (
        <Text style={styles.noPdfText}>No PDF available for this module.</Text>
      )}

      {quiz.length > 0 && (
        <View style={styles.quizContainer}>
          <Text style={styles.quizHeader}>Quiz</Text>
          {quiz.map((q, index) => (
            <View key={index} style={styles.questionContainer}>
              <Text style={styles.questionText}>{q.question}</Text>
              {q.answers.map((option, optIndex) => (
                <TouchableOpacity
                  key={optIndex}
                  style={[
                    styles.optionButton,
                    selectedAnswers[index] === optIndex && styles.selectedOptionButton,
                  ]}
                  onPress={() => handleAnswerSelect(index, optIndex)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitQuiz}>
            <Text style={styles.submitButtonText}>Submit Answers</Text>
          </TouchableOpacity>
          {score !== null && (
            <Text style={styles.scoreText}>
              You scored {score} out of {quiz.length}
            </Text>
          )}
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pdfContainer: {
    height: 400,
    marginBottom: 16,
  },
  pdfContainerWeb: {
    width: '100%',
    height: 600,
    marginBottom: 16,
  },
  webview: {
    flex: 1,
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  noPdfText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  quizContainer: {
    marginTop: 16,
  },
  quizHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 8,
  },
  optionButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOptionButton: {
    backgroundColor: '#d0eaff',
  },
  optionText: {
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});