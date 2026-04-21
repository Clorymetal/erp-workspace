import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Printer, Search, Download, History, User } from 'lucide-react';
import { Button, DataTable } from '../../../core/components';
import { useClientCtaCte } from '../hooks/useClientCtaCte';
import type { ClientMovement } from '../hooks/useClientCtaCte';
import { useClients } from '../hooks/useClients';
import { CollectionModal } from '../components/CollectionModal';

export const ClientCtaCtePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients } = useClients();
  const client = clients.find(c => c.id === id);
  
  const { 
    history, 
    isLoadingHistory, 
    balance,
    isLoadingBalance,
    createPayment,
    isSubmitting: isPaying
  } = useClientCtaCte(id || '');

  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleSavePayment = async (data: any) => {
    try {
      await createPayment(data);
      setIsPaymentModalOpen(false);
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (!client && !isLoadingHistory) {
    return <div className="p-10 text-center flex flex-col items-center gap-4">
      <User size={48} className="text-gray-300" />
      <p className="text-gray-500 font-bold">Cliente no encontrado en la base de datos.</p>
      <Button variant="ghost" onClick={() => navigate('/clientes')}>Volver al Maestro</Button>
    </div>;
  }

  const columns = [
    { 
      key: 'date', 
      header: 'Fecha', 
      render: (row: any) => new Date(row.date).toLocaleDateString('es-AR'),
      sortable: true 
    },
    { 
        key: 'type', 
        header: 'Tipo',
        render: (row: any) => (
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                row.type === 'TALLER' ? 'bg-purple-100 text-purple-600' : 
                row.type === 'VENTA' ? 'bg-blue-100 text-blue-600' : 
                'bg-emerald-100 text-emerald-600'
            }`}>
                {row.type}
            </span>
        )
    },
    { key: 'number', header: 'Número', render: (row:any) => <span className="font-mono text-xs">{row.number}</span> },
    { key: 'description', header: 'Descripción' },
    { 
      key: 'debit', 
      header: 'Debe', 
      render: (row: any) => row.debit > 0 ? (
        <span className="text-red-500 font-bold">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.debit)}
        </span>
      ) : '-',
      align: 'right'
    },
    { 
      key: 'credit', 
      header: 'Haber', 
      render: (row: any) => row.credit > 0 ? (
        <span className="text-emerald-500 font-bold">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.credit)}
        </span>
      ) : '-',
      align: 'right'
    },
    { 
      key: 'balance', 
      header: 'Saldo', 
      render: (row: any) => (
        <span className={`font-black ${row.balance > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.balance)}
        </span>
      ),
      align: 'right'
    },
    {
      key: 'acciones',
      header: '',
      render: (row: any) => (
        <div className="flex justify-end gap-2">
          <button className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors" title="Ver Detalles/Imprimir">
            <Printer size={16} />
          </button>
        </div>
      )
    }
  ];

  const filteredHistory = history.filter((m: any) => 
    m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/clientes')}
            className="p-2 hover:bg-gray-50 dark:hover:bg-dark-surface rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              Estado de Cuenta: <span className="text-primary-500">{client?.businessName}</span>
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">CUIT: {client?.taxId}</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="primary" 
            icon={<Plus size={18} />}
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex-1 md:flex-none"
          >
            Registrar Cobro
          </Button>
          <Button 
            variant="ghost" 
            icon={<Download size={18} />}
            className="flex-1 md:flex-none"
          >
            Resumen PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border flex items-center gap-4">
          <div className={`w-12 h-12 ${balance > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'} rounded-xl flex items-center justify-center`}>
            <History size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-black text-gray-400">Saldo Pendiente de Cobro</span>
            <div className={`text-3xl font-black ${balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(balance || 0)}
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border col-span-2 flex flex-col justify-center">
           <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-black text-gray-400">Dirección</span>
                <p className="font-bold text-sm">{client?.address}, {client?.city}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-gray-400">Plazo de Pago (Default)</span>
                <p className="font-bold text-sm">30 días</p>
              </div>
           </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Buscar reparación, venta o recibo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
        <DataTable 
          data={filteredHistory} 
          columns={columns} 
          isLoading={isLoadingHistory} 
        />
      </div>

      {isPaymentModalOpen && client && (
        <CollectionModal 
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            clientId={client.id}
            clientName={client.businessName}
            onSave={handleSavePayment}
        />
      )}
    </div>
  );
};
