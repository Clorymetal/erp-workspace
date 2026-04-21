import { useState } from 'react';
import { Plus, Wrench, Clock, User, Filter, LayoutDashboard, FileText, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../core/components';
import { useWorkshop } from '../hooks/useWorkshop';
import type { RepoOrder } from '../hooks/useWorkshop';
import { OrderModal } from '../components/OrderModal';
import { useClients } from '../hooks/useClients'; 
import { useMechanics } from '../hooks/useMechanics';
import { PrintTag } from '../components/PrintTag';
import { PrintOrderA4 } from '../components/PrintOrderA4';
import { useAuth } from '../../../core/contexts/AuthContext';

const STATUS_COLUMNS = [
  { id: 'INGRESADO', label: 'Ingresado', color: 'bg-blue-500' },
  { id: 'PRESUPUESTO_PENDIENTE', label: 'Presupuesto', color: 'bg-orange-500' },
  { id: 'EN_REPARACION', label: 'En Taller', color: 'bg-purple-500' },
  { id: 'ESPERANDO_REPUESTOS', label: 'Logística', color: 'bg-red-500' },
  { id: 'LISTO', label: 'Listo para Entrega', color: 'bg-emerald-500' }
];

export const WorkshopDashboard = () => {
  const { user } = useAuth();
  const { orders, isLoading, createOrder, updateOrder, deleteOrder, updateStatus } = useWorkshop();
  const { mechanics } = useMechanics();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<RepoOrder | null>(null);
  
  // Lógica de Impresión
  const [printingOrder, setPrintingOrder] = useState<RepoOrder | null>(null);
  const [printFormat, setPrintFormat] = useState<'OR' | 'TAG'>('OR');

  const handlePrint = (order: RepoOrder, format: 'OR' | 'TAG') => {
    setPrintingOrder(order);
    setPrintFormat(format);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleWhatsApp = (order: RepoOrder) => {
    const message = `Hola %2A${order.client.businessName}%2A, te avisamos de %2AClorymetal%2A que tu pieza %2A(${order.pieceSummary || order.problemDescription})%2A de la OR №${order.orderNumber} ya está %2ALISTA%2A para retirar. Saludos!`;
    const phone = order.client.phone ? order.client.phone.replace(/\D/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleSaveOrder = async (data: any) => {
    try {
      if (editingOrder) {
        await updateOrder({ id: editingOrder.id, data });
      } else {
        const newOrder = await createOrder(data);
        // Preguntar si quiere imprimir el rótulo inmediatamente
        if (window.confirm("Orden creada. ¿Desea imprimir el Rótulo ahora?")) {
          handlePrint(newOrder, 'TAG');
        }
      }
      setIsModalOpen(false);
      setEditingOrder(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (orderId: string, orderNumber: number) => {
    if (window.confirm(`¿Está seguro que desea ELIMINAR permanentemente la Orden №${orderNumber}?`)) {
      try {
        await deleteOrder(orderId);
      } catch (e: any) {
        alert("Error al eliminar: " + e.message);
      }
    }
  };

  const handleEdit = (order: RepoOrder) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleMove = async (orderId: string, nextStatus: string) => {
    await updateStatus({ id: orderId, status: nextStatus });
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
      {/* AREA DE IMPRESIÓN (Visible solo para impresora) */}
      <div id="print-area" className="print-only hidden print:block absolute top-0 left-0 w-full">
        {printingOrder && (
          printFormat === 'OR' ? (
            <PrintOrderA4 
              order={printingOrder} 
              mechanics={mechanics} 
              businessConfig={{ name: 'Clorymetal', address: 'Ruta Nac. Nº 11 - Km 1006', phone: '0362 – 5545436' }} 
            />
          ) : (
            <PrintTag order={printingOrder} />
          )
        )}
      </div>

      <div className="flex justify-between items-end print:hidden">
        <div>
          <div className="flex items-center gap-2 text-primary-600 mb-1">
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Workshop Control Center</span>
          </div>
          <h1 className="text-3xl font-black italic">Tablero de Taller</h1>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>Abrir Orden de Reparación</Button>
      </div>

      {/* COLUMNAS KANBAN */}
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 h-[calc(100vh-250px)] print:hidden">
        {STATUS_COLUMNS.map(col => (
          <div key={col.id} className="flex-1 min-w-[280px] bg-gray-50/50 dark:bg-dark-surface/30 rounded-2xl border border-gray-100 dark:border-dark-border p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                <span className="text-xs font-black uppercase tracking-wider text-gray-500">{col.label}</span>
              </div>
              <span className="bg-gray-200 dark:bg-dark-bg text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-500">
                {orders.filter(o => o.status === col.id).length}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar">
              {orders.filter(o => o.status === col.id).map(order => (
                <div key={order.id} className="bg-white dark:bg-dark-surface p-4 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border group hover:border-primary-500/50 transition-all cursor-pointer relative overflow-hidden">
                  {order.priority === 'URGENTE' && <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 -rotate-45 translate-x-6 -translate-y-6 flex items-end justify-center pb-2 text-red-500 font-black text-[8px] uppercase">Urgent</div>}
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-primary-500">OR #{order.orderNumber}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {order.status === 'LISTO' && (
                        <button 
                         onClick={(e) => { e.stopPropagation(); handleWhatsApp(order); }} 
                         className="p-1 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-500 hover:text-white transition-all" 
                         title="Avisar por WhatsApp"
                        >
                          <svg size={14} viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.063 2.875 1.21 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handlePrint(order, 'OR'); }} className="p-1 bg-gray-100 dark:bg-dark-bg rounded text-gray-400 hover:text-primary-500" title="Imprimir OR"><FileText size={14}/></button>
                      <button onClick={(e) => { e.stopPropagation(); handlePrint(order, 'TAG'); }} className="p-1 bg-gray-100 dark:bg-dark-bg rounded text-gray-400 hover:text-primary-500" title="Imprimir Rótulo"><Wrench size={14}/></button>
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(order); }} className="p-1 bg-gray-100 dark:bg-dark-bg rounded text-gray-400 hover:text-blue-500" title="Editar Orden"><Pencil size={14}/></button>
                      {user?.role === 'ADMIN' && (
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(order.id, order.orderNumber); }} className="p-1 bg-gray-100 dark:bg-dark-bg rounded text-gray-400 hover:text-red-500" title="Eliminar Orden"><Trash2 size={14}/></button>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">{order.client.businessName} - {order.patent || 'S/PATENTE'}</h4>
                  <p className="text-[11px] text-gray-500 italic mb-3 line-clamp-2">{order.pieceSummary || order.problemDescription}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {order.tasks.map((t, i) => (
                      <span key={i} className="text-[9px] bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-1.5 py-0.5 rounded-md font-bold">
                        {t.mechanic?.name.toUpperCase() || 'S/A'}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-dark-border">
                    <div className="flex -space-x-2">
                       {order.tasks.map((t, i) => (
                         <div key={i} className="w-6 h-6 rounded-full bg-primary-100 dark:bg-dark-bg border-2 border-white dark:border-dark-surface flex items-center justify-center text-[8px] font-black text-primary-600 uppercase" title={t.mechanic?.name}>
                           {t.mechanic?.name?.charAt(0) || '?'}
                         </div>
                       ))}
                    </div>
                    
                    <select 
                      className="text-[10px] bg-gray-50 dark:bg-dark-bg border-none rounded-lg p-1 outline-none font-bold text-gray-500 focus:ring-1 focus:ring-primary-500"
                      value={order.status}
                      onChange={(e) => { e.stopPropagation(); handleMove(order.id, e.target.value); }}
                    >
                      {STATUS_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <OrderModal 
        isOpen={isModalOpen} 
        order={editingOrder || undefined}
        onClose={() => { setIsModalOpen(false); setEditingOrder(null); }} 
        onSave={handleSaveOrder}
        mechanics={mechanics}
      />
    </div>
  );
};
