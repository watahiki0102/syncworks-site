import { EmployeeMonthlySummary } from '@/types/employee';

interface EmployeeSummaryPanelProps {
  monthlySummary: EmployeeMonthlySummary[];
  totalStats: {
    totalWorkingDays: number;
    totalWorkingTime: string;
    workingEmployeeCount: number;
    activeEmployeeCount: number;
  };
}

/**
 * 従業員集計パネル
 */
export function EmployeeSummaryPanel({
  monthlySummary,
  totalStats,
}: EmployeeSummaryPanelProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-lg font-bold text-gray-800">
            {year}年{month}月 従業員集計
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                  従業員名
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                  出勤日数
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                  当月総労働時間
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.map((summary, index) => (
                <tr key={summary.employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900">
                    {summary.employee.name}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-700">
                    {summary.workingDays}日
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-700">
                    {summary.totalWorkingTime}
                  </td>
                </tr>
              ))}

              {/* 合計行 */}
              <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
                <td className="border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900">
                  合計
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-900">
                  {totalStats.totalWorkingDays}日
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-900">
                  {totalStats.totalWorkingTime}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 全体集計 */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-600">
              登録従業員数: {totalStats.activeEmployeeCount}名
            </div>
            <div className="text-gray-600">
              出勤予定者数: {totalStats.workingEmployeeCount}名
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
