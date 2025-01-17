import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { getUser, updateUser } from '@/hooks/useUser';
import { IconSymbol } from '@/components/ui/IconSymbol';
import UpdateModal from '@/components/UpdateModal';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

export default function Profile() {
  const auth = getAuth();
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profilePicture: '',
    phoneNumber: '',
    address: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalPlaceholder, setModalPlaceholder] = useState('');
  const [modalValue, setModalValue] = useState('');
  const [fieldToUpdate, setFieldToUpdate] = useState('');

  // Fetch user data on mount or when user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const data = await getUser(user.uid);
        setUserData({
          name: data?.name || '',
          email: user.email || '',
          profilePicture: data?.profilePicture || '',
          phoneNumber: data?.phoneNumber || '',
          address: data?.address || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [user]);

  // Update profile field in the database and local state
  const handleUpdateProfile = async (field, value) => {
    if (!user) return;
    try {
      await updateUser(user.uid, { [field]: value });
      setUserData((prev) => ({ ...prev, [field]: value }));
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  // Handle profile picture change
  const handleProfilePictureChange = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to change profile picture.');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
  
      if (!result.canceled) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
  
        const userRef = doc(getFirestore(), 'users', user.uid);
        await updateDoc(userRef, {
          profilePicture: base64Image
        });
  
        setUserData((prev) => ({
          ...prev,
          profilePicture: base64Image,
        }));
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Failed to update profile picture');
    }
  };

  // Open modal for updating fields
  const openModal = (title, placeholder, value, field) => {
    setModalTitle(title);
    setModalPlaceholder(placeholder);
    setModalValue(value);
    setFieldToUpdate(field);
    setModalVisible(true);
  };

  // Loading state if no user data
  if (!userData) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={handleProfilePictureChange}>
            <Image
              source={
                userData.profilePicture
                  ? { uri: userData.profilePicture }
                  : require('@/assets/images/default-avatar.png')
              }
              style={styles.profilePicture}
            />
          </TouchableOpacity>
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        {/* Edit Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={handleProfilePictureChange}
          >
            <IconSymbol name="pencil" size={24} color="#000" style={styles.icon} />
            <Text style={styles.sectionButtonText}>Customize Profile Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => openModal('Change Username', 'Username', userData.name, 'name')}
          >
            <IconSymbol name="pencil" size={24} color="#000" style={styles.icon} />
            <Text style={styles.sectionButtonText}>Change Username</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => openModal('Change Phone Number', 'Phone Number', userData.phoneNumber, 'phoneNumber')}
          >
            <IconSymbol name="phone.fill" size={24} color="#000" style={styles.icon} />
            <Text style={styles.sectionButtonText}>Change Phone Number</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => openModal('Change Address', 'Address', userData.address, 'address')}
          >
            <IconSymbol name="house.fill" size={24} color="#000" style={styles.icon} />
            <Text style={styles.sectionButtonText}>Change Address</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionButton} onPress={logout}>
            <IconSymbol
              name="rectangle.portrait.and.arrow.right"
              size={24}
              color="#000"
              style={styles.icon}
            />
            <Text style={styles.sectionButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        

        <UpdateModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={(value) => handleUpdateProfile(fieldToUpdate, value)}
          title={modalTitle}
          placeholder={modalPlaceholder}
          value={modalValue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    
  },
  header: {
    padding: 16,
    backgroundColor: '#14213D',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFB703',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  section: {
    marginBottom: 16,
    color: '#14213D',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    position: 'relative',
  },
  sectionButtonText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#14213D',
  },
  icon: {
    width: 24,
    height: 24,
  },
});
