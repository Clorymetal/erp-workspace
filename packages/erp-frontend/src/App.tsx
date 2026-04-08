import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Layout } from './core/layout/Layout';
import { AuthProvider, useAuth } from './core/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    },
  },
});

import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { ProveedoresPage } from './modules/proveedores/pages/ProveedoresPage';
import { ComprasPage } from './modules/proveedores/pages/ComprasPage';
import { LibroIvaComprasPage } from './modules/proveedores/pages/LibroIvaComprasPage';
import { ResumenDeudaPage } from './modules/proveedores/pages/ResumenDeudaPage';
import ParametersPage from './modules/configuracion/pages/ParametersPage';
import { EmpleadosPage } from './modules/empleados/EmpleadosPage';
import { LoginPage } from './modules/auth/pages/LoginPage';

// Recuperar Client ID de las variables de entorno de Vite
// Si no existe, usamos uno de prueba (debe ser cambiado tras el setup en Google Cloud Console)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "erp-clorymetal-placeholder.apps.googleusercontent.com";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="proveedores" element={<ProveedoresPage />} />
                  <Route path="compras" element={<ComprasPage />} />
                  <Route path="resumen-deuda" element={<ResumenDeudaPage />} />
                  <Route path="libro-iva" element={<LibroIvaComprasPage />} />
                  <Route path="parametros" element={<ParametersPage />} />
                  <Route path="empleados" element={<EmpleadosPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
