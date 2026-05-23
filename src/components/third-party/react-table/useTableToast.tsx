import { useState } from "react";

interface ToastState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

export function useTableToast() {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  const handleToastClose = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  return { toast, showToast, handleToastClose };
}