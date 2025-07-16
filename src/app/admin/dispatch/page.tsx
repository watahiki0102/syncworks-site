'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import TruckRegistration from '@/components/TruckRegistration';
import DispatchCalendar from '@/components/DispatchCalendar';

interface Truck {
  id: string;
  name: string;
  plateNumber: string;
  capacityKg: number;
  inspectionExpiry: string;
  status: 'available' | 'maintenance' | 'inactive';
  schedules: Schedule[];
}

interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'maintenance';
}

export default function DispatchManagement() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'registration'>('calendar');
  const router = useRouter();

  useEffect(() => {
    // ローカルストレージからトラックデータを読み込み
    const savedTrucks = localStorage.getItem('trucks');
    if (savedTrucks) {
      setTrucks(JSON.parse(savedTrucks));
    }
  }, []);

  const saveTrucks = (newTrucks: Truck[]) => {
    setTrucks(newTrucks);
    localStorage.setItem('trucks', JSON.stringify(newTrucks));
  };

  const addTruck = (truck: Omit<Truck, 'id'>) => {
    const newTruck: Truck = {
      ...truck,
      id: Date.now().toString(),
    };
    const updatedTrucks = [...trucks, newTruck];
    saveTrucks(updatedTrucks);
  };

  const updateTruck = (updatedTruck: Truck) => {
    const updatedTrucks = trucks.map(truck => 
      truck.id === updatedTruck.id ? updatedTruck : truck
    );
    saveTrucks(updatedTrucks);
    setSelectedTruck(null);
  };

  const deleteTruck = (truckId: string) => {
    if (window.confirm('このトラックを削除しますか？')) {
      const updatedTrucks = trucks.filter(truck => truck.id !== truckId);
      saveTrucks(updatedTrucks);
      if (selectedTruck?.id === truckId) {
        setSelectedTruck(null);
      }
    }
  };

  const handleLogout = () => {
    if (!window.confirm('本当にログアウトしますか？')) return;
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  トップに戻る
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    配車管理
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    トラックの稼働スケジュール管理
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ログアウト
              </button>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* タブ切り替え */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'calendar'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📅 配車カレンダー
                  </button>
                  <button
                    onClick={() => setActiveTab('registration')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'registration'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🚚 トラック登録・編集
                  </button>
                </nav>
              </div>
            </div>

            {/* タブコンテンツ */}
            {activeTab === 'calendar' && (
              <DispatchCalendar 
                trucks={trucks}
                onUpdateTruck={updateTruck}
              />
            )}
            
            {activeTab === 'registration' && (
              <TruckRegistration
                trucks={trucks}
                selectedTruck={selectedTruck}
                onAddTruck={addTruck}
                onUpdateTruck={updateTruck}
                onDeleteTruck={deleteTruck}
                onSelectTruck={setSelectedTruck}
              />
            )}
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 