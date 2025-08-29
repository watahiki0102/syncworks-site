'use client';

interface CustomerInfoSectionProps {
  formData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  };
  errors: Record<string, string>;
  onUpdate: (field: string, value: string) => void;
}

export default function CustomerInfoSection({
  formData,
  errors,
  onUpdate
}: CustomerInfoSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">顧客基本情報</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            顧客名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => onUpdate('customerName', e.target.value)}
            className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.customerName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="山田太郎"
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => onUpdate('customerPhone', e.target.value)}
            className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.customerPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="090-1234-5678"
          />
          {errors.customerPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => onUpdate('customerEmail', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="customer@example.com"
          />
        </div>
      </div>
    </div>
  );
}