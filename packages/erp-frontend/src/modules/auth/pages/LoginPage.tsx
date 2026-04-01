import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../../core/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, LayoutDashboard, AlertTriangle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSuccess = async (response: any) => {
    if (response.credential) {
      setError(null);
      setIsLoading(true);
      try {
        await login(response.credential);
      } catch (e: any) {
        setError('Error al conectar con el servidor. Verificá que el backend esté activo e intentá de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleError = () => {
    setError('Google rechazó la autenticación. Verificá que el dominio esté autorizado en Google Cloud Console.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 bg-gradient-to-br from-primary-500/5 to-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-dark-surface p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-dark-border text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary-500/10 rounded-2xl">
            <LayoutDashboard size={48} className="text-primary-500" />
          </div>
        </div>

        <h1 className="text-3xl font-black mb-2 text-gray-900 dark:text-gray-100">Clorymetal ERP</h1>
        <p className="text-gray-500 mb-6">Gestión operativa centralizada con seguridad empresarial.</p>

        <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-2xl mb-6 flex items-center gap-3 text-left">
          <ShieldCheck className="text-primary-500 shrink-0" size={24} />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Acceso restringido. Identifícate con tu cuenta de Google corporativa para continuar.
          </p>
        </div>

        {/* Mensaje de error visible */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3 text-left"
            >
              <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center flex-col items-center gap-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-primary-500 py-3">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-medium">Verificando identidad...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_blue"
              shape="pill"
              size="large"
              text="signin_with"
            />
          )}
          <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">Powered by Antigravity AI</p>
        </div>
      </motion.div>
    </div>
  );
};
