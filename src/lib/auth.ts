import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const signUpUser = async (email: string, password: string, fullName: string, role: string = 'guest') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  await updateProfile(user, { displayName: fullName });
  
  // Store additional user metadata in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    id: user.uid,
    fullName,
    role,
    email
  });

  return user;
};

export const signInUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    });
  });
};

export const getUserRole = async (uid: string): Promise<string> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data().role;
  }
  return 'guest';
};
