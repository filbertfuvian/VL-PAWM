import { useState, useEffect, useCallback } from 'react';
import { 
  getDoc, 
  doc, 
  collection, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './useAuth';

interface ModuleData {
  id: string;
  name: string;
  completed: boolean;
}

interface CourseData {
  id: string;
  name: string;
  description: string;
}

interface UseCourseDetailsReturn {
  course: CourseData | null;
  modules: ModuleData[];
  examCompleted: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCourseDetails(courseId: string): UseCourseDetailsReturn {
  const { user, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState<CourseData | null>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [examCompleted, setExamCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseData = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch course details
      const courseDocRef = doc(db, 'courses', courseId);
      const courseDocSnap = await getDoc(courseDocRef);
      if (!courseDocSnap.exists()) {
        throw new Error('Course does not exist.');
      }

      const courseData = courseDocSnap.data();
      setCourse({
        id: courseDocSnap.id,
        name: courseData.name || 'Unnamed Course',
        description: courseData.description || '',
      });

      // Fetch modules
      const modulesCollectionRef = collection(db, 'courses', courseId, 'modul');
      const modulesSnapshot = await getDocs(modulesCollectionRef);
      const fetchedModules: ModuleData[] = modulesSnapshot.docs
        .filter(docSnap => docSnap.id && docSnap.data().name)
        .map(docSnap => ({
          id: docSnap.id,
          name: docSnap.data().name,
          completed: false,
        }));

      // Fetch user's module completion status
      const userModulesCollectionRef = collection(db, 'users', user.uid, 'courses', courseId, 'modul');
      const userModulesSnapshot = await getDocs(userModulesCollectionRef);
      const userModulesData: { [key: string]: boolean } = {};
      userModulesSnapshot.forEach(docSnap => {
        userModulesData[docSnap.id] = docSnap.data().completed || false;
      });

      // Map completion status to modules
      const mappedModules = fetchedModules.map(mod => ({
        ...mod,
        completed: userModulesData[mod.id] || false,
      }));

      setModules(mappedModules);

      // Fetch course completion status
      const userCourseDocRef = doc(db, 'users', user.uid, 'courses', courseId);
      const userCourseDocSnap = await getDoc(userCourseDocRef);
      if (userCourseDocSnap.exists()) {
        setExamCompleted(userCourseDocSnap.data().completed || false);
      } else {
        setExamCompleted(false);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching course data:', err);
      setError(err.message || 'An error occurred while fetching course data.');
    } finally {
      setLoading(false);
    }
  }, [courseId, user, authLoading]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  return { course, modules, examCompleted, loading, error, refetch: fetchCourseData };
}