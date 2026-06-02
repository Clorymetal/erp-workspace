import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../../../core/components';
import { useClients } from '../hooks/useClients';

interface CobranzaModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  editData?: any;
}

export const CobranzaModal: React.FC<CobranzaModalProps> = ({ isOpen, onClose, clientId, editData }) => {
  const { createPayment, isCreatingPayment, updatePayment, isUpdatingPayment } = useClients();
  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'EFECTIVO',
    referenceNotes: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        amount: editData.totalAmount?.toString() || '',
        paymentDate: editData.paymentDate ? new Date(editData.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: editData.paymentMethod || 'EFECTIVO',
        referenceNotes: editData.referenceNotes || ''
      });
    } else {
      setFormData({ 
        amount: '', 
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'EFECTIVO', 
        referenceNotes: '' 
      });
    }
  }, [editData, isOpen]);

  const handleSave = async () => {
    if (!editData && !formData.amount) return alert("El monto es obligatorio");
    try {
      if (editData) {
        await updatePayment({ paymentId: editData.id, data: {
          paymentDate: formData.paymentDate,
          paymentMethod: formData.paymentMethod,
          referenceNotes: formData.referenceNotes
        } });
      } else {
        await createPayment({ clientId, paymentData: formData });
      }
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error al registrar la cobranza');
    }
  };

  const isSaving = isCreatingPayment || isUpdatingPayment;

  return (
    <Modal 
      isOpen={isOpen} onClose={onClose} title={editData ? "Editar Cobranza" : "Registrar Cobranza"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>{editData ? "Guardar Cambios" : "Confirmar Pago"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {!editData && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            El pago se imputará automáticamente a los remitos pendientes más antiguos.
          </p>
        )}
        {editData && (
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-4 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-200 dark:border-orange-800/30">
            Nota: Para proteger la integridad contable, el monto total del pago no puede ser editado. Si hubo un error en el monto, debe borrar el pago y registrarlo de nuevo.
          </p>
        )}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-bold dark:text-gray-200">Fecha de Pago</label>
            <input type="date" value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-sm font-bold dark:text-gray-200">Monto Recibido ($)</label>
            <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} disabled={!!editData} className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 ${editData ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed dark:border-dark-border' : 'bg-gray-50 dark:bg-dark-bg/50 dark:border-dark-border'}`} placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-bold dark:text-gray-200">Medio de Pago</label>
            <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="CHEQUE">Cheque</option>
              <option value="TARJETA">Tarjeta</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-bold dark:text-gray-200">Notas / Referencia (Opcional)</label>
            <textarea value={formData.referenceNotes} onChange={e => setFormData({...formData, referenceNotes: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" placeholder="N° de operación, datos del cheque..." rows={3} />
          </div>
        </div>
      </div>
    </Modal>
  );
};
