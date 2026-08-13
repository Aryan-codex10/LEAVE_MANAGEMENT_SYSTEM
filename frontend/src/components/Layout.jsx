import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  CalendarPlus,
  History,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Apply Leave', path: '/apply', icon: CalendarPlus },
    { name: 'Leave History', path: '/history', icon: History },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Review', path: '/admin', icon: ShieldCheck });
  }

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-primary-light text-primary'
        : 'text-slate-550 hover:bg-slate-50 hover:text-slate-900'
    }`;

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-5">
      <div>
        <div className="flex items-center px-2 py-1">
          <span className="font-display text-sm font-extrabold uppercase tracking-wider text-slate-900">
            Leave Management
          </span>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={linkClasses}
            >
              <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <div className="flex flex-col px-2 mb-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900 leading-none mb-1">
              {user?.name || 'User'}
            </p>
            <p className="truncate text-3xs font-bold uppercase tracking-wider text-slate-400">
              {user?.role || 'employee'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger-light hover:text-danger transition-colors"
        >
          <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bgApp font-body">
      <aside className="hidden w-60 border-r border-slate-100 bg-white md:block flex-shrink-0 shadow-xs">
        <SidebarContent />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/20 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="relative z-50 flex w-60 flex-col bg-white border-r border-slate-100 shadow-xs animate-fade-in">
            <div className="absolute right-4 top-5">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6 md:hidden flex-shrink-0 shadow-xs">
          <div className="flex items-center">
            <span className="font-display font-extrabold text-slate-900 text-sm tracking-tight">
              Leave Management
            </span>
          </div>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded p-1.5 text-slate-655 hover:bg-slate-50 focus:outline-none"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
