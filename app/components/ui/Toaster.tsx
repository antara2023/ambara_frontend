import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/store";
import { toastDismissed, toastShown, type Toast } from "~/store/uiSlice";

export const useToast = () => {
  const dispatch = useAppDispatch();
  return {
    success: (text: string) => dispatch(toastShown("success", text)),
    error: (text: string) => dispatch(toastShown("error", text)),
    info: (text: string) => dispatch(toastShown("info", text)),
  };
};

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const id = setTimeout(() => dispatch(toastDismissed(toast.id)), toast.kind === "error" ? 6000 : 3500);
    return () => clearTimeout(id);
  }, [dispatch, toast.id, toast.kind]);

  const Icon = toast.kind === "success" ? CheckCircle2 : toast.kind === "error" ? XCircle : Info;
  const tone = toast.kind === "success" ? "text-lagoon" : toast.kind === "error" ? "text-ember" : "text-gold";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      role={toast.kind === "error" ? "alert" : "status"}
      className="panel pointer-events-auto flex w-full items-start gap-3 !rounded-2xl !bg-night/90 px-4 py-3 text-sm"
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${tone}`} />
      <p className="flex-1 text-star">{toast.text}</p>
      <button onClick={() => dispatch(toastDismissed(toast.id))} className="text-haze hover:text-star" aria-label="Dismiss">
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] mx-auto flex w-full max-w-sm flex-col gap-2 px-4 sm:bottom-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
