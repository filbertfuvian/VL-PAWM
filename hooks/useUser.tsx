import { doc, setDoc, getDoc, getDocs, collection, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface UserData {
  id?: string;
  email: string;
  name?: string;
  profilePicture?: string;
  phoneNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function addUser(userId: string, userData: UserData): Promise<void> {
  try {
    const userDataWithTimestamp = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await setDoc(doc(db, 'users', userId), userDataWithTimestamp);
    console.log('User data written with ID: ', userId);
  } catch (e) {
    console.error('Error adding user data: ', e);
    throw e;
  }
}

export async function getUser(userId: string): Promise<UserData | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (e) {
    console.error('Error getting user: ', e);
    throw e;
  }
}

export async function getAllUsers(): Promise<UserData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: UserData[] = [];
    querySnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() } as UserData);
    });
    return users;
  } catch (e) {
    console.error('Error getting users: ', e);
    throw e;
  }
}

export async function updateUser(userId: string, userData: Partial<UserData>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
  } catch (e) {
    console.error('Error updating user: ', e);
    throw e;
  }
}