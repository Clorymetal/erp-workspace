import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Printer, Search, Download, History } from 'lucide-react';
import { Button, DataTable } from '../../../core/components';
import { useCtaCte } from '../hooks/useCtaCte';
import { useProviders } from '../hooks/useProviders';
import { PaymentWizard } from '../components/PaymentWizard';
import { PaymentDetailsModal } from '../components/PaymentDetailsModal';

export const ProviderCtaCtePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { providers } = useProviders();
  const provider = providers.find(p => p.id === id);
  
  const { 
    history, 
    isLoadingHistory, 
    annulPayment,
    isAnnullingPayment 
  } = useCtaCte(id || '');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!provider && !isLoadingHistory) {
    return <div className="p-10 text-center">Proveedor no encontrado</div>;
  }

  const handleAnnul = async (paymentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas anular este pago? Esta acción no se puede deshacer.')) {
      try {
        await annulPayment(paymentId);
      } catch (e: any) {
        alert('Error al anular: ' + e.message);
      }
    }
  };

  const columns = [
    { 
      key: 'date', 
      header: 'Fecha', 
      render: (row: any) => new Date(row.date).toLocaleDateString('es-AR'),
      sortable: true 
    },
    { key: 'type', header: 'Tipo' },
    { key: 'number', header: 'Número' },
    { key: 'description', header: 'Descripción' },
    { 
      key: 'debit', 
      header: 'Debe', 
      render: (row: any) => row.debit > 0 ? (
        <span className="text-red-500 font-medium">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.debit)}
        </span>
      ) : '-',
      align: 'right'
    },
    { 
      key: 'credit', 
      header: 'Haber', 
      render: (row: any) => row.credit > 0 ? (
        <span className="text-emerald-500 font-medium">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.credit)}
        </span>
      ) : '-',
      align: 'right'
    },
    { 
      key: 'balance', 
      header: 'Saldo', 
      render: (row: any) => (
        <span className={`font-bold ${row.balance > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
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
          {row.origin === 'PAYMENT' && row.status !== 'ANULADO' && (
            <button 
              onClick={() => handleAnnul(row.id)}
              disabled={isAnnullingPayment}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Anular Pago"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors" title="Imprimir">
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
            onClick={() => navigate('/proveedores')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Cuenta Corriente: <span className="text-primary-500">{provider?.razonSocial}</span>
            </h1>
            <p className="text-sm text-gray-500 italic">CUIT: {provider?.cuit}</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="primary" 
            icon={<Plus size={18} />}
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex-1 md:flex-none"
          >
            Nueva Orden de Pago
          </Button>
          <Button 
            variant="ghost" 
            icon={<Download size={18} />}
            className="flex-1 md:flex-none"
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-xl flex items-center justify-center">
            <History size={24} />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-gray-400">Saldo Actual</span>
            <div className={`text-2xl font-black ${provider && provider.saldo > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(provider?.saldo || 0)}
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border col-span-2 flex flex-col justify-center">
           <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400">Condición Fiscal</span>
                <p className="font-semibold">{provider?.condFisc}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Días de Gracia</span>
                <p className="font-semibold">{provider?.expirationDays} días</p>
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
            placeholder="Buscar movimiento..."
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
          onRowClick={(row: any) => {
            if (row.origin === 'PAYMENT') {
              setSelectedPaymentId(row.id);
            }
          }}
        />
      </div>

      {/* Modals */}
      {isPaymentModalOpen && (
        <PaymentWizard 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          providerId={id || ''}
        />
      )}

      {selectedPaymentId && (
        <PaymentDetailsModal 
          isOpen={!!selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
          paymentId={selectedPaymentId}
        />
      )}
    </div>
  );
};
