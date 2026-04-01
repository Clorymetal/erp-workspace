import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Sliders } from 'lucide-react';
import { DataTable } from '../../../core/components/DataTable';
import { Modal, Button } from '../../../core/components';
import { API_BASE_URL } from '../../../core/config/apiConfig';

interface Parameter {
  id: string;
  category: string;
  key: string;
  value: string;
  label: string;
  isActive: boolean;
}

const CATEGORIES = [
  { id: 'PROVINCIA', name: 'Provincias' },
  { id: 'COND_FISCAL', name: 'Condiciones Fiscales' },
  { id: 'FACTO_TYPE', name: 'Tipos de Factura' },
  { id: 'ALICUOTA_IVA', name: 'Alícuotas de IVA' },
];

export default function ParametersPage() {
  const [params, setParams] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingParam, setEditingParam] = useState<Parameter | null>(null);

  const [formData, setFormData] = useState({
    category: selectedCategory,
    key: '',
    value: '',
    label: ''
  });

  const fetchParams = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/parametros?category=${selectedCategory}`);
      if (res.ok) {
        const data = await res.json();
        setParams(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParams();
    setFormData(prev => ({ ...prev, category: selectedCategory }));
  }, [selectedCategory]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const url = editingParam ? `${API_BASE_URL}/parametros/${editingParam.id}` : `${API_BASE_URL}/parametros`;
      const method = editingParam ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchParams();
        setIsModalOpen(false);
        setEditingParam(null);
        setFormData({ category: selectedCategory, key: '', value: '', label: '' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que desea eliminar este parámetro?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/parametros/${id}`, { method: 'DELETE' });
      if (res.ok) fetchParams();
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { key: 'label', header: 'Descripción / Etiqueta' },
    { key: 'key', header: 'Código / Clave' },
    { key: 'value', header: 'Valor' },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row: Parameter) => (
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setEditingParam(row);
              setFormData({ category: row.category, key: row.key, value: row.value, label: row.label });
              setIsModalOpen(true);
            }} 
            className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sliders className="text-primary-500" />
            Parámetros del Sistema
          </h1>
          <p className="text-sm text-gray-500">Configura valores globales y definiciones generales del ERP.</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />} 
          onClick={() => {
            setEditingParam(null);
            setFormData({ category: selectedCategory, key: '', value: '', label: '' });
            setIsModalOpen(true);
          }}
        >
          Nuevo Parámetro
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar categories */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 text-left rounded-xl transition-all font-medium ${
                selectedCategory === cat.id 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                  : 'bg-white dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-dark-border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <DataTable 
            data={params} 
            columns={columns} 
            isLoading={loading} 
            emptyMessage={`No hay ${selectedCategory.toLowerCase()} cargadas.`}
          />
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingParam ? "Editar Parámetro" : "Nuevo Parámetro"}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <input type="text" readOnly value={selectedCategory} className="w-full p-2 bg-gray-100 border rounded-lg opacity-60" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Código (Key)</label>
            <input 
              type="text" 
              value={formData.key} 
              onChange={e => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
              className="w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Ej: CBA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor</label>
            <input 
              type="text" 
              value={formData.value} 
              onChange={e => setFormData({ ...formData, value: e.target.value })}
              className="w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Ej: Córdoba"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Etiqueta (Display)</label>
            <input 
              type="text" 
              value={formData.label} 
              onChange={e => setFormData({ ...formData, label: e.target.value })}
              className="w-full p-2 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Ej: Córdoba (CBA)"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
