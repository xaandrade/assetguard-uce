import React, { useEffect, useState } from 'react';
import { Package, ShieldCheck, Database, LayoutDashboard, Loader2 } from 'lucide-react';
import api from '../services/api'; // Asegúrate de haber creado este archivo

// Definimos la interfaz para que TypeScript nos ayude
interface Asset {
  id: string;
  name: string;
  category: string;
  status: string;
  value: string | number;
}

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        // Llamada a tu API Gateway (Puerto 3000)
        // El Gateway redirige al Inventory Service
        const response = await api.get('/inventory');
        setAssets(response.data);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError("No se pudo conectar con los microservicios.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <ShieldCheck className="text-blue-400" /> AssetGuard
        </h1>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-blue-400 font-medium">
            <LayoutDashboard size={20}/> Dashboard
          </div>
          <div className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer transition-colors">
            <Package size={20}/> Inventario
          </div>
          <div className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer transition-colors">
            <Database size={20}/> Auditoría (Mongo)
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Panel de Control de Activos</h2>
            <p className="text-gray-500 text-sm">Visualización en tiempo real de microservicios</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-1 rounded-full text-sm font-medium ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {error ? 'Sistema Offline' : 'Sistema Online (AWS RDS)'}
            </div>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-gray-500 italic">Conectando con Gateway...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-500 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-blue-600 hover:underline text-sm"
              >
                Reintentar conexión
              </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Activo</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assets.length > 0 ? (
                  assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{asset.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{asset.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          asset.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                        {typeof asset.value === 'number' ? `$${asset.value.toLocaleString()}` : asset.value}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                      No se encontraron activos en la base de datos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}