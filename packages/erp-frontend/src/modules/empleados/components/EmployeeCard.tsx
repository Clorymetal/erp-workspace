import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../core/components/Button';
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface EmployeeCardProps {
  employee: any;
  onAddAdvance: (employee: any) => void;
  onDeleteAdvance: (advanceId: number) => void;
  onUpdateSalary: (periodId: number, data: any) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onAddAdvance, onDeleteAdvance, onUpdateSalary, formatCurrency }) => {
  const period = employee.salaryPeriods[0];
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isEditingSalary, setIsEditingSalary] = React.useState(false);
  const [editData, setEditData] = React.useState({
    salary: period?.baseSalary || 0,
    first: period?.firstInstallment || 0,
    second: period?.secondInstallment || 0
  });
  
  if (!period) return null; // Si no hay período activo, no mostrar.
  
  const isBiWeekly = employee.payType === 'BIWEEKLY';

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const periodMonthName = monthNames[period.periodMonth - 1] || 'Mes';
  const shortYear = period.periodYear ? period.periodYear.toString().slice(-2) : '';
  const isCancelled = period.balance <= 0;
  
  let headerBg = "bg-gradient-to-r from-red-600 to-red-500";
  let statusText = `Se Adeuda parte de ${periodMonthName} '${shortYear}`;

  if (isCancelled) {
    headerBg = "bg-gradient-to-r from-emerald-600 to-emerald-500";
    statusText = `${periodMonthName} '${shortYear} Cancelado`;
  } else if (isBiWeekly && period.firstInstallment && period.totalAdvances >= period.firstInstallment) {
    headerBg = "bg-gradient-to-r from-amber-500 to-orange-500";
    statusText = `1ra Quinc. Cancelada - Adeuda 2da`;
  }

  const handleSaveSalary = async () => {
    await onUpdateSalary(period.id, {
      salary: Number(editData.salary),
      firstInstallment: isBiWeekly ? Number(editData.first) : undefined,
      secondInstallment: isBiWeekly ? Number(editData.second) : undefined
    });
    setIsEditingSalary(false);
  };

  return (
    <motion.div 
      layout
      className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden transition-all hover:shadow-md print:break-inside-avoid print:shadow-none print:border-gray-300 print:mb-2 print:rounded-none [-webkit-print-color-adjust:exact] [color-adjust:exact]"
    >
      {/* Header (Nombre + Mes) */}
      <div className={`${headerBg} text-white p-3 print:p-1.5 flex justify-between items-center text-sm print:text-[12px] font-semibold shadow-inner transition-colors`}>
        <div className="flex flex-col">
          <span className="text-lg tracking-wide leading-tight">{employee.name}</span>
          <span className="text-[10px] opacity-75 font-normal uppercase tracking-wider">{isBiWeekly ? 'Quincenal' : 'Mensual'}</span>
        </div>
        <span className="opacity-90 font-medium">{statusText}</span>
      </div>

      <div className="p-4 print:p-1.5 space-y-4 print:space-y-1">
        {/* Resumen Principal */}
        <div className="grid grid-cols-2 gap-4 print:gap-1.5">
          <div className="p-3 print:p-1 bg-gray-50 dark:bg-dark-background/50 rounded-xl print:rounded border border-gray-100 dark:border-dark-border relative group">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1 print:mb-0 font-medium tracking-tight whitespace-nowrap">Sueldo Aproximado Mensual</span>
            {isEditingSalary ? (
              <input 
                type="number"
                value={editData.salary}
                onChange={(e) => setEditData({...editData, salary: Number(e.target.value)})}
                className="w-full bg-white dark:bg-dark-surface border border-blue-500 rounded px-1 text-lg font-bold"
                autoFocus
              />
            ) : (
              <span className="text-lg print:text-sm font-bold text-gray-800 dark:text-gray-100">{formatCurrency(period.baseSalary)}</span>
            )}
            {!isEditingSalary && (
              <button 
                onClick={() => setIsEditingSalary(true)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 print:hidden"
              >
                <Plus size={14} className="rotate-45" /> {/* Icono de editar manual rapido o usar Editar texto */}
                <span className="text-[10px] underline ml-1">Editar</span>
              </button>
            )}
          </div>
          <div className="p-3 print:p-1 bg-orange-50 dark:bg-orange-900/20 rounded-xl print:rounded border border-orange-100 dark:border-orange-800/30">
            <span className="text-xs text-orange-600 dark:text-orange-400 block mb-1 print:mb-0 font-medium tracking-tight">Adelantos Tot.</span>
            <span className="text-lg print:text-sm font-bold text-orange-700 dark:text-orange-300">{formatCurrency(period.totalAdvances)}</span>
          </div>
        </div>

        {/* Info Quincenal Condicional */}
        {isBiWeekly && (
          <div className="p-3 print:p-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl print:rounded border border-indigo-100 dark:border-indigo-800/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Distribución Quincenal</span>
              {isEditingSalary && <span className="text-[10px] text-indigo-500 italic">Puedes ajustar los montos</span>}
            </div>
            <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs block mb-1 print:mb-0 text-indigo-700 tracking-tight">1ra Quincena</span>
                  {isEditingSalary ? (
                    <input 
                      type="number"
                      value={editData.first}
                      onChange={(e) => setEditData({...editData, first: Number(e.target.value)})}
                      className="w-24 bg-white dark:bg-dark-surface border border-indigo-300 rounded px-1 text-sm font-semibold"
                    />
                  ) : (
                    <span className="font-semibold print:text-[11px] text-indigo-900">{formatCurrency(period.firstInstallment || 0)}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs block mb-1 print:mb-0 text-indigo-700 tracking-tight">2da Quincena</span>
                  {isEditingSalary ? (
                    <input 
                      type="number"
                      value={editData.second}
                      onChange={(e) => setEditData({...editData, second: Number(e.target.value)})}
                      className="w-24 bg-white dark:bg-dark-surface border border-indigo-300 rounded px-1 text-sm font-semibold text-right"
                    />
                  ) : (
                    <span className="font-semibold print:text-[11px] text-indigo-900">{formatCurrency(period.secondInstallment || 0)}</span>
                  )}
                </div>
            </div>
          </div>
        )}

        {isEditingSalary && (
          <div className="flex gap-2 pt-2">
            <button 
              onClick={handleSaveSalary}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-bold hover:bg-blue-700 transition shadow-sm"
            >
              Guardar Cambios
            </button>
            <button 
              onClick={() => {
                setIsEditingSalary(false);
                setEditData({
                  salary: period.baseSalary,
                  first: period.firstInstallment || 0,
                  second: period.secondInstallment || 0
                });
              }}
              className="px-4 bg-gray-100 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Saldo Final */}
        <div className="mt-4 print:mt-1 pt-4 print:pt-1 border-t border-gray-100 print:border-gray-300 dark:border-dark-border pb-2 flex justify-between items-end">
          <div>
            <span className="text-sm print:text-[11px] text-gray-600 dark:text-gray-400 block mb-1 print:mb-0">Saldo Adeudado:</span>
            <span className="text-2xl print:text-sm font-black text-green-600 dark:text-green-400">
              {formatCurrency(period.balance)}
            </span>
          </div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => onAddAdvance(employee)}>
            Adelanto
          </Button>
        </div>

        {/* Expandir Historial de Adelantos */}
        {period.advances && period.advances.length > 0 && (
          <div className="mt-2">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 py-2 bg-gray-50 dark:bg-dark-background/50 rounded-lg transition print:hidden"
            >
              {isExpanded ? <><ChevronUp size={14}/> Ocultar historial</> : <><ChevronDown size={14}/> Ver {period.advances.length} adelanto(s)</>}
            </button>

            <motion.div 
              initial={false}
              animate={{ 
                height: isExpanded ? 'auto' : 0, 
                opacity: isExpanded ? 1 : 0 
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden print:!h-auto print:!opacity-100 print:!overflow-visible"
            >
              <div className="pt-3 print:pt-0">
                <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-100 dark:bg-dark-background uppercase text-gray-500 dark:text-gray-400 print:bg-gray-200">
                    <tr>
                        <th className="px-2 py-2 print:px-1 print:py-0.5 rounded-l-lg print:rounded-none tracking-tight">Fecha</th>
                        <th className="px-2 py-2 print:px-1 print:py-0.5 tracking-tight">Efectivo</th>
                        <th className="px-2 py-2 print:px-1 print:py-0.5 tracking-tight">Transf.</th>
                        <th className="px-2 py-2 print:px-1 print:py-0.5 tracking-tight">Cheque</th>
                        <th className="px-2 py-2 print:px-1 print:py-0.5 tracking-tight">Saldo</th>
                        <th className="px-2 py-2 rounded-r-lg print:hidden w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {period.advances.map((adv: any) => (
                        <tr key={adv.id} className="border-b border-gray-50 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-background/50 transition print:break-inside-avoid print:border-gray-200">
                          <td className="px-2 py-2 print:px-1 print:py-0.5 font-medium whitespace-nowrap">{new Date(adv.date).toLocaleDateString('es-AR', {day: '2-digit', month: 'short'})}</td>
                          <td className="px-2 py-2 print:px-1 print:py-0.5 text-green-600 print:text-green-800">{adv.cashAmount > 0 ? formatCurrency(adv.cashAmount) : '-'}</td>
                          <td className="px-2 py-2 print:px-1 print:py-0.5 text-blue-600 print:text-blue-800">{adv.transferAmount > 0 ? formatCurrency(adv.transferAmount) : '-'}</td>
                          <td className="px-2 py-2 print:px-1 print:py-0.5 text-purple-600 print:text-purple-800">{adv.checkAmount > 0 ? formatCurrency(adv.checkAmount) : '-'}</td>
                          <td className="px-2 py-2 print:px-1 print:py-0.5 font-bold print:text-black">{formatCurrency(adv.balance)}</td>
                          <td className="px-2 py-2 print:hidden text-right">
                            <button 
                              onClick={() => onDeleteAdvance(adv.id)}
                              className="text-red-400 hover:text-red-600 transition-colors p-1 bg-red-50 hover:bg-red-100 rounded-md"
                              title="Eliminar adelanto"
                            >
                              <Trash2 size={14} />
                            </button>
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
    </motion.div>
  );
};
