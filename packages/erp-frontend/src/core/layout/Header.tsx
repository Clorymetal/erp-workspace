import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Search, Menu } from 'lucide-react';

export const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/notificaciones');
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
      case '/inventario': return 'Inventario';
      case '/rrhh': return 'Recursos Humanos';
      case '/settings': return 'Configuración';
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
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 min sync
    return () => clearInterval(interval);
  }, []);

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
            placeholder="Buscar facturas, proveedores, alertas..." 
            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Lado Derecho: Acciones (Tema, Notificaciones, Menú Móvil) */}
      <div className="flex items-center gap-3 relative">
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
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
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
        </div>
        
        {/* Botón de Menú para móvil */}
        <button className="p-2 sm:hidden text-gray-600 dark:text-gray-300">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};
