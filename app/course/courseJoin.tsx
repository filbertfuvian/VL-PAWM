import React from 'react';
import { SafeAreaView, View, Button, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';

export default function CourseJoin() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params as { courseId: string };
  const { user } = useAuth();
  const { joinCourse } = useCourses();

  const handleJoinCourse = async () => {
    if (!user) return;
    await joinCourse(user.uid, courseId);
    navigation.navigate('CourseDetails', { courseId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Join this course?</Text>
        <Button title="Join" onPress={handleJoinCourse} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 16,
  },
});