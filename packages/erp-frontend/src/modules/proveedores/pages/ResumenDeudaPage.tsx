import { useState, useEffect, Fragment } from 'react';
import { Search, FileText, Download, Calendar, Printer } from 'lucide-react';
import { API_BASE_URL } from '../../../core/config/apiConfig';
import { ExportMenu } from '../../../core/components';

export const ResumenDeudaPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [filters, setFilters] = useState({
    ivaPeriod: currentPeriod,
    status: 'PENDIENTE',
    isCtaCte: 'all'
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search: searchTerm,
        ivaPeriod: filters.ivaPeriod === 'ALL' ? '' : filters.ivaPeriod,
        status: filters.status === 'ALL' ? '' : filters.status,
        isCtaCte: filters.isCtaCte === 'all' ? '' : (filters.isCtaCte === 'true' ? 'true' : 'false'),
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
  }, [filters, searchTerm]);

  // Agrupar facturas por proveedor
  const groupedData = invoices.reduce((acc: any, inv: any) => {
    const providerName = inv.provider?.businessName || 'Desconocido';
    if (!acc[providerName]) acc[providerName] = { invoices: [], total: 0 };
    acc[providerName].invoices.push(inv);
    acc[providerName].total += inv.totalAmount;
    return acc;
  }, {});

  const providers = Object.keys(groupedData).sort();
  const globalTotal = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const exportColumns = [
    { key: 'providerName', header: 'Proveedor' },
    { key: 'issueDate', header: 'Fecha Emisión' },
    { key: 'pointOfSale', header: 'Suc.' },
    { key: 'invoiceNumber', header: 'Número' },
    { key: 'dueDate', header: 'Vencimiento' },
    { key: 'totalAmount', header: 'IMPORTE' },
  ];

  const exportData = invoices.map(inv => ({
    ...inv,
    providerName: inv.provider?.businessName,
    issueDate: new Date(inv.issueDate).toLocaleDateString(),
    dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'
  }));

  return (
    <div className="w-full flex flex-col gap-6 p-4">
      <style>{`
        @media print {
          @page { size: landscape; margin: 1cm; }
          .no-print { display: none !important; }
          .print-break-inside-avoid { break-inside: avoid; }
          body { background: white !important; }
          .main-content { padding: 0 !important; margin: 0 !important; width: 100% !important; }
          table { width: 100% !important; border-collapse: collapse !important; font-size: 10pt !important; }
          th { background-color: #f1f5f9 !important; color: #475569 !important; -webkit-print-color-adjust: exact; border: 1px solid #e2e8f0 !important; }
          td { border: 1px solid #f1f5f9 !important; }
          .bg-primary-50\\/20 { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
          .font-black { font-weight: 900 !important; }
          .text-primary-900 { color: #1e3a8a !important; -webkit-print-color-adjust: exact; }
          .subtotal-row { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; font-weight: bold !important; }
        }
      `}</style>

      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-primary-500" />
            Reporte de Cuentas Corrientes
          </h1>
          <p className="text-sm text-gray-500">Saldo detallado por proveedor y comprobante.</p>
        </div>
        <div className="flex gap-2">
          <ExportMenu 
            data={exportData}
            columnsToExport={exportColumns}
            filename={`Resumen_Deuda_${filters.ivaPeriod}`}
          />
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-200"
          >
            <Printer size={18} />
            Imprimir PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border no-print">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Período</label>
          <input
            type="month"
            value={filters.ivaPeriod}
            onChange={(e) => setFilters({ ...filters, ivaPeriod: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-background border-none rounded-xl text-sm outline-none ring-1 ring-gray-100 dark:ring-dark-border focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Estado de Pago</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-background border-none rounded-xl text-sm outline-none ring-1 ring-gray-100 dark:ring-dark-border focus:ring-2 focus:ring-primary-500 transition-all font-medium"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PENDIENTE">Sólo Pendientes</option>
            <option value="PAGADA">Sólo Pagadas</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Cta. Cte.</label>
          <select
            value={filters.isCtaCte}
            onChange={(e) => setFilters({ ...filters, isCtaCte: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-background border-none rounded-xl text-sm outline-none ring-1 ring-gray-100 dark:ring-dark-border focus:ring-2 focus:ring-primary-500 transition-all font-medium"
          >
            <option value="all">Todas</option>
            <option value="true">Sólo Cta. Cte.</option>
            <option value="false">Sólo Contado</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Búsqueda</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="w-full bg-gray-50 dark:bg-dark-background border-none rounded-xl py-2 pl-9 text-sm outline-none ring-1 ring-gray-100 dark:ring-dark-border focus:ring-2 focus:ring-primary-500 transition-all"
              placeholder="Filtro rápido..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla Agrupada */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden main-content">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-dark-background/50 border-b border-gray-100 dark:border-dark-border">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">PROVEEDOR</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Fecha Emisión</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Suc. / Número</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Vencimiento</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">IMPORTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                    Cargando información...
                  </td>
                </tr>
              ) : Object.keys(groupedData).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">No se encontraron facturas con los filtros seleccionados.</td>
                </tr>
              ) : providers.map(prov => (
                <Fragment key={prov}>
                  {/* Header del Proveedor */}
                  <tr className="bg-primary-50/20 dark:bg-primary-900/10">
                    <td colSpan={6} className="px-6 py-3 border-b border-primary-100/50 dark:border-primary-900/30">
                      <span className="font-black text-primary-900 dark:text-primary-100 tracking-tight uppercase">{prov}</span>
                    </td>
                  </tr>
                  {/* Detalle de Facturas */}
                  {groupedData[prov].invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-background/30 transition-colors">
                      <td className="px-6 py-2 text-[10px] text-gray-400 font-medium pl-10">
                         {inv.provider?.taxId}
                      </td>
                      <td className="px-6 py-2 text-center">
                        <span className="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-dark-background px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          {inv.invoiceType.replace('FACTURA_', '')}
                        </span>
                      </td>
                      <td className="px-6 py-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-2 text-center text-sm font-mono text-gray-500">
                        {inv.pointOfSale}-{inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-2 text-center text-sm text-gray-500">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-2 text-right">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(inv.totalAmount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Subtotal del Proveedor */}
                  <tr className="subtotal-row border-b-2 border-gray-100">
                    <td colSpan={5} className="px-6 py-2 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest pr-4">
                      Total {prov}
                    </td>
                    <td className="px-6 py-2 text-right">
                      <span className="text-sm font-black text-gray-900 dark:text-gray-100">
                        {formatCurrency(groupedData[prov].total)}
                      </span>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
            {/* Footer Total General */}
            {!loading && Object.keys(groupedData).length > 0 && (
              <tfoot>
                <tr className="bg-gray-900 text-white">
                  <td colSpan={5} className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest">
                    Total general
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-black tracking-tight">
                      {formatCurrency(globalTotal)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
