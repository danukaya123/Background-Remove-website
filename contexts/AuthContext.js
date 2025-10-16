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
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            const userObj = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              emailVerified: user.emailVerified,
              photoURL: user.photoURL,
              ...userData
            };
            
            setCurrentUser(userObj);
            setUserProfile(userData);
          } else {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              emailVerified: user.emailVerified,
              photoURL: user.photoURL,
            });
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
          });
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Email/Password Signup
  const signup = async (email, password, userData) => {
    try {
      setLoading(true);
      
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
      const userObj = {
        uid: user.uid,
        email: user.email,
        displayName: userData.username,
        emailVerified: user.emailVerified,
        ...userProfileData
      };

      setCurrentUser(userObj);
      setUserProfile(userProfileData);

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // SIMPLE Google Signin - No callbacks needed!
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create user profile in Firestore for new Google user
        const userProfileData = {
          uid: user.uid,
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: 'google',
          googleId: user.providerData[0]?.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfileData);
        
        // Update local state
        const userObj = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
          ...userProfileData
        };

        setCurrentUser(userObj);
        setUserProfile(userProfileData);
      }
      
      return user;
    } catch (error) {
      console.error('Google signin error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update User Profile
  const updateUserProfile = async (updates) => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      setLoading(true);

      if (updates.username || updates.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: updates.username || updates.displayName
        });
      }

      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', currentUser.uid), updatedData, { merge: true });

      const newProfile = { ...userProfile, ...updatedData };
      const newUser = {
        ...currentUser,
        displayName: updates.username || updates.displayName || currentUser.displayName,
        ...updatedData
      };

      setUserProfile(newProfile);
      setCurrentUser(newUser);

      return newProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // User state
    user: currentUser,
    currentUser,
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
    isAuthenticated: !!currentUser,
    isLoading: loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
