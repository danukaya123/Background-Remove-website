import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Create a consistent user object
            const userObj = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || userData.username || userData.displayName,
              emailVerified: firebaseUser.emailVerified,
              // Include all Firestore data
              ...userData
            };
            
            setUser(userObj);
            setUserProfile(userData);
          } else {
            // If no Firestore document exists, create basic user object
            const userObj = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
            };
            
            setUser(userObj);
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to basic Firebase user data
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
          });
          setUserProfile(null);
        }
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
    try {
      setError('');
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update profile with username
      await updateProfile(firebaseUser, {
        displayName: userData.username
      });

      // Create user document in Firestore
      const userProfileData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: userData.username,
        phoneNumber: userData.phoneNumber || '',
        birthday: userData.birthday || '',
        displayName: userData.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        provider: 'email'
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfileData);

      // Update local state with consistent structure
      const userObj = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: userData.username,
        emailVerified: firebaseUser.emailVerified,
        ...userProfileData
      };

      setUser(userObj);
      setUserProfile(userProfileData);

      return firebaseUser;
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

  // Google OAuth with direct Google API (not Firebase)
  const signInWithGoogle = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}`;
    const scope = 'email profile';
    const state = Math.random().toString(36).substring(2);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    // Store state for verification
    localStorage.setItem('oauth_state', state);
    window.location.href = authUrl;
  };

  // Handle Google OAuth callback
  const handleGoogleAuthCallback = async (code) => {
    try {
      setLoading(true);
      
      // Exchange authorization code for access token
      const tokenResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      
      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const googleUser = await userResponse.json();
      
      // Create or sign in user in Firebase
      return await handleGoogleUser(googleUser);
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle Google user creation/sign in
  const handleGoogleUser = async (googleUser) => {
    try {
      const { email, name, picture, id } = googleUser;
      
      // Generate a secure password for Firebase
      const password = btoa(email + process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID + id).slice(0, 20);
      
      try {
        // Try to sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Update profile with Google data
          await updateProfile(firebaseUser, {
            displayName: name,
            photoURL: picture
          });

          // Create user profile in Firestore
          const userProfileData = {
            uid: firebaseUser.uid,
            email: email,
            username: name || email.split('@')[0],
            displayName: name,
            photoURL: picture,
            provider: 'google',
            googleId: id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await setDoc(doc(db, 'users', firebaseUser.uid), userProfileData);
          
          // Update local state with consistent structure
          const userObj = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: name,
            emailVerified: firebaseUser.emailVerified,
            ...userProfileData
          };

          setUserProfile(userProfileData);
          setUser(userObj);

          return firebaseUser;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error handling Google user:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
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
    if (!user) throw new Error('No user logged in');
    
    try {
      setLoading(true);

      // Update in Firebase Auth if displayName is changing
      if (updates.username || updates.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: updates.username || updates.displayName
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
      const newUser = {
        ...user,
        displayName: updates.username || updates.displayName || user.displayName,
        ...updatedData
      };

      setUserProfile(newProfile);
      setUser(newUser);

      return newProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get user profile data (useful for refreshing data)
  const refreshUserProfile = async () => {
    if (!user) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        
        // Also update user object with latest data
        const updatedUser = {
          ...user,
          ...userData
        };
        setUser(updatedUser);
        
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user profile:', error);
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
    handleGoogleAuthCallback,
    
    // Profile management
    updateUserProfile,
    refreshUserProfile,
    
    // Helper properties
    isAuthenticated: !!user,
    isLoading: loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
