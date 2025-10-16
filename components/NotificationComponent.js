import { useNotification } from '../contexts/NotificationContext';
import { useEffect } from 'react';

export default function NotificationComponent() {
  const { notifications, addNotification, removeNotification } = useNotification();

  useEffect(() => {
    const handleAuthNotification = (event) => {
      addNotification(event.detail);
    };

    window.addEventListener('showNotification', handleAuthNotification);

    return () => {
      window.removeEventListener('showNotification', handleAuthNotification);
    };
  }, [addNotification]);

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            background: notification.type === 'success' 
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : notification.type === 'error'
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : notification.type === 'info'
              ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
              : 'linear-gradient(135deg, #6b7280, #4b5563)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            animation: 'slideInRight 0.3s ease-out',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Icon */}
          <div style={{ flexShrink: 0 }}>
            {notification.type === 'success' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {notification.type === 'error' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {notification.type === 'info' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>

          {/* Message */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
              {notification.title}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              {notification.message}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => removeNotification(notification.id)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Progress Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '3px',
              background: 'rgba(255,255,255,0.5)',
              width: '100%',
              transform: 'scaleX(1)',
              transformOrigin: 'left',
              animation: 'progress 5s linear forwards',
            }}
          />
        </div>
      ))}

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  );
}
