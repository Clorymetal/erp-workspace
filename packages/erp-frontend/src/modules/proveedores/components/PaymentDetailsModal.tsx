import { useQuery } from '@tanstack/react-query';
import { Modal, Button } from '../../../core/components';
import { API_BASE_URL } from '../../../core/config/apiConfig';
import { Receipt, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
}

export const PaymentDetailsModal = ({ isOpen, onClose, paymentId }: Props) => {
  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment-details', paymentId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/proveedores/pagos/${paymentId}`);
      if (!res.ok) throw new Error('Error fetching details');
      return res.json();
    },
    enabled: !!paymentId && isOpen
  });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalle de Pago / Orden de Pago"
      maxWidth="lg"
      footer={<Button variant="primary" onClick={onClose}>Cerrar</Button>}
    >
      {isLoading ? (
        <div className="p-10 text-center">Cargando...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6 bg-gray-50 dark:bg-dark-bg p-4 rounded-2xl border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                <Receipt size={20} className="text-primary-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Número</p>
                <p className="font-bold">{payment?.number || 'S/N'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                <Calendar size={20} className="text-primary-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Fecha</p>
                <p className="font-bold">{new Date(payment?.paymentDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                <User size={20} className="text-primary-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Proveedor</p>
                <p className="font-bold">{payment?.provider?.businessName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                <CheckCircle2 size={20} className="text-primary-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Estado</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${payment?.status === 'ANULADO' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {payment?.status}
                </span>
              </div>
            </div>
          </div>

          <div>
             <h4 className="flex items-center gap-2 font-bold mb-3 text-gray-600">
               <FileText size={18} /> Comprobantes Imputados
             </h4>
             <div className="border border-gray-100 dark:border-dark-border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-dark-surface text-[10px] font-bold uppercase">
                    <tr>
                      <th className="p-3">Tipo / Número</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3 text-right">Monto Original</th>
                      <th className="p-3 text-right">Monto Aplicado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {payment?.invoicesPaid?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="p-3 font-medium">
                          {item.invoice?.invoiceType} {item.invoice?.pointOfSale}-{item.invoice?.invoiceNumber}
                        </td>
                        <td className="p-3">{new Date(item.invoice?.issueDate).toLocaleDateString()}</td>
                        <td className="p-3 text-right font-mono">${item.invoice?.totalAmount.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">${item.amountPaid.toLocaleString()}</td>
                      </tr>
                    ))}
                    {!payment?.invoicesPaid?.length && (
                      <tr><td colSpan={4} className="p-4 text-center text-gray-400">Pago a cuenta (Sin imputaciones específicas)</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>

          <div className="flex flex-col items-end gap-1 border-t pt-4">
             <div className="flex gap-10 text-sm">
                <span className="text-gray-400 font-bold uppercase">Importe Pagado ({payment?.paymentMethod}):</span>
                <span className="font-mono font-bold">${payment?.totalAmount.toLocaleString()}</span>
             </div>
             {payment?.discountAmount > 0 && (
               <div className="flex gap-10 text-sm">
                  <span className="text-gray-400 font-bold uppercase">Ajuste / Descuento:</span>
                  <span className="font-mono font-bold">${payment?.discountAmount.toLocaleString()}</span>
               </div>
             )}
             <div className="flex gap-10 text-lg border-t mt-1 pt-1">
                <span className="text-gray-600 font-black uppercase">Crédito Total:</span>
                <span className="font-mono font-black text-primary-600">${(payment?.totalAmount + (payment?.discountAmount || 0)).toLocaleString()}</span>
             </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
