import React from 'react';
import { Package, ShieldCheck, Database, LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const assets = [
    { id: '1', name: 'Servidor Dell R740', category: 'IT', status: 'Activo', value: '$5,000' },
    { id: '2', name: 'Licencia Oracle v19', category: 'Software', status: 'En Auditoría', value: '$12,000' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <ShieldCheck className="text-blue-400" /> AssetGuard
        </h1>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-blue-400"><LayoutDashboard size={20}/> Dashboard</div>
          <div className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer"><Package size={20}/> Inventario</div>
          <div className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer"><Database size={20}/> Auditoría (Mongo)</div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Panel de Control de Activos</h2>
          <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
            Sistema Online (AWS RDS)
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Activo</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Categoría</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">#{asset.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{asset.category}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-bold">{asset.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}