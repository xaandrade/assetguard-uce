import React, { useState } from 'react';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Llamada al Gateway -> /api/auth/login
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });

      // Guardamos el JWT real
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Redirigimos al Dashboard
      window.location.href = '/dashboard';
      
    } catch (err: any) {
      console.error("Error en login:", err);
      const message = err.response?.data?.message || "Error de conexión con el servidor";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
             <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
                <ShieldCheck className="text-white" size={32} />
             </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AssetGuard</h2>
          <p className="text-slate-500 mt-2">Sistema de Gestión de Activos - UCE</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Institucional</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input 
                type="email" 
                required 
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="admin@uce.edu.ec"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input 
                type="password" 
                required 
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-all active:scale-95"
          >
            {isLoading ? (
              <><Loader2 className="animate-spin mr-2" size={20} /> Verificando...</>
            ) : (
              'Entrar al Panel'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
           <span>Gateway: Online</span>
           <span>AWS RDS: Connected</span>
        </div>
      </div>
    </div>
  );
}