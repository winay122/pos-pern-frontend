import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Store, PlusCircle, BarChart3, LogOut } from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { Button } from '../common/Button';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Platform Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/admin/shops', label: 'Registered Shops', icon: <Store className="w-5 h-5" /> },
    { path: '/admin/create-shop', label: 'Create New Shop', icon: <PlusCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-indigo-900/40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-950/50 border border-indigo-500/40 bg-slate-900 flex-shrink-0">
                <img src="/logo.png" alt="ViRa POS Admin" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-100 block leading-tight">ViRa POS Admin</span>
                <span className="text-xs text-indigo-400 font-semibold">Platform Management Portal</span>
              </div>
            </div>

            <nav className="flex items-center space-x-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-400 hidden md:inline">
                {admin?.email || 'admin@posvillage.com'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400"
                title="Admin Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
