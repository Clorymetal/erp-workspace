import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Calendar, TrendingUp, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/dashboard/stats');
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Deuda Total',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(stats?.totalDebt || 0),
      icon: <DollarSign className="text-rose-500" size={24} />,
      bgColor: 'bg-rose-50 dark:bg-rose-500/10',
      description: 'Saldo acumulado en Cta Cte'
    },
    {
      title: 'Compras del Mes',
      value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(stats?.monthlyTotal || 0),
      icon: <ShoppingBag className="text-blue-500" size={24} />,
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      description: `${stats?.monthlyCount || 0} comprobantes este mes`
    },
    {
      title: 'Próximos Vencimientos',
      value: stats?.upcomingExpiring || 0,
      icon: <Calendar className="text-amber-500" size={24} />,
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      description: 'En los próximos 7 días'
    },
    {
      title: 'Tendencia',
      value: '+12%',
      icon: <TrendingUp className="text-emerald-500" size={24} />,
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      description: 'Vs mes anterior (simulado)'
    }
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Panel de Control</h1>
        <p className="text-gray-500">Resumen operativo de Clorymetal ERP.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border group hover:shadow-md transition-all cursor-default"
          >
            <div className={`p-3 rounded-2xl ${card.bgColor} w-fit mb-4 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{card.value}</div>
            <p className="text-xs text-gray-400">{card.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Últimas Compras</h2>
            <button className="text-primary-500 text-sm font-semibold flex items-center gap-1 hover:underline">
              Ver todas <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {stats?.recentInvoices?.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg/50 border border-transparent hover:border-primary-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-500/10 p-2 rounded-xl">
                    <ShoppingBag className="text-primary-500" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{inv.provider?.businessName}</h4>
                    <p className="text-xs text-gray-500">{inv.invoiceType} - {inv.pointOfSale}-{inv.invoiceNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(inv.totalAmount)}</div>
                  <p className="text-[10px] text-gray-400">{new Date(inv.issueDate).toLocaleDateString('es-AR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin size={22} className="text-primary-500" />
            Deuda por Provincia
          </h2>
          <div className="space-y-6">
            {stats?.provinceStats?.map((stat: any) => (
              <div key={stat.province}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{stat.province}</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(stat.total)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stat.total / stats.totalDebt) * 100, 100)}%` }}
                    className="h-full bg-primary-500 rounded-full"
                  />
                </div>
              </div>
            ))}
            {(!stats?.provinceStats || stats.provinceStats.length === 0) && (
              <div className="text-center py-10 text-gray-400 text-sm italic">
                Sin deudas activas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
