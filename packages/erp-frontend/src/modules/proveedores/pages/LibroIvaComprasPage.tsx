import { useState, useEffect } from 'react';
import { Search, Download, Filter, Save, Calendar } from 'lucide-react';
import { Button, DataTable, ExportMenu } from '../../../core/components';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export const LibroIvaComprasPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Default to current month
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [period, setPeriod] = useState(currentPeriod);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search: searchTerm,
        ivaPeriod: period,
      });
      const res = await fetch(`${API_BASE_URL}/proveedores/facturas?${query}`);
      if (res.ok) {
        const data = await res.json();
        // Sort by ivaNumber if available, else by issueDate
        const sortedData = data.sort((a: any, b: any) => {
          if (a.ivaNumber && b.ivaNumber) return a.ivaNumber - b.ivaNumber;
          if (a.ivaNumber) return -1;
          if (b.ivaNumber) return 1;
          return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        });
        setInvoices(sortedData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [period, searchTerm]);

  const handleUpdateIvaNumber = async (id: string, newNumber: number | null) => {
    try {
      const res = await fetch(`${API_BASE_URL}/proveedores/facturas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ivaNumber: newNumber })
      });
      if (res.ok) {
        // Optimistic update or refetch
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ivaNumber: newNumber } : inv));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { 
      key: 'ivaNumber', 
      header: 'Rec',
      render: (row: any) => (
        <input 
          type="number" 
          defaultValue={row.ivaNumber || ''} 
          onBlur={(e) => {
            const val = e.target.value === '' ? null : Number(e.target.value);
            if (val !== row.ivaNumber) handleUpdateIvaNumber(row.id, val);
          }}
          className="w-16 px-2 py-1 bg-gray-50 border border-transparent focus:border-primary-500 rounded text-center font-bold text-gray-700"
          placeholder="-"
        />
      )
    },
    { 
      key: 'issueDate', 
      header: 'Fecha',
      render: (row: any) => new Date(row.issueDate).toLocaleDateString()
    },
    { 
      key: 'invoiceType', 
      header: 'Tipo',
      render: (row: any) => (
        <span className="text-[10px] font-black text-gray-400">
           {row.invoiceType.replace('FACTURA_', '')}
        </span>
      )
    },
    { 
      key: 'invoiceNumber', 
      header: 'P.V. / Nro',
      render: (row: any) => `${row.pointOfSale}-${row.invoiceNumber}`
    },
    { 
      key: 'provider', 
      header: 'Proveedor',
      render: (row: any) => (
        <div className="flex flex-col max-w-[200px]">
          <span className="font-semibold text-gray-900 truncate">{row.provider?.businessName}</span>
          <span className="text-[10px] text-gray-400">CUIT: {row.provider?.taxId}</span>
        </div>
      )
    },
    { 
      key: 'netAmount', 
      header: 'Neto Grab.',
      render: (row: any) => (
         <span className="font-medium text-gray-600">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.netAmount)}
         </span>
      )
    },
    { 
      key: 'taxAmount', 
      header: 'IVA',
      render: (row: any) => (
        <span className="font-medium text-gray-600">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.taxAmount)}
        </span>
      )
    },
    { 
      key: 'perceptionAmount', 
      header: 'Percep.',
      render: (row: any) => (
        <span className="font-medium text-gray-600">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.perceptionAmount)}
        </span>
      )
    },
    { 
      key: 'nonTaxedAmount', 
      header: 'No Grab.',
      render: (row: any) => (
        <span className="font-medium text-gray-600">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.nonTaxedAmount)}
        </span>
      )
    },
    { 
      key: 'totalAmount', 
      header: 'Total',
      render: (row: any) => (
        <span className="font-black text-gray-900">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.totalAmount)}
        </span>
      )
    }
  ];

  const columnsToExport = [
    { key: 'ivaNumber', header: 'Rec' },
    { key: 'issueDate', header: 'Fecha' },
    { key: 'invoiceType', header: 'Tipo Comprobante' },
    { key: 'pointOfSale', header: 'Punto Venta' },
    { key: 'invoiceNumber', header: 'Nro Comprobante' },
    { key: 'taxId', header: 'CUIT' },
    { key: 'businessName', header: 'Proveedor' },
    { key: 'taxCondition', header: 'Condición Fiscal' },
    { key: 'netAmount', header: 'Neto Gravado' },
    { key: 'taxAmount', header: 'IVA' },
    { key: 'perceptionAmount', header: 'Percepciones' },
    { key: 'nonTaxedAmount', header: 'No Gravado' },
    { key: 'totalAmount', header: 'Total' },
  ];

  const exportData = invoices.map(inv => ({
    ...inv,
    taxId: inv.provider?.taxId,
    businessName: inv.provider?.businessName,
    taxCondition: inv.provider?.taxCondition,
    issueDate: new Date(inv.issueDate).toLocaleDateString()
  }));

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-primary-500" />
            Libro IVA Compras - Auditoría
          </h1>
          <p className="text-sm text-gray-500">Módulo de consulta impositiva y ordenamiento de registros.</p>
        </div>
        <div className="flex gap-2">
           <ExportMenu 
            data={exportData} 
            filename={`Libro_IVA_Compras_${period}`} 
            columnsToExport={columnsToExport}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
        {/* Period Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Período Fiscal</label>
          <input 
            type="month" 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-background border-none rounded-xl text-sm outline-none ring-1 ring-gray-100 dark:ring-dark-border focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>

        {/* Search */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Búsqueda rápida</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full bg-gray-50 dark:bg-dark-background border-none rounded-xl py-2 pl-10 text-sm outline-none ring-1 ring-gray-100 dark:ring-dark-border focus:ring-2 focus:ring-primary-500 transition-all"
              placeholder="Buscar por proveedor, CUIT o factura..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-end pb-1">
            <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-bold w-full text-center">
              {invoices.length} Registros en {period}
            </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <DataTable data={invoices} columns={columns} />
      )}
      
      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300 flex gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg h-fit text-blue-600 dark:text-blue-400">
          <Filter size={20} />
        </div>
        <div>
          <p className="font-bold">Sugerencia de Ordenamiento</p>
          <p className="text-xs opacity-80">Podés asignar números de orden (Rec) en la primera columna para que el reporte impreso coincida con tus archivos físicos. Los cambios se guardan automáticamente al salir del campo (blur).</p>
        </div>
      </div>
    </div>
  );
};
