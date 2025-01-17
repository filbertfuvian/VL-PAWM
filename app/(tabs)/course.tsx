import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  Text,
  Dimensions,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';

export default function CourseScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { courses, userCourseJoined } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All'); // State for selected genre
  const [availableCourses, setAvailableCourses] = useState<CourseData[]>([]); // Courses not yet joined

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

  // Handle course press with genre check
  const handleCoursePress = useCallback(
    async (courseId: string) => {
      if (!user) {
        Alert.alert('Authentication Required', 'Please log in to access this course.');
        return;
      }
      const joined = await userCourseJoined(user.uid, courseId);
      if (joined) {
        navigation.navigate('CourseDetails', { courseId });
      } else {
        navigation.navigate('CourseJoin', { courseId });
      }
    },
    [user, userCourseJoined, navigation]
  );

  // Categorize courses by genre
  const genres = [
    { title: 'All', key: 'All' },
    { title: 'Mathematics', key: 'Matematika' },
    { title: 'Physics', key: 'Fisika' },
    { title: 'Chemistry', key: 'Kimia' },
    { title: 'Programming', key: 'Programming' },
  ];

  const filterCourses = useCallback(
    (genreKey: string) => {
      if (genreKey === 'All') return availableCourses;
      return availableCourses.filter((course) => course.genre === genreKey);
    },
    [availableCourses]
  );

  const renderCourseCard = useCallback(
    (course: CourseData) => (
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
    ),
    [cardWidth, handleCoursePress]
  );

  // Fetch available courses (not joined)
  useEffect(() => {
    const fetchAvailableCourses = async () => {
      if (!user) {
        setAvailableCourses([]);
        return;
      }

      try {
        const filtered = await Promise.all(
          courses.map(async (course) => {
            const joined = await userCourseJoined(user.uid, course.id);
            return joined ? null : course;
          })
        );
        setAvailableCourses(filtered.filter((course) => course !== null) as CourseData[]);
      } catch (error) {
        console.error('Error filtering courses:', error);
        Alert.alert('Error', 'Failed to load courses.');
      }
    };

    fetchAvailableCourses();
  }, [courses, user, userCourseJoined]);

  // Filter courses based on search query and selected genre
  const filteredCourses = filterCourses(selectedGenre).filter((course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.messageText}>Please log in to view courses.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Courses</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Genre Filter Buttons */}
        <View style={styles.genreContainer}>
          {genres.map((genre) => (
            <TouchableOpacity
              key={genre.key}
              style={[
                styles.genreButton,
                selectedGenre === genre.key && styles.genreButtonActive,
              ]}
              onPress={() => setSelectedGenre(genre.key)}
            >
              <Text
                style={[
                  styles.genreButtonText,
                  selectedGenre === genre.key && styles.genreButtonTextActive,
                ]}
              >
                {genre.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Courses Grid */}
        <View style={styles.gridContainer}>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => renderCourseCard(course))
          ) : (
            <Text style={styles.noCoursesText}>No courses available.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Define the CourseData interface
interface CourseData {
  id: string;
  name: string;
  image: string;
  genre: string;
  // Add other fields as necessary
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  messageText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
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
  contentContainer: {
    padding: 16,
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
  genreContainer: { // Genre filter buttons container
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  genreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    margin: 4,
    borderWidth: 1,
    borderColor: '#14213D',
  },
  genreButtonActive: {
    backgroundColor: '#14213D',
  },
  genreButtonText: {
    fontSize: 14,
    color: '#14213D',
  },
  genreButtonTextActive: {
    color: '#fff',
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
  noCoursesText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});