import { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown } from 'lucide-react';
import { Product } from '../types/database';
import { supabase } from '../lib/supabase';

interface AdminStockManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminStockManagement({
  isOpen,
  onClose,
}: AdminStockManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('stock', { ascending: true });
    if (data) setProducts(data);
    setLoading(false);
  }

  async function handleUpdateStock(productId: string, stock: number) {
    await supabase
      .from('products')
      .update({ stock })
      .eq('product_id', productId);

    setEditingId(null);
    await loadProducts();
  }

  const lowStockProducts = products.filter((p) => p.stock < 10);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  if (!isOpen) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Stock/Inventory Management
        </h3>
        <button
          onClick={loadProducts}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Out of Stock</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {outOfStockProducts.length}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingDown className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Low Stock</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {lowStockProducts.length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading inventory...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-4 py-2">Product Name</th>
                <th className="text-left px-4 py-2">Brand</th>
                <th className="text-right px-4 py-2">Current Stock</th>
                <th className="text-center px-4 py-2">Status</th>
                <th className="text-center px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const status =
                  product.stock === 0
                    ? 'Out of Stock'
                    : product.stock < 10
                      ? 'Low Stock'
                      : 'In Stock';
                const statusColor =
                  product.stock === 0
                    ? 'bg-red-100 text-red-800'
                    : product.stock < 10
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800';

                return (
                  <tr key={product.product_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {product.product_name}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {product.brand || '-'}
                    </td>
                    <td className="px-4 py-2">
                      {editingId === product.product_id ? (
                        <input
                          type="number"
                          value={newStock}
                          onChange={(e) =>
                            setNewStock(parseInt(e.target.value) || 0)
                          }
                          min="0"
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                          autoFocus
                        />
                      ) : (
                        <span className="text-right block font-medium">
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${statusColor}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex justify-center space-x-2">
                      {editingId === product.product_id ? (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStock(product.product_id, newStock)
                            }
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(product.product_id);
                            setNewStock(product.stock);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
