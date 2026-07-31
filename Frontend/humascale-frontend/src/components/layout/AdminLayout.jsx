import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  Activity,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const navItems = [
  { to: '/admin', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'المستخدمون', icon: Users },
  { to: '/admin/assessments', label: 'التقييمات', icon: ClipboardList },
  { to: '/admin/analytics', label: 'تحليلات المحاور', icon: BarChart3 },
];

function NavItem({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
          isActive
            ? 'bg-white text-brand-700 shadow-sm'
            : 'text-brand-100 hover:bg-brand-700/60 hover:text-white',
        )
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

function AdminMenu() {
  const { admin, adminLogout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await adminLogout();
    toast.success('تم تسجيل الخروج.');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl p-2 text-right hover:bg-brand-700/60"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-amber-900">
          <Shield size={18} />
        </span>
        <span className="flex-1 truncate text-sm">
          <span className="block font-semibold text-white">{admin?.name || 'مدير'}</span>
          <span className="block text-xs text-brand-200">{admin?.email}</span>
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 left-0 z-40 mb-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 right-0 z-40 flex w-72 flex-col bg-gradient-to-b from-brand-800 to-brand-950 text-white transition-transform md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Activity size={20} />
            </span>
            <div>
              <p className="text-sm font-bold">HumaScale</p>
              <p className="text-[11px] text-brand-200">لوحة الإدارة</p>
            </div>
          </Link>
          <button
            className="rounded-full p-1 text-brand-100 hover:bg-white/10 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((n) => (
            <NavItem
              key={n.to}
              {...n}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <AdminMenu />
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="فتح القائمة"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-sm font-semibold text-slate-700">
            مرحباً بك في لوحة الإدارة
          </h2>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
