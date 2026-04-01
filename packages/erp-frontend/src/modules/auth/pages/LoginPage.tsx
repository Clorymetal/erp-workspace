import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../../core/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, LayoutDashboard } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const handleSuccess = (response: any) => {
    if (response.credential) {
      login(response.credential);
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
    alert('Hubo un error al intentar iniciar sesión con Google.');
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
        <p className="text-gray-500 mb-8">Gestión operativa centralizada con seguridad empresarial.</p>

        <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-2xl mb-8 flex items-center gap-3 text-left">
          <ShieldCheck className="text-primary-500 shrink-0" size={24} />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Acceso restringido. Por favor, identifícate con tu cuenta corporativa para continuar.
          </p>
        </div>

        <div className="flex justify-center flex-col items-center gap-4">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme="filled_blue"
            shape="pill"
            size="large"
            text="signin_with"
          />
          <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">Powered by Antigravity AI</p>
        </div>
      </motion.div>
    </div>
  );
};
