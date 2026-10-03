import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Boxes,
  Receipt,
  LogOut,
  Wifi,
  WifiOff,
  RefreshCw,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { SyncManager } from '../../offline/syncManager';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { shop, logout } = useAuthStore();
  const isOnline = useOnlineStatus();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [syncState, setSyncState] = useState<{ isSyncing: boolean; pendingCount: number }>({
    isSyncing: false,
    pendingCount: 0,
  });

  useEffect(() => {
    const unsubscribe = SyncManager.subscribe(setSyncState);
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    await SyncManager.syncPendingSales();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/billing', label: 'POS Billing / बिलिंग', icon: <ShoppingBag className="w-5 h-5" /> },
    { path: '/products', label: 'Products / सामान', icon: <Package className="w-5 h-5" /> },
    { path: '/stock', label: 'Stock / स्टॉक', icon: <Boxes className="w-5 h-5" /> },
    { path: '/sales', label: 'Sales History / बिक्री', icon: <Receipt className="w-5 h-5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Shop Name */}
          <div className="flex items-center space-x-3">
            <Link to="/billing" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-emerald-950/50 border border-emerald-500/40 bg-slate-900 group-hover:scale-105 transition-transform flex-shrink-0">
                <img src="/logo.png" alt="ViRa POS" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-extrabold text-slate-100 block leading-tight">
                  {shop?.shopName || 'ViRa POS'}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  {shop?.ownerName ? `${shop.ownerName} • ViRa POS` : 'Smart Retail Billing'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Status Indicators & Actions */}
          <div className="flex items-center space-x-2.5">
            {/* Online / Offline / Sync Status */}
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1.5 border border-slate-700/60 text-xs">
              {isOnline ? (
                <span className="flex items-center text-emerald-400 font-medium px-2 py-0.5 space-x-1.5">
                  <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">Online</span>
                </span>
              ) : (
                <span className="flex items-center text-amber-400 font-medium px-2 py-0.5 space-x-1.5">
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  <span>Offline</span>
                </span>
              )}

              {syncState.pendingCount > 0 && (
                <button
                  onClick={handleManualSync}
                  disabled={!isOnline || syncState.isSyncing}
                  title={`${syncState.pendingCount} pending offline bills`}
                  className="flex items-center space-x-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg ml-1 font-bold hover:bg-amber-500/30 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                  <span>{syncState.pendingCount} sync</span>
                </button>
              )}
            </div>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 hidden sm:flex"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/98 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout ({shop?.ownerName})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
