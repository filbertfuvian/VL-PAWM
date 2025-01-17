import { useState, useEffect, useCallback } from 'react';
import { 
  getDocs, 
  collection, 
  QuerySnapshot, 
  DocumentData, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './useAuth';

interface ExamData {
  id: string;
  question: string;
  answers: string[];
  correct_answer: number;
}

interface UseCourseExamReturn {
  exams: ExamData[];
  loading: boolean;
  error: string | null;
  submitExam: (selectedAnswers: { [key: string]: number }) => Promise<number | null>;
  refetch: () => void;
}

export function useCourseExam(courseId: string): UseCourseExamReturn {
  const { user, loading: authLoading } = useAuth();

  const [exams, setExams] = useState<ExamData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExamData = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const examCollection = collection(db, 'courses', courseId, 'exam');
      const examSnapshot: QuerySnapshot<DocumentData> = await getDocs(examCollection);
      if (!examSnapshot.empty) {
        const examData: ExamData[] = examSnapshot.docs.map(doc => ({
          id: doc.id,
          question: doc.data().question,
          answers: doc.data().answers,
          correct_answer: doc.data().correct_answer,
        }));
        setExams(examData);
        setError(null);
      } else {
        setError('No exam data found.');
        setExams([]);
      }
    } catch (err: any) {
      console.error('Error fetching exam data:', err);
      setError(err.message || 'Error fetching exam data.');
    } finally {
      setLoading(false);
    }
  }, [courseId, user, authLoading]);

  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);

  const submitExam = async (selectedAnswers: { [key: string]: number }): Promise<number | null> => {
    if (!user) {
      setError('User not authenticated.');
      return null;
    }

    let calculatedScore = 0;
    exams.forEach((exam) => {
      if (selectedAnswers[exam.id] === exam.correct_answer) {
        calculatedScore += 1;
      }
    });

    try {
      const userCourseRef = doc(db, 'users', user.uid, 'courses', courseId);
      await updateDoc(userCourseRef, { completed: true });
      console.log('Course marked as completed.');
      return calculatedScore;
    } catch (err) {
      console.error('Error updating course completion status:', err);
      setError('Error submitting exam.');
      return null;
    }
  };

  return { exams, loading, error, submitExam, refetch: fetchExamData };
}