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
  Alert, // Imported Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';

export default function CourseScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { courses, userCourseJoined } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const gap = 16;

  const genres = ['All', 'Matematika', 'Fisika', 'Kimia', 'Programming'];

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

  // Updated handleCoursePress function
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

  const renderCourseCard = useCallback(
    (course) => (
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

  // Filter courses based on search query and selected genre
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGenre =
      selectedGenre === 'All' || course.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const renderGenreButton = (genre) => (
    <TouchableOpacity
      key={genre}
      style={[
        styles.genreButton,
        selectedGenre === genre && styles.genreButtonSelected,
      ]}
      onPress={() => setSelectedGenre(genre)}
    >
      <Text
        style={[
          styles.genreButtonText,
          selectedGenre === genre && styles.genreButtonTextSelected,
        ]}
      >
        {genre}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Available Courses</Text>
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
          {genres.map((genre) => renderGenreButton(genre))}
        </View>

        {/* Courses Grid */}
        <View style={styles.gridContainer}>
          {filteredCourses.map((course) => renderCourseCard(course))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
  header: {
    paddingTop: 40, 
    paddingBottom: 16,
    paddingHorizontal: 16,
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
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  genreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  genreButtonSelected: {
    backgroundColor: '#14213D',
    borderColor: '#14213D',
  },
  genreButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  genreButtonTextSelected: {
    color: '#FFB703',
    fontWeight: '600',
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
});
