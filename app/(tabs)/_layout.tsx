import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Use native-stack for more consistent web support
import HomeScreen from './index';
import CourseScreen from './course';
import ProfileScreen from './profile';
import CourseDetails from '../course/courseDetails';
import CourseJoin from '../course/courseJoin';
import CourseModule from '../course/courseModule';
import CourseExam from '../course/courseExam';
import { IconSymbol } from '@/components/ui/IconSymbol';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CourseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Course">
      <Stack.Screen name="Course" component={CourseScreen} />
      <Stack.Screen name="CourseDetails" component={CourseDetails} />
      <Stack.Screen name="CourseJoin" component={CourseJoin} />
      <Stack.Screen name="CourseModule" component={CourseModule} />
      <Stack.Screen name="CourseExam" component={CourseExam} />
    </Stack.Navigator>
  );
}

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#14213D' },
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
        tabBarActiveTintColor: '#FFB703',
        tabBarInactiveTintColor: '#FFFFFF',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={focused ? '#FFB703' : '#FFFFFF'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CourseStack"
        component={CourseStack}
        options={{
          title: 'Courses',
          tabBarIcon: ({ focused }) => (
            <IconSymbol
              size={28}
              name="book.fill"
              color={focused ? '#FFB703' : '#FFFFFF'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <IconSymbol
              size={28}
              name="person.fill"
              color={focused ? '#FFB703' : '#FFFFFF'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
