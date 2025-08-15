import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Pencil, Trash2, Plus } from 'lucide-react';

export interface Truck {
  id: string;
  name: string;
  plateNumber: string;
  capacityKg: number;
  inspectionExpiry: string;
  status: 'available' | 'maintenance' | 'inactive';
  truckType: string;
  schedules: any[];
}

interface TruckManagementProps {
  trucks: Truck[];
  onTrucksChange: (trucks: Truck[]) => void;
}

const truckTypes = ['2t', '4t', '8t', '10t', '20t', '25t'];
const truckStatuses = [
  { value: 'available', label: '利用可' },
  { value: 'maintenance', label: '整備中' },
  { value: 'inactive', label: '非稼働' }
];

export function TruckManagement({ trucks, onTrucksChange }: TruckManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({
    name: '',
    plateNumber: '',
    capacityKg: '',
    truckType: '',
    inspectionExpiry: '',
    status: 'available' as Truck['status']
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTruck && modalMode === 'edit') {
      setFormData({
        name: editingTruck.name,
        plateNumber: editingTruck.plateNumber,
        capacityKg: editingTruck.capacityKg.toString(),
        truckType: editingTruck.truckType,
        inspectionExpiry: editingTruck.inspectionExpiry,
        status: editingTruck.status
      });
    } else {
      setFormData({
        name: '',
        plateNumber: '',
        capacityKg: '',
        truckType: '',
        inspectionExpiry: '',
        status: 'available'
      });
    }
    setErrors({});
  }, [editingTruck, modalMode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'トラック名は必須です';
    }

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = 'ナンバーは必須です';
    }

    if (!formData.capacityKg.trim()) {
      newErrors.capacityKg = '容量は必須です';
    } else if (isNaN(Number(formData.capacityKg)) || Number(formData.capacityKg) <= 0) {
      newErrors.capacityKg = '有効な容量を入力してください';
    }

    if (!formData.truckType) {
      newErrors.truckType = '車種は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const truckData = {
      name: formData.name.trim(),
      plateNumber: formData.plateNumber.trim(),
      capacityKg: Number(formData.capacityKg),
      truckType: formData.truckType,
      inspectionExpiry: formData.inspectionExpiry,
      status: formData.status
    };

    if (modalMode === 'create') {
      const newTruck: Truck = {
        ...truckData,
        id: Date.now().toString(),
        schedules: []
      };
      onTrucksChange([...trucks, newTruck]);
    } else if (modalMode === 'edit' && editingTruck) {
      const updatedTruck: Truck = {
        ...editingTruck,
        ...truckData
      };
      onTrucksChange(trucks.map(t => t.id === editingTruck.id ? updatedTruck : t));
    }

    setIsModalOpen(false);
    setEditingTruck(null);
  };

  const handleCreateTruck = () => {
    setModalMode('create');
    setEditingTruck(null);
    setIsModalOpen(true);
  };

  const handleEditTruck = (truck: Truck) => {
    setModalMode('edit');
    setEditingTruck(truck);
    setIsModalOpen(true);
  };

  const handleDeleteTruck = (id: string) => {
    if (window.confirm('このトラックを削除しますか？')) {
      onTrucksChange(trucks.filter(t => t.id !== id));
    }
  };

  const getStatusLabel = (status: Truck['status']) => {
    switch (status) {
      case 'available':
        return '利用可';
      case 'maintenance':
        return '整備中';
      case 'inactive':
        return '非稼働';
      default:
        return status;
    }
  };

  const getStatusColor = (status: Truck['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">トラック管理</h2>
        <Button
          onClick={handleCreateTruck}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新規登録
        </Button>
      </div>

      {trucks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">トラックが登録されていません</p>
          <p className="text-gray-400 text-sm mt-2">新規登録ボタンからトラックを追加してください</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  トラック名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ナンバー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  容量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  車種
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  車検期限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trucks.map((truck) => (
                <tr key={truck.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {truck.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.plateNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.capacityKg.toLocaleString()} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.truckType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.inspectionExpiry ? new Date(truck.inspectionExpiry).toLocaleDateString('ja-JP') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(truck.status)}`}>
                      {getStatusLabel(truck.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEditTruck(truck)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        variant="ghost"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteTruck(truck.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        variant="ghost"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* トラック登録・編集モーダル */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {modalMode === 'create' ? 'トラック新規登録' : 'トラック編集'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* トラック名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  トラック名 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="例: トラックA"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* ナンバー */}
              <div>
                <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  ナンバー <span className="text-red-500">*</span>
                </label>
                <Input
                  id="plateNumber"
                  type="text"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                  className={errors.plateNumber ? 'border-red-500' : ''}
                  placeholder="例: 品川500 あ 1234"
                />
                {errors.plateNumber && <p className="text-red-500 text-sm mt-1">{errors.plateNumber}</p>}
              </div>

              {/* 容量 */}
              <div>
                <label htmlFor="capacityKg" className="block text-sm font-medium text-gray-700 mb-1">
                  容量 (kg) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="capacityKg"
                  type="number"
                  value={formData.capacityKg}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacityKg: e.target.value }))}
                  className={errors.capacityKg ? 'border-red-500' : ''}
                  placeholder="例: 4000"
                  min="1"
                />
                {errors.capacityKg && <p className="text-red-500 text-sm mt-1">{errors.capacityKg}</p>}
              </div>

              {/* 車種 */}
              <div>
                <label htmlFor="truckType" className="block text-sm font-medium text-gray-700 mb-1">
                  車種 <span className="text-red-500">*</span>
                </label>
                <select
                  id="truckType"
                  value={formData.truckType}
                  onChange={(e) => setFormData(prev => ({ ...prev, truckType: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.truckType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">車種を選択</option>
                  {truckTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.truckType && <p className="text-red-500 text-sm mt-1">{errors.truckType}</p>}
              </div>

              {/* 車検有効期限 */}
              <div>
                <label htmlFor="inspectionExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                  車検有効期限
                </label>
                <Input
                  id="inspectionExpiry"
                  type="date"
                  value={formData.inspectionExpiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, inspectionExpiry: e.target.value }))}
                />
              </div>

              {/* ステータス */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Truck['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {truckStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="px-4 py-2"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              >
                {modalMode === 'create' ? '登録' : '更新'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
