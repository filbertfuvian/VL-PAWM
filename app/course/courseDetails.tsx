import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getFirestore, doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';

const db = getFirestore();

export default function CourseDetails() {
  const route = useRoute();
  const { courseId } = route.params;
  const auth = getAuth();
  const user = auth.currentUser;

  const [course, setCourse] = useState(null);
  const [modul, setModul] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        console.log('Fetching course data for courseId:', courseId);

        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          console.log('Course data:', courseData);
          setCourse(courseData);

          const modulSnapshot = await getDocs(collection(db, 'courses', courseId, 'modul'));
          const modulData = modulSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('Modul data with quizzes:', modulData);
          setModul(modulData);
        } else {
          console.error('Course not found in Firestore');
        }
      } catch (error) {
        console.error('Failed to fetch data from Firestore:', error);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleAnswerSelect = (modulId, questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [modulId]: {
        ...prev[modulId],
        [questionIndex]: answerIndex
      }
    }));
  };

  const calculateScore = (modul) => {
    let correctCount = 0;
    modul.quiz.forEach((quizItem, index) => {
      if (selectedAnswers[modul.id] && selectedAnswers[modul.id][index] === quizItem.correct_answer) {
        correctCount++;
      }
    });
    return (correctCount / modul.quiz.length) * 100;
  };

  const saveQuizPoints = async (modulId, score) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'courses', courseId, 'modul', modulId), {
        quizPoint: score
      });
    } catch (error) {
      console.error('Failed to save quiz points to Firestore:', error);
    }
  };

  const handleSubmitQuiz = (modul) => {
    const score = calculateScore(modul);
    saveQuizPoints(modul.id, score);
    alert(`Nilai kuis untuk modul ${modul.name}: ${score}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          {course ? (
            <>
              <Text style={styles.title}>{course.name}</Text>
              {modul.length > 0 ? (
                modul.map(modulItem => (
                  <View key={modulItem.id} style={styles.modulContainer}>
                    <Text style={styles.modulTitle}>{modulItem.name}</Text>
                    <Text style={styles.contentLink}>
                      Content Link: {modulItem.contentLink || 'Link tidak tersedia'}
                    </Text>
                    {modulItem.contentLink && (
                      <iframe
                        src={modulItem.contentLink}
                        width="100%"
                        height="500px"
                        style={styles.iframe}
                        title={modulItem.name}
                      />
                    )}
                    {modulItem.quiz && modulItem.quiz.length > 0 && (
                      <View style={styles.quizContainer}>
                        <Text style={styles.quizTitle}>Kuis</Text>
                        {modulItem.quiz.map((quizItem, questionIndex) => (
                          <View key={questionIndex} style={styles.quizItem}>
                            <Text style={styles.question}>
                              {questionIndex + 1}. {quizItem.question}
                            </Text>
                            {quizItem.answers.map((answer, answerIndex) => (
                              <TouchableOpacity
                                key={answerIndex}
                                style={[
                                  styles.answerButton,
                                  selectedAnswers[modulItem.id]?.[questionIndex] === answerIndex && styles.selectedAnswerButton
                                ]}
                                onPress={() => handleAnswerSelect(modulItem.id, questionIndex, answerIndex)}
                              >
                                <Text style={styles.answerText}>{answer}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        ))}
                        <TouchableOpacity
                          style={styles.submitButton}
                          onPress={() => handleSubmitQuiz(modulItem)}
                        >
                          <Text style={styles.submitButtonText}>Kirim Jawaban</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.description}>Tidak ada modul yang tersedia.</Text>
              )}
            </>
          ) : (
            <Text style={styles.description}>Kursus tidak ditemukan.</Text>
          )}
        </View>
      </ScrollView>
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
  modulContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modulTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentLink: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 8,
  },
  iframe: {
    border: 'none',
  },
  quizContainer: {
    marginTop: 16,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quizItem: {
    marginBottom: 16,
  },
  question: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  answerButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedAnswerButton: {
    backgroundColor: '#d0e0f0',
  },
  answerText: {
    fontSize: 12,
  },
  submitButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
});
