import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Placeholder data for course cards
const courses = [
  {
    title: 'React Native Basics',
    description: 'Learn the basics of React Native, a popular framework for building mobile apps.',
    image: require('@/assets/images/course-template.png'),
  },
  {
    title: 'Advanced React Native',
    description: 'Dive deeper into React Native and learn advanced techniques and patterns.',
    image: require('@/assets/images/course-template.png'),
  },
  // Add more courses as needed
];

export default function CourseScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCoursePress = () => {
    navigation.navigate('CourseDetails');
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Courses</Text>
      </View>

      {/* Garis Pemisah */}
      <View style={styles.separator} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Konten */}
      <ScrollView contentContainerStyle={styles.gridContainer}>
        {filteredCourses.map((course, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={handleCoursePress}
          >
            <Image source={course.image} style={styles.cardImage} />
            <Text style={styles.cardTitle}>{course.title}</Text>
            <Text style={styles.cardDescription}>{course.description}</Text>
          </TouchableOpacity>
        ))}
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
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#ddd',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#888',
  },
});
