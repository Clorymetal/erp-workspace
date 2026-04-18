import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../core/components/Button';
import { Plus, ChevronDown, ChevronUp, Trash2, Settings, User, Briefcase, Check } from 'lucide-react';

interface EmployeeCardProps {
  employee: any;
  onAddAdvance: (employee: any) => void;
  onDeleteAdvance: (advanceId: number) => void;
  onUpdateSalary: (periodId: number, data: any) => Promise<void>;
  onUpdateEmployee: (id: number, data: any) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  onAddAdvance, 
  onDeleteAdvance, 
  onUpdateSalary, 
  onUpdateEmployee,
  formatCurrency 
}) => {
  const period = employee.salaryPeriods[0];
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isEditingSalary, setIsEditingSalary] = React.useState(false);
  const [isEditingInfo, setIsEditingInfo] = React.useState(false);
  
  const [editData, setEditData] = React.useState({
    salary: period?.baseSalary || 0,
    first: period?.firstInstallment || 0,
    second: period?.secondInstallment || 0
  });

  const [empData, setEmpData] = React.useState({
    name: employee.name,
    cuil: employee.cuil || '',
    address: employee.address || '',
    phone: employee.phone || '',
    area: employee.area || 'TALLER',
    payType: employee.payType,
    username: employee.username || '',
    password: employee.password || '',
    isActive: employee.isActive
  });
  
  if (!period) return null;
  
  const isBiWeekly = employee.payType === 'BIWEEKLY';
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const periodMonthName = monthNames[period.periodMonth - 1] || 'Mes';
  const shortYear = period.periodYear ? period.periodYear.toString().slice(-2) : '';
  const isCancelled = period.balance <= 0;
  
  let headerBg = "bg-gradient-to-r from-red-600 to-red-500";
  let statusText = `Adeuda ${periodMonthName} '${shortYear}`;

  if (isCancelled) {
    headerBg = "bg-gradient-to-r from-emerald-600 to-emerald-500";
    statusText = `${periodMonthName} '${shortYear} OK`;
  } else if (isBiWeekly && period.firstInstallment && period.totalAdvances >= period.firstInstallment) {
    headerBg = "bg-gradient-to-r from-amber-500 to-orange-500";
    statusText = `1ra Quinc. OK`;
  }

  const handleSaveSalary = async () => {
    await onUpdateSalary(period.id, {
      salary: Number(editData.salary),
      firstInstallment: isBiWeekly ? Number(editData.first) : undefined,
      secondInstallment: isBiWeekly ? Number(editData.second) : undefined
    });
    setIsEditingSalary(false);
  };

  const handleSaveInfo = async () => {
    await onUpdateEmployee(employee.id, empData);
    setIsEditingInfo(false);
  };

  return (
    <motion.div 
      layout
      className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className={`${headerBg} text-white p-3 flex justify-between items-center text-sm font-semibold`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg tracking-wide leading-tight">{employee.name}</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[9px] uppercase font-black">{employee.area || 'ADMIN'}</span>
          </div>
          <span className="text-[10px] opacity-75 font-normal uppercase tracking-wider print:hidden">{isBiWeekly ? 'Quincenal' : 'Mensual'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-90 font-medium">{statusText}</span>
          <button onClick={() => setIsEditingInfo(!isEditingInfo)} className="p-1 hover:bg-black/10 rounded transition-colors print:hidden">
            <Settings size={14} />
          </button>
        </div>
      </div>

      {isEditingInfo ? (
        <div className="p-6 bg-gray-50 dark:bg-dark-background/30 border-b border-gray-100 space-y-4">
           <h4 className="text-xs font-black uppercase text-gray-400 mb-4 flex items-center gap-2">
              <Settings size={14} /> Editar Información Básica
           </h4>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre</label>
                 <input value={empData.name} onChange={e => setEmpData({...empData, name: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-bold" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">CUIL</label>
                 <input value={empData.cuil} onChange={e => setEmpData({...empData, cuil: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-bold" />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Teléfono</label>
                 <input value={empData.phone} onChange={e => setEmpData({...empData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-bold" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Dirección</label>
                 <input value={empData.address} onChange={e => setEmpData({...empData, address: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-bold" />
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Área</label>
              <select value={empData.area} onChange={e => setEmpData({...empData, area: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm font-bold">
                 <option value="TALLER">TALLER</option>
                 <option value="ADMIN">ADMINISTRACIÓN</option>
                 <option value="MOSTRADOR">MOSTRADOR</option>
                 <option value="VENTAS">LOGÍSTICA</option>
              </select>
           </div>
           <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-blue-600 uppercase">Usuario</label>
                 <input value={empData.username} onChange={e => setEmpData({...empData, username: e.target.value})} className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm font-bold" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-blue-600 uppercase">Contraseña</label>
                 <input type="password" value={empData.password} onChange={e => setEmpData({...empData, password: e.target.value})} className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm font-bold" />
              </div>
           </div>
           <div className="flex gap-2">
              <button onClick={handleSaveInfo} className="flex-1 bg-gray-900 text-white rounded-xl py-2.5 text-xs font-black uppercase tracking-wider">Guardar Cambios</button>
              <button onClick={() => setIsEditingInfo(false)} className="px-4 bg-white border border-gray-200 text-gray-500 rounded-xl py-2.5 text-xs font-bold">Cancelar</button>
           </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Resumen Salarial */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 relative group print:hidden">
              <span className="text-xs text-gray-500 block mb-1 font-medium">Sueldo Base Estimado</span>
              {isEditingSalary ? (
                <input 
                  type="number"
                  value={editData.salary}
                  onChange={(e) => setEditData({...editData, salary: Number(e.target.value)})}
                  className="w-full border border-blue-500 rounded px-1 text-lg font-bold"
                  autoFocus
                />
              ) : (
                <span className="text-lg font-bold text-gray-800">{formatCurrency(period.baseSalary)}</span>
              )}
              {!isEditingSalary && (
                <button onClick={() => setIsEditingSalary(true)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                  <Plus size={14} className="rotate-45" />
                </button>
              )}
            </div>
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 print:col-span-2">
              <span className="text-xs text-orange-600 block mb-1 font-medium">Adelantos Tot.</span>
              <span className="text-lg font-bold text-orange-700">{formatCurrency(period.totalAdvances)}</span>
            </div>
          </div>

          {isBiWeekly && (
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 print:hidden">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Quincenas</span>
              </div>
              <div className="flex justify-between">
                  <div>
                    <span className="text-[10px] block text-indigo-700">1ra Q.</span>
                    <span className="font-bold text-indigo-900">{formatCurrency(period.firstInstallment || 0)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] block text-indigo-700">2da Q.</span>
                    <span className="font-bold text-indigo-900">{formatCurrency(period.secondInstallment || 0)}</span>
                  </div>
              </div>
            </div>
          )}

          {isEditingSalary && (
            <div className="flex gap-2">
              <button onClick={handleSaveSalary} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-bold shadow-sm">Guardar Sueldo</button>
              <button onClick={() => setIsEditingSalary(false)} className="px-4 bg-gray-100 text-gray-600 rounded-lg py-2 text-sm font-medium">Cancelar</button>
            </div>
          )}

          {/* Saldo y Acción */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-end">
            <div>
              <span className="text-xs text-gray-600 block mb-1">Saldo Adeudado:</span>
              <span className="text-2xl font-black text-green-600">{formatCurrency(period.balance)}</span>
            </div>
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => onAddAdvance(employee)} className="print:hidden">Adelanto</Button>
          </div>

          {/* Historial */}
          {period.advances && period.advances.length > 0 && (
            <div className="mt-2 print:hidden">
              <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 py-2 bg-gray-50 rounded-lg">
                {isExpanded ? <><ChevronUp size={14}/> Ocultar adelantos</> : <><ChevronDown size={14}/> Ver {period.advances.length} adelanto(s)</>}
              </button>

              <motion.div 
                initial={false}
                animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100 uppercase text-gray-500">
                      <tr>
                        <th className="px-2 py-2">Fecha</th>
                        <th className="px-2 py-2">Efectivo</th>
                        <th className="px-2 py-2">Transf.</th>
                        <th className="px-2 py-2">Cheque</th>
                        <th className="px-2 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {period.advances.map((adv: any) => (
                        <tr key={adv.id} className="border-b border-gray-50 text-gray-600">
                          <td className="px-2 py-2 font-medium">{new Date(adv.date).toLocaleDateString('es-AR')}</td>
                          <td className="px-2 py-2 text-green-600">{adv.cashAmount > 0 ? formatCurrency(adv.cashAmount) : '-'}</td>
                          <td className="px-2 py-2 text-blue-600">{adv.transferAmount > 0 ? formatCurrency(adv.transferAmount) : '-'}</td>
                          <td className="px-2 py-2 text-purple-600">{adv.checkAmount > 0 ? formatCurrency(adv.checkAmount) : '-'}</td>
                          <td className="px-2 py-2 text-right">
                            <button onClick={() => onDeleteAdvance(adv.id)} className="text-red-400 hover:text-red-700 p-1 bg-red-50 rounded-md"><Trash2 size={12} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
