import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Receipt, Edit, CheckCircle } from 'lucide-react';
import { DataTable } from '../../../core/components/DataTable';
import type { Column } from '../../../core/components/DataTable';

interface Invoice {
  id: string;
  invoiceType: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
}

interface ProviderDetailsProps {
  provider: any;
  onClose: () => void;
  onAddInvoice: () => void;
  onEditInvoice: (invoice: any) => void;
  onStatusChange: (invoiceId: string, status: string) => void;
  refreshTrigger?: number;
}

export const ProviderDetails = ({ provider, onClose, onAddInvoice, onEditInvoice, onStatusChange, refreshTrigger }: ProviderDetailsProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/api/proveedores/${provider.id}/facturas`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (provider) fetchInvoices();
  }, [provider, refreshTrigger]);

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesType = typeFilter === 'all' || inv.invoiceType === typeFilter;
    return matchesStatus && matchesType;
  });

  const columns: Column<Invoice>[] = [
    { 
      key: 'invoiceType', 
      header: 'Comprobante',
      render: (item) => (
        <span className="flex flex-col">
          <span className="text-xs font-bold text-gray-400">{item.invoiceType.replace('_', ' ')}</span>
          <span className="text-sm font-medium">{item.invoiceNumber}</span>
        </span>
      )
    },
    { 
      key: 'issueDate', 
      header: 'Fechas',
      render: (item) => (
        <div className="flex flex-col text-[11px]">
          <span className="text-gray-500">Emi: {new Date(item.issueDate).toLocaleDateString()}</span>
          {item.dueDate && (
            <span className={new Date(item.dueDate) < new Date() && item.status === 'PENDIENTE' ? 'text-red-500 font-bold' : 'text-primary-500'}>
              Venc: {new Date(item.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'totalAmount', 
      header: 'Monto',
      render: (item) => (
        <span className="font-bold text-gray-900 dark:text-gray-100">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.totalAmount)}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-black ${
          item.status === 'PAGADA' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
            : item.status === 'VENCIDA' || (item.dueDate && new Date(item.dueDate) < new Date())
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'acciones',
      header: '',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onEditInvoice(item); }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-primary-500"
          >
            <Edit size={16} />
          </button>
          {item.status !== 'PAGADA' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onStatusChange(item.id, 'PAGADA'); }}
              className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-gray-400 hover:text-green-600"
              title="Marcar como Pagada"
            >
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-dark-surface shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-dark-border"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-bg/50">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 uppercase">{provider.razonSocial}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestión Detallada de Compras</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
            <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">Deuda Actual</p>
            <p className="text-xl font-black text-red-700 dark:text-red-300 mt-1">
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(provider.saldo)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">Total Facturas</p>
            <p className="text-xl font-black text-gray-700 dark:text-gray-300 mt-1">{invoices.length}</p>
          </div>
        </div>

        {/* Section Title & Add Button */}
        <div className="flex justify-between items-center mt-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Receipt size={22} className="text-primary-500" />
            Movimientos de Cuenta Corriente
          </h3>
          <button 
            onClick={onAddInvoice}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary-500/30 active:scale-95"
          >
            <Plus size={18} />
            Nueva Factura
          </button>
        </div>

        {/* Filtering Controls */}
        <div className="flex gap-3 mb-2">
          <select 
            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">TODOS LOS ESTADOS</option>
            <option value="PENDIENTE">PENDIENTES</option>
            <option value="PAGADA">PAGADAS</option>
          </select>
          <select 
            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">TODOS LOS TIPOS</option>
            <option value="FACTURA_A">FACTURA A</option>
            <option value="FACTURA_B">FACTURA B</option>
            <option value="NOTA_CREDITO">NOTA CRÉDITO</option>
          </select>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-dark-bg/30 rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border">
          <DataTable 
            data={filteredInvoices} 
            columns={columns} 
            isLoading={loading} 
            emptyMessage="No hay registros que coincidan con los filtros."
            onRowClick={(item) => onEditInvoice(item)}
          />
        </div>
      </div>
    </motion.div>
  );
};
