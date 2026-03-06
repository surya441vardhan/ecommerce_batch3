import { useState, useEffect } from 'react';
import { Trash2, Mail, Phone } from 'lucide-react';
import { Customer } from '../types/database';
import { supabase } from '../lib/supabase';

interface AdminUserManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminUserManagement({
  isOpen,
  onClose,
}: AdminUserManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  async function loadCustomers() {
    setLoading(true);
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCustomers(data);
    setLoading(false);
  }

  async function handleDeleteUser(customerId: string) {
    if (!confirm('This will delete the customer account. Continue?')) return;

    await supabase.from('customers').delete().eq('customer_id', customerId);
    await loadCustomers();
  }

  if (!isOpen) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          User Management ({customers.length} customers)
        </h3>
        <button
          onClick={loadCustomers}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading customers...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Phone</th>
                <th className="text-left px-4 py-2">City</th>
                <th className="text-left px-4 py-2">Joined</th>
                <th className="text-center px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customer_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {customer.email || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {customer.phone || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {customer.city || '-'}
                  </td>
                  <td className="px-4 py-2 text-gray-600 text-xs">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 flex justify-center">
                    <button
                      onClick={() => handleDeleteUser(customer.customer_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No customers found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
