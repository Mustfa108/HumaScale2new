import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, adminAuthApi } from '../api/auth';
import { tokenKeys, userKeys } from '../api/client';

const AuthContext = createContext(null);

function readStored(actor) {
  try {
    const raw = localStorage.getItem(userKeys[actor]);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(actor, user) {
  if (user) {
    localStorage.setItem(userKeys[actor], JSON.stringify(user));
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
          if (!cancelled && res?.data) {
            setUser(res.data);
            persist('user', res.data);
          }
        } catch {
          if (!cancelled) setUser(null);
        }
      }
      if (adminToken) {
        try {
          const res = await adminAuthApi.me();
          if (!cancelled && res?.data) {
            setAdmin(res.data);
            persist('admin', res.data);
          }
        } catch {
          if (!cancelled) setAdmin(null);
        }
      }
      if (!cancelled) setBootstrapping(false);
    }
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ===================== User actions ===================== */
  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    
    // 1. البحث عن التوكن (تم التبسيط للعمل مباشرة مع كود LoginController الجديد)
    // الباك إند يرسل الآن: { data: { access_token: '...', ... } }
    const responseData = res?.data?.data;
    const token = responseData?.access_token || res?.data?.token || res?.data?.access_token;
    
    // إذا لم نجد توكن، نرمي خطأ واضحاً
    if (!token) {
        console.error('فشل في العثور على التوكن في استجابة السيرفر:', res);
        throw new Error('لم يتلق النظام رمز الدخول. تأكد من إعدادات الباك إند.');
    }

    // 2. بناء كائن المستخدم (استخراج البيانات)
    let userObject = responseData || res?.data;
    if (userObject && userObject.user) {
        userObject = userObject.user;
    }

    // 3. تخزين البيانات
    persistToken('user', token);
    persist('user', userObject);
    setUser(userObject);
    
    // مسح أي جلسة أدمن معلقة
    persistToken('admin', null);
    setAdmin(null);
    
    // 4. إعادة تحميل الصفحة لضمان تحديث حالة التطبيق بعد الدخول
    window.location.reload();
    
    return userObject;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear locally anyway
    }
    persistToken('user', null);
    persist('user', null);
    setUser(null);
    // إعادة تحميل الصفحة بعد الخروج لضمان تنظيف الحالة
    window.location.reload();
  }, []);

  /* ===================== Admin actions ===================== */
  const adminLogin = useCallback(async (email, password) => {
    const res = await adminAuthApi.login({ email, password });
    
    const responseData = res?.data?.data;
    const token = responseData?.access_token || res?.data?.token || res?.data?.access_token;

    if (!token) {
        throw new Error('لم يتلق النظام رمز دخول الأدمن.');
    }

    let adminObject = responseData || res?.data;
    if (adminObject && adminObject.admin) {
        adminObject = adminObject.admin;
    }

    persistToken('admin', token);
    persist('admin', adminObject);
    setAdmin(adminObject);
    persistToken('user', null);
    setUser(null);
    
    window.location.reload();
    return adminObject;
  }, []);

  const adminLogout = useCallback(async () => {
    try {
      await adminAuthApi.logout();
    } catch {
      // ignore
    }
    persistToken('admin', null);
    persist('admin', null);
    setAdmin(null);
    window.location.reload();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res?.data) {
        setUser(res.data);
        persist('user', res.data);
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