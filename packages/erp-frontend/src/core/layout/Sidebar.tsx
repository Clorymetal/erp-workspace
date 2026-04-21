import { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  Users, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Sliders,
  FileText,
  History,
  ChevronDown,
  Wrench,
  UserCircle2,
  Truck
} from 'lucide-react';

interface MenuItem {
  name: string;
  icon: any;
  path?: string;
  subItems?: MenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  { 
    name: 'Ventas y Taller', 
    icon: Wrench,
    subItems: [
      { name: 'Tablero Taller', icon: Wrench, path: '/taller' },
      { name: 'Ventas Directas', icon: Truck, path: '/ventas' },
      { name: 'Maestro Clientes', icon: UserCircle2, path: '/clientes' },
    ]
  },
  { 
    name: 'Proveedores', 
    icon: Building2,
    subItems: [
      { name: 'Gestión', icon: Building2, path: '/proveedores' },
      { name: 'Cuentas Corrientes', icon: History, path: '/resumen-deuda' },
      { name: 'Compras', icon: FileText, path: '/compras' },
      { name: 'Libro IVA', icon: FileText, path: '/libro-iva' },
    ]
  },
  { name: 'Inventario', icon: PackageSearch, path: '/inventario' },
  { name: 'Empleados', icon: Users, path: '/empleados' },
  { 
    name: 'Configuración', 
    icon: Settings,
    subItems: [
      { name: 'Mi Negocio', icon: Building2, path: '/configuracion' },
      { name: 'Parámetros Globales', icon: Sliders, path: '/parametros' },
    ]
  },
];

export const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Proveedores']);
  const location = useLocation();

  const toggleMenu = (name: string) => {
    if (collapsed) {
      setCollapsed(false);
      if (!expandedMenus.includes(name)) {
        setExpandedMenus(prev => [...prev, name]);
      }
      return;
    }
    setExpandedMenus(prev => 
      prev.includes(name) 
        ? prev.filter(m => m !== name) 
        : [...prev, name]
    );
  };

  const isChildActive = (item: MenuItem) => {
    if (!item.subItems) return location.pathname === item.path;
    return item.subItems.some(sub => location.pathname === sub.path);
  };

  return (
    <motion.aside 
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col relative z-20 shadow-xl"
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <Link to="/">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="font-bold text-xl bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent truncate cursor-pointer hover:opacity-80 transition-opacity"
            >
              Clorymetal
            </motion.div>
          </Link>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto no-scrollbar">
        {MENU_ITEMS.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedMenus.includes(item.name);
          const active = isChildActive(item);

          if (hasSubItems) {
            return (
              <div key={item.name} className="flex flex-col">
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative overflow-hidden w-full ${
                    active 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <item.icon size={22} className={`shrink-0 ${active ? 'drop-shadow-md' : 'group-hover:text-primary-500 transition-colors'}`} />
                  
                  {!collapsed && (
                    <>
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="whitespace-nowrap flex-1 text-left"
                      >
                        {item.name}
                      </motion.span>
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </>
                  )}
                </button>

                {!collapsed && (
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden flex flex-col pl-9 mt-1 space-y-1"
                      >
                        {item.subItems!.map((sub) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path!}
                            className={({ isActive }) => 
                              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                                isActive 
                                  ? 'text-primary-600 dark:text-primary-400 font-semibold bg-primary-50/50 dark:bg-primary-900/10' 
                                  : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                              }`
                            }
                          >
                            <sub.icon size={16} />
                            <span>{sub.name}</span>
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={({ isActive }) => 
                `flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <item.icon size={22} className={`shrink-0 ${isActive ? 'drop-shadow-md' : 'group-hover:text-primary-500 transition-colors'}`} />
                  
                  {!collapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-dark-border">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
            {user?.name?.charAt(0) || 'A'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@clorymetal.com'}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
