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
          const user = userCredential.user;
          
          // Update profile with Google data
          await updateProfile(user, {
            displayName: name,
            photoURL: picture
          });

          // Create user profile in Firestore
          const userProfileData = {
            uid: user.uid,
            email: email,
            username: name || email.split('@')[0],
            displayName: name,
            photoURL: picture,
            provider: 'google',
            googleId: id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await setDoc(doc(db, 'users', user.uid), userProfileData);
          
          // Update local state
          setUserProfile(userProfileData);
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: name,
            ...userProfileData
          });

          return user;
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
    handleGoogleAuthCallback,
    
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
