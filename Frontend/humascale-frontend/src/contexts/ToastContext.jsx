import { createContext, useCallback, useContext, useMemo } from 'react';
import toast from 'react-hot-toast';

const ToastContext = createContext(null);

/**
 * Thin wrapper around react-hot-toast with Arabic defaults.
 * Use `useToast()` instead of importing `toast` directly so we can
 * tweak style / i18n in one place if needed.
 */
export function ToastProvider({ children }) {
  const success = useCallback((msg) => toast.success(msg), []);
  const error = useCallback((msg) => toast.error(msg), []);
  const info = useCallback((msg) => toast(msg, { icon: 'ℹ️' }), []);
  const loading = useCallback((msg) => toast.loading(msg), []);

  const dismiss = useCallback((id) => toast.dismiss(id), []);

  const promise = useCallback((promiseLike, msgs) => {
    return toast.promise(promiseLike, {
      loading: msgs.loading || 'جارٍ التحميل…',
      success: msgs.success || 'تمت العملية بنجاح.',
      error: msgs.error || 'حدث خطأ.',
    });
  }, []);

  const value = useMemo(
    () => ({ success, error, info, loading, dismiss, promise }),
    [success, error, info, loading, dismiss, promise],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
