import { useState } from 'react';
import { Plus, Search, Truck, DollarSign } from 'lucide-react';
import { Button, DataTable, Modal } from '../../../core/components';
import { useSales } from '../hooks/useSales';
import type { SaleOrder } from '../hooks/useSales';
import { useClients } from '../hooks/useClients';

export const VentasDirectasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { sales, isLoading, createSale, isSubmitting } = useSales({ search: searchTerm });
  const { clients } = useClients();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientList, setShowClientList] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: '',
    remitoNumber: '',
    totalAmount: 0,
    itemsDescription: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const filteredClients = clients.filter(c => c.businessName.toLowerCase().includes(clientSearch.toLowerCase()));
  const selectedClient = clients.find(c => c.id === formData.clientId);

  // LOGÍSTICA: Cálculo de vencimiento sugerido por localidad
  const handleSelectClient = (client: any) => {
    let daysToAdd = 1;
    const cityUpper = client.city?.toUpperCase() || '';
    
    if (cityUpper.includes('SAENZ PEÑA') || cityUpper.includes('SÁENZ PEÑA')) {
      daysToAdd = 3; // Promedio 2-4 días
    } else if (cityUpper.includes('CHARATA') || cityUpper.includes('VILLA ANGELA')) {
      daysToAdd = 4;
    }
    
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    
    setFormData({
      ...formData,
      clientId: client.id,
      dueDate: d.toISOString().split('T')[0]
    });
    setShowClientList(false);
  };

  const handleSave = async () => {
    if (!formData.clientId || formData.totalAmount <= 0) return alert("Complete cliente y monto");
    try {
      await createSale(formData);
      setIsModalOpen(false);
      setFormData({ clientId: '', invoiceNumber: '', remitoNumber: '', totalAmount: 0, itemsDescription: '', dueDate: new Date().toISOString().split('T')[0] });
    } catch (e: any) { alert(e.message); }
  };

  const columns = [
    { 
      key: 'saleDate', 
      header: 'Fecha', 
      render: (row: SaleOrder) => new Date(row.saleDate).toLocaleDateString('es-AR') 
    },
    { 
      key: 'client', 
      header: 'Cliente / Destino',
      render: (row: SaleOrder) => (
        <div className="flex flex-col">
          <span className="font-bold">{row.client.businessName}</span>
          <span className="text-[10px] text-gray-400 uppercase font-black">{row.client.city}</span>
        </div>
      )
    },
    { 
      key: 'document', 
      header: 'Documento',
      render: (row: SaleOrder) => (
        <span className="text-xs font-mono font-bold">
          {row.invoiceNumber ? `FC ${row.invoiceNumber}` : row.remitoNumber ? `RM ${row.remitoNumber}` : 'S/N'}
        </span>
      )
    },
    { 
      key: 'totalAmount', 
      header: 'Monto',
      render: (row: SaleOrder) => (
        <span className="font-black text-gray-800">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.totalAmount)}
        </span>
      ),
      align: 'right' as const
    },
    { 
      key: 'dueDate', 
      header: 'Venc. Logística',
      render: (row: SaleOrder) => {
        const isPast = row.dueDate && new Date(row.dueDate) < new Date() && row.status !== 'COBRADO';
        return (
          <span className={`text-xs font-bold ${isPast ? 'text-red-500 underline' : 'text-gray-500'}`}>
            {row.dueDate ? new Date(row.dueDate).toLocaleDateString('es-AR') : 'Inmediato'}
          </span>
        );
      }
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (row: SaleOrder) => (
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
          row.status === 'COBRADO' ? 'bg-emerald-100 text-emerald-600' : 
          row.status === 'EN_VIAJE' ? 'bg-blue-100 text-blue-600' : 
          'bg-orange-100 text-orange-600'
        }`}>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic flex items-center gap-2 tracking-tight"><Truck /> Ventas Directas y Logística</h1>
          <p className="text-sm text-gray-500">Gestión de envíos, fletes y ventas de mostrador.</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>Nueva Venta Directa</Button>
      </div>

      <div className="flex bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            placeholder="Buscar por cliente, nro de remito o factura..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable data={sales} columns={columns} isLoading={isLoading} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Crear Venta Directa / Envío"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
            {/* Buscador de Cliente */}
            <div className="relative">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Cliente / Destino</label>
                <input 
                    type="text" 
                    placeholder="Buscar cliente..." 
                    value={selectedClient ? selectedClient.businessName : clientSearch}
                    onFocus={() => { setShowClientList(true); if(selectedClient) setFormData({...formData, clientId: ''}); }}
                    onChange={e => setClientSearch(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" 
                />
                {showClientList && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-surface border rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                        {filteredClients.map(c => (
                            <div key={c.id} onClick={() => handleSelectClient(c)} className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0">
                                <p className="text-sm font-bold">{c.businessName}</p>
                                <p className="text-[10px] text-gray-500 uppercase">{c.city}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Factura № (ARCA)</label>
                   <input type="text" value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-mono" placeholder="0004-..." />
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Remito № (Interno)</label>
                   <input type="text" value={formData.remitoNumber} onChange={e => setFormData({...formData, remitoNumber: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-mono" placeholder="0001-..." />
                </div>
            </div>

            <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 flex items-center justify-between">
                <div>
                    <span className="text-[10px] font-black uppercase text-primary-600 block mb-1">Total a Cobrar</span>
                    <div className="flex items-center gap-1">
                        <DollarSign size={20} className="text-primary-500" />
                        <input 
                            type="number" 
                            value={formData.totalAmount} 
                            onChange={e => setFormData({...formData, totalAmount: Number(e.target.value)})} 
                            className="bg-transparent text-2xl font-black text-primary-700 outline-none w-32" 
                        />
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-primary-600 block mb-1">Venc. Sugerido</span>
                    <input 
                        type="date" 
                        value={formData.dueDate} 
                        onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                        className="bg-white dark:bg-dark-bg p-1 text-sm font-bold rounded-lg border-none" 
                    />
                </div>
            </div>

            <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Detalle de Productos / Flete</label>
                <textarea 
                    value={formData.itemsDescription} 
                    onChange={e => setFormData({...formData, itemsDescription: e.target.value})} 
                    className="w-full p-3 bg-gray-50 dark:bg-dark-bg border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm h-24" 
                    placeholder="Ej: 2 Válvulas Relay + Envío a terminal..."
                ></textarea>
            </div>

            <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
                <Button variant="primary" onClick={handleSave} isLoading={isSubmitting} className="flex-1">Confirmar Venta</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
