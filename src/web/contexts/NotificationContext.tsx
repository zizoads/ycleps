
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  addNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = uuidv4();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const notificationStyles = {
    success: 'bg-green-100 border-green-400 text-green-700 dark:bg-green-800/50 dark:border-green-600 dark:text-green-200',
    error: 'bg-red-100 border-red-400 text-red-700 dark:bg-red-800/50 dark:border-red-600 dark:text-red-200',
    info: 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-800/50 dark:border-blue-600 dark:text-blue-200',
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`w-80 px-4 py-3 rounded-md shadow-lg border ${notificationStyles[notification.type]}`}
            role="alert"
          >
            <strong className="font-bold">{notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}!</strong>
            <span className="block sm:inline ml-2">{notification.message}</span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
