
"use client";
import { Toast } from "primereact/toast";
import { createContext, useRef } from "react";
export const ToastContext = createContext<React.RefObject<Toast> | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastRef = useRef<Toast>(null);
  return (
    <ToastContext.Provider value={toastRef as React.RefObject<Toast> | null}>
      <Toast ref={toastRef} position="bottom-right" />
      {children}
    </ToastContext.Provider>
  );
}