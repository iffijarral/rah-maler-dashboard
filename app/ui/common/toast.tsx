'use client';
import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  type: "success" | "error";  // changed from 'priority' to 'type'
  onClose: () => void;
};

export const Toast = ({ message, type, onClose }: ToastProps) => {
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    // Hide the toast after 3 seconds
    const timer = setTimeout(() => {
      setShowToast(false);

      // Wait for animation to finish before calling onClose
      setTimeout(() => {
        onClose();
      }, 500); // This matches the "toast-out" animation duration (0.5s)
      
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = type === "success"
    ? "bg-green-500 text-white"
    : "bg-red-500 text-white";

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-md ${showToast
        ? "animate-toast-in"
        : "animate-toast-out"
        } ${typeStyles}`}
    >
      {message}
    </div>
  );
};
