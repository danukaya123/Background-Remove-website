import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
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
  const previousUserRef = useRef(null); // Track previous user state
  const notificationSentRef = useRef(false); // Track if notification was sent

  // Notification functions
  const showLoginNotification = (user) => {
    if (notificationSentRef.current) return; // Prevent duplicate notifications
    
    notificationSentRef.current = true;
    const event = new CustomEvent('showNotification', {
      detail: {
        type: 'success',
        title: 'Welcome back! 👋',
        message: `You've successfully signed in as ${user.displayName || user.email}.`
      }
    });
    window.dispatchEvent(event);
    
    // Reset after a short delay
    setTimeout(() => {
      notificationSentRef.current = false;
    }, 1000);
  };

  const showLogoutNotification = () => {
    if (notificationSentRef.current) return; // Prevent duplicate notifications
    
    notificationSentRef.current = true;
    const event = new CustomEvent('showNotification', {
      detail: {
        type: 'info',
        title: 'Signed out',
        message: 'You have been successfully signed out from our system.'
      }
    });
    window.dispatchEvent(event);
    
    // Reset after a short delay
    setTimeout(() => {
      notificationSentRef.current = false;
    }, 1000);
  };

  const showErrorNotification = (title, message) => {
    const event = new CustomEvent('showNotification', {
      detail: {
        type: 'error',
        title,
        message
      }
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const previousUser = previousUserRef.current;
      previousUserRef.current = user; // Update ref for next comparison

      // Check for login/logout events
      if (user && !previousUser) {
        // User just logged in (was null, now has user)
        showLoginNotification(user);
      } else if (!user && previousUser) {
        // User just logged out (had user, now null)
        showLogoutNotification();
      }

      if (user) {
        try {
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
  }, []); // Remove currentUser from dependencies

  // Email/Password Signup with Email Verification
  const signup = async (email, password, userData) => {
    try {
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with username
      await updateProfile(user, {
        displayName: userData.username
      });

      // Send email verification
      await sendEmailVerification(user);

      // Create user document in Firestore
      const userProfileData = {
        uid: user.uid,
        email: user.email,
        username: userData.username,
        phoneNumber: userData.phoneNumber || '',
        birthday: userData.birthday || '',
        displayName: userData.username,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        provider: 'email'
      };

      await setDoc(doc(db, 'users', user.uid), userProfileData);

      const userObj = {
        uid: user.uid,
        email: user.email,
        displayName: userData.username,
        emailVerified: false,
        ...userProfileData
      };

      setCurrentUser(userObj);
      setUserProfile(userProfileData);

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      showErrorNotification('Signup Failed', error.message);
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
      showErrorNotification('Login Failed', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Social Auth Providers (Google + GitHub Only)
  const signInWithSocial = async (providerName) => {
    try {
      setLoading(true);
      
      let provider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
      } else if (providerName === 'github') {
        provider = new GithubAuthProvider();
      } else {
        throw new Error('Unknown provider');
      }

      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        const userProfileData = {
          uid: user.uid,
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: providerName,
          emailVerified: user.emailVerified,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfileData);
        
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
      console.error(`${providerName} signin error:`, error);
      showErrorNotification(`Sign in with ${providerName} failed`, error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Resend Email Verification
  const resendEmailVerification = async () => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      setLoading(true);
      await sendEmailVerification(currentUser);
      
      // Show success notification
      const event = new CustomEvent('showNotification', {
        detail: {
          type: 'success',
          title: 'Verification Email Sent',
          message: 'Please check your inbox for the verification link.'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Resend verification error:', error);
      showErrorNotification('Verification Failed', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      
      // Show success notification
      const event = new CustomEvent('showNotification', {
        detail: {
          type: 'success',
          title: 'Reset Email Sent',
          message: 'Please check your inbox for the password reset link.'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Password reset error:', error);
      showErrorNotification('Password Reset Failed', error.message);
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
      // The onAuthStateChanged will handle the notification
    } catch (error) {
      console.error('Logout error:', error);
      showErrorNotification('Logout Failed', 'There was an issue signing out. Please try again.');
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

      // Show success notification
      const event = new CustomEvent('showNotification', {
        detail: {
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been successfully updated.'
        }
      });
      window.dispatchEvent(event);

      return newProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorNotification('Update Failed', 'There was an issue updating your profile.');
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
    forgotPassword,
    signInWithSocial,
    resendEmailVerification,
    
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
