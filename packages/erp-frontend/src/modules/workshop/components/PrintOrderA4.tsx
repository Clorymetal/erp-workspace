import React from 'react';

interface PrintOrderProps {
  order: any;
  businessConfig: any;
  mechanics: any[];
}

export const PrintOrderA4: React.FC<PrintOrderProps> = ({ order, businessConfig, mechanics }) => {
  const bizAddress = businessConfig?.address || 'Ruta Nac. Nº 11 - Km 1006';
  const bizPhone = businessConfig?.phone || '0362 – 5545436';
  const bizEmail = businessConfig?.email || 'clorymetal@gmail.com';
  const bizWeb = businessConfig?.web || 'www.clorymetal.com.ar';

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatTime = (date: string | Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="print-only">
      <style>{`
        @media print {
          .print-only {
            display: block !important;
            visibility: visible !important;
          }
          .page {
            width: 210mm;
            height: 295mm;
            padding: 10mm;
            background: white !important;
            color: black !important;
            box-sizing: border-box;
            page-break-after: always;
            overflow: hidden;
            position: relative;
          }
          .dotted-bg {
            background-image: linear-gradient(to bottom, transparent 27px, #ddd 27px, #ddd 28px, transparent 28px);
            background-size: 100% 28px;
            line-height: 28px;
          }
          .dotted-line-text {
            border-bottom: 2px dotted black;
            padding-bottom: 1px;
          }
          .solid-line-text {
             border-bottom: 2px solid black;
             padding-bottom: 1px;
          }
          .table-header {
             background-color: #f3f4f6 !important;
             border-bottom: 3px solid black;
             font-weight: 900;
             text-transform: uppercase;
             font-size: 11px;
             text-align: center;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* HOJA 1: FRENTE */}
      <div className="page">
        <div className="flex flex-col h-full border-[3px] border-black p-4 relative">
           
           {/* CABECERA (LOGO + DATOS) */}
           <div className="flex justify-between items-start border-b-[3px] border-black pb-4 mb-4 text-black">
              <div className="flex flex-col">
                 <h1 className="text-5xl font-black italic tracking-tighter text-black">CLORYMETAL S.R.L.</h1>
                 <p className="text-[11px] font-bold mt-2">{bizAddress} | Tel/Fax: {bizPhone}</p>
                 <p className="text-[11px] font-bold">Email: {bizEmail} | {bizWeb}</p>
              </div>
              <div className="bg-black text-white p-4 text-center min-w-[200px]">
                 <p className="text-[10px] font-bold uppercase tracking-[3px] mb-1 text-white">Orden de Reparación</p>
                 <p className="text-4xl font-black text-white">№ {order.orderNumber.toString().padStart(6, '0')}</p>
              </div>
           </div>

           {/* DATOS DE INGRESO */}
           <div className="grid grid-cols-3 gap-6 mb-4">
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase tracking-tighter">Fecha:</span> <div className="flex-1 dotted-line-text text-sm font-bold">{formatDate(order.createdAt)}</div></div>
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase tracking-tighter">Hora:</span> <div className="flex-1 dotted-line-text text-sm font-bold">{formatTime(order.createdAt)}</div></div>
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase tracking-tighter">Vehículo:</span> <div className="flex-1 dotted-line-text text-sm font-bold uppercase truncate">{order.vehicleModel || 'S/D'}</div></div>
           </div>

           <div className="grid grid-cols-2 gap-8 mb-4">
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase tracking-tighter">Trabajo para la Empresa:</span> <div className="flex-1 dotted-line-text text-sm font-bold">.........................................</div></div>
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase tracking-tighter">Patente:</span> <div className="px-6 py-1 border-[3px] border-black bg-gray-100 text-3xl font-black">{order.patent || 'S/PAT'}</div></div>
           </div>

           {/* RECUADRO CLIENTE */}
           <div className="border-[3px] border-black p-3 mb-4 space-y-2">
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase text-gray-400">CLIENTE:</span></div>
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase tracking-tighter">Firma:</span> <div className="flex-1 solid-line-text"></div></div>
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase tracking-tighter">Aclaración:</span> <div className="flex-1 solid-line-text text-sm font-bold uppercase">{order.client.businessName}</div></div>
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase tracking-tighter">CUIL/CUIT/DNI:</span> <div className="flex-1 solid-line-text text-sm">{order.client.taxId || ''}</div></div>
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase tracking-tighter">Dirección:</span> <div className="flex-1 solid-line-text text-sm">{order.client.address || ''}</div></div>
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase tracking-tighter">:</span> <div className="flex-1 solid-line-text"></div></div>
              <div className="flex gap-2 items-end"><span className="text-xs font-black uppercase tracking-tighter">Teléfono:</span> <div className="flex-1 solid-line-text text-sm">{order.client.phone || ''}</div></div>
           </div>

           {/* ACCIONES TÉCNICAS */}
           <div className="grid grid-cols-4 gap-4 p-3 border-[3px] border-black mb-4 bg-gray-50">
              {['REVISAR', 'REPARAR', 'ENCINTAR', 'RECTIFICAR'].map(action => (
                <div key={action} className="flex items-center gap-2">
                   <div className="w-5 h-5 border-[2.5px] border-black bg-white"></div>
                   <span className="text-[11px] font-black uppercase">{action}</span>
                </div>
              ))}
           </div>

           {/* CUERPO CENTRAL */}
           <div className="flex-1 mb-4 flex flex-col">
              <div className="flex gap-2 items-start mb-2"><span className="text-xs font-black uppercase mt-1">Pieza a Trabajar:</span> <div className="flex-1 dotted-line-text text-sm font-bold flex items-center min-h-[30px]">{order.vehicleModel} - {order.actions}</div></div>
              
              <div className="flex-1 border-[3px] border-black flex flex-col overflow-hidden">
                 <div className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Descripción del problema / Notas de taller</div>
                 <div className="flex-1 p-3 dotted-bg text-sm italic leading-[28px] overflow-hidden">
                    {order.observations}
                 </div>
              </div>
           </div>

           {/* FORMA DE PAGO */}
           <div className="flex gap-2 items-end mb-4"><span className="text-xs font-black uppercase tracking-tighter">Forma de pago:</span> <div className="flex-1 dotted-line-text text-sm font-bold">..........................................................................................................</div></div>

           {/* AUTORIZACIÓN LITERAL */}
           <div className="border-[2px] border-black p-3 bg-gray-50 mb-4">
              <p className="text-[11px] font-medium leading-normal text-justify">
                Como legítimo tenedor del vehículo descripto en ésta Orden de Reparación autorizo a **CLORYMETAL S.R.L.** para que realice los trabajos y coloque los repuestos necesarios para la reparación de los frenos de dicho vehículo.
              </p>
           </div>

           {/* BLOQUE RECIBO */}
           <div className="border-[3px] border-black p-3 mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-black uppercase text-gray-400">RECIBO:</span>
                 <div className="flex gap-4">
                    <span className="text-[10px] font-bold">FECHA: {formatDate(new Date())}</span>
                    <span className="text-[10px] font-bold">HORA: {formatTime(new Date())}</span>
                 </div>
              </div>
              <p className="text-[11px] font-bold italic mb-4">
                Retiro conforme de CLORYMETAL S.R.L. el vehículo dominio <span className="px-4 border-b-2 border-black font-black uppercase tracking-wider">{order.patent || '..................'}</span> con la reparación realizada.
              </p>
              <div className="grid grid-cols-2 gap-20">
                 <div className="text-center">
                    <div className="w-full border-b-2 border-black h-8"></div>
                    <span className="text-[9px] font-bold uppercase mt-1 block">Firma</span>
                 </div>
                 <div className="text-center">
                    <div className="w-full border-b-2 border-black h-8"></div>
                    <span className="text-[9px] font-bold uppercase mt-1 block">Aclaración</span>
                 </div>
              </div>
           </div>

           {/* TAG GIGANTE AL PIE - AHORA IDENTIFICADO POR EMPRESA */}
           <div className="mt-auto border-t-[4px] border-dashed border-black pt-4">
              <div className="border-[4px] border-black p-4 bg-white min-h-[160px] flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <h2 className="text-xl font-black italic tracking-tighter">CLORYMETAL - Rótulo de Identificación</h2>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase text-gray-400">Orden № {order.orderNumber.toString().padStart(6, '0')}</p>
                       <p className="text-sm font-bold">Patente: {order.patent || 'S/D'}</p>
                    </div>
                 </div>
                 
                 <div className="flex justify-center items-center py-1 border-y-[4px] border-black my-2">
                    <p className="text-[75px] font-black leading-none tracking-tighter uppercase text-center overflow-hidden">{order.client.businessName}</p>
                 </div>

                 <div className="flex justify-between items-end">
                    <p className="text-xs font-black uppercase tracking-widest bg-black text-white px-3 py-1">TALLER PRINCIPAL</p>
                    <p className="text-xl font-black">{order.vehicleModel || ''}</p>
                 </div>
              </div>
           </div>

        </div>
      </div>

      {/* HOJA 2: DORSO (OPERARIO CON IMPORTE Y SUBTOTAL) */}
      <div className="page page-break">
         <div className="flex flex-col h-full border-[3px] border-black p-0">
             <div className="bg-black text-white p-3 flex justify-between items-center">
               <span className="font-black tracking-[4px] uppercase text-sm">Control de Taller - Hoja de Operario</span>
               <span className="font-black">№ OR {order.orderNumber.toString().padStart(6, '0')}</span>
            </div>

            <div className="p-4 border-b-[3px] border-black bg-gray-50 flex items-center gap-6">
               <span className="text-sm font-black uppercase text-black">OPERARIO:</span>
               <div className="flex flex-wrap gap-8">
                 {['JOSÉ', 'NINO', 'NÉSTOR', 'ALFREDO', 'WALTER'].map((name) => (
                    <div key={name} className="flex items-center gap-3">
                       <span className="text-xs font-black text-gray-700">{name}</span>
                       <div className="w-6 h-6 border-[3px] border-black bg-white rounded-sm"></div>
                    </div>
                 ))}
               </div>
            </div>

            <div className="flex flex-1 divide-x-[3px] divide-black">
               {/* COLUMNA MANO DE OBRA CON IMPORTE Y SUBTOTAL */}
               <div className="w-[45%] flex flex-col">
                  <div className="table-header py-2">Mano de Obra</div>
                  <div className="flex-1 flex flex-col divide-y-2 divide-gray-200">
                     {[...Array(6)].map((_, i) => (
                       <div key={i} className="flex h-12 items-center divide-x-2 divide-gray-200">
                          <div className="w-10 h-full bg-gray-50/50"></div>
                          <div className="flex-1 px-4 italic text-[14px] text-gray-100 font-bold">Detalle...</div>
                          <div className="w-24 h-full text-right p-2 font-black text-xs text-gray-400">Importe $</div>
                       </div>
                     ))}
                  </div>
                  <div className="bg-gray-50 p-4 border-t-[3px] border-black flex justify-between items-center">
                     <span className="text-xs font-black uppercase">Subtotal M.O. $</span>
                     <div className="w-32 h-8 border-[3px] border-black bg-white"></div>
                  </div>
               </div>

               <div className="flex-1 flex flex-col">
                  <div className="table-header py-2">Repuestos e Insumos</div>
                  <div className="flex-1 flex flex-col divide-y divide-gray-100">
                     {[...Array(26)].map((_, i) => (
                       <div key={i} className="flex h-[26px] items-center divide-x divide-gray-100">
                          <div className="w-8 h-full bg-gray-50/20"></div>
                          <div className="flex-1 px-4 italic text-[12px] text-gray-100 font-bold">Repuesto...</div>
                          <div className="w-24 h-full text-right p-1 font-bold text-[10px] text-gray-200">$</div>
                       </div>
                     ))}
                  </div>
                  <div className="bg-black text-white p-4 flex justify-between items-center min-h-[60px]">
                     <span className="text-sm font-black tracking-widest uppercase italic pr-4">Total General $</span>
                     <div className="flex-1 h-10 bg-white text-black flex items-center justify-center font-black text-2xl border-[3px] border-white"></div>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-gray-50 border-t-[3px] border-black">
               <span className="text-xs font-black uppercase text-gray-500 mb-2 block tracking-[3px]">Notas Técnicas del Trabajo:</span>
               <div className="space-y-6 pt-2">
                  <div className="border-b-2 border-gray-300 h-8"></div>
                  <div className="border-b-2 border-gray-300 h-8"></div>
               </div>
            </div>

            <div className="min-h-[120px]"></div>
         </div>
      </div>
    </div>
  );
};

PrintOrderA4.displayName = 'PrintOrderA4';
