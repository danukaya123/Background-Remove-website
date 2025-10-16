import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationComponent from '../components/NotificationComponent';

export default function MyApp({ Component, pageProps }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <NotificationComponent />
        <Component {...pageProps} />
      </AuthProvider>
    </NotificationProvider>
  );
}
