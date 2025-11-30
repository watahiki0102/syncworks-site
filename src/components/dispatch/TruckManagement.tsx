import { useReducer, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { FormModal } from '@/components/ui/SimpleModal';
import { Input } from '@/components/ui/Input';
import { Pencil, Trash2, Plus } from 'lucide-react';

import { Truck } from '@/types/shared';

interface TruckManagementProps {
  trucks: Truck[];
  onTrucksChange: (trucks: Truck[]) => void;
}

const truckStatuses = [
  { value: 'available', label: '利用可' },
  { value: 'maintenance', label: '整備中' },
  { value: 'inactive', label: '非稼働' }
];

interface FormState {
  isModalOpen: boolean;
  editingTruck: Truck | null;
  modalMode: 'create' | 'edit';
  formData: {
    name: string;
    plateNumber: string;
    capacityKg: string;
    truckType: string;
    inspectionExpiry: string;
    status: Truck['status'];
  };
  errors: Record<string, string>;
}

type FormAction = 
  | { type: 'OPEN_CREATE_MODAL' }
  | { type: 'OPEN_EDIT_MODAL'; payload: Truck }
  | { type: 'CLOSE_MODAL' }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<FormState['formData']> }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'RESET_FORM' };

const initialFormState: FormState = {
  isModalOpen: false,
  editingTruck: null,
  modalMode: 'create',
  formData: {
    name: '',
    plateNumber: '',
    capacityKg: '',
    truckType: '',
    inspectionExpiry: '',
    status: 'available'
  },
  errors: {}
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'OPEN_CREATE_MODAL':
      return {
        ...initialFormState,
        isModalOpen: true,
        modalMode: 'create'
      };
    case 'OPEN_EDIT_MODAL':
      return {
        ...state,
        isModalOpen: true,
        editingTruck: action.payload,
        modalMode: 'edit',
        formData: {
          name: action.payload.name,
          plateNumber: action.payload.plateNumber,
          capacityKg: action.payload.capacityKg.toString(),
          truckType: action.payload.truckType,
          inspectionExpiry: action.payload.inspectionExpiry,
          status: action.payload.status
        },
        errors: {}
      };
    case 'CLOSE_MODAL':
      return {
        ...initialFormState
      };
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload
        }
      };
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload
      };
    case 'RESET_FORM':
      return {
        ...state,
        formData: initialFormState.formData,
        errors: {}
      };
    default:
      return state;
  }
}

