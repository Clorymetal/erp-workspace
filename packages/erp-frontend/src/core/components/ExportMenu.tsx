import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Share2, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from './Button';

interface ExportMenuProps {
  data: any[];
  filename: string;
  columnsToExport?: { key: string; header: string }[];
  whatsappText?: string;
  formatWhatsAppShare?: (data: any[]) => string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ 
  data, 
  filename, 
  columnsToExport,
  whatsappText = 'Mirá este reporte del sistema',
  formatWhatsAppShare
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportCSV = () => {
    // Add UTF-8 BOM for Excel compatibility
    let csvContent = "\uFEFF";
    const headers = columnsToExport ? columnsToExport.map(c => c.header) : Object.keys(data[0] || {});
    csvContent += headers.join(";") + "\n";

    data.forEach(row => {
      const rowData = columnsToExport 
        ? columnsToExport.map(c => row[c.key])
        : Object.values(row);
      csvContent += rowData.map(d => `"${String(d || '').replace(/"/g, '""')}"`).join(";") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    // We'll trust the global print CSS to hide sidebar/filters
    window.print();
    setIsOpen(false);
  };

  const handleWhatsAppShare = () => {
    let summary = whatsappText;
    
    if (formatWhatsAppShare) {
      summary = formatWhatsAppShare(data);
    } else {
      // Fallback genérico para no romper vistas anteriores
      summary += "\n\nResumen de saldos:\n";
      const withDebt = data.filter(d => (d.saldo || d.balance) > 0).sort((a,b) => (b.saldo || b.balance) - (a.saldo || a.balance)).slice(0, 5);
      
      withDebt.forEach(p => {
        const name = p.razonSocial || p.name || 'Entidad';
        const amount = p.saldo || p.balance || 0;
        summary += `- ${name}: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount)}\n`;
      });
    }

    const text = encodeURIComponent(summary);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <Button 
        variant="outline" 
        icon={<Download size={18} />} 
        onClick={() => setIsOpen(!isOpen)}
      >
        Exportar
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-lg overflow-hidden z-30"
          >
            <div className="py-1 flex flex-col">
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-background/50 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <FileSpreadsheet size={16} /> Excel / CSV
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-background/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <FileText size={16} /> Formato PDF
              </button>
              <div className="border-t border-gray-100 dark:border-dark-border my-1"></div>
              <button 
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-background/50 hover:text-green-500 dark:hover:text-green-400 transition-colors"
              >
                <Share2 size={16} />  WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Backdrop invisible para cerrar al hacer click afuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
