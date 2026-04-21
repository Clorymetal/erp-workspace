import React from 'react';
import type { RepoOrder } from '../hooks/useWorkshop';

interface PrintTagProps {
  order: RepoOrder;
}

export const PrintTag = React.forwardRef<HTMLDivElement, PrintTagProps>(({ order }, ref) => {
  return (
    <div ref={ref} className="bg-white font-sans text-black print:m-0 print:w-full">
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 0; }
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .tag-container { 
            width: 210mm; 
            min-height: 297mm; 
            padding: 15mm; 
            margin: 0 auto; 
            display: flex; 
            flex-direction: column; 
            border: 4pt solid black;
            box-sizing: border-box;
          }
        }
      `}} />
      
      <div className="tag-container">
        {/* CABECERA */}
        <div className="border-b-[4px] border-black pb-4 mb-8 flex justify-between items-center text-black">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">CLORYMETAL S.R.L.</h1>
            <p className="text-xs font-bold uppercase tracking-[2px]">Rótulo de Identificación de Pieza</p>
          </div>
          <div className="text-right border-2 border-black p-2 bg-gray-50">
            <p className="text-[10px] font-black uppercase text-gray-400">Orden №</p>
            <div className="text-3xl font-black">{String(order.orderNumber).padStart(6, '0')}</div>
          </div>
        </div>

        {/* CUERPO CENTRAL */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
           <p className="text-xs font-black uppercase tracking-[10px] text-gray-400 mb-4">Propietario / Empresa</p>
           <div className="w-full border-y-[6px] border-black py-10 flex items-center justify-center">
              <h2 className="text-[90px] font-black leading-none uppercase tracking-tighter text-center line-clamp-2">
                 {order.client.businessName}
              </h2>
           </div>
           
           <div className="grid grid-cols-2 w-full mt-10 gap-10">
              <div className="border-b-4 border-black pb-2">
                 <p className="text-[10px] font-black uppercase text-gray-400">Patente / Dominio</p>
                 <p className="text-4xl font-black">{order.patent || 'S/D'}</p>
              </div>
              <div className="border-b-4 border-black pb-2">
                 <p className="text-[10px] font-black uppercase text-gray-400">Pieza / Vehículo</p>
                 <p className="text-4xl font-black truncate">{order.vehicleModel || order.pieceSummary || '-'}</p>
              </div>
           </div>
        </div>

        {/* DETALLE TÉCNICO AL PIE */}
        <div className="mt-8 border-2 border-black p-4 bg-gray-50">
           <h3 className="text-xs font-black uppercase border-b border-black pb-1 mb-2">Detalles del Trabajo</h3>
           <p className="text-xl font-medium italic">
              {order.observations || order.problemDescription}
           </p>
        </div>

        {/* MARCA DE CLORYMETAL */}
        <div className="mt-auto pt-8 border-t-4 border-dashed border-black flex justify-between items-end">
           <div>
              <p className="text-sm font-black italic">CLORYMETAL S.R.L.</p>
              <p className="text-[10px]">Ruta Nac. Nº 11 - Km 1006 - Resistencia, Chaco</p>
           </div>
           <div className="bg-black text-white px-6 py-2 text-xl font-black uppercase tracking-widest text-white">
              Taller
           </div>
        </div>
      </div>
    </div>
  );
});

PrintTag.displayName = 'PrintTag';
