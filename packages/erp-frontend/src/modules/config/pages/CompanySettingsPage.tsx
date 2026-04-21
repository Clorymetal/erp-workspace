import { useState, useEffect } from 'react';
import { Save, Building2, Phone, Mail, MapPin, Hash, ShieldCheck } from 'lucide-react';
import { Button } from '../../../core/components';
import { useBusinessConfig } from '../../../core/hooks/useBusinessConfig';

export const CompanySettingsPage = () => {
  const { config, isLoading, updateConfig, isUpdating } = useBusinessConfig();
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    address: '',
    city: '',
    province: '',
    phone: '',
    email: '',
    vatCondition: 'Responsable Inscripto'
  });

  useEffect(() => {
    if (config) {
      setFormData({ ...config });
    }
  }, [config]);

  const handleSave = async () => {
    try {
      await updateConfig(formData);
      alert('Configuración guardada correctamente');
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  if (isLoading) return <div className="p-10 text-center font-bold">Cargando configuración...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-dark-border overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 -translate-y-16 translate-x-16 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-primary-600 mb-2">
            <Building2 size={24} className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Ajustes Globales</span>
          </div>
          <h1 className="text-4xl font-black italic">Datos del Negocio</h1>
          <p className="text-gray-500 mt-2 font-medium">Esta información se utilizará para el membrete de facturas, remitos y órdenes de reparación.</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Save size={20} />} 
          onClick={handleSave} 
          isLoading={isUpdating}
          className="relative z-10"
        >
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {/* Identidad */}
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-md border border-gray-100 dark:border-dark-border flex flex-col gap-6">
          <h2 className="text-lg font-black flex items-center gap-2 border-b pb-4 mb-2 dark:border-dark-border">
            <Building2 className="text-primary-500" size={20} /> Identidad Comercial
          </h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-400">Razón Social</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-3 pl-10 outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-gray-400">CUIT</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  value={formData.taxId} 
                  onChange={e => setFormData({...formData, taxId: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-3 pl-10 outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                  placeholder="30-XXXXXXXX-X"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-gray-400">Condición IVA</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <select 
                   value={formData.vatCondition}
                   onChange={e => setFormData({...formData, vatCondition: e.target.value})}
                   className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-3 pl-10 outline-none focus:ring-2 focus:ring-primary-500 font-bold appearance-none"
                >
                  <option>Responsable Inscripto</option>
                  <option>Monotributista</option>
                  <option>Exento</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-md border border-gray-100 dark:border-dark-border flex flex-col gap-6">
          <h2 className="text-lg font-black flex items-center gap-2 border-b pb-4 mb-2 dark:border-dark-border">
            <Phone className="text-primary-500" size={20} /> Canal de Ventas y Contacto
          </h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-400">Teléfono / WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-3 pl-10 outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                placeholder="Teléfono comercial"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-400">Email de Contacto</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-3 pl-10 outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                placeholder="info@empresa.com"
              />
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-md border border-gray-100 dark:border-dark-border flex flex-col gap-6">
          <h2 className="text-lg font-black flex items-center gap-2 border-b pb-4 mb-2 dark:border-dark-border">
            <MapPin className="text-primary-500" size={20} /> Localización
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-1 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-gray-400">Dirección</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-3 pl-10 outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                  placeholder="Calle y Número"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-gray-400">Ciudad</label>
              <input 
                type="text" 
                value={formData.city} 
                onChange={e => setFormData({...formData, city: e.target.value})}
                className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                placeholder="Localidad"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-gray-400">Provincia</label>
              <input 
                type="text" 
                value={formData.province} 
                onChange={e => setFormData({...formData, province: e.target.value})}
                className="w-full bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                placeholder="Chaco, Formosa, etc."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
