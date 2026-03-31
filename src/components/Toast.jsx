import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 400 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 20, x: 400 }}
      className={`pointer-events-auto rounded-lg p-4 pr-12 shadow-lg flex items-start gap-3 relative ${
        toast.type === "error"
          ? "bg-red-900 text-red-50"
          : toast.type === "success"
            ? "bg-emerald-900 text-emerald-50"
            : "bg-slate-900 text-slate-50"
      }`}
    >
      {toast.type === "error" ? (
        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
      ) : toast.type === "success" ? (
        <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
      ) : null}
      <div className="flex-1">
        <p className="text-sm leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </motion.div>
  );
}
