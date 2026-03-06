import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Category } from '../types/database';
import { supabase } from '../lib/supabase';

interface AdminCategoryManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminCategoryManagement({
  isOpen,
  onClose,
}: AdminCategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category_name: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('category_name');
    if (data) setCategories(data);
  }

  async function handleSave() {
    if (!formData.category_name.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (editingId) {
      await supabase
        .from('categories')
        .update(formData)
        .eq('category_id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('categories').insert([formData]);
    }

    setFormData({ category_name: '', description: '' });
    setShowForm(false);
    await loadCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    await supabase.from('categories').delete().eq('category_id', id);
    await loadCategories();
  }

  function handleEdit(category: Category) {
    setFormData({
      category_name: category.category_name,
      description: category.description || '',
    });
    setEditingId(category.category_id);
    setShowForm(true);
  }

  if (!isOpen) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Category Management
        </h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ category_name: '', description: '' });
          }}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-4">
          <input
            type="text"
            placeholder="Category Name"
            value={formData.category_name}
            onChange={(e) =>
              setFormData({ ...formData, category_name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
            rows={2}
          />
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
              <th className="text-left px-4 py-2">Category Name</th>
              <th className="text-left px-4 py-2">Description</th>
              <th className="text-center px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.category_id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">
                  {category.category_name}
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {category.description || '-'}
                </td>
                <td className="px-4 py-2 flex justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.category_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No categories found</p>
          </div>
        )}
      </div>
    </div>
  );
}
