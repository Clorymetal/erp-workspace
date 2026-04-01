import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../core/components/Button';

interface AdvanceModalProps {
  employee: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const AdvanceModal: React.FC<AdvanceModalProps> = ({ employee, isOpen, onClose, onSubmit }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cashAmount, setCashAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [checkAmount, setCheckAmount] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !employee) return null;

  // Lógica localizadora para estilo argentino (100.000,50) -> 100000.50
  const parseLocalNumber = (val: string) => {
    if (!val) return 0;
    const cleaned = val.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const totalPreview = parseLocalNumber(cashAmount) + parseLocalNumber(transferAmount) + parseLocalNumber(checkAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      employeeId: employee.id,
      periodId: employee.salaryPeriods[0].id,
      date,
      cashAmount: parseLocalNumber(cashAmount),
      transferAmount: parseLocalNumber(transferAmount),
      checkAmount: parseLocalNumber(checkAmount),
      notes
    });
    // Reset
    setCashAmount(''); setTransferAmount(''); setCheckAmount(''); setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-2xl w-full max-w-lg"
      >
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4">
          Registrar Adelanto - {employee.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
            <input 
              type="date" 
              required
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-dark-background/50 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Efectivo ($)</label>
              <input 
                type="text" 
                inputMode="decimal"
                value={cashAmount} 
                onChange={(e) => setCashAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-dark-background/50 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tranfer. ($)</label>
              <input 
                type="text" 
                inputMode="decimal"
                value={transferAmount} 
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-dark-background/50 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cheque ($)</label>
              <input 
                type="text" 
                inputMode="decimal"
                value={checkAmount} 
                onChange={(e) => setCheckAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-dark-background/50 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Referencia / Notas</label>
            <input 
              type="text" 
              placeholder="Ej. Transferencia Banco Nación o N° Cheque"
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-dark-background/50 dark:text-white"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-dark-border">
            <div className="text-gray-800 dark:text-gray-200">
              Total Cargado: <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalPreview)}
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
              <Button variant="primary" type="submit" disabled={totalPreview <= 0}>Guardar</Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
