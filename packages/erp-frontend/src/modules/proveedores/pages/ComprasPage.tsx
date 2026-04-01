import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, FileText, Download, Share2, Plus, Pencil } from 'lucide-react';
import { Button, DataTable, ExportMenu, Modal } from '../../../core/components';
import { InvoiceModal } from '../components/InvoiceModal';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export const ComprasPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'ALL',
    isCtaCte: 'ALL',
    province: 'ALL',
    searchTerm: ''
  });

  const [provincias, setProvincias] = useState<any[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status,
        isCtaCte: filters.isCtaCte === 'cta_cte' ? 'true' : (filters.isCtaCte === 'contado' ? 'false' : ''),
        province: filters.province,
      });
      const res = await fetch(`${API_BASE_URL}/proveedores/facturas?${query}`);
      if (res.ok) {
        setInvoices(await res.json());
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const fetchProvincias = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/parametros?category=PROVINCIA');
      if (res.ok) setProvincias(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchInvoices();
    fetchProvincias();
  }, [filters.startDate, filters.endDate, filters.status, filters.isCtaCte, filters.province]);

  const handleSaveInvoice = async (data: any) => {
    try {
      const url = selectedInvoice 
        ? `http://localhost:4000/api/proveedores/${data.providerId}/facturas/${selectedInvoice.id}`
        : `http://localhost:4000/api/proveedores/${data.providerId}/facturas`;
      
      const res = await fetch(url, {
        method: selectedInvoice ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setIsInvoiceModalOpen(false);
        fetchInvoices();
      }
    } catch (e) { console.error(e); }
  };

  const filteredInvoices = invoices.filter(inv => {
    const s = filters.searchTerm.toLowerCase();
    return (inv.invoiceNumber?.includes(s) || 
            inv.provider?.businessName?.toLowerCase().includes(s) || 
            inv.provider?.taxId?.includes(s));
  });

  const totalFiltered = filteredInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  const columns = [
    { 
      key: 'issueDate', 
      header: 'Fecha', 
      render: (row: any) => new Date(row.issueDate).toLocaleDateString('es-AR') 
    },
    { 
      key: 'provider', 
      header: 'Proveedor', 
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 dark:text-gray-200">{row.provider?.businessName}</span>
          <span className="text-[10px] text-gray-500">{row.provider?.taxId}</span>
        </div>
      ) 
    },
    { 
      key: 'invoiceNumber', 
      header: 'Comprobante',
      render: (row: any) => `${row.invoiceType?.replace('_', ' ')} ${row.pointOfSale}-${row.invoiceNumber}`
    },
    { 
      key: 'totalAmount', 
      header: 'Total', 
      render: (row: any) => (
        <span className="font-bold text-gray-900 dark:text-gray-100 italic">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.totalAmount)}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
          row.status === 'PAGADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'acciones',
      header: '',
      render: (row: any) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setSelectedInvoice(row); setIsInvoiceModalOpen(true); }}
          className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
        >
          <Pencil size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Listado de Compras</h1>
          <p className="text-sm text-gray-500">Consulta global de facturas y comprobantes.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-white dark:bg-dark-surface px-4 py-2 rounded-xl border border-primary-500/20 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Seleccionado</span>
            <span className="text-lg font-black text-primary-600">
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalFiltered)}
            </span>
          </div>
          <ExportMenu 
            data={filteredInvoices.map(i => ({ 
              'Fecha Emisión': new Date(i.issueDate).toLocaleDateString('es-AR'),
              'Fecha Recepción': new Date(i.issueDate).toLocaleDateString('es-AR'),
              'Cpbte': i.invoiceType?.split('_')[0] || '',
              'Tipo': i.invoiceType?.split('_')[1] || '',
              'Suc.': i.pointOfSale,
              'Número': i.invoiceNumber,
              'CUIT': i.provider?.taxId || '',
              'Razón Social o Denominación Cliente': i.provider?.businessName || '',
              'Domicilio': i.provider?.address || '',
              'C.P.': i.provider?.postalCode || '',
              'Pcia': i.provider?.province || '',
              'Cond Fisc': i.provider?.taxCondition || '',
              'Cód. Neto': '1',
              'Neto Gravado': i.netAmount,
              'Alic.': '21%',
              'IVA Liquidado': i.taxAmount,
              'IVA Débito': 0,
              'Cód. NO/EX': '',
              'Conceptos NG/EX': i.nonTaxedAmount,
              'Cód. P/R': '',
              'Perc./Ret.': i.perceptionAmount,
              'Pcia P/R': '',
              'Total': i.totalAmount
            }))} 
            filename="Reporte_Contable_Compras" 
            whatsappText={`Reporte Contable: ${filteredInvoices.length} facturas sumando ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalFiltered)}`}
          />
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => { setSelectedInvoice(null); setIsInvoiceModalOpen(true); }}>
            Nueva Factura
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border filter-section">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-gray-400 mb-1 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Nro Factura, Proveedor..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-bg/50 border rounded-xl text-sm"
                value={filters.searchTerm}
                onChange={e => setFilters({...filters, searchTerm: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">Desde</label>
            <input type="date" className="p-2 border rounded-xl text-sm bg-gray-50" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">Hasta</label>
            <input type="date" className="p-2 border rounded-xl text-sm bg-gray-50" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">Pcia</label>
            <select className="p-2 border rounded-xl text-sm bg-gray-50" value={filters.province} onChange={e => setFilters({...filters, province: e.target.value})}>
              <option value="ALL">Todas</option>
              {provincias.map(p => <option key={p.id} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">Pago</label>
            <select className="p-2 border rounded-xl text-sm bg-gray-50" value={filters.isCtaCte} onChange={e => setFilters({...filters, isCtaCte: e.target.value})}>
              <option value="ALL">Todos</option>
              <option value="cta_cte">Cta Cte</option>
              <option value="contado">Contado</option>
            </select>
          </div>

          <Button variant="ghost" icon={<Download size={16} />} onClick={() => setFilters({ startDate: '', endDate: '', status: 'ALL', isCtaCte: 'ALL', province: 'ALL', searchTerm: '' })}>Limpiar</Button>
        </div>
      </div>

      <DataTable 
        data={filteredInvoices} 
        columns={columns} 
        isLoading={isLoading} 
        onRowClick={(row) => { setSelectedInvoice(row); setIsInvoiceModalOpen(true); }}
      />

      {isInvoiceModalOpen && (
        <InvoiceModal 
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          onSave={handleSaveInvoice}
          initialData={selectedInvoice}
        />
      )}
    </div>
  );
};
