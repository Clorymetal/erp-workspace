import { useState, useEffect } from 'react';
import { Search, Plus, Pencil } from 'lucide-react';
import { Button, DataTable, ExportMenu, Modal } from '../../../core/components';
import { InvoiceModal } from '../components/InvoiceModal';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export const ComprasPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    province: '',
    isCtaCte: 'all'
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search: searchTerm,
        status: filters.status === 'all' ? '' : filters.status,
        type: filters.type === 'all' ? '' : filters.type,
        isCtaCte: filters.isCtaCte === 'cta_cte' ? 'true' : (filters.isCtaCte === 'contado' ? 'false' : ''),
        province: filters.province,
      });
      const res = await fetch(`${API_BASE_URL}/proveedores/facturas?${query}`);
      if (res.ok) {
        setInvoices(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [searchTerm, filters]);

  const handleSaveInvoice = async (data: any) => {
    try {
      const isEdit = !!selectedInvoice;
      // Note: This endpoint should be correct or handle provider routing
      const url = isEdit 
        ? `${API_BASE_URL}/proveedores/invoices/${selectedInvoice.id}`
        : `${API_BASE_URL}/proveedores/invoices`;
        
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setIsInvoiceModalOpen(false);
        fetchInvoices();
      }
    } catch (e) { console.error(e); }
  };

  const columns = [
    { 
      key: 'provider', 
      header: 'Proveedor',
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{row.provider?.businessName}</span>
          <span className="text-[10px] text-gray-400 font-medium tracking-tight">CUIT: {row.provider?.taxId}</span>
        </div>
      )
    },
    { 
      key: 'invoiceNumber', 
      header: 'Factura',
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400">{row.invoiceType.replace('_', ' ')}</span>
          <span className="text-sm font-medium">{row.invoiceNumber}</span>
        </div>
      )
    },
    { 
      key: 'issueDate', 
      header: 'Fecha Emisión',
      render: (row: any) => new Date(row.issueDate).toLocaleDateString()
    },
    { 
      key: 'totalAmount', 
      header: 'Total',
      render: (row: any) => (
        <span className="font-black text-gray-900">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.totalAmount)}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (row: any) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
          row.status === 'PAGADA' 
            ? 'bg-emerald-100 text-emerald-600' 
            : 'bg-orange-100 text-orange-600'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'acciones',
      header: '',
      render: (row: any) => (
        <div className="flex gap-1 justify-end">
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedInvoice(row); setIsInvoiceModalOpen(true); }}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary-500 transition-colors"
          >
            <Pencil size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Compras</h1>
          <p className="text-sm text-gray-500">Historial completo y control de facturación.</p>
        </div>
        <div className="flex gap-2">
          <ExportMenu data={invoices} filename="Reporte_Compras" />
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => { setSelectedInvoice(null); setIsInvoiceModalOpen(true); }}>Cargar Factura</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary-500 transition-all"
            placeholder="Buscar por proveedor o número..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary-500"
          value={filters.status}
          onChange={e => setFilters({...filters, status: e.target.value})}
        >
          <option value="all">Todos los Estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="PAGADA">Pagadas</option>
        </select>

        <select 
          className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary-500"
          value={filters.type}
          onChange={e => setFilters({...filters, type: e.target.value})}
        >
          <option value="all">Todos los Tipos</option>
          <option value="FACTURA_A">Factura A</option>
          <option value="FACTURA_B">Factura B</option>
          <option value="NOTA_CREDITO">Nota de Crédito</option>
        </select>
      </div>

      <DataTable data={invoices} columns={columns} isLoading={loading} />

      <InvoiceModal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)} 
        onSave={handleSaveInvoice}
        initialData={selectedInvoice}
        isStandalone={true}
      />
    </div>
  );
};
