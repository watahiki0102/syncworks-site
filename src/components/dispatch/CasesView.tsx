'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminButton from '@/components/admin/AdminButton';
import { Truck } from '@/types/shared';
import { ContractStatus } from '@/types/case';

interface FormSubmission {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  moveDate: string;
  originAddress: string;
  destinationAddress: string;
  totalPoints: number;
  totalCapacity: number;
  itemList: string[];
  additionalServices: string[];
  status: 'pending' | 'assigned' | 'completed';
  truckAssignments: TruckAssignment[];
  createdAt: string;
  distance?: number;
  estimatedPrice?: number;
  recommendedTruckTypes?: string[];
  contractStatus: ContractStatus;
  contractDate?: string;
  caseStatus?: 'unanswered' | 'answered' | 'contracted' | 'lost' | 'cancelled';
  requestSource?: string;
  isManualRegistration?: boolean;
  registeredBy?: string;
}

interface TruckAssignment {
  truckId: string;
  truckName: string;
  capacity: number;
  startTime: string;
  endTime: string;
  workType: 'loading' | 'moving' | 'unloading';
}

interface DispatchTemplate {
  id: string;
  name: string;
  description: string;
  settings: {
    truckCount: number;
    workerCount: number;
    timeBuffer: number;
    autoAssignWorkers: boolean;
    preferredTruckTypes: string[];
  };
}

interface CasesViewProps {
  formSubmissions: FormSubmission[];
  trucks: Truck[];
  expandedSubmissions: Set<string>;
  dispatchTemplates: DispatchTemplate[];
  onAssignTruck: (submissionId: string, truckId: string) => void;
  onRemoveTruck: (submissionId: string, truckId: string) => void;
  onToggleExpand: (id: string) => void;
  onBulkAssign: (submissionIds: string[], templateId: string) => void;
}

export default function CasesView({
  formSubmissions,
  trucks,
  expandedSubmissions,
  dispatchTemplates,
  onAssignTruck,
  onRemoveTruck,
  onToggleExpand,
  onBulkAssign
}: CasesViewProps) {
  const router = useRouter();
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* 新規案件登録 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">新規案件登録</h3>
            <AdminButton
              variant="primary"
              onClick={() => router.push('/admin/cases/register')}
              icon="+"
            >
              新規案件登録
            </AdminButton>
          </div>
        </div>
      </div>

      {/* 案件一覧 */}
      <UnifiedCaseManagement
        submissions={formSubmissions}
        trucks={trucks}
        onAssignTruck={onAssignTruck}
        onRemoveTruck={onRemoveTruck}
        expandedSubmissions={expandedSubmissions}
        onToggleExpand={onToggleExpand}
        dispatchTemplates={dispatchTemplates}
        onBulkAssign={onBulkAssign}
      />

      {/* 一括割り当てモーダル */}
      {showBulkAssignModal && (
        <BulkAssignModal
          submissions={formSubmissions.filter(s => s.status === 'pending')}
          templates={dispatchTemplates}
          onAssign={onBulkAssign}
          onClose={() => setShowBulkAssignModal(false)}
        />
      )}
    </div>
  );
}

// 一括割り当てモーダルコンポーネント
interface BulkAssignModalProps {
  submissions: FormSubmission[];
  templates: DispatchTemplate[];
  onAssign: (submissionIds: string[], templateId: string) => void;
  onClose: () => void;
}

const BulkAssignModal = ({ submissions, templates, onAssign, onClose }: BulkAssignModalProps) => {
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubmissions.length === 0 || !selectedTemplate) {
      alert('案件とテンプレートを選択してください');
      return;
    }
    onAssign(selectedSubmissions, selectedTemplate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">一括配車割り当て</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 案件選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対象案件を選択
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-3">
              {submissions.map(submission => (
                <label key={submission.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.includes(submission.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubmissions(prev => [...prev, submission.id]);
                      } else {
                        setSelectedSubmissions(prev => prev.filter(id => id !== submission.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">
                    {submission.customerName} - {submission.moveDate}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* テンプレート選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              配車テンプレート
            </label>
            <div className="space-y-2">
              {templates.map(template => (
                <label key={template.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="template"
                    value={template.id}
                    checked={selectedTemplate === template.id}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      トラック{template.settings.truckCount}台・作業者{template.settings.workerCount}名・
                      時間バッファ{template.settings.timeBuffer}分
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              一括割り当て
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// UnifiedCaseManagementコンポーネント（プレースホルダー）
interface UnifiedCaseManagementProps {
  submissions: FormSubmission[];
  trucks: Truck[];
  expandedSubmissions: Set<string>;
  dispatchTemplates: DispatchTemplate[];
  onAssignTruck: (submissionId: string, truckId: string) => void;
  onRemoveTruck: (submissionId: string, truckId: string) => void;
  onToggleExpand: (id: string) => void;
  onBulkAssign: (submissionIds: string[], templateId: string) => void;
}

const UnifiedCaseManagement = (props: UnifiedCaseManagementProps) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg mb-4">案件管理</h3>
      <p className="text-gray-600">案件一覧と管理機能がここに表示されます</p>
    </div>
  );
};