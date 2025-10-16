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
            
            // Create a consistent user object
            const userObj = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || userData.username || userData.displayName,
              emailVerified: user.emailVerified,
              // Include all Firestore data
              ...userData
            };
            
            setCurrentUser(userObj);
            setUserProfile(userData);
          } else {
            // If no Firestore document exists, create basic user object
            const userObj = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              emailVerified: user.emailVerified,
            };
            
            setCurrentUser(userObj);
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to basic Firebase user data
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
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

      // Update local state with consistent structure
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

  // Google OAuth with direct Google API - FIXED REDIRECT URI
  const signInWithGoogle = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    // FIX: Redirect to the callback page, not the root
    const redirectUri = `${window.location.origin}/auth/callback`;
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
    console.log('Redirecting to Google OAuth with redirect URI:', redirectUri);
    window.location.href = authUrl;
  };

  // Handle Google OAuth callback
  const handleGoogleAuthCallback = async (code) => {
    try {
      setLoading(true);
      console.log('Exchanging code for access token...');
      
      // Exchange authorization code for access token
      const tokenResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code,
          redirectUri: `${window.location.origin}/auth/callback` // Important: same redirect URI
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Token exchange failed:', errorData);
        throw new Error(errorData.error || 'Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      console.log('Token exchange successful');
      
      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info from Google');
      }

      const googleUser = await userResponse.json();
      console.log('Google user info received:', googleUser);
      
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
      
      if (!email) {
        throw new Error('No email received from Google');
      }

      console.log('Processing Google user:', email);
      
      // Generate a secure password for Firebase
      const password = btoa(email + process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID + id).slice(0, 20);
      
      try {
        console.log('Attempting to sign in existing user...');
        // Try to sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Existing user signed in successfully');
        
        // Update local state
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            ...userData
          });
        }
        
        return user;
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log('Creating new user...');
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
          
          // Update local state with consistent structure
          const userObj = {
            uid: user.uid,
            email: user.email,
            displayName: name,
            emailVerified: user.emailVerified,
            photoURL: picture,
            ...userProfileData
          };

          setUserProfile(userProfileData);
          setCurrentUser(userObj);

          console.log('New Google user created successfully in Firestore');
          return user;
        } else {
          console.error('Firebase auth error:', error);
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

      await setDoc(doc(db, 'users', currentUser.uid), updatedData, { merge: true });

      // Update local state
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
    handleGoogleAuthCallback,
    
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
