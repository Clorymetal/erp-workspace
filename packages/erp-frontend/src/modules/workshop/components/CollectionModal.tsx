import { useState } from 'react';
import { Modal, Button } from '../../../core/components';
import { DollarSign, CreditCard, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  onSave: (data: any) => void;
}

const PAYMENT_METHODS = [
  { id: 'EFECTIVO', label: 'Efectivo', icon: '💵' },
  { id: 'TRANSFERENCIA', label: 'Transferencia', icon: '🏦' },
  { id: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito', icon: '💳' },
  { id: 'TARJETA_DEBITO', label: 'Tarjeta de Débito', icon: '🏦' },
  { id: 'CHEQUE', label: 'Cheque de Terceros', icon: '✍️' }
];

export const CollectionModal = ({ isOpen, onClose, clientId, clientName, onSave }: CollectionModalProps) => {
  const [formData, setFormData] = useState({
    clientId,
    paymentDate: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    paymentMethod: 'EFECTIVO',
    number: '', // Nro de Recibo
    referenceNotes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.totalAmount <= 0) return alert("Ingrese un monto válido");
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Registrar Cobranza: ${clientName}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div className="flex-1">
                <span className="text-[10px] font-black uppercase text-emerald-600 block mb-1">Monto Recibido</span>
                <div className="flex items-center gap-1">
                    <span className="text-2xl font-black text-emerald-700">$</span>
                    <input 
                        type="number" 
                        value={formData.totalAmount} 
                        onChange={e => setFormData({...formData, totalAmount: Number(e.target.value)})} 
                        className="bg-transparent text-3xl font-black text-emerald-700 outline-none w-full" 
                        placeholder="0.00"
                        autoFocus
                    />
                </div>
            </div>
            <div className="text-right">
                <span className="text-[10px] font-black uppercase text-emerald-600 block mb-1">Fecha Recibo</span>
                <input 
                    type="date" 
                    value={formData.paymentDate} 
                    onChange={e => setFormData({...formData, paymentDate: e.target.value})} 
                    className="bg-white dark:bg-dark-bg p-1 text-sm font-bold rounded-lg border-none outline-none" 
                />
            </div>
        </div>

        <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block tracking-widest">Método de Cobro</label>
            <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(method => (
                    <button
                        key={method.id}
                        type="button"
                        onClick={() => setFormData({...formData, paymentMethod: method.id})}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                            formData.paymentMethod === method.id 
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700' 
                            : 'border-gray-100 dark:border-dark-border hover:border-gray-200'
                        }`}
                    >
                        <span className="text-xl">{method.icon}</span>
                        <span className="text-xs font-bold">{method.label}</span>
                        {formData.paymentMethod === method.id && <CheckCircle2 size={16} className="ml-auto text-primary-500" />}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
               <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Número de Recibo / Operación</label>
               <input 
                  type="text" 
                  value={formData.number} 
                  onChange={e => setFormData({...formData, number: e.target.value})} 
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-mono" 
                  placeholder="Ej: REC-0001-00004321"
               />
            </div>
            <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Notas / Observaciones</label>
                <textarea 
                    value={formData.referenceNotes} 
                    onChange={e => setFormData({...formData, referenceNotes: e.target.value})} 
                    className="w-full p-3 bg-gray-50 dark:bg-dark-bg border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm h-20" 
                    placeholder="Detalle del cobro..."
                ></textarea>
            </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button variant="primary" type="submit" className="flex-1">Confirmar Cobro</Button>
        </div>
      </form>
    </Modal>
  );
};
