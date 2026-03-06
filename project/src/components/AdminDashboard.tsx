import { X, Package, Users, ChartBar as BarChart3, FolderTree } from 'lucide-react';
import { useState } from 'react';
import { AdminProductManagement } from './AdminProductManagement';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminStockManagement } from './AdminStockManagement';
import { AdminCategoryManagement } from './AdminCategoryManagement';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'products' | 'categories' | 'stock' | 'users';

export function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('products');

  if (!isOpen) return null;

  const tabs = [
    { id: 'products' as TabType, label: 'Products', icon: Package },
    { id: 'categories' as TabType, label: 'Categories', icon: FolderTree },
    { id: 'stock' as TabType, label: 'Stock', icon: BarChart3 },
    { id: 'users' as TabType, label: 'Users', icon: Users },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="border-b">
          <div className="flex space-x-1 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'products' && (
            <AdminProductManagement isOpen={true} onClose={onClose} />
          )}
          {activeTab === 'categories' && (
            <AdminCategoryManagement isOpen={true} onClose={onClose} />
          )}
          {activeTab === 'stock' && (
            <AdminStockManagement isOpen={true} onClose={onClose} />
          )}
          {activeTab === 'users' && (
            <AdminUserManagement isOpen={true} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
