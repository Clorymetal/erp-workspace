import React, { useState } from 'react';
import { ExportMenu } from '../../core/components/ExportMenu';
import { EmployeeCard } from './components/EmployeeCard';
import { AdvanceModal } from './components/AdvanceModal';
import { useEmployees } from './hooks/useEmployees';

export const EmpleadosPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(3);
  const [currentYear] = useState(2026);
  const [selectedEmployeeForAdvance, setSelectedEmployeeForAdvance] = useState<any>(null);

  const {
    employees,
    isLoading,
    createAdvance,
    deleteAdvance,
    updateSalary
  } = useEmployees(currentYear, currentMonth);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const handleCreateAdvance = async (advanceData: any) => {
    try {
      await createAdvance(advanceData);
    } catch(e) {
      alert("Error al guardar anticipo");
    }
  };

  const handleDeleteAdvance = async (advanceId: number) => {
    if(!window.confirm('¿Seguro que deseas eliminar este adelanto? Paff, el saldo se recalculará automáticamente.')) return;
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

  // Preparación de data para los reportes de Excel/PDF.
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
      
      {/* Título sólo para impresión */}
      <div className="hidden print:block mb-4 border-b border-gray-400 pb-1">
        <h1 className="text-sm font-bold">
          Detalle de adelantos al {' '}
          <span className="capitalize">{new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(new Date())}</span> {' '}
          {new Date().getDate().toString().padStart(2, '0')} / {' '}
          {(new Date().getMonth() + 1).toString().padStart(2, '0')} / {' '}
          {new Date().getFullYear()}
        </h1>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">
            Control de Empleados
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión de sueldos, adelantos y saldos.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Selector de Mes */}
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

          {/* Acciones de Exportación */}
          <ExportMenu 
            data={getExportData()} 
            filename={`Sueldos_${currentMonth}_${currentYear}`}
            formatWhatsAppShare={formatWhatsAppShare}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-64 bg-gray-100 dark:bg-dark-surface animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4 print:text-sm">
          {employees.map((emp) => (
            <EmployeeCard 
              key={emp.id} 
              employee={emp} 
              formatCurrency={formatCurrency}
              onAddAdvance={setSelectedEmployeeForAdvance}
              onDeleteAdvance={handleDeleteAdvance}
              onUpdateSalary={handleUpdateSalary}
            />
          ))}
        </div>
      )}

      {/* Modal de Registro de Pagos - Formulario Flotante */}
      <AdvanceModal 
        isOpen={!!selectedEmployeeForAdvance}
        employee={selectedEmployeeForAdvance}
        onClose={() => setSelectedEmployeeForAdvance(null)}
        onSubmit={handleCreateAdvance}
      />
    </div>
  );
};
