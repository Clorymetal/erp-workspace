import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../../../core/components';
import { useClients } from '../hooks/useClients';

interface RemitoModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  editData?: any;
}

export const RemitoModal: React.FC<RemitoModalProps> = ({ isOpen, onClose, clientId, editData }) => {
  const { createRemito, isCreatingRemito, updateRemito, isUpdatingRemito } = useClients();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalAmount: '',
    paymentTermDays: '30',
    driverName: '',
    driverDni: '',
    driverPhone: '',
    invoiceNumber: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        date: editData.date ? new Date(editData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        totalAmount: editData.totalAmount?.toString() || '',
        paymentTermDays: editData.paymentTermDays?.toString() || '30',
        driverName: editData.driverName || '',
        driverDni: editData.driverDni || '',
        driverPhone: editData.driverPhone || '',
        invoiceNumber: editData.invoiceNumber || ''
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        totalAmount: '',
        paymentTermDays: '30',
        driverName: '',
        driverDni: '',
        driverPhone: '',
        invoiceNumber: ''
      });
    }
  }, [editData, isOpen]);

  const handleSave = async () => {
    if (!formData.totalAmount) return alert("El monto total es obligatorio");
    try {
      if (editData) {
        await updateRemito({ remitoId: editData.id, data: formData });
      } else {
        await createRemito({ clientId, remitoData: formData });
      }
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error al guardar el remito');
    }
  };

  const isSaving = isCreatingRemito || isUpdatingRemito;

  return (
    <Modal 
      isOpen={isOpen} onClose={onClose} title={editData ? "Editar Remito" : "Cargar Nuevo Remito (Trabajo)"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>{editData ? "Guardar Cambios" : "Guardar Remito"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold dark:text-gray-200">Fecha del Trabajo</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-sm font-bold dark:text-gray-200">Monto Total ($)</label>
            <input type="number" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-bold dark:text-gray-200">Plazo Otorgado (Días)</label>
            <input type="number" value={formData.paymentTermDays} onChange={e => setFormData({...formData, paymentTermDays: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="text-sm font-bold dark:text-gray-200">Nº Factura</label>
            <input type="text" value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" placeholder="0001-00001234" />
          </div>
          
          <div className="col-span-2 mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
            <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-2">Datos de Quien Retira / Chofer</h4>
          </div>

          <div>
            <label className="text-sm font-bold dark:text-gray-200">Nombre</label>
            <input type="text" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" placeholder="Nombre completo" />
          </div>
          <div>
            <label className="text-sm font-bold dark:text-gray-200">DNI</label>
            <input type="text" value={formData.driverDni} onChange={e => setFormData({...formData, driverDni: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" placeholder="Documento" />
          </div>
          <div>
            <label className="text-sm font-bold dark:text-gray-200">Celular (WhatsApp)</label>
            <input type="text" value={formData.driverPhone} onChange={e => setFormData({...formData, driverPhone: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" placeholder="Número" />
          </div>
        </div>
      </div>
    </Modal>
  );
};
