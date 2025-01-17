import { useState, useEffect, useCallback } from 'react';
import { 
  getDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './useAuth';

interface QuizData {
  question: string;
  answers: string[];
  correct_answer: number;
}

interface ModuleData {
  name: string;
  contentLink?: string;
  quiz?: QuizData[];
}

interface UseCourseModuleReturn {
  module: ModuleData | null;
  quiz: QuizData[];
  loading: boolean;
  error: string | null;
  submitQuiz: (selectedAnswers: { [key: number]: number }) => Promise<number | null>;
  isCompleted: boolean;
  refetch: () => void;
}

export function useCourseModule(courseId: string, moduleId: string): UseCourseModuleReturn {
  const { user, loading: authLoading } = useAuth();

  const [module, setModule] = useState<ModuleData | null>(null);
  const [quiz, setQuiz] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const fetchModuleData = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const moduleDoc = await getDoc(doc(db, 'courses', courseId, 'modul', moduleId));
      if (moduleDoc.exists()) {
        const moduleData = moduleDoc.data();
        setModule({
          name: moduleData.name || 'Unnamed Module',
          contentLink: moduleData.contentLink,
          quiz: moduleData.quiz || [],
        });

        if (moduleData.quiz && Array.isArray(moduleData.quiz)) {
          const quizData: QuizData[] = moduleData.quiz.map((q: any) => ({
            question: q.question,
            answers: q.answers,
            correct_answer: q.correct_answer,
          }));
          setQuiz(quizData);
        }

        // Fetch user's module completion status
        const userModuleDoc = await getDoc(doc(db, 'users', user.uid, 'courses', courseId, 'modul', moduleId));
        if (userModuleDoc.exists()) {
          const userModuleData = userModuleDoc.data();
          setIsCompleted(userModuleData.completed || false);
        }
      } else {
        setError('Module does not exist.');
      }
    } catch (err: any) {
      console.error('Error fetching module data:', err);
      setError(err.message || 'Error fetching module data.');
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId, user, authLoading]);

  useEffect(() => {
    fetchModuleData();
  }, [fetchModuleData]);

  const submitQuiz = async (selectedAnswers: { [key: number]: number }): Promise<number | null> => {
    if (!user) {
      setError('User not authenticated.');
      return null;
    }

    let calculatedScore = 0;
    quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) { 
        calculatedScore += 1;
      }
    });
    setIsCompleted(true);

    try {
      const userModuleRef = doc(db, 'users', user.uid, 'courses', courseId, 'modul', moduleId);
      await updateDoc(userModuleRef, { completed: true });
      console.log('Module marked as completed.');
      return calculatedScore;
    } catch (err) {
      console.error('Error updating module completion status:', err);
      setError('Error submitting quiz.');
      return null;
    }
  };

  return { module, quiz, loading, error, submitQuiz, isCompleted, refetch: fetchModuleData };
}