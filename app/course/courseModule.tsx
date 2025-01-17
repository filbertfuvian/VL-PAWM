import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView, 
  Platform 
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCourseModule } from '@/hooks/useCourseModule';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { WebView } from 'react-native-webview';

export default function CourseModule() {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId, moduleId } = route.params as { courseId: string; moduleId: string };

  const { module, quiz, loading, error, submitQuiz, isCompleted, refetch } = useCourseModule(courseId, moduleId);

  useFocusEffect(
    useCallback(() => {
      if (refetch) {
        refetch();
      }
    }, [refetch])
  );

  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [score, setScore] = useState<number | null>(null);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    const calculatedScore = await submitQuiz(selectedAnswers);
    if (calculatedScore !== null) {
      setScore(calculatedScore);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading module...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!module) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Module not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconSymbol
            name="chevron.left"
            size={28}
            color="#FFB703"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{module ? module.name : 'Course Module'}</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.moduleTitle}>Content</Text>
        
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
            <WebView
              source={{ uri: module.contentLink }}
              style={styles.webview}
              allowsInlineMediaPlayback
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0000ff" />
                  <Text style={styles.loadingText}>Loading PDF...</Text>
                </View>
              )}
            />
          )
        ) : (
          <Text style={styles.noContentText}>No content available.</Text>
        )}
      </View>

      {!isCompleted && quiz.length > 0 && (
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
                  disabled={score !== null}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          {score === null ? (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitQuiz}>
              <Text style={styles.submitButtonText}>Submit Answers</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.scoreText}>
              You scored {score} out of {quiz.length}
            </Text>
          )}
        </View>
      )}

      {isCompleted && (
        <Text style={styles.completedText}>You have completed this module.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40, 
    paddingBottom: 16,
    paddingHorizontal: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  contentContainer: {
    marginBottom: 24,
  },
  moduleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
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
  pdf: {
    flex: 1,
    width: '100%',
    height: 600, // Adjust height as needed
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
    color: '#14213D',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    textAlign: 'center',
  },
  noContentText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});