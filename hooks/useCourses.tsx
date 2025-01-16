import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore';

interface CourseData {
  id: string;
  name: string;
  image: string;
}

export function useCourses() {
  const [courses, setCourses] = useState<CourseData[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      const result = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CourseData[];
      setCourses(result);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }

  async function userCourseJoined(userId: string, courseId: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'users', userId, 'courses', courseId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (err) {
      console.error('Error checking user course:', err);
      return false;
    }
  }

  async function joinCourse(userId: string, courseId: string) {
    try {
      await setDoc(doc(db, 'users', userId, 'courses', courseId), { status: 'ongoing' });
    } catch (err) {
      console.error('Error joining course:', err);
    }
  }

  return { courses, fetchCourses, userCourseJoined, joinCourse };
}