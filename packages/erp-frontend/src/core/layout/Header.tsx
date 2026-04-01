import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Moon, Sun, Search, Menu, LogOut, ChevronDown, User as UserIcon } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';

export const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();
  const { user, logout, token } = useAuth();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.warn("Backend not available for notifications");
    }
  };

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Dashboard Principal';
      case '/proveedores': return 'Gestión de Proveedores';
      case '/compras': return 'Compras y Facturación';
      case '/parametros': return 'Configuración Sistema';
      case '/empleados': return 'Gestión de Personal';
      default: return 'Portal Clorymetal';
    }
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    if (token) {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // 1 min sync
        return () => clearInterval(interval);
    }
  }, [token]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} h`;
    return date.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border px-6 py-4 flex items-center justify-between transition-colors shadow-sm">
      {/* Lado Izquierdo: Ruta Actual y Buscador Global */}
      <div className="flex items-center gap-6 flex-1">
        <motion.h1 
          key={location.pathname}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-2xl font-semibold text-gray-800 dark:text-gray-100 hidden sm:block"
        >
          {getPageTitle(location.pathname)}
        </motion.h1>

        {/* Buscador Global Rápido */}
        <div className="relative max-w-md flex-1 group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar facturas, proveedores..." 
            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Lado Derecho: Acciones (Tema, Notificaciones, Menú Móvil) */}
      <div className="flex items-center gap-4 relative">
        {/* Toggle Modo Oscuro / Claro */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-inner"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        {/* Notificaciones */}
        <div className="relative">
          <motion.button 
            onClick={() => setShowNotifications(!showNotifications)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-inner"
          >
            <Bell size={20} />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
            )}
          </motion.button>

          {/* Dropdown de Notificaciones */}
          <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-2xl overflow-hidden z-20"
            >
              <div className="p-4 border-b border-gray-100 dark:border-dark-border flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notificaciones</h3>
                <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full font-medium">
                  {notifications.filter(n => !n.isRead).length} nuevas
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 border-b border-gray-50 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notif.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.description}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">{formatTime(notif.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No hay notificaciones
                  </div>
                )}
              </div>
              <div className="p-3 text-center border-t border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors cursor-pointer">
                <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">Ver todas</span>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-dark-border mx-1 hidden sm:block"></div>

        {/* User Menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 pr-4 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-dark-border group"
          >
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-primary-500" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight truncate max-w-[100px]">{user?.name}</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">{user?.role}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 group-hover:text-primary-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-56 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden z-20"
            >
              <div className="p-4 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Tu Cuenta</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg/50 rounded-xl transition-colors">
                  <UserIcon size={18} />
                  Mi Perfil
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors"
                >
                  <LogOut size={18} />
                  Cerrar Sesión
                </button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
        
        {/* Botón de Menú para móvil */}
        <button className="p-2 sm:hidden text-gray-600 dark:text-gray-300">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};
