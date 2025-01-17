import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { getDocs, collection, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [ongoingCourses, setOngoingCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const gap = 16;

  // Function to determine the number of columns based on window width
  const getNumColumns = (width: number) => {
    if (width >= 1200) return 6;
    if (width >= 992) return 5;
    if (width >= 768) return 4;
    if (width >= 576) return 3;
    return 2;
  };

  const [numColumns, setNumColumns] = useState(getNumColumns(windowWidth));
  const cardWidth = (windowWidth - gap * (numColumns + 1)) / numColumns;

  useEffect(() => {
    const handleChange = ({ window }: { window: any }) => {
      setWindowWidth(window.width);
      setNumColumns(getNumColumns(window.width));
    };

    const subscription = Dimensions.addEventListener('change', handleChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  const fetchUserName = useCallback(async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().name);
      }
    } catch (err) {
      console.error('Error fetching user name:', err);
    }
  }, [user]);

  const fetchUserCourses = useCallback(async () => {
    try {
      const ongoingQuery = query(
        collection(db, 'users', user.uid, 'courses'),
        where('completed', '==', false)
      );
      const completedQuery = query(
        collection(db, 'users', user.uid, 'courses'),
        where('completed', '==', true)
      );

      const ongoingSnapshot = await getDocs(ongoingQuery);
      const completedSnapshot = await getDocs(completedQuery);

      const ongoingCoursesData = await Promise.all(
        ongoingSnapshot.docs.map(async (document) => {
          const courseDoc = await getDoc(doc(db, 'courses', document.id));
          return {
            id: document.id,
            ...(courseDoc.data() || {}),
          };
        })
      );

      const completedCoursesData = await Promise.all(
        completedSnapshot.docs.map(async (document) => {
          const courseDoc = await getDoc(doc(db, 'courses', document.id));
          return {
            id: document.id,
            ...courseDoc.data(),
          };
        })
      );

      setOngoingCourses(ongoingCoursesData);
      setCompletedCourses(completedCoursesData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user courses:', err);
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchUserName();
        fetchUserCourses();
      }
    }, [user, fetchUserName, fetchUserCourses])
  );

  const handleCoursePress = (courseId: string) => {
    navigation.navigate('CourseStack', {
      screen: 'CourseDetails',
      params: { courseId },
    });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getDisplayedCourses = (courses: any[]) => {
    if (isExpanded) return courses;
    return courses.slice(0, numColumns * 2); // Show 2 rows initially
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const filteredOngoingCourses = ongoingCourses.filter((course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>InspiraLab</Text>
      </View>

      <View style={styles.separator} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.label}>Hello, {userName}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Courses..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Ongoing Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Courses</Text>
          <View style={styles.gridContainer}>
            {getDisplayedCourses(filteredOngoingCourses).map((course) => (
              <TouchableOpacity
                key={course.id}
                onPress={() => handleCoursePress(course.id)}
                style={[styles.courseCard, { width: cardWidth, margin: gap / 2 }]}
              >
                <Image
                  source={{ uri: `data:image/png;base64,${course.image}` }}
                  style={styles.courseImage}
                />
                <Text style={styles.courseName}>{course.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {filteredOngoingCourses.length > numColumns * 2 && (
            <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
              <IconSymbol
                name={isExpanded ? 'chevron.up' : 'chevron.down'}
                size={24}
                color="#000"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Completed Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Courses</Text>
          <View style={styles.gridContainer}>
            {completedCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                onPress={() => handleCoursePress(course.id)}
                style={[styles.courseCard, { width: cardWidth, margin: gap / 2 }]}
              >
                <Image
                  source={{ uri: `data:image/png;base64,${course.image}` }}
                  style={styles.courseImage}
                />
                <Text style={styles.courseName}>{course.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
  header: {
    padding: 16,
    backgroundColor: '#14213D',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFB703',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#ddd',
  },
  contentContainer: {
    padding: 16,
  },
  greetingContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  searchInput: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseImage: {
    width: '80%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14213D',
    textAlign: 'center',
  },
  expandButton: {
    alignItems: 'center',
    padding: 8,
    marginTop: 8,
  },
});