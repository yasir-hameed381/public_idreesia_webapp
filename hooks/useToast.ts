"use client";
import { useCallback, useContext } from 'react';
import { ToastContext } from '@/context/ToastContext';
import { Toast } from 'primereact/toast';

interface UseToastReturn {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  toasts: never[];
  removeToast: (id: string) => void;
}

export const useToast = (): UseToastReturn => {
  const toastRef = useContext(ToastContext);

  const showToast = useCallback((message: string, severity: 'success' | 'error' | 'warn' | 'info', duration = 5000) => {
    if (toastRef?.current) {
      toastRef.current.show({
        severity,
        summary: severity === 'success' ? 'Success' : severity === 'error' ? 'Error' : severity === 'warn' ? 'Warning' : 'Info',
        detail: message,
        life: duration,
      });
    }
  }, [toastRef]);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warn', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    // PrimeReact Toast doesn't expose individual toast removal
    // Toasts are automatically removed after their life duration
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    toasts: [],
    removeToast,
  };
};