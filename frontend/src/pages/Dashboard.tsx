import { useEffect, useState } from 'react';
import { ShieldCheck, Database, LayoutDashboard, Loader2, Clock } from 'lucide-react';
import api from '../services/api';


interface Asset {
  id: string;
  name: string;
  category: string;
  status: string;
  value: string | number;
}

interface AuditLog {
  _id: string;
  event: string;
  userId: string;
  details: any;
  timestamp: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'audit'>('inventory');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'inventory') {
        const response = await api.get('/inventory');
        setAssets(response.data);
      } else {
        const response = await api.get('/audit');
        setAuditLogs(response.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error de conexión con los microservicios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <ShieldCheck className="text-blue-400" /> AssetGuard
        </h1>
        <nav className="space-y-4">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20}/> Inventario
          </button>
          
          <button 
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'audit' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-slate-800'}`}
          >
            <Database size={20}/> Auditoría (Mongo)
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {activeTab === 'inventory' ? 'Gestión de Activos (AWS RDS)' : 'Historial de Auditoría (MongoDB Atlas)'}
            </h2>
            <p className="text-gray-500 text-sm">Arquitectura Hexagonal - Microservicios UCE</p>
          </div>
          <div className={`px-4 py-1 rounded-full text-sm font-medium ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {error ? 'Servicios Offline' : 'Servicios Online'}
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-gray-500 italic">Sincronizando con Gateway...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-500 font-medium">{error}</p>
              <button onClick={fetchData} className="mt-4 text-blue-600 hover:underline text-sm">Reintentar</button>
            </div>
          ) : activeTab === 'inventory' ? (
            
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Activo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">#{asset.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{asset.category}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {asset.status || 'Activo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">${Number(asset.value).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Evento</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock size={14} /> {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700">
                          {log.event}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{log.userId}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                        {JSON.stringify(log.details).substring(0, 50)}...
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">No hay registros de auditoría en MongoDB Atlas.</td>
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