export function TruckManagement({ trucks, onTrucksChange }: TruckManagementProps) {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [truckTypes, setTruckTypes] = useState<string[]>([]);

  // 車種をAPIから取得（Supabase DB）
  useEffect(() => {
    const fetchTruckTypes = async () => {
      try {
        const response = await fetch('/api/truck-types');
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          setTruckTypes(result.data.map((t: { name: string }) => t.name));
        }
      } catch (error) {
        console.error('車種取得エラー:', error);
      }
    };
    fetchTruckTypes();
  }, []);


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.formData.name.trim()) {
      newErrors.name = 'トラック名は必須です';
    }

    if (!formState.formData.plateNumber.trim()) {
      newErrors.plateNumber = 'ナンバーは必須です';
    }

    if (!formState.formData.capacityKg.trim()) {
      newErrors.capacityKg = '容量は必須です';
    } else if (isNaN(Number(formState.formData.capacityKg)) || Number(formState.formData.capacityKg) <= 0) {
      newErrors.capacityKg = '有効な容量を入力してください';
    }

    if (!formState.formData.truckType) {
      newErrors.truckType = '車種は必須です';
    }

    dispatch({ type: 'SET_ERRORS', payload: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {    
    if (!validateForm()) {
      return;
    }

    const truckData = {
      name: formState.formData.name.trim(),
      plateNumber: formState.formData.plateNumber.trim(),
      capacityKg: Number(formState.formData.capacityKg),
      truckType: formState.formData.truckType,
      inspectionExpiry: formState.formData.inspectionExpiry,
      status: formState.formData.status
    };

    if (formState.modalMode === 'create') {
      const newTruck: Truck = {
        ...truckData,
        id: Date.now().toString(),
        schedules: []
      };
      onTrucksChange([...trucks, newTruck]);
    } else if (formState.modalMode === 'edit' && formState.editingTruck) {
      const updatedTruck: Truck = {
        ...formState.editingTruck,
        ...truckData
      };
      onTrucksChange(trucks.map(t => t.id === formState.editingTruck!.id ? updatedTruck : t));
    }

    closeModal();
  };
  
  const closeModal = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };
  
  const isFormValid = formState.formData.name.trim() && formState.formData.plateNumber.trim() && formState.formData.capacityKg && formState.formData.truckType;

  const handleCreateTruck = () => {
    dispatch({ type: 'OPEN_CREATE_MODAL' });
  };

  const handleEditTruck = (truck: Truck) => {
    dispatch({ type: 'OPEN_EDIT_MODAL', payload: truck });
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
    <div>
      <div className="flex justify-end items-center mb-3">
        <button
          onClick={handleCreateTruck}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規登録
        </button>
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
      <FormModal
        isOpen={formState.isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        title={formState.modalMode === 'create' ? 'トラック新規登録' : 'トラック編集'}
        submitText={formState.modalMode === 'create' ? '登録' : '更新'}
        cancelText="キャンセル"
        isValid={!!isFormValid}
      >
        <div className="space-y-4">
              {/* トラック名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
                  トラック名 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formState.formData.name}
                  onChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { name: e.target.value } })}
                  className={formState.errors.name ? 'border-red-500' : ''}
                  placeholder="例: トラックA"
                />
                {formState.errors.name && <p className="text-red-500 text-sm mt-1">{formState.errors.name}</p>}
              </div>

              {/* ナンバー */}
              <div>
                <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-900 mb-1">
                  ナンバー <span className="text-red-500">*</span>
                </label>
                <Input
                  id="plateNumber"
                  type="text"
                  value={formState.formData.plateNumber}
                  onChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { plateNumber: e.target.value } })}
                  className={formState.errors.plateNumber ? 'border-red-500' : ''}
                  placeholder="例: 品川500 あ 1234"
                />
                {formState.errors.plateNumber && <p className="text-red-500 text-sm mt-1">{formState.errors.plateNumber}</p>}
              </div>

              {/* 容量 */}
              <div>
                <label htmlFor="capacityKg" className="block text-sm font-medium text-gray-900 mb-1">
                  容量 (kg) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="capacityKg"
                  type="number"
                  value={formState.formData.capacityKg}
                  onChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { capacityKg: e.target.value } })}
                  className={formState.errors.capacityKg ? 'border-red-500' : ''}
                  placeholder="例: 4000"
                  min="1"
                />
                {formState.errors.capacityKg && <p className="text-red-500 text-sm mt-1">{formState.errors.capacityKg}</p>}
              </div>

              {/* 車種 */}
              <div>
                <label htmlFor="truckType" className="block text-sm font-medium text-gray-900 mb-1">
                  車種 <span className="text-red-500">*</span>
                </label>
                <select
                  id="truckType"
                  value={formState.formData.truckType}
                  onChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { truckType: e.target.value } })}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    formState.errors.truckType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">車種を選択</option>
                  {truckTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {formState.errors.truckType && <p className="text-red-500 text-sm mt-1">{formState.errors.truckType}</p>}
              </div>

              {/* 車検有効期限 */}
              <div>
                <label htmlFor="inspectionExpiry" className="block text-sm font-medium text-gray-900 mb-1">
                  車検有効期限
                </label>
                <Input
                  id="inspectionExpiry"
                  type="date"
                  value={formState.formData.inspectionExpiry}
                  onChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { inspectionExpiry: e.target.value } })}
                />
              </div>

              {/* ステータス */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-1">
                  ステータス
                </label>
                <select
                  id="status"
                  value={formState.formData.status}
                  onChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { status: e.target.value as Truck['status'] } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {truckStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
        </div>
      </FormModal>
    </div>
  );
}
