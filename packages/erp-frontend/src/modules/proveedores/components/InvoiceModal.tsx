import { useState, useEffect } from 'react';
import { Modal, Button } from '../../../core/components';
import { useProviders } from '../hooks/useProviders';
import { Search } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  expirationDays?: number;
  showProviderSelector?: boolean;
}

export const InvoiceModal = ({ isOpen, onClose, onSave, initialData, expirationDays = 0, showProviderSelector = false }: InvoiceModalProps) => {
  const { providers } = useProviders();
  const [formData, setFormData] = useState({
    providerId: '',
    invoiceType: 'FACTURA_A',
    pointOfSale: '',
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    totalAmount: '',
    netAmount: '',
    taxAmount: '',
    perceptionAmount: '',
    nonTaxedAmount: '',
    isCtaCte: true,
    status: 'PENDIENTE',
    ivaPeriod: new Date().toISOString().substring(0, 7),
    ivaNumber: ''
  });

  const [providerSearch, setProviderSearch] = useState('');
  const [showProviderList, setShowProviderList] = useState(false);

  // Filtrar proveedores por búsqueda
  const filteredProviders = providers.filter(p => 
    p.razonSocial.toLowerCase().includes(providerSearch.toLowerCase()) || 
    p.cuit.includes(providerSearch)
  );

  const selectedProvider = providers.find(p => p.id === formData.providerId);
  const currentExpirationDays = selectedProvider?.expirationDays ?? expirationDays;

  // Auto-calcular vencimiento y periodo al cambiar fecha de emisión o proveedor
  useEffect(() => {
    if (formData.issueDate && !initialData) {
      const issue = new Date(formData.issueDate + 'T12:00:00');
      
      // Vencimiento
      if (currentExpirationDays > 0) {
        const due = new Date(issue.getTime() + currentExpirationDays * 24 * 60 * 60 * 1000);
        setFormData(prev => ({ ...prev, dueDate: due.toISOString().split('T')[0] }));
      } else {
        setFormData(prev => ({ ...prev, dueDate: formData.issueDate }));
      }

      // Periodo IVA automático
      const period = formData.issueDate.substring(0, 7);
      setFormData(prev => ({ ...prev, ivaPeriod: period }));
    }
  }, [formData.issueDate, currentExpirationDays, initialData]);


  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        providerId: initialData.providerId?.toString() || '',
        issueDate: initialData.issueDate ? new Date(initialData.issueDate).toISOString().split('T')[0] : '',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        totalAmount: initialData.totalAmount.toString(),
        netAmount: initialData.netAmount?.toString() || '',
        taxAmount: initialData.taxAmount?.toString() || '',
        perceptionAmount: initialData.perceptionAmount?.toString() || '',
        nonTaxedAmount: initialData.nonTaxedAmount?.toString() || '',
        ivaPeriod: initialData.ivaPeriod || '',
        ivaNumber: initialData.ivaNumber?.toString() || '',
      });
    }
  }, [initialData, isOpen]);

  // Auto-calcular total
  useEffect(() => {
    const net = parseFloat(formData.netAmount) || 0;
    const tax = parseFloat(formData.taxAmount) || 0;
    const perc = parseFloat(formData.perceptionAmount) || 0;
    const nonTax = parseFloat(formData.nonTaxedAmount) || 0;
    
    // Solo si se están tocando los campos del desglose, recalculamos el total
    // Para evitar sobreescribir un total manual si el usuario prefiere poner el total directo.
    if (net !== 0 || tax !== 0 || perc !== 0 || nonTax !== 0) {
      setFormData(prev => ({ ...prev, totalAmount: (net + tax + perc + nonTax).toFixed(2) }));
    }
  }, [formData.netAmount, formData.taxAmount, formData.perceptionAmount, formData.nonTaxedAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showProviderSelector && !formData.providerId) return alert("Debe seleccionar un proveedor");
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Factura" : "Registrar Nueva Factura"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {showProviderSelector && !initialData && (
          <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30 mb-2 relative">
            <label className="block text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Seleccionar Proveedor</label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por Nombre o CUIT..."
                  value={selectedProvider ? `${selectedProvider.razonSocial} (${selectedProvider.cuit})` : providerSearch}
                  onFocus={() => {
                    setShowProviderList(true);
                    if (selectedProvider) {
                      setFormData(prev => ({ ...prev, providerId: '' }));
                      setProviderSearch('');
                    }
                  }}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  className="w-full p-2 pl-9 bg-white dark:bg-gray-800 border-none rounded-lg text-sm outline-none ring-1 ring-orange-200 dark:ring-orange-800 focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              {showProviderList && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-orange-100 dark:border-orange-900/30 max-h-48 overflow-y-auto">
                  {filteredProviders.length > 0 ? (
                    filteredProviders.map((p: any) => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, providerId: p.id }));
                          setShowProviderList(false);
                          setProviderSearch('');
                        }}
                        className="p-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0"
                      >
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{p.razonSocial}</p>
                        <p className="text-[10px] text-gray-500">CUIT: {p.cuit}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500 text-xs">No se encontraron proveedores</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Tipo de Comprobante</label>
            <select
              id="invoiceType"
              name="invoiceType"
              value={formData.invoiceType}
              onChange={e => setFormData({ ...formData, invoiceType: e.target.value })}
              className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="FACTURA_A">Factura A</option>
              <option value="FACTURA_B">Factura B</option>
              <option value="FACTURA_C">Factura C</option>
              <option value="NOTA_CREDITO">Nota de Crédito</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="w-20">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">P.V.</label>
              <input
                id="pointOfSale"
                name="pointOfSale"
                type="text"
                maxLength={4}
                value={formData.pointOfSale}
                onChange={e => setFormData({ ...formData, pointOfSale: e.target.value })}
                className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="0001"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Factura</label>
              <input
                id="invoiceNumber"
                name="invoiceNumber"
                type="text"
                value={formData.invoiceNumber}
                onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="00001234"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emisión</label>
            <input
              id="issueDate"
              name="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
              className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vencimiento</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/50">
          <p className="text-xs text-primary-600 dark:text-primary-400 font-bold mb-3 uppercase tracking-wider">Desglose Fiscal (Fórmula Excel)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Neto Gravado</label>
              <input
                id="netAmount"
                name="netAmount"
                type="number"
                step="0.01"
                value={formData.netAmount}
                onChange={e => setFormData({ ...formData, netAmount: e.target.value })}
                className="w-full text-sm p-2 bg-white dark:bg-gray-800 border rounded-lg dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">IVA (21%)</label>
              <input
                id="taxAmount"
                name="taxAmount"
                type="number"
                step="0.01"
                value={formData.taxAmount}
                onChange={e => setFormData({ ...formData, taxAmount: e.target.value })}
                className="w-full text-sm p-2 bg-white dark:bg-gray-800 border rounded-lg dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Percepciones</label>
              <input
                id="perceptionAmount"
                name="perceptionAmount"
                type="number"
                step="0.01"
                value={formData.perceptionAmount}
                onChange={e => setFormData({ ...formData, perceptionAmount: e.target.value })}
                className="w-full text-sm p-2 bg-white dark:bg-gray-800 border rounded-lg dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">No Gravado / Otros</label>
              <input
                id="nonTaxedAmount"
                name="nonTaxedAmount"
                type="number"
                step="0.01"
                value={formData.nonTaxedAmount}
                onChange={e => setFormData({ ...formData, nonTaxedAmount: e.target.value })}
                className="w-full text-sm p-2 bg-white dark:bg-gray-800 border rounded-lg dark:border-gray-700 dark:text-gray-100"
              />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-primary-100 dark:border-primary-800/50 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">TOTAL FACTO (Cálculo)</span>
            <div className="text-lg font-black text-primary-600 dark:text-primary-400">
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(parseFloat(formData.totalAmount) || 0)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado:</label>
            <select 
              id="status"
              name="status"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="text-sm p-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg dark:border-gray-700"
            >
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="PAGADA">PAGADA</option>
              <option value="VENCIDA">VENCIDA</option>
            </select>
           </div>
           
           <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 italic">Cta Cte:</label>
            <input 
              id="isCtaCte"
              name="isCtaCte"
              type="checkbox" 
              checked={formData.isCtaCte} 
              onChange={e => setFormData({...formData, isCtaCte: e.target.checked})}
              className="w-4 h-4 rounded text-primary-500"
            />
           </div>
        </div>

        <div className="border-t border-gray-100 dark:border-dark-border pt-4 mt-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Información Libro IVA (Contabilidad)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Período (YYYY-MM)</label>
              <input
                id="ivaPeriod"
                name="ivaPeriod"
                type="month"
                value={formData.ivaPeriod}
                onChange={e => setFormData({ ...formData, ivaPeriod: e.target.value })}
                className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">N° Orden (Rec)</label>
              <input
                id="ivaNumber"
                name="ivaNumber"
                type="number"
                value={formData.ivaNumber}
                onChange={e => setFormData({ ...formData, ivaNumber: e.target.value })}
                className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                placeholder="1, 2, 3..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
          <Button variant="primary" type="submit">
            {initialData ? 'Actualizar Factura' : 'Guardar Factura'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
