import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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

  // Sign up with email and password
  const signup = async (email, password, userData) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: userData.username
    });

    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: user.email,
      username: userData.username,
      phoneNumber: userData.phoneNumber || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    setUserProfile(userProfile);
    
    return user;
  };

  // Login with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Logout
  const logout = () => {
    return signOut(auth);
  };

  // Google OAuth Login (Fixed - using implicit flow)
  const loginWithGoogle = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}`; // Redirect to same page
    const scope = 'email profile';
    const state = Math.random().toString(36).substring(2);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` + // CHANGED: using token instead of code
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
    
    // Store state for verification
    localStorage.setItem('oauth_state', state);
    window.location.href = authUrl;
  };

  // Google OAuth Signup (Fixed - using implicit flow)
  const signupWithGoogle = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}`; // Redirect to same page
    const scope = 'email profile';
    const state = Math.random().toString(36).substring(2);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` + // CHANGED: using token instead of code
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `prompt=select_account`;
    
    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_action', 'signup');
    window.location.href = authUrl;
  };

  // Handle OAuth callback when page loads
  useEffect(() => {
    const handleOAuthCallback = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const state = params.get('state');
        
        // Verify state
        const storedState = localStorage.getItem('oauth_state');
        if (state !== storedState) {
          console.error('Invalid state parameter');
          return;
        }
        
        // Use the access token to get user info
        getUserInfo(accessToken);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    const getUserInfo = async (accessToken) => {
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        const userData = await response.json();
        
        // Create Firebase user with Google data
        await handleGoogleUser(userData);
        
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    const handleGoogleUser = async (googleUser) => {
      try {
        // Generate a password for Firebase auth
        const password = btoa(googleUser.email + process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID).slice(0, 20);
        
        try {
          // Try to sign in existing user
          await signInWithEmailAndPassword(auth, googleUser.email, password);
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            // Create new user
            const { user } = await createUserWithEmailAndPassword(auth, googleUser.email, password);
            
            await updateProfile(user, {
              displayName: googleUser.name,
              photoURL: googleUser.picture
            });

            // Create user profile in Firestore
            const userProfile = {
              uid: user.uid,
              email: googleUser.email,
              username: googleUser.name || googleUser.email.split('@')[0],
              displayName: googleUser.name,
              photoURL: googleUser.picture,
              provider: 'google',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', user.uid), userProfile);
            setUserProfile(userProfile);
          } else {
            throw error;
          }
        }
        
        // Clean up
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_action');
        
      } catch (error) {
        console.error('Error handling Google user:', error);
      }
    };

    handleOAuthCallback();
  }, []);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    loginWithGoogle,
    signupWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
