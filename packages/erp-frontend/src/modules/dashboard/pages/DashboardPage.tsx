import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  AlertCircle, 
  Clock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (e) {
        console.error('Error fetching dashboard stats', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  const statsCards = [
    {
      title: 'Deuda Total',
      value: formatCurrency(stats?.totalDebt || 0),
      icon: <DollarSign className="text-rose-500" size={24} />,
      bgColor: 'bg-rose-50 dark:bg-rose-500/10',
      description: 'Facturas pendientes de pago'
    },
    {
      title: 'Compras del Mes',
      value: formatCurrency(stats?.currentMonthTotal || 0),
      icon: <ShoppingBag className="text-blue-500" size={24} />,
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      description: 'Acumulado mes en curso',
      extra: (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border space-y-1">
          {stats?.monthlyHistory?.slice(1).map((h: any) => (
            <div key={h.month} className="flex justify-between text-[10px]">
              <span className="text-gray-400 capitalize">{h.month}</span>
              <span className="font-bold text-gray-600 dark:text-gray-300">{formatCurrency(h.total)}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Vencimientos',
      value: stats?.expiringSoonAndOverdue?.length || 0,
      icon: <AlertCircle className="text-amber-500" size={24} />,
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      description: 'Facturas próximas o vencidas',
      highlight: stats?.expiringSoonAndOverdue?.some((i: any) => new Date(i.dueDate) < new Date())
    },
    {
      title: 'Tendencia',
      value: `${stats?.trend?.value}%`,
      icon: <TrendingUp className={stats?.trend?.comparison === 'up' ? 'text-rose-500' : 'text-emerald-500'} size={24} />,
      bgColor: stats?.trend?.comparison === 'up' ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10',
      description: 'Comparativo vs mes anterior',
      clickable: true
    }
  ];

  // Preparar datos para el gráfico
  const chartData = stats?.chartData?.current.map((item: any, idx: number) => ({
    name: item.day,
    actual: item.total,
    anterior: stats?.chartData?.previous[idx]?.total || 0
  }));

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Panel de Control</h1>
          <p className="text-gray-500">Resumen financiero y operativo.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-400 uppercase font-black tracking-widest">Estado del Sistema</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-bold">En Línea</span>
          </div>
        </div>
      </header>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => card.clickable && setShowChart(!showChart)}
            className={`bg-white dark:bg-dark-surface p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-dark-border group hover:shadow-xl hover:-translate-y-1 transition-all ${card.clickable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.bgColor} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              {card.highlight && (
                <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full animate-bounce">ATENCIÓN</span>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1 tracking-tight">{card.value}</div>
            <p className="text-xs text-gray-400">{card.description}</p>
            {card.extra}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-dark-surface rounded-[2.5rem] p-8 shadow-2xl border border-primary-500/20"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold">Comparativo de Compras</h2>
                <p className="text-sm text-gray-500">Mes Actual vs Mes Anterior (Día por día)</p>
              </div>
              <button 
                onClick={() => setShowChart(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Line type="monotone" name="Mes Actual" dataKey="actual" stroke="#6366F1" strokeWidth={4} dot={false} activeDot={{ r: 8 }} />
                  <Line type="monotone" name="Mes Anterior" dataKey="anterior" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Últimas Compras */}
        <div className="bg-white dark:bg-dark-surface rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-dark-border">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="text-primary-500" size={24} />
              Últimas Compras
            </h2>
            <button className="text-primary-500 text-sm font-bold flex items-center gap-1 hover:underline">
              Ver todas <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {stats?.recentInvoices?.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-bg/30 border border-transparent hover:border-primary-500/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="bg-white dark:bg-dark-surface p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <ShoppingBag className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{inv.provider?.businessName}</h4>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{inv.invoiceType} • {inv.pointOfSale}-{inv.invoiceNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm text-gray-900 dark:text-gray-100">{formatCurrency(inv.totalAmount)}</div>
                  <p className="text-[10px] text-gray-400 font-bold">{new Date(inv.issueDate).toLocaleDateString('es-AR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle de Vencimientos */}
        <div className="bg-white dark:bg-dark-surface rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Clock size={120} />
          </div>
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Calendar className="text-amber-500" size={24} />
            Próximos Vencimientos
          </h2>
          <div className="space-y-4 relative z-10">
            {stats?.expiringSoonAndOverdue?.map((inv: any) => {
              const overdue = new Date(inv.dueDate) < new Date();
              return (
                <div key={inv.id} className={`flex items-center justify-between p-4 rounded-2xl border-l-4 transition-all ${overdue ? 'bg-rose-50 dark:bg-rose-500/5 border-l-rose-500 shadow-sm' : 'bg-gray-50/50 dark:bg-dark-bg/30 border-l-amber-500'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${overdue ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600'}`}>
                      {overdue ? <AlertCircle size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{inv.provider?.businessName}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-bold">{new Date(inv.dueDate).toLocaleDateString('es-AR')}</span>
                        {overdue && <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-black">VENCIDO</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-sm ${overdue ? 'text-rose-600' : 'text-gray-900 dark:text-gray-100'}`}>{formatCurrency(inv.totalAmount)}</div>
                    <p className="text-[10px] text-gray-400">Fact. {inv.invoiceNumber}</p>
                  </div>
                </div>
              );
            })}
            {(!stats?.expiringSoonAndOverdue || stats.expiringSoonAndOverdue.length === 0) && (
              <div className="text-center py-20 flex flex-col items-center gap-3">
                <div className="bg-emerald-100 dark:bg-emerald-500/10 p-4 rounded-full text-emerald-500">
                  <Clock size={40} />
                </div>
                <p className="text-sm font-bold text-gray-500">No hay vencimientos pendientes</p>
                <p className="text-xs text-gray-400">¡Tu cartera está al día!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
