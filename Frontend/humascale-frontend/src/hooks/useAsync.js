import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic async data hook.
 *   const { data, error, loading, refresh, setData } = useAsync(() => api.foo(), { immediate: true });
 */
export function useAsync(asyncFn, { immediate = true, deps = [] } = {}) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: immediate,
  });
  const mounted = useRef(true);
  const fnRef = useRef(asyncFn);

  useEffect(() => {
    fnRef.current = asyncFn;
  });

  const run = useCallback(async (...args) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fnRef.current(...args);
      if (mounted.current) {
        setState({ data, error: null, loading: false });
      }
      return data;
    } catch (err) {
      if (mounted.current) {
        setState({
          data: null,
          error: err?.message || 'حدث خطأ.',
          loading: false,
        });
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (immediate) run().catch(() => {});
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((updater) => {
    setState((s) => ({
      ...s,
      data: typeof updater === 'function' ? updater(s.data) : updater,
    }));
  }, []);

  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    refresh: run,
    setData,
  };
}
