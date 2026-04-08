import { useState, useEffect, Fragment } from 'react';
import { Search, FileText, Printer } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grouped' | 'dueDate'>('grouped');

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

  // Agrupar y ordenar facturas por proveedor
  const groupedData = invoices.reduce((acc: any, inv: any) => {
    const providerName = inv.provider?.businessName || 'Desconocido';
    if (!acc[providerName]) acc[providerName] = { invoices: [], total: 0 };
    acc[providerName].invoices.push(inv);
    acc[providerName].total += inv.totalAmount;
    return acc;
  }, {});

  // Ordenar facturas dentro de cada proveedor por fecha de emisión para el subtotal acumulado
  Object.keys(groupedData).forEach(prov => {
    groupedData[prov].invoices.sort((a: any, b: any) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
  });

  const sortedByDueDate = [...invoices].sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return dateA - dateB;
  });

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
          @page { size: A4 portrait; margin: 1cm 0.5cm; }
          .no-print { display: none !important; }
          .print-break-inside-avoid { break-inside: avoid; }
          body { background: white !important; font-family: sans-serif; }
          .main-content { padding: 0 !important; margin: 0 !important; width: 100% !important; border: none !important; shadow: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; font-size: 11.5pt !important; table-layout: fixed; }
          th { background-color: #f8fafc !important; color: #475569 !important; -webkit-print-color-adjust: exact; border: 1px solid #e2e8f0 !important; padding: 8px 4px !important; }
          td { border: 1px solid #f1f5f9 !important; padding: 6px 4px !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .bg-primary-50\\/20 { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; }
          .font-black { font-weight: 800 !important; }
          .text-primary-900 { color: #000 !important; }
          .subtotal-row { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; font-weight: bold !important; border-top: 1.5pt solid #000 !important; }
          
          /* Ajuste de anchos de columna para A4 Portrait sin CUIT repetido */
          .col-prov { width: 30%; }
          .col-tipo { width: 8%; }
          .col-fecha { width: 12%; }
          .col-nro { width: 15%; }
          .col-venc { width: 10%; }
          .col-imp { width: 12%; }
          .col-acum { width: 13%; }
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

        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Modo de Vista</label>
          <div className="flex bg-gray-50 dark:bg-dark-background rounded-xl p-1 gap-1 ring-1 ring-gray-100 dark:ring-dark-border">
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${viewMode === 'grouped' ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200/50'}`}
            >
              Por Proveedor
            </button>
            <button
              onClick={() => setViewMode('dueDate')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${viewMode === 'dueDate' ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200/50'}`}
            >
              Por Vencimiento
            </button>
          </div>
        </div>
      </div>

      {/* Tabla Agrupada */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden main-content">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-dark-background/50 border-b border-gray-100 dark:border-dark-border">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest col-prov">PROVEEDOR</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center col-tipo">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center col-fecha">Fecha Emisión</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center col-nro">Suc. / Número</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center col-venc">Vencimiento</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right col-imp">IMPORTE</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right col-acum">SALDO ACUM.</th>
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">No se encontraron facturas con los filtros seleccionados.</td>
                </tr>
              ) : viewMode === 'grouped' ? (
                providers.map(prov => {
                  let runningTotal = 0;
                  return (
                    <Fragment key={prov}>
                      {/* Header del Proveedor con CUIT */}
                      <tr className="bg-primary-50/20 dark:bg-primary-900/10 print-break-inside-avoid border-t-2 border-primary-100 dark:border-primary-900/30">
                        <td colSpan={7} className="px-6 py-3 border-b border-primary-100/50 dark:border-primary-900/30">
                          <div className="flex justify-between items-center w-full">
                            <span className="font-black text-primary-900 dark:text-primary-100 tracking-tight uppercase">{prov}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-bold text-gray-500 no-print">CUIT: {groupedData[prov].invoices[0]?.provider?.taxId}</span>
                              <span className="hidden print:block text-[10pt] font-bold text-black border border-black px-2 py-0.5">CUIT: {groupedData[prov].invoices[0]?.provider?.taxId}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {/* Detalle de Facturas */}
                      {groupedData[prov].invoices.map((inv: any) => {
                        runningTotal += inv.totalAmount;
                        return (
                          <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-background/30 transition-colors">
                            <td className="px-6 py-2 text-[10px] text-gray-400 font-medium pl-10 border-l border-gray-100">
                               {/* Celda de Proveedor vacía en modo agrupado */}
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
                            <td className="px-6 py-2 text-right bg-gray-50/30 dark:bg-black/10">
                              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                {formatCurrency(runningTotal)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
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
                        <td className="px-6 py-2 bg-gray-100/50 dark:bg-white/5 border-l border-gray-200/50"></td>
                      </tr>
                    </Fragment>
                  );
                })
              ) : (
                /* Vista Ordenada por Vencimiento */
                sortedByDueDate.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-background/30 transition-colors">
                    <td className="px-6 py-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase truncate max-w-[200px]" title={inv.provider?.businessName}>
                          {inv.provider?.businessName}
                        </span>
                        <span className="text-[9px] text-gray-400 font-medium">CUIT: {inv.provider?.taxId}</span>
                      </div>
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
                    <td className="px-6 py-2 text-center">
                      <span className={`text-sm font-bold ${inv.dueDate && new Date(inv.dueDate) < new Date() ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-2 text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(inv.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-2 text-right bg-gray-50/30 dark:bg-black/10">
                      {/* En modo vencimiento no mostramos saldo acumulado porque no tiene sentido por proveedor */}
                      <span className="text-[10px] text-gray-400 italic">N/A</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Footer Total General */}
            {!loading && Object.keys(groupedData).length > 0 && (
              <tfoot>
                <tr className="bg-gray-900 text-white">
                  <td colSpan={5} className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest border-t border-gray-700">
                    Total general
                  </td>
                  <td className="px-6 py-4 text-right border-t border-gray-700">
                    <span className="text-lg font-black tracking-tight">
                      {formatCurrency(globalTotal)}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-t border-gray-700"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
