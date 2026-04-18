import React, { useState } from 'react';
import { ExportMenu } from '../../core/components/ExportMenu';
import { EmployeeCard } from './components/EmployeeCard';
import { AdvanceModal } from './components/AdvanceModal';
import { useEmployees } from './hooks/useEmployees';
import { Button } from '../../core/components/Button';
import { Plus, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmpleadosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sueldos' | 'fichas'>('sueldos');
  const [currentMonth, setCurrentMonth] = useState(3);
  const [currentYear] = useState(2026);
  const [selectedEmployeeForAdvance, setSelectedEmployeeForAdvance] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const {
    employees,
    isLoading,
    createAdvance,
    deleteAdvance,
    updateSalary,
    createEmployee,
    updateEmployee
  } = useEmployees(currentYear, currentMonth);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const handleCreateEmployee = async (data: any) => {
    try {
      await createEmployee(data);
      alert("Empleado creado con éxito");
    } catch(e) {
      alert("Error al crear empleado");
    }
  };

  const handleUpdateEmployee = async (id: number, data: any) => {
    try {
      await updateEmployee({ id, data });
    } catch(e) {
      alert("Error al actualizar empleado");
    }
  };

  const handleCreateAdvance = async (advanceData: any) => {
    try {
      await createAdvance(advanceData);
    } catch(e) {
      alert("Error al guardar anticipo");
    }
  };

  const handleDeleteAdvance = async (advanceId: number) => {
    if(!window.confirm('¿Seguro que deseas eliminar este adelanto? El saldo se recalculará automáticamente.')) return;
    try {
      await deleteAdvance(advanceId);
    } catch(e) {
      alert("Error al eliminar anticipo");
    }
  };

  const handleUpdateSalary = async (periodId: number, salaryData: any) => {
    try {
      await updateSalary({ periodId, salaryData });
    } catch(e) {
      alert("Error al actualizar sueldo");
    }
  };

  const getExportData = () => {
    return employees.map(emp => {
      const p = emp.salaryPeriods[0] || {};
      return {
        Nombre: emp.name,
        'Tipo Sueldo': emp.payType === 'MONTHLY' ? 'Mensual' : 'Quincenal',
        'Valor Estimativo del mes ($)': p.baseSalary,
        '1ra Quincena ($)': p.firstInstallment || 0,
        '2da Quincena ($)': p.secondInstallment || 0,
        'Total Adelantos ($)': p.totalAdvances,
        'Saldo Adeudado ($)': p.balance
      };
    });
  };

  const formatWhatsAppShare = (exportData: any[]) => {
    let text = "🏢 *Resumen de Sueldos y Saldos*\n";
    text += "-------------------------------\n";
    exportData.forEach(d => {
      text += `👤 *${d.Nombre}*:\n`;
      text += `Valor Estimativo del mes: ${formatCurrency(d['Valor Estimativo del mes ($)'])}\n`;
      text += `Adelantos: ${formatCurrency(d['Total Adelantos ($)'])}\n`;
      text += `💰 *Adeudado: ${formatCurrency(d['Saldo Adeudado ($)'])}*\n`;
      text += `-------------------------------\n`;
    });
    return text;
  };

  return (
    <div className="animate-fade-in p-6 print:p-0 print:m-0 print:w-full">
      <style type="text/css" media="print">
        {`@page { size: A4 portrait; margin: 0.5cm; } * { font-size: 11px !important; line-height: 1.1 !important; }`}
      </style>
      
      <div className="hidden print:flex justify-between items-center mb-4 border-b-2 border-gray-800 pb-2">
        <p className="!text-[16px] !font-black uppercase tracking-tighter">
          Detalle de adelantos: {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][currentMonth - 1]} {currentYear}
        </p>
        <p className="!text-[12px] font-bold text-gray-600">
          Impreso el: {new Date().toLocaleDateString('es-AR')}
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">
               Personal
             </h1>
             <div className="bg-gray-100 dark:bg-dark-background/50 p-1 rounded-xl flex gap-1 ml-4 print:hidden">
                <button 
                   onClick={() => setActiveTab('sueldos')} 
                   className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'sueldos' ? 'bg-white dark:bg-dark-surface shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                   CONTROL DE SUELDOS
                </button>
                <button 
                   onClick={() => setActiveTab('fichas')} 
                   className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'fichas' ? 'bg-white dark:bg-dark-surface shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                   FICHAS TÉCNICAS
                </button>
             </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión integral de personal, finanzas y legajos.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            icon={<Plus size={18} />} 
            onClick={() => setIsCreateModalOpen(true)}
            className="print:hidden border-red-200 text-red-600 hover:bg-red-50"
          >
            Nuevo Empleado
          </Button>

          {activeTab === 'sueldos' && (
             <>
               <select 
                 value={currentMonth} 
                 onChange={(e) => setCurrentMonth(Number(e.target.value))}
                 className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none print:hidden shadow-sm"
               >
                 {[
                   { m: 1, name: 'Enero' }, { m: 2, name: 'Febrero' }, { m: 3, name: 'Marzo' }, { m: 4, name: 'Abril' },
                   { m: 5, name: 'Mayo' }, { m: 6, name: 'Junio' }, { m: 7, name: 'Julio' }, { m: 8, name: 'Agosto' },
                   { m: 9, name: 'Septiembre' }, { m: 10, name: 'Octubre' }, { m: 11, name: 'Noviembre' }, { m: 12, name: 'Diciembre' }
                 ].map(mes => (
                   <option key={mes.m} value={mes.m}>{mes.name} {currentYear}</option>
                 ))}
               </select>

               <ExportMenu 
                 data={getExportData()} 
                 filename={`Sueldos_${currentMonth}_${currentYear}`}
                 formatWhatsAppShare={formatWhatsAppShare}
               />
             </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="col-span-full py-20 text-center animate-pulse">Cargando datos...</div>
        </div>
      ) : (
        activeTab === 'sueldos' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4 print:text-sm">
            {employees.map((emp) => (
              <EmployeeCard 
                key={emp.id} 
                employee={emp} 
                formatCurrency={formatCurrency}
                onAddAdvance={setSelectedEmployeeForAdvance}
                onDeleteAdvance={handleDeleteAdvance}
                onUpdateSalary={handleUpdateSalary}
                onUpdateEmployee={handleUpdateEmployee}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden shadow-sm">
             <div className="p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-background/20 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">Listado de Legajos Técnicos</h3>
                  <p className="text-[10px] text-gray-500 font-medium">Información de contacto, CUIL y seguridad del sistema.</p>
                </div>
                <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-gray-200">{employees.length} INTEGRANTES</span>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-gray-50 dark:bg-dark-background/50 border-b border-gray-100 dark:border-dark-border text-[10px] font-black uppercase text-gray-400">
                      <tr>
                         <th className="px-6 py-4">Integrante / Área</th>
                         <th className="px-6 py-4">CUIL / DNI</th>
                         <th className="px-6 py-4">Contacto</th>
                         <th className="px-6 py-4">Acceso Sistema</th>
                         <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                      {employees.map((emp: any) => (
                         <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-dark-background/20 transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex flex-col">
                                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{emp.name}</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full w-fit mt-1 
                                     ${emp.area === 'TALLER' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 
                                       emp.area === 'ADMIN' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 
                                       emp.area === 'MOSTRADOR' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' :
                                       'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                     {emp.area || 'TALLER'}
                                  </span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-gray-600">{emp.cuil || '-'}</td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-bold text-gray-700">{emp.phone || '-'}</span>
                                  <span className="text-[10px] text-gray-400 italic truncate max-w-[200px]">{emp.address || '-'}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${emp.username ? 'bg-blue-500' : 'bg-gray-300 animate-pulse'}`}></div>
                                  <span className="text-xs font-black text-blue-600">{emp.username || 'Sin Usuario'}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <Button 
                                  variant="secondary" 
                                  onClick={() => setEditingEmployee(emp)}
                                  className="text-[10px] font-black uppercase py-1 px-4 border-gray-200 hover:bg-gray-50 flex items-center gap-1 ml-auto"
                               >
                                  <Settings size={12} /> Editar Ficha
                               </Button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )
      )}

      <AdvanceModal 
        isOpen={!!selectedEmployeeForAdvance}
        employee={selectedEmployeeForAdvance}
        onClose={() => setSelectedEmployeeForAdvance(null)}
        onSubmit={handleCreateAdvance}
      />

      <div className="hidden print:block fixed bottom-4 right-4 opacity-50 text-[10px] font-mono border border-gray-400 p-2 rounded italic">
        SISTEMA ERP - IMPRESO EL: {new Date().toLocaleDateString('es-AR')} - {new Date().toLocaleTimeString('es-AR')}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-dark-border">
              <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white">
                 <h3 className="text-xl font-black uppercase tracking-tighter">Alta de Personal</h3>
                 <p className="text-white/80 text-xs mt-1">Ingresá los datos básicos del nuevo integrante.</p>
              </div>
              <form onSubmit={async (e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 await handleCreateEmployee({
                    name: formData.get('name'),
                    cuil: formData.get('cuil'),
                    address: formData.get('address'),
                    phone: formData.get('phone'),
                    area: formData.get('area'),
                    payType: formData.get('payType'),
                    baseSalary: Number(formData.get('salary')),
                    username: formData.get('username'),
                    password: formData.get('password')
                 });
                 setIsCreateModalOpen(false);
              }} className="p-6 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Nombre y Apellido</label>
                    <input name="name" required className="w-full bg-gray-50 dark:bg-dark-background border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200 dark:ring-dark-border focus:ring-2 focus:ring-red-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">CUIL / DNI</label>
                      <input name="cuil" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Teléfono</label>
                      <input name="phone" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200" />
                   </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Dirección Particular</label>
                    <input name="address" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Área</label>
                      <select name="area" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200">
                         <option value="TALLER">TALLER</option>
                         <option value="MOSTRADOR">MOSTRADOR</option>
                         <option value="ADMIN">ADMIN</option>
                         <option value="VENTAS">VENTAS</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Tipo Pago</label>
                      <select name="payType" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200">
                         <option value="MONTHLY">Mensual</option>
                         <option value="BIWEEKLY">Quincenal</option>
                      </select>
                   </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Sueldo / Valor Base ($)</label>
                    <input name="salary" type="number" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200" />
                 </div>
                 
                 <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                    <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Credenciales para el ERP</h5>
                    <div className="grid grid-cols-2 gap-3">
                       <input name="username" placeholder="Usuario" className="w-full p-2 rounded-lg border border-blue-200 text-xs font-bold" />
                       <input name="password" type="password" placeholder="Clave" className="w-full p-2 rounded-lg border border-blue-200 text-xs font-bold" />
                    </div>
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="submit" className="flex-1 bg-gray-900 text-white p-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition">Crear Ficha</button>
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold text-xs uppercase">Cerrar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {editingEmployee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-dark-border">
              <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Editar Legajo</h3>
                    <p className="text-white/60 text-xs mt-1">Actualizando datos de {editingEmployee.name}</p>
                 </div>
                 <button onClick={() => setEditingEmployee(null)} className="text-white/40 hover:text-white">
                    <Plus size={24} className="rotate-45" />
                 </button>
              </div>
              <form onSubmit={async (e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 await handleUpdateEmployee(editingEmployee.id, {
                    name: formData.get('name'),
                    cuil: formData.get('cuil'),
                    address: formData.get('address'),
                    phone: formData.get('phone'),
                    area: formData.get('area'),
                    payType: formData.get('payType'),
                    baseSalary: Number(formData.get('salary')),
                    username: formData.get('username'),
                    password: formData.get('password')
                 });
                 setEditingEmployee(null);
              }} className="p-6 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Nombre y Apellido</label>
                    <input name="name" defaultValue={editingEmployee.name} required className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">CUIL / DNI</label>
                      <input name="cuil" defaultValue={editingEmployee.cuil || ''} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Teléfono</label>
                      <input name="phone" defaultValue={editingEmployee.phone || ''} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200" />
                   </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Dirección Particular</label>
                    <input name="address" defaultValue={editingEmployee.address || ''} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Área</label>
                      <select name="area" defaultValue={editingEmployee.area} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200">
                         <option value="TALLER">TALLER</option>
                         <option value="MOSTRADOR">MOSTRADOR</option>
                         <option value="ADMIN">ADMIN</option>
                         <option value="VENTAS">VENTAS</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Tipo Pago</label>
                      <select name="payType" defaultValue={editingEmployee.payType} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200">
                         <option value="MONTHLY">Mensual</option>
                         <option value="BIWEEKLY">Quincenal</option>
                      </select>
                   </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Sueldo / Valor Base ($)</label>
                    <input name="salary" defaultValue={editingEmployee.salaryPeriods?.[0]?.baseSalary || 0} type="number" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-gray-200" />
                 </div>
                 
                 <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-3">
                    <h5 className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Credenciales para el ERP</h5>
                    <div className="grid grid-cols-2 gap-3">
                       <input name="username" defaultValue={editingEmployee.username || ''} placeholder="Usuario" className="w-full p-2 rounded-lg border border-orange-200 text-xs font-bold" />
                       <input name="password" defaultValue={editingEmployee.password || ''} type="password" placeholder="Clave" className="w-full p-2 rounded-lg border border-orange-200 text-xs font-bold" />
                    </div>
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition">Guardar Cambios</button>
                    <button type="button" onClick={() => setEditingEmployee(null)} className="px-6 py-3 text-gray-500 font-bold text-xs uppercase">Cerrar</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
