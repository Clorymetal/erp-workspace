import { useState, useEffect } from 'react';
import { Modal, Button } from '../../../core/components';
import { Check, Wallet, Landmark, Receipt, ArrowRight, Plus, X } from 'lucide-react';
import { useCtaCte } from '../hooks/useCtaCte';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
}

export const PaymentWizard = ({ isOpen, onClose, providerId }: Props) => {
  const { pendingItems, createPayment, isCreatingPayment } = useCtaCte(providerId);
  const [step, setStep] = useState(1);
  
  // Form State
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [imputationAmounts, setImputationAmounts] = useState<Record<string, number>>({});
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNumber, setPaymentNumber] = useState('');
  const [referenceNotes, setReferenceNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'CHEQUE'>('TRANSFERENCIA');
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  
  // Checks State
  const [checks, setChecks] = useState<any[]>([]);

  // Auto-calculate imputation amounts when selection changes
  useEffect(() => {
    const newImputations: Record<string, number> = {};
    selectedInvoices.forEach(id => {
      const inv = pendingItems.invoices.find((i: any) => i.id === id);
      if (inv) newImputations[id] = inv.amountPending;
    });
    setImputationAmounts(newImputations);
  }, [selectedInvoices, pendingItems.invoices]);

  const totalImputed = Object.values(imputationAmounts).reduce((a, b) => a + b, 0);

  const handleFinish = async () => {
    const data = {
      paymentDate,
      number: paymentNumber,
      totalAmount,
      paymentMethod,
      referenceNotes,
      discountAmount,
      imputations: Object.entries(imputationAmounts).map(([invoiceId, amount]) => ({
        invoiceId,
        amount
      })),
      checks
    };

    try {
      await createPayment(data);
      onClose();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const addCheck = () => {
    setChecks([...checks, {
      checkNumber: '',
      bankName: '',
      issuerName: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      amount: 0
    }]);
  };

  const removeCheck = (index: number) => {
    setChecks(checks.filter((_, i) => i !== index));
  };

  const updateCheck = (index: number, field: string, value: any) => {
    const newChecks = [...checks];
    newChecks[index][field] = field === 'amount' ? Number(value) : value;
    setChecks(newChecks);
    
    // Update totalAmount if paymentMethod is CHEQUE
    if (paymentMethod === 'CHEQUE') {
      const newTotal = newChecks.reduce((acc, c) => acc + c.amount, 0);
      setTotalAmount(newTotal);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Nueva Orden de Pago - Paso ${step} de 3`}
      maxWidth="xl"
      footer={
        <div className="flex justify-between w-full">
          <Button variant="ghost" onClick={step === 1 ? onClose : () => setStep(step - 1)}>
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </Button>
          {step < 3 ? (
            <Button variant="primary" icon={<ArrowRight size={18} />} onClick={() => setStep(step + 1)}>
              Siguiente
            </Button>
          ) : (
            <Button 
              variant="primary" 
              icon={<Check size={18} />} 
              onClick={handleFinish}
              isLoading={isCreatingPayment}
            >
              Confirmar Pago
            </Button>
          )}
        </div>
      }
    >
      <div className="min-h-[400px]">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Receipt className="text-primary-500" /> Seleccionar comprobantes a pagar
            </h3>
            <div className="max-h-[350px] overflow-y-auto rounded-xl border border-gray-100 dark:border-dark-border">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-gray-50 dark:bg-dark-surface uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3 w-10"></th>
                    <th className="p-3">Factura</th>
                    <th className="p-3">Vencimiento</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-right">Pendiente</th>
                    <th className="p-3 text-right w-32">A Pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {pendingItems.invoices.map((inv: any) => (
                    <tr key={inv.id} className={`${selectedInvoices.includes(inv.id) ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                      <td className="p-3">
                        <input 
                          type="checkbox" 
                          checked={selectedInvoices.includes(inv.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedInvoices([...selectedInvoices, inv.id]);
                            else setSelectedInvoices(selectedInvoices.filter(id => id !== inv.id));
                          }}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                      </td>
                      <td className="p-3 font-medium">
                        {inv.invoiceType} {inv.pointOfSale}-{inv.invoiceNumber}
                      </td>
                      <td className="p-3">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="p-3 text-right font-mono">${inv.totalAmount.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-red-500">${inv.amountPending.toLocaleString()}</td>
                      <td className="p-3">
                        <input 
                          type="number"
                          disabled={!selectedInvoices.includes(inv.id)}
                          value={imputationAmounts[inv.id] || 0}
                          onChange={(e) => setImputationAmounts({...imputationAmounts, [inv.id]: Number(e.target.value)})}
                          className="w-full p-1 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded text-right"
                        />
                      </td>
                    </tr>
                  ))}
                  {pendingItems.invoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-gray-500">No hay facturas pendientes</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl flex justify-between items-center">
              <span className="font-bold text-gray-500">Total a Imputar:</span>
              <span className="text-xl font-black text-primary-600">${totalImputed.toLocaleString()}</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Landmark className="text-primary-500" /> Información del Pago
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-400">Fecha de Pago</label>
                <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-400">Nro Orden de Pago / Recibo</label>
                <input type="text" value={paymentNumber} onChange={e => setPaymentNumber(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg" placeholder="OP-0001" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase text-gray-400">Medio de Pago</label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {(['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE'] as const).map(m => (
                    <button 
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === m ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-gray-200 dark:border-dark-border hover:border-gray-300'}`}
                    >
                      {m === 'EFECTIVO' && <Wallet size={24} />}
                      {m === 'TRANSFERENCIA' && <Landmark size={24} />}
                      {m === 'CHEQUE' && <Receipt size={24} />}
                      <span className="text-[10px] font-bold tracking-tight">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase text-gray-400">Notas / Referencias</label>
                <textarea value={referenceNotes} onChange={e => setReferenceNotes(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-dark-bg/50 border dark:border-dark-border rounded-lg resize-none" rows={2}></textarea>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="font-bold text-lg flex items-center gap-2">
              <Check className="text-primary-500" /> Valores y Ajustes
            </h3>

            {paymentMethod === 'CHEQUE' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold uppercase text-gray-400">Detalle de Cheques</h4>
                  <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={addCheck}>Agregar Cheque</Button>
                </div>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  {checks.map((c, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-3">
                        <label className="text-[10px] font-bold">NRO</label>
                        <input type="text" value={c.checkNumber} onChange={e => updateCheck(i, 'checkNumber', e.target.value)} className="w-full p-1 text-xs border rounded" />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[10px] font-bold">BANCO</label>
                        <input type="text" value={c.bankName} onChange={e => updateCheck(i, 'bankName', e.target.value)} className="w-full p-1 text-xs border rounded" />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] font-bold">VENCE</label>
                        <input type="date" value={c.dueDate} onChange={e => updateCheck(i, 'dueDate', e.target.value)} className="w-full p-1 text-xs border rounded" />
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                         <div className="flex-1">
                            <label className="text-[10px] font-bold">IMPORTE</label>
                            <input type="number" value={c.amount} onChange={e => updateCheck(i, 'amount', e.target.value)} className="w-full p-1 text-xs border rounded text-right font-bold" />
                         </div>
                         <button onClick={() => removeCheck(i)} className="text-red-400 hover:text-red-500 mb-1"><X size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-bold">Importe Total a Pagar</label>
                <input 
                  type="number" 
                  value={totalAmount} 
                  onChange={e => setTotalAmount(Number(e.target.value))} 
                  className="w-full p-4 text-3xl font-black text-center bg-gray-50 dark:bg-dark-bg/50 border-2 border-primary-500/20 dark:border-primary-500/10 rounded-2xl outline-none focus:border-primary-500 transition-all"
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-800/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500">Monto Imputado a Facturas:</span>
                <span className="font-mono font-bold">${totalImputed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-500">Ajuste / Descuento:</span>
                  <span className="text-[10px] text-gray-400">Este monto se resta de la deuda pero NO sale de caja</span>
                </div>
                <input 
                  type="number" 
                  value={discountAmount} 
                  onChange={e => setDiscountAmount(Number(e.target.value))} 
                  className="w-32 p-1 text-right bg-white dark:bg-dark-bg border border-primary-200 dark:border-primary-800 rounded font-mono font-bold text-primary-600"
                />
              </div>
              <div className="pt-2 border-t border-primary-200 dark:border-primary-800/50 flex justify-between items-center">
                <span className="font-black uppercase text-xs">Saldo a Favor Resultante:</span>
                <span className={`text-xl font-black ${(totalAmount + discountAmount - totalImputed) > 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                  ${Math.max(0, totalAmount + discountAmount - totalImputed).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
