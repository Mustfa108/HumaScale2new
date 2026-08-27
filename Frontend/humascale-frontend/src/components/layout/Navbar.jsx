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
  MapPin,
  Globe,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { notificationApi } from '../../api/notification';

function useNavItems() {
  const { t } = useLanguage();
  return [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/assessment', label: t('nav.assessment'), icon: ClipboardList },
    { to: '/history', label: t('nav.history'), icon: HistoryIcon },
    { to: '/expansion', label: t('nav.expansion'), icon: MapPin },
  ];
}

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
        )
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

function LocaleToggle() {
  const { locale, setLocale, t } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label={t('common.language')}
    >
      <Globe size={16} />
      {locale === 'ar' ? 'EN' : 'ع'}
    </button>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const cycle = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  return (
    <button
      type="button"
      onClick={() => setTheme(cycle)}
      className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label={`${t('common.theme')}: ${t(`common.${theme}`)}`}
      title={t(`common.${theme}`)}
    >
      <Icon size={18} />
    </button>
  );
}

function NotificationsBell({ onNavigate }) {
  const { t } = useLanguage();
  const { data } = useAsync(() => notificationApi.list({ page: 1 }), {
    deps: [],
  });
  const unread = data?.unread_count || 0;
  return (
    <button
      onClick={() => onNavigate('/notifications')}
      className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label={t('nav.notifications')}
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
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.success(t('nav.logout'));
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
        className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {initials || '؟'}
        </span>
        <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:inline">
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
          <div className="absolute start-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card animate-fade-in dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
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
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <UserIcon size={16} />
                {t('nav.profile')}
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <LogOut size={16} />
                {t('nav.logout')}
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
  const navItems = useNavItems();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <Activity size={20} />
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">HumaScale</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LocaleToggle />
          <ThemeToggle />
          <NotificationsBell onNavigate={(p) => navigate(p)} />
          <UserMenu />
          <button
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={t('nav.dashboard')}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-950">
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
    <div className={clsx('min-h-screen bg-slate-50 dark:bg-slate-950', className)}>
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
        {subtitle && <p className="mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export { FileDown };
