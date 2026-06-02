import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, DollarSign, MessageCircle, Loader2, ClipboardCheck } from 'lucide-react';
import { Button, DataTable } from '../../../core/components';
import { useClientDetail } from '../hooks/useClients';
import { RemitoModal } from './RemitoModal';
import { CobranzaModal } from './CobranzaModal';
import { EstadoCuentaRecibo } from './EstadoCuentaRecibo';

interface ClienteDetalleProps {
  clientId: string;
  onClose: () => void;
}

export const ClienteDetalle: React.FC<ClienteDetalleProps> = ({ clientId, onClose }) => {
  const { detail, isLoading } = useClientDetail(clientId);
  const [activeTab, setActiveTab] = useState<'REMITOS' | 'PAGOS'>('REMITOS');
  const [isRemitoModalOpen, setIsRemitoModalOpen] = useState(false);
  const [isCobranzaModalOpen, setIsCobranzaModalOpen] = useState(false);
  const [isSendingWA, setIsSendingWA] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const reciboRef = useRef<HTMLDivElement>(null);

  if (isLoading || !detail) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-dark-surface shadow-2xl z-50 p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-AR');

  const pendingRemitos = detail.remitos.filter((r: any) =>
    ['PENDIENTE', 'PARCIAL', 'VENCIDO'].includes(r.status)
  );

  const remitoColumns = [
    { key: 'date', header: 'Fecha', render: (r: any) => formatDate(r.date) },
    { key: 'driverName', header: 'Chofer / Retira' },
    { key: 'dueDate', header: 'Vto', render: (r: any) => formatDate(r.dueDate) },
    {
      key: 'status', header: 'Estado', render: (r: any) => (
        <span className={`px-2 py-1 text-xs rounded-full font-bold
          ${r.status === 'PENDIENTE' ? 'bg-orange-100 text-orange-600' :
            r.status === 'PARCIAL' ? 'bg-blue-100 text-blue-600' :
            r.status === 'VENCIDO' ? 'bg-red-100 text-red-600' :
            'bg-emerald-100 text-emerald-600'}`}>
          {r.status}
        </span>
      )
    },
    { key: 'totalAmount', header: 'Total', render: (r: any) => <span className="font-bold">{formatCurrency(r.totalAmount)}</span> }
  ];

  const paymentColumns = [
    { key: 'paymentDate', header: 'Fecha', render: (r: any) => formatDate(r.paymentDate) },
    { key: 'paymentMethod', header: 'Medio' },
    { key: 'referenceNotes', header: 'Ref' },
    { key: 'totalAmount', header: 'Monto', render: (r: any) => <span className="font-bold text-emerald-600">{formatCurrency(r.totalAmount)}</span> }
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleWhatsAppShare = async () => {
    if (!reciboRef.current) return;
    setIsSendingWA(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(reciboRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      // Armar el mensaje de texto
      const nextDueDateStr = pendingRemitos.length > 0
        ? formatDate([...pendingRemitos].sort((a: any, b: any) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          )[0].dueDate)
        : 'Inmediato';

      const text =
        `Estimado cliente. Le recordamos que su cuenta corriente registra un saldo impago de *${formatCurrency(detail.balance)}*, con vencimientos al *${nextDueDateStr}*.\n\n` +
        `Adjuntamos a este mensaje el resumen detallado de su cuenta y los remitos correspondientes.\n\n` +
        `Si ya ha efectuado el pago, por favor remita el comprobante a clorymetal@gmail.com. ` +
        `Caso contrario, le solicitamos regularizar su saldo a la brevedad para continuar disfrutando de los beneficios de su cuenta corriente.\n` +
        `Saludos cordiales, Equipo Clorymetal.`;

      const phone = detail.phone?.replace(/[^0-9]/g, '') || '';

      // Convertir canvas a Blob JPEG
      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
      );

      // INTENTO 1: Web Share API (funciona en móviles y Chrome moderno)
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'estado_cuenta.jpg', { type: 'image/jpeg' })] })) {
        const file = new File([blob], 'estado_cuenta.jpg', { type: 'image/jpeg' });
        await navigator.share({ files: [file], title: 'Estado de Cuenta', text });
        return;
      }

      // INTENTO 2: Copiar imagen al portapapeles (WhatsApp Web → Ctrl+V)
      try {
        const pngBlob: Blob = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png') // Clipboard API solo acepta PNG
        );
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': pngBlob })
        ]);
        // Abrir WhatsApp con el texto
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
        showToast('✅ Imagen copiada — en WhatsApp pegala con Ctrl+V (o ⌘V) y luégo envía el mensaje.');
      } catch {
        // FALLBACK: Si el clipboard falla, descargar el JPEG manualmente
        const link = document.createElement('a');
        link.download = `EstadoCuenta_${detail.businessName.replace(/\s+/g, '_')}.jpg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
        showToast('⚠️ Imagen descargada en tu carpeta. Adjuntála en WhatsApp como Foto (no como Documento).');
      }
    } catch (e) {
      console.error(e);
      alert('No se pudo generar la imagen. Intente nuevamente.');
    } finally {
      setIsSendingWA(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-dark-surface shadow-2xl z-50 flex flex-col border-l border-gray-100 dark:border-dark-border"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-start bg-gray-50/50 dark:bg-dark-bg/50">
          <div>
            <h2 className="text-2xl font-black">{detail.businessName}</h2>
            <p className="text-gray-500 text-sm mt-1">
              CUIT: {detail.taxId} | Tel: {detail.phone || 'N/A'}
              {detail.billingCycle === 'MENSUAL' && (
                <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-bold rounded-full">Facturación Mensual</span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-dark-bg rounded-full shadow-sm hover:bg-gray-50"><X size={20} /></button>
        </div>

        {/* Balance Banner */}
        <div className="p-6 bg-gradient-to-r from-primary-50 to-orange-50 dark:from-primary-900/10 dark:to-orange-900/10 border-b border-primary-100 dark:border-primary-800/30 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Saldo Adeudado</p>
            <p className={`text-4xl font-black ${detail.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {formatCurrency(detail.balance)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{pendingRemitos.length} remito(s) pendiente(s)</p>
          </div>
          <Button
            variant="primary"
            icon={isSendingWA ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
            onClick={handleWhatsAppShare}
            isLoading={isSendingWA}
          >
            Cobrar por WhatsApp
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-dark-border px-6 pt-4 gap-4 bg-white dark:bg-dark-surface">
          <button
            className={`pb-3 font-semibold text-sm border-b-2 transition-all ${activeTab === 'REMITOS' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('REMITOS')}
          >
            Trabajos / Remitos
          </button>
          <button
            className={`pb-3 font-semibold text-sm border-b-2 transition-all ${activeTab === 'PAGOS' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('PAGOS')}
          >
            Historial de Cobranzas
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-dark-bg/20">
          {activeTab === 'REMITOS' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsRemitoModalOpen(true)}>Cargar Remito</Button>
              </div>
              <DataTable data={detail.remitos} columns={remitoColumns} isLoading={false} />
            </div>
          )}
          {activeTab === 'PAGOS' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="primary" icon={<DollarSign size={16} />} onClick={() => setIsCobranzaModalOpen(true)}>Registrar Cobro</Button>
              </div>
              <DataTable data={detail.payments} columns={paymentColumns} isLoading={false} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Componente invisible para captura de imagen - fuera de la pantalla */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
        <EstadoCuentaRecibo
          ref={reciboRef}
          businessName={detail.businessName}
          taxId={detail.taxId}
          balance={detail.balance}
          remitos={detail.remitos}
          generatedAt={new Date().toLocaleDateString('es-AR')}
        />
      </div>

      <RemitoModal isOpen={isRemitoModalOpen} onClose={() => setIsRemitoModalOpen(false)} clientId={clientId} />
      <CobranzaModal isOpen={isCobranzaModalOpen} onClose={() => setIsCobranzaModalOpen(false)} clientId={clientId} />

      {/* Toast de instrucción WhatsApp */}
      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md text-center"
        >
          <ClipboardCheck size={20} className="shrink-0 text-emerald-400" />
          <span>{toastMsg}</span>
        </motion.div>
      )}
    </>
  );
};
