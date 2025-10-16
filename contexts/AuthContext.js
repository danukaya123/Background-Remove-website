import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userData
        });
        
        setUserProfile(userData);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Email/Password Signup
  const signup = async (email, password, userData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with username
    await updateProfile(user, {
      displayName: userData.username
    });

    // Create user document in Firestore
    const userProfileData = {
      uid: user.uid,
      email: user.email,
      username: userData.username,
      phoneNumber: userData.phoneNumber || '',
      birthday: userData.birthday || '',
      displayName: userData.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provider: 'email'
    };

    await setDoc(doc(db, 'users', user.uid), userProfileData);

    // Update local state
    setUser({
      uid: user.uid,
      email: user.email,
      displayName: userData.username,
      ...userProfileData
    });
    setUserProfile(userProfileData);

    return user;
  };

  // Email/Password Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google OAuth Signup/Login
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile for Google signup
        const userProfileData = {
          uid: user.uid,
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: 'google',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfileData);
        
        // Update local state
        setUserProfile(userProfileData);
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userProfileData
        });
      } else {
        // User exists, just update local state
        const existingData = userDoc.data();
        setUserProfile(existingData);
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...existingData
        });
      }
      
      return user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    return signOut(auth);
  };

  // Password Reset
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Update User Profile
  const updateUserProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      // Update in Firebase Auth if displayName is changing
      if (updates.username) {
        await updateProfile(auth.currentUser, {
          displayName: updates.username
        });
      }

      // Update in Firestore
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });

      // Update local state
      const newProfile = { ...userProfile, ...updatedData };
      setUserProfile(newProfile);
      setUser({
        ...user,
        displayName: updates.username || user.displayName,
        ...newProfile
      });

      return newProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    // User state
    user,
    userProfile,
    
    // Authentication methods
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle,
    
    // Profile management
    updateUserProfile,
    
    // Helper properties
    isAuthenticated: !!user,
    isLoading: loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
