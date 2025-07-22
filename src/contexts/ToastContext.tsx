import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastProps } from '@/components/ui/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastProps['type'], duration?: number) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastProps['type'];
    duration: number;
    visible: boolean;
    id: number;
  } | null>(null);

  const showToast = (
    message: string,
    type: ToastProps['type'] = 'info',
    duration: number = 4000
  ) => {
    const id = Date.now();
    setToast({
      message,
      type,
      duration,
      visible: true,
      id,
    });
  };

  const showError = (message: string) => {
    showToast(message, 'error', 5000);
  };

  const showSuccess = (message: string) => {
    showToast(message, 'success', 3000);
  };

  const dismissToast = () => {
    setToast(prev => (prev ? { ...prev, visible: false } : null));
    // Clear the toast after animation
    setTimeout(() => setToast(null), 300);
  };

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          visible={toast.visible}
          onDismiss={dismissToast}
        />
      )}
    </ToastContext.Provider>
  );
};
