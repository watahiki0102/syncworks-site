'use client';

import { WorkerRef, WorkerAssignment } from '@/types/dispatch';

interface EmployeePillProps {
  worker: WorkerRef;
  assignment: WorkerAssignment;
  onUnassign: () => void;
}

export default function EmployeePill({
  worker,
  assignment,
  onUnassign
}: EmployeePillProps) {
  // 役割に応じた色とアイコンを取得
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'driver':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🚗', label: 'ドライバー' };
      case 'staff':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: '👷', label: 'スタッフ' };
      case 'leader':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '👑', label: 'リーダー' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '👤', label: '作業者' };
    }
  };

  const roleConfig = getRoleConfig(worker.role);

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${roleConfig.color} ${
        !worker.active ? 'opacity-50' : ''
      }`}
      title={`${worker.name} (${roleConfig.label}) - ${assignment.start}-${assignment.end}`}
    >
      <span className="text-xs">{roleConfig.icon}</span>
      <span className="font-medium text-gray-700 truncate max-w-[60px]">{worker.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUnassign();
        }}
        className="ml-1 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
        title="割り当てを解除"
      >
        ×
      </button>
    </div>
  );
}
