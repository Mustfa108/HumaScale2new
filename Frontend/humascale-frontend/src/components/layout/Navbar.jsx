import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  History as HistoryIcon,
  Bell,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  FileDown,
  Activity,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { notificationApi } from '../../api/notification';

const navItems = [
  { to: '/dashboard', label: 'لوحة المعلومات', icon: LayoutDashboard },
  { to: '/assessment', label: 'تقييم جديد', icon: ClipboardList },
  { to: '/history', label: 'سجل التقييمات', icon: HistoryIcon },
];

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

function NotificationsBell({ onNavigate }) {
  const { data } = useAsync(() => notificationApi.list({ page: 1 }), {
    deps: [],
  });
  const unread = data?.unread_count || 0;
  return (
    <button
      onClick={() => onNavigate('/notifications')}
      className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      aria-label="الإشعارات"
    >
      <Bell size={20} />
      {unread > 0 && (
        <span className="absolute -top-0.5 -left-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.success('تم تسجيل الخروج بنجاح.');
    navigate('/login', { replace: true });
  };

  const initials = (user?.name || '؟')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {initials || '؟'}
        </span>
        <span className="hidden text-sm font-medium text-slate-700 sm:inline">
          {user?.name}
        </span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card animate-fade-in">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
              {user?.organization_name && (
                <p className="mt-1 truncate text-xs text-slate-500">
                  {user.organization_name}
                </p>
              )}
            </div>
            <div className="p-1">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                <UserIcon size={16} />
                الملف الشخصي
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <Activity size={20} />
          </span>
          <span className="text-lg font-bold text-slate-900">HumaScale</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NotificationsBell onNavigate={(p) => navigate(p)} />
          <UserMenu />
          <button
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="القائمة"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="container-page flex flex-col gap-1 py-3">
            {navItems.map((n) => (
              <NavItem
                key={n.to}
                {...n}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export function PageContainer({ children, className = '' }) {
  return (
    <div className={clsx('min-h-screen bg-slate-50', className)}>
      <Navbar />
      <main className="container-page py-6 md:py-10">{children}</main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 className="heading-2">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export { FileDown };
