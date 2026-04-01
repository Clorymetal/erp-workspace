import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Pencil, Trash2 } from 'lucide-react';
import { Button, DataTable, Modal, ExportMenu } from '../../../core/components';
import { AnimatePresence } from 'framer-motion';
import { ProviderDetails } from '../components/ProviderDetails';
import { InvoiceModal } from '../components/InvoiceModal';

interface Proveedor {
  id: string;
  razonSocial: string;
  cuit: string;
  email: string;
  telefono: string;
  provincia: string;
  cp: string;
  condFisc: string;
  saldo: number;
  isCtaCte: boolean;
  estado: 'Activo' | 'Inactivo';
}

export const ProveedoresPage = () => {
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterBalanceStatus, setFilterBalanceStatus] = useState('all');
  const [filterIsCtaCte, setFilterIsCtaCte] = useState('all'); // 'all', 'cta_cte', 'contado'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingProvider, setIsEditingProvider] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ 
    razonSocial: '', cuit: '', telefono: '', email: '', provincia: '', cp: '', condFisc: '', isCtaCte: true 
  });

  const [selectedProvider, setSelectedProvider] = useState<Proveedor | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [refreshInvoices, setRefreshInvoices] = useState(0);
  
  const [provincias, setProvincias] = useState<any[]>([]);
  const [condicionesFiscales, setCondicionesFiscales] = useState<any[]>([]);

  const fetchParameters = async () => {
    try {
      const [rp, rc] = await Promise.all([
        fetch('http://localhost:4000/api/parametros?category=PROVINCIA'),
        fetch('http://localhost:4000/api/parametros?category=COND_FISCAL')
      ]);
      if (rp.ok) setProvincias(await rp.json());
      if (rc.ok) setCondicionesFiscales(await rc.json());
    } catch (e) { console.error(e); }
  };

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/proveedores');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.map((p: any) => ({
          id: String(p.id),
          razonSocial: p.businessName,
          cuit: p.taxId,
          email: p.contacts?.[0]?.email || '',
          telefono: p.contacts?.[0]?.phone || '',
          provincia: p.province || '',
          cp: p.postalCode || '',
          condFisc: p.taxCondition || '',
          isCtaCte: !!p.isCtaCte,
          saldo: p.balance || 0,
          estado: 'Activo'
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchParameters();
  }, []);

  const handleSave = async () => {
    if (!formData.razonSocial || !formData.cuit) return alert("Razón Social y CUIT obligatorios");
    setIsSubmitting(true);
    try {
      const url = isEditingProvider ? `http://localhost:4000/api/proveedores/${editingProviderId}` : 'http://localhost:4000/api/proveedores';
      const res = await fetch(url, {
        method: isEditingProvider ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchProviders();
        setIsModalOpen(false);
        setFormData({ razonSocial: '', cuit: '', telefono: '', email: '', provincia: '', cp: '', condFisc: '', isCtaCte: true });
      }
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const handleSaveInvoice = async (invoiceData: any) => {
    if (!selectedProvider) return;
    try {
      const isEdit = !!selectedInvoice;
      const url = isEdit 
        ? `http://localhost:4000/api/proveedores/${selectedProvider.id}/facturas/${selectedInvoice.id}`
        : `http://localhost:4000/api/proveedores/${selectedProvider.id}/facturas`;
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      if (res.ok) {
        setIsInvoiceModalOpen(false);
        setRefreshInvoices(p => p + 1);
        fetchProviders();
      }
    } catch (e) { console.error(e); }
  };

  const handleStatusChange = async (invoiceId: string, status: string) => {
    if (!selectedProvider) return;
    try {
      await fetch(`http://localhost:4000/api/proveedores/${selectedProvider.id}/facturas/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setRefreshInvoices(p => p + 1);
      fetchProviders();
    } catch (e) { console.error(e); }
  };

  const columns = [
    { key: 'razonSocial', header: 'Razón Social', sortable: true },
    { key: 'cuit', header: 'CUIT', sortable: true },
    { key: 'provincia', header: 'Provincia' },
    { 
      key: 'saldo', 
      header: 'Saldo (Cta Cte)', 
      render: (row: Proveedor) => (
        <span className={`font-semibold ${row.saldo > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(row.saldo)}
        </span>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row: Proveedor) => (
        <div className="flex gap-2">
          <button onClick={(e) => {
            e.stopPropagation();
            setIsEditingProvider(true);
            setEditingProviderId(row.id);
            setFormData({ ...row });
            setIsModalOpen(true);
          }} className="p-1.5 text-gray-400 hover:text-primary-500"><Pencil size={18} /></button>
          <button className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
        </div>
      )
    }
  ];

  const filteredData = providers.filter(p => {
    const s = searchTerm.toLowerCase();
    const mSearch = p.razonSocial.toLowerCase().includes(s) || p.cuit.includes(s);
    const mProv = !filterProvince || p.provincia === filterProvince;
    const mCta = filterIsCtaCte === 'all' ? true : (filterIsCtaCte === 'cta_cte' ? p.isCtaCte : !p.isCtaCte);
    const mBal = filterBalanceStatus === 'all' ? true : (filterBalanceStatus === 'with_debt' ? p.saldo > 0 : p.saldo <= 0);
    return mSearch && mProv && mCta && mBal;
  });

  const totalBalance = filteredData.reduce((acc, p) => acc + p.saldo, 0);

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="text-sm text-gray-500">Central de compras y cuentas corrientes.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-white dark:bg-dark-surface px-6 py-2 rounded-2xl border border-primary-500/20 shadow-sm flex flex-col justify-center animate-in zoom-in-95 duration-700">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Saldo Total Acumulado</span>
            <span className={`text-xl font-black ${totalBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalBalance)}
            </span>
          </div>
          <ExportMenu 
            data={filteredData.map(p => ({
              Razon_Social: p.razonSocial,
              CUIT: p.cuit,
              Provincia: p.provincia,
              Saldo_Cta_Cte: p.saldo,
              Telefono: p.telefono,
              Email: p.email,
              Cod_Postal: p.cp,
              Cond_Fiscal: p.condFisc,
              Cuenta_Corriente: p.isCtaCte ? 'SI' : 'NO'
            }))} 
            filename="Maestro_Proveedores" 
            whatsappText={`Reporte de Deuda: El saldo total acumulado es ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalBalance)}`}
          />
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => {
            setIsEditingProvider(false);
            setFormData({ razonSocial: '', cuit: '', telefono: '', email: '', provincia: '', cp: '', condFisc: '', isCtaCte: true });
            setIsModalOpen(true);
          }}>Nuevo Proveedor</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select 
            className="px-4 py-2 bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
            value={filterProvince} onChange={e => setFilterProvince(e.target.value)}
          >
            <option value="">Provincias</option>
            {provincias.map(p => <option key={p.id} value={p.value}>{p.label}</option>)}
          </select>
          <select 
            className="px-4 py-2 bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
            value={filterIsCtaCte} onChange={e => setFilterIsCtaCte(e.target.value)}
          >
            <option value="all">Ver Todos (Cta / Contado)</option>
            <option value="cta_cte">Solo Cuenta Corriente</option>
            <option value="contado">Solo de Contado</option>
          </select>

          <select 
            className="px-4 py-2 bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
            value={filterBalanceStatus} onChange={e => setFilterBalanceStatus(e.target.value)}
          >
            <option value="all">Saldos</option>
            <option value="with_debt">Con Deuda</option>
            <option value="no_debt">Sin Deuda</option>
          </select>
        </div>
      </div>

      <DataTable data={filteredData} columns={columns} isLoading={isLoading} onRowClick={setSelectedProvider} />

      <AnimatePresence>
        {selectedProvider && (
          <ProviderDetails 
            provider={selectedProvider} onClose={() => setSelectedProvider(null)}
            onAddInvoice={() => { setSelectedInvoice(null); setIsInvoiceModalOpen(true); }}
            onEditInvoice={(i) => { setSelectedInvoice(i); setIsInvoiceModalOpen(true); }}
            onStatusChange={handleStatusChange} refreshTrigger={refreshInvoices}
          />
        )}
      </AnimatePresence>

      <InvoiceModal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)}
        onSave={handleSaveInvoice} initialData={selectedInvoice}
      />

      <Modal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={isEditingProvider ? "Editar Proveedor" : "Nuevo Proveedor"}
        footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button variant="primary" onClick={handleSave} isLoading={isSubmitting}>Guardar</Button></>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-bold">Razón Social</label>
              <input type="text" value={formData.razonSocial} onChange={e => setFormData({...formData, razonSocial: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-bold">CUIT</label>
              <input type="text" value={formData.cuit} onChange={e => setFormData({...formData, cuit: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-bold">Teléfono</label>
              <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-bold">Provincia</label>
              <select value={formData.provincia} onChange={e => setFormData({...formData, provincia: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg">
                <option value="">Seleccionar</option>
                {provincias.map(p => <option key={p.id} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold">Cond. Fiscal</label>
              <select value={formData.condFisc} onChange={e => setFormData({...formData, condFisc: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg">
                <option value="">Seleccionar</option>
                {condicionesFiscales.map(c => <option key={c.id} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="col-span-2 mt-2 p-3 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/30">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.isCtaCte} 
                  onChange={e => setFormData({...formData, isCtaCte: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-primary-100 select-none">
                  El proveedor posee Cuenta Corriente (Permite saldos deudores)
                </span>
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
