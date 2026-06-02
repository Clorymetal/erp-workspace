import React, { useState } from 'react';
import { Modal, Button } from '../../../core/components';
import { useClients } from '../hooks/useClients';

interface RemitoModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export const RemitoModal: React.FC<RemitoModalProps> = ({ isOpen, onClose, clientId }) => {
  const { createRemito, isCreatingRemito } = useClients();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalAmount: '',
    paymentTermDays: '30',
    driverName: '',
    driverDni: '',
    driverPhone: ''
  });

  const handleSave = async () => {
    if (!formData.totalAmount) return alert("El monto total es obligatorio");
    try {
      await createRemito({ clientId, remitoData: formData });
      onClose();
      setFormData({
        date: new Date().toISOString().split('T')[0],
        totalAmount: '',
        paymentTermDays: '30',
        driverName: '',
        driverDni: '',
        driverPhone: ''
      });
    } catch (e) {
      console.error(e);
      alert('Error al guardar el remito');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} onClose={onClose} title="Cargar Nuevo Remito (Trabajo)"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} isLoading={isCreatingRemito}>Guardar Remito</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold">Fecha del Trabajo</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-bold">Monto Total ($)</label>
            <input type="number" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-bold">Plazo Otorgado (Días)</label>
            <input type="number" value={formData.paymentTermDays} onChange={e => setFormData({...formData, paymentTermDays: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
          </div>
          
          <div className="col-span-2 mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-primary-600 mb-2">Datos de Quien Retira / Chofer</h4>
          </div>

          <div>
            <label className="text-sm font-bold">Nombre</label>
            <input type="text" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" placeholder="Nombre completo" />
          </div>
          <div>
            <label className="text-sm font-bold">DNI</label>
            <input type="text" value={formData.driverDni} onChange={e => setFormData({...formData, driverDni: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" placeholder="Documento" />
          </div>
          <div>
            <label className="text-sm font-bold">Celular (WhatsApp)</label>
            <input type="text" value={formData.driverPhone} onChange={e => setFormData({...formData, driverPhone: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" placeholder="Número" />
          </div>
        </div>
      </div>
    </Modal>
  );
};
