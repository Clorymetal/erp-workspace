import React, { useState } from 'react';
import { Plus, Search, AlertCircle, Clock, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button, DataTable, Modal } from '../../../core/components';
import { AnimatePresence } from 'framer-motion';
import { useClients, type Client } from '../hooks/useClients';
import { ClienteDetalle } from '../components/ClienteDetalle';

type DueFilter = 'TODOS' | 'VENCIDO' | 'PROXIMO' | 'AL_DIA';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('es-AR') : '—';

export const CuentasCorrientesPage = () => {
  const { clients, isLoading, saveClient, isSubmitting } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [dueFilter, setDueFilter] = useState<DueFilter>('TODOS');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '', taxId: '', email: '', phone: '', address: '', city: '', billingCycle: 'POR_REMITO'
  });

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!formData.businessName || !formData.taxId) return alert("Razón Social y CUIT obligatorios");
    try {
      await saveClient({ client: formData, isEdit: false });
      setIsModalOpen(false);
      setFormData({ businessName: '', taxId: '', email: '', phone: '', address: '', city: '', billingCycle: 'POR_REMITO' });
    } catch (e) {
      console.error(e);
      alert('Error guardando el cliente');
    }
  };

  // Filtrado combinado: búsqueda + estado de vencimiento
  const filteredData = clients.filter((c: Client) => {
    const s = searchTerm.toLowerCase();
    const matchSearch = c.businessName.toLowerCase().includes(s) || c.taxId.includes(s);
    const matchDue = dueFilter === 'TODOS' || c.dueStatus === dueFilter;
    return matchSearch && matchDue;
  });


  // Totales por segmento
  const vencidos = clients.filter(c => c.dueStatus === 'VENCIDO');
  const proximos = clients.filter(c => c.dueStatus === 'PROXIMO');
  const alDia = clients.filter(c => c.dueStatus === 'AL_DIA');

  const totalVencido = vencidos.reduce((acc, c) => acc + c.balance, 0);
  const totalProximo = proximos.reduce((acc, c) => acc + c.balance, 0);
  const totalAlDia = alDia.reduce((acc, c) => acc + c.balance, 0);
  const totalGeneral = clients.reduce((acc, c) => acc + c.balance, 0);

  // Enviar recordatorio directamente desde la fila
  const handleSendReminder = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation(); // No abrir el detalle
    if (!client.phone) return alert(`El cliente ${client.businessName} no tiene teléfono registrado.`);

    const nextVto = formatDate(client.nextDueDate);
    const text =
      `Hola! Le escribimos desde *Clorymetal* para recordarle amablemente que tiene un vencimiento próximo el *${nextVto}* por un saldo de *${formatCurrency(client.balance)}*.\n\n` +
      `Si necesita coordinar el pago o tiene alguna consulta, no dude en contactarnos.\n` +
      `¡Muchas gracias y hasta pronto! 😊`;

    let phone = client.phone.replace(/[^0-9]/g, '');
    if (phone && !phone.startsWith('54')) phone = '549' + phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const DUE_FILTERS: { key: DueFilter; label: string; icon: React.ReactNode; color: string; count: number; amount: number }[] = [
    { key: 'TODOS', label: 'Todos', icon: <CheckCircle2 size={16} />, color: 'gray', count: clients.length, amount: totalGeneral },
    { key: 'VENCIDO', label: 'Vencidos', icon: <AlertCircle size={16} />, color: 'red', count: vencidos.length, amount: totalVencido },
    { key: 'PROXIMO', label: 'Próx. a vencer', icon: <Clock size={16} />, color: 'orange', count: proximos.length, amount: totalProximo },
    { key: 'AL_DIA', label: 'Al día', icon: <CheckCircle2 size={16} />, color: 'emerald', count: alDia.length, amount: totalAlDia },
  ];

  const colorMap: Record<string, string> = {
    gray:    'bg-gray-50 dark:bg-dark-surface/30 text-gray-600 border-gray-200 dark:border-dark-border hover:bg-gray-100/50',
    red:     'bg-red-50/50 dark:bg-red-950/10 text-red-600 border-red-100 dark:border-red-950/20 hover:bg-red-50',
    orange:  'bg-orange-50/50 dark:bg-orange-950/10 text-orange-600 border-orange-100 dark:border-orange-950/20 hover:bg-orange-50',
    emerald: 'bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 border-emerald-100 dark:border-emerald-950/20 hover:bg-emerald-50',
  };
  const activeColorMap: Record<string, string> = {
    gray:    'bg-gray-800 text-white border-gray-800 dark:bg-gray-700 dark:border-gray-700 shadow-md scale-[1.02]',
    red:     'bg-red-500 text-white border-red-500 shadow-md scale-[1.02]',
    orange:  'bg-orange-500 text-white border-orange-500 shadow-md scale-[1.02]',
    emerald: 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-[1.02]',
  };

  const columns = [
    {
      key: 'dueStatus', header: '', render: (row: Client) => (
        <span className={`w-2 h-2 rounded-full inline-block ${
          row.dueStatus === 'VENCIDO' ? 'bg-red-500' :
          row.dueStatus === 'PROXIMO' ? 'bg-orange-400' : 'bg-emerald-400'
        }`} title={row.dueStatus} />
      )
    },
    { key: 'businessName', header: 'Cliente / Razón Social', sortable: true },
    { key: 'taxId', header: 'CUIT' },
    { key: 'billingCycle', header: 'Facturación', render: (row: Client) => (
        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
          row.billingCycle === 'MENSUAL'
            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {row.billingCycle === 'MENSUAL' ? 'Mensual' : 'Por Remito'}
        </span>
    )},
    { key: 'nextDueDate', header: 'Próx. Vto.', render: (row: Client) => (
        <span className={`text-sm font-semibold ${row.dueStatus === 'VENCIDO' ? 'text-red-500' : row.dueStatus === 'PROXIMO' ? 'text-orange-500' : 'text-gray-400'}`}>
          {formatDate(row.nextDueDate)}
        </span>
    )},
    {
      key: 'balance', header: 'Saldo Adeudado', render: (row: Client) => (
        <span className={`font-bold ${row.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
          {formatCurrency(row.balance)}
        </span>
      )
    },
    {
      key: 'acciones', header: 'Recordatorio', render: (row: Client) => (
        row.dueStatus !== 'AL_DIA' && row.balance > 0 ? (
          <button
            onClick={(e) => handleSendReminder(row, e)}
            title="Enviar recordatorio por WhatsApp"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800/30"
          >
            <MessageCircle size={14} />
            Recordatorio
          </button>
        ) : null
      )
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-orange-500">
            Cuentas Corrientes
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de remitos pendientes y cobranzas de clientes.</p>
        </div>
        <div className="flex gap-3 items-center">
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* FILTROS DE VENCIMIENTO CON IMPORTES ABAJO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {DUE_FILTERS.map(f => (
          <div key={f.key} className="flex flex-col gap-2">
            <button
              onClick={() => setDueFilter(f.key)}
              className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left border transition-all ${
                dueFilter === f.key ? activeColorMap[f.color] : colorMap[f.color]
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider opacity-90">
                  {f.icon}
                  {f.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  dueFilter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-gray-300 border dark:border-dark-border'
                }`}>{f.count}</span>
              </div>
            </button>
            <div className="text-center bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border rounded-xl py-2">
              <span className="text-[10px] text-gray-400 block uppercase tracking-widest font-bold mb-0.5">Importe Total</span>
              <span className={`text-lg font-black tracking-tight ${
                f.color === 'red' ? 'text-red-500' : 
                f.color === 'orange' ? 'text-orange-500' : 
                f.color === 'emerald' ? 'text-emerald-500' : 
                'text-gray-700 dark:text-gray-300'
              }`}>{formatCurrency(f.amount)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* BUSCADOR */}
      <div className="flex bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Buscar por Razón Social o CUIT..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(row: Client) => setSelectedClientId(row.id)}
      />

      <AnimatePresence>
        {selectedClientId && (
          <ClienteDetalle clientId={selectedClientId} onClose={() => setSelectedClientId(null)} />
        )}
      </AnimatePresence>

      {/* MODAL NUEVO CLIENTE */}
      <Modal
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Cliente"
        footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button variant="primary" onClick={handleSave} isLoading={isSubmitting}>Guardar</Button></>}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Razón Social</label>
            <input type="text" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">CUIT</label>
            <input type="text" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">WhatsApp / Teléfono</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" placeholder="549362XXXXXXX" />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Ciudad</label>
            <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="col-span-2 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30">
            <label className="text-xs font-bold uppercase text-purple-700 dark:text-purple-300 block mb-2">Tipo de Facturación</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="POR_REMITO" checked={formData.billingCycle === 'POR_REMITO'} onChange={e => setFormData({...formData, billingCycle: e.target.value})} className="accent-purple-600" />
                <span className="text-sm font-semibold">Por Remito</span>
                <span className="text-xs text-gray-500">(vence según plazo otorgado)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="MENSUAL" checked={formData.billingCycle === 'MENSUAL'} onChange={e => setFormData({...formData, billingCycle: e.target.value})} className="accent-purple-600" />
                <span className="text-sm font-semibold">Mensual</span>
                <span className="text-xs text-gray-500">(vencen el 1° del mes siguiente)</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
