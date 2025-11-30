// トラック種別データを更新するスクリプト
// 使用方法: node scripts/update-truck-types.mjs

const truckTypesData = [
  { id: "947a046d-9569-483c-8c93-48bc8c811f6d", name: "軽トラ", displayName: "軽トラック", basePrice: 15000, capacityKg: 350, maxPoints: 50, sortOrder: 10 },
  { id: "0aa6c01f-f0d2-43c0-94fd-2c9af12d300b", name: "2tショート", displayName: "2トンショート", basePrice: 25000, capacityKg: 1000, maxPoints: 75, sortOrder: 20 },
  { id: "315ce73f-5225-419b-9c00-5ebc2aa49f8d", name: "2tロング", displayName: "2トンロング", basePrice: 30000, capacityKg: 1500, maxPoints: 100, sortOrder: 30 },
  { id: "e19c6eec-fbe4-4cb8-b873-5728c9fffcd2", name: "3t", displayName: "3トン", basePrice: 40000, capacityKg: 2000, maxPoints: 150, sortOrder: 40 },
  { id: "8e01b830-bde3-4b79-95c0-71843dab2489", name: "4t", displayName: "4トン", basePrice: 50000, capacityKg: 3000, maxPoints: 200, sortOrder: 50 },
  { id: "f5d417f6-31f0-4669-b643-1118fcf706a1", name: "4t複数", displayName: "4トン複数", basePrice: 80000, capacityKg: 6000, maxPoints: 400, sortOrder: 60 },
  { id: "04b94944-c912-42e0-bfb9-343a2e73af68", name: "特別対応", displayName: "特別対応", basePrice: 100000, capacityKg: 10000, maxPoints: 500, sortOrder: 70 }
];

async function updateTruckTypes() {
  try {
    const response = await fetch('http://localhost:3000/api/truck-types', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ truckTypes: truckTypesData })
    });

    const result = await response.json();
    console.log('更新結果:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('エラー:', error);
  }
}

updateTruckTypes();
