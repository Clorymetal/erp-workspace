import React, { useState } from 'react';
import { Modal, Button } from '../../../core/components';
import { useClients } from '../hooks/useClients';

interface CobranzaModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export const CobranzaModal: React.FC<CobranzaModalProps> = ({ isOpen, onClose, clientId }) => {
  const { createPayment, isCreatingPayment } = useClients();
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'EFECTIVO',
    referenceNotes: ''
  });

  const handleSave = async () => {
    if (!formData.amount) return alert("El monto es obligatorio");
    try {
      await createPayment({ clientId, paymentData: formData });
      onClose();
      setFormData({ amount: '', paymentMethod: 'EFECTIVO', referenceNotes: '' });
    } catch (e) {
      console.error(e);
      alert('Error al registrar la cobranza');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} onClose={onClose} title="Registrar Cobranza"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} isLoading={isCreatingPayment}>Confirmar Pago</Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 mb-4">
          El pago se imputará automáticamente a los remitos pendientes más antiguos.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-bold">Monto Recibido ($)</label>
            <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-bold">Medio de Pago</label>
            <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg">
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="CHEQUE">Cheque</option>
              <option value="TARJETA">Tarjeta</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-bold">Notas / Referencia (Opcional)</label>
            <textarea value={formData.referenceNotes} onChange={e => setFormData({...formData, referenceNotes: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" placeholder="N° de operación, datos del cheque..." rows={3} />
          </div>
        </div>
      </div>
    </Modal>
  );
};
