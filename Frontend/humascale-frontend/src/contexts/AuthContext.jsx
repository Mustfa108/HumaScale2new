import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, adminAuthApi } from '../api/auth';
import { tokenKeys, userKeys } from '../api/client';
import { extractToken, extractUser } from '../utils/api';

const AuthContext = createContext(null);

function readStored(actor) {
  try {
    const raw = localStorage.getItem(userKeys[actor]);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(actor, record) {
  if (record) {
    localStorage.setItem(userKeys[actor], JSON.stringify(record));
  } else {
    localStorage.removeItem(userKeys[actor]);
  }
}

function persistToken(actor, token) {
  if (token) {
    localStorage.setItem(tokenKeys[actor], token);
  } else {
    localStorage.removeItem(tokenKeys[actor]);
  }
}

function stripSecrets(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const { access_token, token, token_type, ...rest } = payload;
  return rest;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStored('user'));
  const [admin, setAdmin] = useState(() => readStored('admin'));
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      const userToken = localStorage.getItem(tokenKeys.user);
      const adminToken = localStorage.getItem(tokenKeys.admin);

      if (userToken) {
        try {
          const res = await authApi.me();
          const profile = extractUser(res);
          if (!cancelled && profile) {
            setUser(profile);
            persist('user', profile);
          }
        } catch {
          if (!cancelled) {
            persistToken('user', null);
            persist('user', null);
            setUser(null);
          }
        }
      }

      // GET /api/admin/me is not implemented — keep stored admin if a token exists.
      if (!cancelled) {
        if (adminToken) {
          const storedAdmin = readStored('admin');
          if (storedAdmin) setAdmin(storedAdmin);
        } else {
          setAdmin(null);
        }
        setBootstrapping(false);
      }
    }
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const hydrateUser = useCallback(async (fallback) => {
    try {
      const me = await authApi.me();
      const profile = extractUser(me) || stripSecrets(fallback);
      persist('user', profile);
      setUser(profile);
      return profile;
    } catch {
      const profile = stripSecrets(fallback);
      persist('user', profile);
      setUser(profile);
      return profile;
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login({ email, password });
      const token = extractToken(res);
      if (!token) {
        throw new Error('لم يتلق النظام رمز الدخول. تأكد من إعدادات الباك إند.');
      }
      persistToken('user', token);
      persistToken('admin', null);
      persist('admin', null);
      setAdmin(null);
      return hydrateUser(res.data);
    },
    [hydrateUser],
  );

  const register = useCallback(
    async (payload) => {
      const res = await authApi.register(payload);
      const token = extractToken(res);
      if (token) {
        persistToken('user', token);
        persistToken('admin', null);
        persist('admin', null);
        setAdmin(null);
        return hydrateUser(res.data);
      }
      return res.data;
    },
    [hydrateUser],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* clear locally anyway */
    }
    persistToken('user', null);
    persist('user', null);
    setUser(null);
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    const res = await adminAuthApi.login({ email, password });
    const token = extractToken(res);
    if (!token) {
      throw new Error('لم يتلق النظام رمز دخول الأدمن.');
    }
    const adminObject = res.data?.admin || stripSecrets(res.data);
    persistToken('admin', token);
    persist('admin', adminObject);
    setAdmin(adminObject);
    persistToken('user', null);
    persist('user', null);
    setUser(null);
    return adminObject;
  }, []);

  const adminLogout = useCallback(async () => {
    // POST /api/admin/logout is not implemented.
    persistToken('admin', null);
    persist('admin', null);
    setAdmin(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      const profile = extractUser(res);
      if (profile) {
        persist('user', profile);
        setUser(profile);
      }
    } catch {
      /* noop */
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      admin,
      bootstrapping,
      isAuthenticated: !!user,
      isAdminAuthenticated: !!admin,
      login,
      logout,
      register,
      adminLogin,
      adminLogout,
      refreshUser,
    }),
    [
      user,
      admin,
      bootstrapping,
      login,
      logout,
      register,
      adminLogin,
      adminLogout,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
