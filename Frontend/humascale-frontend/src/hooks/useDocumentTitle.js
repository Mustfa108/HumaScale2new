import { useEffect } from 'react';

export function useDocumentTitle(title, suffix = 'HumaScale') {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | ${suffix}` : suffix;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
