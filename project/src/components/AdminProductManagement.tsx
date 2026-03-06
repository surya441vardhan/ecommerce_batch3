import { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard as Edit } from 'lucide-react';
import { Product, Category } from '../types/database';
import { supabase } from '../lib/supabase';

interface AdminProductManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminProductManagement({
  isOpen,
  onClose,
}: AdminProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    category_id: '',
    mrp: 0,
    stock: 0,
    brand: '',
    description: '',
    is_repair_service: false,
  });

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadCategories();
    }
  }, [isOpen]);

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  }

  async function loadCategories() {
    const { data } = await supabase.from('categories').select('*').order('category_name');
    if (data) setCategories(data);
  }

  async function handleSave() {
    if (!formData.product_name || !formData.category_id) {
      alert('Please fill required fields');
      return;
    }

    if (editingId) {
      await supabase
        .from('products')
        .update(formData)
        .eq('product_id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('products').insert([formData]);
    }

    setFormData({
      product_name: '',
      category_id: '',
      mrp: 0,
      stock: 0,
      brand: '',
      description: '',
      is_repair_service: false,
    });
    setShowForm(false);
    await loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return;
    await supabase.from('products').delete().eq('product_id', id);
    await loadProducts();
  }

  function handleEdit(product: Product) {
    setFormData({
      product_name: product.product_name,
      category_id: product.category_id || '',
      mrp: product.mrp,
      stock: product.stock,
      brand: product.brand || '',
      description: product.description || '',
      is_repair_service: product.is_repair_service,
    });
    setEditingId(product.product_id);
    setShowForm(true);
  }

  if (!isOpen) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              product_name: '',
              category_id: '',
              mrp: 0,
              stock: 0,
              brand: '',
              description: '',
              is_repair_service: false,
            });
          }}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-4">
          <input
            type="text"
            placeholder="Product Name"
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Price (MRP)"
            value={formData.mrp}
            onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Stock"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
            rows={2}
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_repair_service}
              onChange={(e) => setFormData({ ...formData, is_repair_service: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Is Repair Service</span>
          </label>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Brand</th>
              <th className="text-right px-4 py-2">Price</th>
              <th className="text-right px-4 py-2">Stock</th>
              <th className="text-center px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{product.product_name}</td>
                <td className="px-4 py-2">{product.brand || '-'}</td>
                <td className="text-right px-4 py-2">₹{product.mrp.toFixed(2)}</td>
                <td className="text-right px-4 py-2">{product.stock}</td>
                <td className="px-4 py-2 flex justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.product_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
