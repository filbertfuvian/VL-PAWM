import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/hooks/useAuth';
import * as Progress from 'react-native-progress';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [ongoingCourses, setOngoingCourses] = useState<CourseData[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CourseData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const gap = 16;
  const getNumColumns = (width: number) => {
    if (Platform.OS === 'android') return 2;
    if (width >= 1200) return 6;
    if (width >= 992) return 5;
    if (width >= 768) return 4;
    if (width >= 576) return 3;
    return 2;
  };
  const [numColumns, setNumColumns] = useState(getNumColumns(windowWidth));
  const cardWidth = (windowWidth - gap * (numColumns + 1)) / numColumns;

  // Fetch username
  const fetchUserName = useCallback(async () => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) setUserName(userDoc.data().name);
  }, [user]);

  // Fetch all courses from user’s collection, then calculate modules and final exam
  const fetchUserCourses = useCallback(async () => {
    try {
      const userCoursesSnap = await getDocs(collection(db, 'users', user.uid, 'courses'));
      const tmpOngoing: CourseData[] = [];
      const tmpCompleted: CourseData[] = [];

      for await (const courseDoc of userCoursesSnap.docs) {
        const courseDataRef = doc(db, 'courses', courseDoc.id);
        const courseDataSnap = await getDoc(courseDataRef);
        if (!courseDataSnap.exists()) continue;

        const courseData = courseDataSnap.data();
        // Count module docs to get totalModules
        const modulSnap = await getDocs(collection(db, 'users', user.uid, 'courses', courseDoc.id, 'modul'));
        const totalModules = modulSnap.size;
        let completedModules = 0;
        modulSnap.forEach(m => {
          if (m.data().completed) completedModules++;
        });

        // Check final exam from user doc's 'completed'
        const finalExamCompleted = !!courseDoc.data().completed;
        const allModulesDone = completedModules === totalModules;

        const courseObj: CourseData = {
          id: courseDoc.id,
          name: courseData.name || '',
          image: courseData.image || '',
          genre: courseData.genre || '',
          totalModules,
          completedModules,
          finalExamCompleted,
        };

        if (allModulesDone && finalExamCompleted) {
          tmpCompleted.push(courseObj);
        } else {
          tmpOngoing.push(courseObj);
        }
      }
      setOngoingCourses(tmpOngoing);
      setCompletedCourses(tmpCompleted);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user courses:', error);
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      fetchUserName();
      fetchUserCourses();
    }, [user])
  );

  useEffect(() => {
    const handleChange = ({ window }: { window: any }) => {
      setWindowWidth(window.width);
      setNumColumns(getNumColumns(window.width));
    };
    const subscription = Dimensions.addEventListener('change', handleChange);
    return () => subscription?.remove();
  }, []);

  const handleCoursePress = (courseId: string) => {
    navigation.navigate('CourseStack', { screen: 'CourseDetails', params: { courseId } });
  };

  const handleSearch = (text: string) => setSearchQuery(text);
  const getDisplayedCourses = (courses: CourseData[]) => (isExpanded ? courses : courses.slice(0, numColumns * 2));
  const toggleExpand = () => setIsExpanded(!isExpanded);

  const filteredOngoing = ongoingCourses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading courses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hello, {userName}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Courses..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Ongoing Courses */}
        <Text style={styles.title}>Your Courses</Text>
        <View style={styles.grid}>
          {getDisplayedCourses(filteredOngoing).map(course => {
            const progress = course.totalModules ? course.completedModules / course.totalModules : 0;
            const allModulesDone = course.completedModules === course.totalModules;
            const finalExamLeft = allModulesDone && !course.finalExamCompleted;
            return (
              <TouchableOpacity
                key={course.id}
                style={[styles.card, { width: cardWidth, margin: gap / 2 }]}
                onPress={() => handleCoursePress(course.id)}
              >
                <Image source={{ uri: `data:image/png;base64,${course.image}` }} style={styles.image} />
                <Text style={styles.courseName}>{course.name}</Text>
                <View style={styles.progressContainer}>
                  {finalExamLeft ? (
                    <Text style={styles.finalExamText}>Final exam left</Text>
                  ) : (
                    <>
                      <Progress.Bar
                        progress={progress}
                        width={cardWidth - 32}
                        color="#4CAF50"
                        unfilledColor="#E0E0E0"
                        borderWidth={0}
                        height={10}
                        borderRadius={5}
                      />
                      <Text style={styles.progressText}>
                        {course.completedModules} / {course.totalModules} modules
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {filteredOngoing.length > numColumns * 2 && (
          <TouchableOpacity onPress={toggleExpand}>
            <Text style={styles.expandBtn}>{isExpanded ? 'Show Less' : 'Show More'}</Text>
          </TouchableOpacity>
        )}

        {/* Completed Courses */}
        <Text style={styles.title}>Completed Courses</Text>
        <View style={styles.grid}>
          {completedCourses.length ? (
            completedCourses.map(course => (
              <TouchableOpacity
                key={course.id}
                style={[styles.card, { width: cardWidth, margin: gap / 2 }]}
                onPress={() => handleCoursePress(course.id)}
              >
                <Image source={{ uri: `data:image/png;base64,${course.image}` }} style={styles.image} />
                <Text style={styles.courseName}>{course.name}</Text>
                <View style={styles.progressContainer}>
                  {/* All modules done, final exam done => 100% */}
                  <Progress.Bar
                    progress={1}
                    width={cardWidth - 32}
                    color="#4CAF50"
                    unfilledColor="#E0E0E0"
                    borderWidth={0}
                    height={10}
                    borderRadius={5}
                  />
                  <Text style={styles.progressText}>All modules completed</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No completed courses yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface CourseData {
  id: string;
  name: string;
  image: string;
  genre: string;
  totalModules: number;
  completedModules: number;
  finalExamCompleted: boolean;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, backgroundColor: '#14213D' },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16 },
  searchContainer: { marginBottom: 16 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  image: { width: '80%', height: 80, resizeMode: 'contain', marginBottom: 8 },
  courseName: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  progressContainer: { width: '100%', alignItems: 'center' },
  progressText: { marginTop: 4, fontSize: 12, color: '#555' },
  finalExamText: { marginTop: 4, fontSize: 12, color: '#e53935', fontWeight: 'bold' },
  expandBtn: { textAlign: 'center', color: '#007BFF', marginTop: 8 },
});