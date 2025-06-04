
import React from 'react';
import { SecureLoginForm } from '@/components/auth/SecureLoginForm';
import { SecureAuthGuard } from '@/components/auth/SecureAuthGuard';
import { useNavigate } from 'react-router-dom';

export default function SecureLogin() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <SecureAuthGuard requireAuth={false}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CraniumCare Clinic
            </h1>
            <p className="text-gray-600">
              Sistema Seguro de Gestão Craniana
            </p>
          </div>
          
          <SecureLoginForm onSuccess={handleLoginSuccess} />
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Sistema protegido com autenticação segura e auditoria completa</p>
          </div>
        </div>
      </div>
    </SecureAuthGuard>
  );
}
