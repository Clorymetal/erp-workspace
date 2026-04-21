import { useState, useEffect } from 'react';
import { Modal, Button } from '../../../core/components';
import { Search, Plus, Trash2, Wrench, User, AlertCircle } from 'lucide-react';
import { useClients } from '../hooks/useClients';

interface OrderModalProps {
  isOpen: boolean;
  order?: any; // Para edición
  onClose: () => void;
  onSave: (data: any) => void;
  mechanics: any[]; 
}

const PRECIOS_ESTANDAR = {
  RECTIFICACION: { LIVIANO: 20000, MEDIANO: 30000, PESADO: 40000 },
  ENCINTADO: { LIVIANO: 5000, MEDIANO: 6000, PESADO: 7500, ESPECIAL: 8500 }
};

export const OrderModal = ({ isOpen, order, onClose, onSave, mechanics }: OrderModalProps) => {
  const { clients } = useClients();
  const [clientSearch, setClientSearch] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    patent: '',
    vehicleBrand: '',
    pieceSummary: '',
    problemDescription: '',
    priority: 'NORMAL',
    dueDate: '',
    tasks: [] as any[]
  });

  useEffect(() => {
    if (order && isOpen) {
      setFormData({
        clientId: order.client.id || order.clientId,
        patent: order.patent || '',
        vehicleBrand: order.vehicleBrand || '',
        pieceSummary: order.pieceSummary || '',
        problemDescription: order.problemDescription || '',
        priority: order.priority || 'NORMAL',
        dueDate: order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '',
        tasks: order.tasks.map((t: any) => ({ ...t, mechanicId: t.mechanicId?.toString() || '' }))
      });
      setClientSearch(order.client.businessName);
    } else if (isOpen) {
      // Reset si es nueva
      setFormData({
        clientId: '',
        patent: '',
        vehicleBrand: '',
        pieceSummary: '',
        problemDescription: '',
        priority: 'NORMAL',
        dueDate: '',
        tasks: []
      });
      setClientSearch('');
    }
  }, [order, isOpen]);

  const filteredClients = clients.filter(c => 
    c.businessName.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.taxId.includes(clientSearch)
  );

  const selectedClient = clients.find(c => c.id === formData.clientId);

  const handleAddTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { pieceName: '', serviceName: 'Reparación', mechanicId: '', laborPrice: 0, partsCost: 0 }]
    }));
  };

  const handleRemoveTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const updateTask = (index: number, field: string, value: any) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    
    // Lógica de precios sugeridos
    if (field === 'serviceName' || field === 'tipoVehiculo') {
      const task = newTasks[index];
      if (task.serviceName === 'Rectificación' && task.tipoVehiculo) {
        task.laborPrice = PRECIOS_ESTANDAR.RECTIFICACION[task.tipoVehiculo as keyof typeof PRECIOS_ESTANDAR.RECTIFICACION] || 0;
      } else if (task.serviceName === 'Encintado' && task.tipoVehiculo) {
        task.laborPrice = PRECIOS_ESTANDAR.ENCINTADO[task.tipoVehiculo as keyof typeof PRECIOS_ESTANDAR.ENCINTADO] || 0;
      }
    }
    
    setFormData({ ...formData, tasks: newTasks });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return alert("Debe seleccionar un cliente");
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={order ? `Editar Orden №${order.orderNumber}` : "Nueva Orden de Reparación"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN CLIENTE */}
        <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-2xl border border-primary-100 dark:border-primary-800/30">
          <label className="text-[10px] font-black uppercase text-primary-600 mb-2 block tracking-widest">Información del Cliente</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
            <input
              type="text"
              placeholder="Buscar Cliente por nombre o CUIT..."
              value={selectedClient ? `${selectedClient.businessName} (${selectedClient.taxId})` : clientSearch}
              onFocus={() => { setShowClientList(true); if (selectedClient) setFormData({...formData, clientId: ''}); }}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full p-2.5 pl-10 bg-white dark:bg-dark-surface border-none rounded-xl text-sm outline-none ring-1 ring-primary-200 focus:ring-2 focus:ring-primary-500 shadow-sm"
            />
            {showClientList && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-primary-100 max-h-48 overflow-y-auto">
                {filteredClients.map(c => (
                  <div key={c.id} onClick={() => { setFormData({...formData, clientId: c.id}); setShowClientList(false); }} className="p-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer border-b last:border-0">
                    <p className="text-sm font-bold">{c.businessName}</p>
                    <p className="text-[10px] text-gray-500">CUIT: {c.taxId}</p>
                  </div>
                ))}
                {filteredClients.length === 0 && <div className="p-4 text-center text-xs text-gray-500">No se encontraron clientes.</div>}
              </div>
            )}
          </div>
        </div>

        {/* DATOS DEL TRABAJO */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Patente / Dominio</label>
            <input type="text" value={formData.patent} onChange={e => setFormData({...formData, patent: e.target.value.toUpperCase()})} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg uppercase font-mono" placeholder="AA 123 BB" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-bold text-gray-500 mb-1 block">Marca / Modelo / Motor</label>
            <input type="text" value={formData.vehicleBrand} onChange={e => setFormData({...formData, vehicleBrand: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg" placeholder="Iveco Daily / Ford F-100" />
          </div>
          <div className="col-span-3">
            <label className="text-xs font-bold text-gray-500 mb-1 block">Descripción de la Pieza (O Resumen)</label>
            <input type="text" value={formData.pieceSummary} onChange={e => setFormData({...formData, pieceSummary: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg" placeholder="Ej: Válvula de freno / Rectificación de Campanas" />
          </div>
        </div>

        {/* TAREAS Y MECÁNICOS */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-black uppercase text-gray-400 flex items-center gap-2 tracking-widest"><Wrench size={16}/> Tareas y Especialistas</h3>
            <Button type="button" variant="ghost" size="sm" icon={<Plus size={14}/>} onClick={handleAddTask}>Añadir Tarea</Button>
          </div>
          
          <div className="space-y-3">
            {formData.tasks.map((task, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-100 dark:border-dark-border relative group animate-in slide-in-from-right-4">
                <button type="button" onClick={() => handleRemoveTask(index)} className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-400">Pieza / Trabajo</label>
                    <input type="text" value={task.pieceName} onChange={e => updateTask(index, 'pieceName', e.target.value)} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border rounded-lg" placeholder="Ej: Pulmón 30/30" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400">Servicio</label>
                    <select value={task.serviceName} onChange={e => updateTask(index, 'serviceName', e.target.value)} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border rounded-lg">
                      <option value="Reparación">Reparación</option>
                      <option value="Rectificación">Rectificación</option>
                      <option value="Encintado">Encintado</option>
                      <option value="Revisión">Revisión</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400">Mecánico</label>
                    <select value={task.mechanicId} onChange={e => updateTask(index, 'mechanicId', e.target.value)} className="w-full p-1.5 text-sm bg-white dark:bg-gray-800 border rounded-lg">
                      <option value="">Asignar...</option>
                      {mechanics.filter(m => m.isActive).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  
                  {/* Selector de porte para precios sugeridos */}
                  {(task.serviceName === 'Rectificación' || task.serviceName === 'Encintado') && (
                    <div className="col-span-4 mt-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 flex items-center justify-between">
                      <div className="flex gap-2">
                        {['LIVIANO', 'MEDIANO', 'PESADO', ...(task.serviceName === 'Encintado' ? ['ESPECIAL'] : [])].map(porte => (
                          <button key={porte} type="button" onClick={() => updateTask(index, 'tipoVehiculo', porte)} className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${task.tipoVehiculo === porte ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-blue-500 border border-blue-200'}`}>{porte}</button>
                        ))}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-blue-400 block font-bold">Precio Sugerido</span>
                        <span className="text-sm font-black text-blue-600">${task.laborPrice}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {formData.tasks.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                <AlertCircle className="mx-auto mb-2 opacity-20" size={32}/>
                <p className="text-xs">No hay tareas detalladas. Agregue una para asignar mecánicos.</p>
              </div>
            )}
          </div>
        </div>

        {/* TEXTO LEGAL (FOOTER DEL MODAL) */}
        <div className="p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl text-[9px] text-gray-400 text-justify leading-tight italic">
          Autorizo a CLORYMETAL a realizar los trabajos detallados. Me responsabilizo por el retiro de la pieza/vehículo en el plazo estipulado. Los presupuestos tienen una validez de 5 días. Firma del cliente al dorso o digital.
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit">{order ? 'Guardar Cambios' : 'Generar OR e Imprimir Rótulo'}</Button>
        </div>
      </form>
    </Modal>
  );
};
