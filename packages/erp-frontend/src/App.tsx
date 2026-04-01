import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './core/layout/Layout';

import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { ProveedoresPage } from './modules/proveedores/pages/ProveedoresPage';
import { ComprasPage } from './modules/proveedores/pages/ComprasPage';
import ParametersPage from './modules/configuracion/pages/ParametersPage';
import { EmpleadosPage } from './modules/empleados/EmpleadosPage';
// Placeholder: 404
const NotFound = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
    <h2 className="text-2xl font-semibold mb-2">404 - No Encontrado</h2>
    <p className="text-gray-500">El módulo que buscas no existe o está en construcción.</p>
  </div>
);

function App() {
  // Inicialización básica de Dark Mode (luego se puede delegar a un contexto)
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="proveedores" element={<ProveedoresPage />} />
          <Route path="compras" element={<ComprasPage />} />
          <Route path="parametros" element={<ParametersPage />} />
          <Route path="empleados" element={<EmpleadosPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
