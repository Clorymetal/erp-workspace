import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, UserCircle, History } from 'lucide-react';
import { Button, DataTable, Modal } from '../../../core/components';
import { useClients } from '../hooks/useClients';
import type { Cliente } from '../hooks/useClients';

export const ClientesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    clients, 
    isLoading, 
    taxConditions, 
    provinces,
    saveClient, 
    deleteClient,
    isSubmitting 
  } = useClients(searchTerm);
  
  const clientsList = clients || [];
  const taxConditionsList = taxConditions || [];
  const provincesList = provinces || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    businessName: '', taxId: '', phone: '', email: '', address: '', city: '', province: 'Chaco', postalCode: '', taxCondition: 'RI', paymentTermsDays: 30
  });

  const handleSave = async () => {
    if (!formData.businessName || !formData.taxId) return alert("Razón Social y CUIT/DNI obligatorios");
    try {
      await saveClient({ client: formData, isEdit: isEditing, id: selectedId || undefined });
      setIsModalOpen(false);
      resetForm();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const resetForm = () => {
    setFormData({ businessName: '', taxId: '', phone: '', email: '', address: '', city: '', province: 'Chaco', postalCode: '', taxCondition: 'RI', paymentTermsDays: 30 });
    setIsEditing(false);
    setSelectedId(null);
  };

  const handleDelete = async (client: Cliente) => {
    if (window.confirm(`¿Seguro que desea eliminar a ${client.businessName}?`)) {
      try {
        await deleteClient(client.id);
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const columns = [
    { 
      key: 'businessName', 
      header: 'Cliente / Razón Social', 
      sortable: true,
      render: (row: Cliente) => (
        <div 
          className="flex items-center gap-3 cursor-pointer hover:text-primary-500 transition-colors group"
          onClick={() => navigate(`/clientes/${row.id}/cta-cte`)}
        >
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-all">
            <UserCircle size={20} />
          </div>
          <span className="font-semibold">{row.businessName}</span>
        </div>
      )
    },
    { key: 'taxId', header: 'CUIT / DNI' },
    { key: 'phone', header: 'Teléfono' },
    { 
      key: 'city', 
      header: 'Localidad / Pcia',
      render: (row: Cliente) => <span className="text-sm">{row.city} ({row.province})</span>
    },
    { 
      key: 'paymentTermsDays', 
      header: 'Plazo Pago',
      render: (row: Cliente) => <span className="badge badge-info">{row.paymentTermsDays} días</span>
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row: Cliente) => (
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/clientes/${row.id}/cta-cte`)}
            className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
            title="Ver Cuenta Corriente"
          >
            <History size={18} />
          </button>
          <button onClick={() => {
            setIsEditing(true);
            setSelectedId(row.id);
            setFormData({ ...row });
            setIsModalOpen(true);
          }} className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors" title="Editar"><Pencil size={18} /></button>
          <button onClick={() => handleDelete(row)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar"><Trash2 size={18} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold italic">Maestro de Clientes</h1>
          <p className="text-sm text-gray-500">Administración de clientes para taller y ventas directas.</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => { resetForm(); setIsModalOpen(true); }}>Nuevo Cliente</Button>
      </div>

      <div className="flex bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
            placeholder="Buscar por nombre, CUIT o teléfono..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable data={clientsList} columns={columns} isLoading={isLoading} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Cliente" : "Nuevo Cliente"}
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSubmitting}>Guardar Cliente</Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Razón Social / Nombre</label>
            <input type="text" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Domicilio</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" placeholder="Calle, número, depto..." />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">CUIT / DNI</label>
            <input type="text" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Teléfono</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Ciudad / Localidad</label>
            <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Código Postal</label>
            <input type="text" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Provincia</label>
            <select value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500">
              {provincesList?.map((p: any) => <option key={p.id} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Condición Fiscal</label>
            <select value={formData.taxCondition} onChange={e => setFormData({...formData, taxCondition: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500">
              {taxConditionsList?.map((c: any) => <option key={c.id} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Plazo de Pago (Días Corridos)</label>
            <input type="number" value={formData.paymentTermsDays} onChange={e => setFormData({...formData, paymentTermsDays: Number(e.target.value)})} className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </Modal>
    </div>
  );
};
