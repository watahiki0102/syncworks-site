'use client';

interface AddressInfoSectionProps {
  formData: {
    fromAddress: string;
    toAddress: string;
    fromPostalCode: string;
    toPostalCode: string;
  };
  errors: Record<string, string>;
  onUpdate: (field: string, value: string) => void;
}

export default function AddressInfoSection({
  formData,
  errors,
  onUpdate
}: AddressInfoSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">住所情報</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            引越し元住所 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="text"
              value={formData.fromPostalCode}
              onChange={(e) => onUpdate('fromPostalCode', e.target.value)}
              className="block border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="123-4567"
              maxLength={8}
            />
            <input
              type="text"
              value={formData.fromAddress}
              onChange={(e) => onUpdate('fromAddress', e.target.value)}
              className={`col-span-3 block border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.fromAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="東京都新宿区西新宿1-1-1"
            />
          </div>
          {errors.fromAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.fromAddress}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            引越し先住所 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="text"
              value={formData.toPostalCode}
              onChange={(e) => onUpdate('toPostalCode', e.target.value)}
              className="block border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="123-4567"
              maxLength={8}
            />
            <input
              type="text"
              value={formData.toAddress}
              onChange={(e) => onUpdate('toAddress', e.target.value)}
              className={`col-span-3 block border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.toAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="東京都渋谷区渋谷2-2-2"
            />
          </div>
          {errors.toAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.toAddress}</p>
          )}
        </div>
      </div>
    </div>
  );
}