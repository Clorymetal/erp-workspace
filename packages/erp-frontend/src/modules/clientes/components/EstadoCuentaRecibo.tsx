import React from 'react';

interface Remito {
  date: string;
  invoiceNumber?: string;
  driverName?: string;
  totalAmount: number;
  dueDate: string;
  status: string;
}

interface EstadoCuentaReciboProps {
  businessName: string;
  taxId: string;
  balance: number;
  remitos: Remito[];
  generatedAt?: string;
}

const fmt = (val: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-AR');

export const EstadoCuentaRecibo = React.forwardRef<HTMLDivElement, EstadoCuentaReciboProps>(
  ({ businessName, taxId, balance, remitos, generatedAt }, ref) => {
    const pending = remitos.filter(r => ['PENDIENTE', 'PARCIAL', 'VENCIDO'].includes(r.status));

    return (
      <div
        ref={ref}
        style={{
          width: '680px',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          padding: '32px',
          color: '#1a1a2e',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '3px solid #4f46e5', paddingBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#4f46e5' }}>CLORYMETAL S.R.L.</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Estado de Cuenta Corriente</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Generado: {generatedAt || new Date().toLocaleDateString('es-AR')}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Saldo Total Adeudado</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: balance > 0 ? '#ef4444' : '#10b981' }}>
              {fmt(balance)}
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>{businessName}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>CUIT: {taxId}</div>
        </div>

        {/* Remitos Table Header */}
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Remitos Pendientes de Pago
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderRadius: '6px 0 0 6px' }}>Fecha</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>N° Doc.</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Retira</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Vencimiento</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Estado</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Monto</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((r, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px' }}>{fmtDate(r.date)}</td>
                <td style={{ padding: '10px 12px', color: '#6b7280' }}>{r.invoiceNumber || '—'}</td>
                <td style={{ padding: '10px 12px' }}>{r.driverName || '—'}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>{fmtDate(r.dueDate)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: r.status === 'VENCIDO' ? '#fef2f2' : r.status === 'PARCIAL' ? '#eff6ff' : '#fff7ed',
                    color: r.status === 'VENCIDO' ? '#ef4444' : r.status === 'PARCIAL' ? '#3b82f6' : '#f97316',
                  }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>{fmt(r.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#1a1a2e', color: '#ffffff' }}>
              <td colSpan={5} style={{ padding: '12px', fontWeight: '700', borderRadius: '0 0 0 6px' }}>TOTAL ADEUDADO</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: '900', fontSize: '16px', borderRadius: '0 0 6px 0' }}>{fmt(balance)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
          Si ya ha efectuado el pago, remita el comprobante a clorymetal@gmail.com • Clorymetal S.R.L.
        </div>
      </div>
    );
  }
);

EstadoCuentaRecibo.displayName = 'EstadoCuentaRecibo';
