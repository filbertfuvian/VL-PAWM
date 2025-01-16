import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Image, View, Text, Dimensions, Platform, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';

const { width } = Dimensions.get('window');
const numColumns = Platform.OS === 'web' ? 8 : 4;
const rowsToShow = 8;
const gap = 16;
const cardWidth = (width - (gap * (numColumns + 1))) / numColumns;

export default function CourseScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { courses, userCourseJoined } = useCourses();
  const [displayedRows, setDisplayedRows] = useState(rowsToShow);

  const handleCoursePress = async (courseId: string) => {
    if (!user) return;
    const isJoined = await userCourseJoined(user.uid, courseId);
    if (isJoined) {
      navigation.navigate('CourseDetails', { courseId });
    } else {
      navigation.navigate('CourseJoin', { courseId });
    }
  };

  const handleViewMore = () => {
    setDisplayedRows(prev => prev + rowsToShow);
  };

  const filteredCourses = courses.filter(course =>
    course.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDisplayedCourses = () => {
    return filteredCourses.slice(0, numColumns * displayedRows);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Courses</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.grid}>
          {getDisplayedCourses().map(course => (
            <TouchableOpacity 
              key={course.id} 
              onPress={() => handleCoursePress(course.id)} 
              style={styles.courseCard}
            >
              <Image 
                source={{ uri: `data:image/png;base64,${course.image}` }} 
                style={styles.courseImage} 
              />
              <Text style={styles.courseName}>{course.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {filteredCourses.length > numColumns * displayedRows && (
          <TouchableOpacity 
            style={styles.viewMoreButton} 
            onPress={handleViewMore}
          >
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  contentContainer: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: gap,
  },
  courseCard: {
    width: cardWidth,
    height: cardWidth,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseImage: {
    width: '80%',
    height: '70%',
    resizeMode: 'contain',
  },
  courseName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  viewMoreButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
