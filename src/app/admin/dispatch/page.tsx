'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import TruckRegistration from '@/components/TruckRegistration';
import DispatchCalendar from '@/components/DispatchCalendar';
import TruckAssignmentModal from './components/TruckAssignmentModal';
import { formatDate, formatTime } from '@/utils/dateTimeUtils';

interface Truck {
  id: string;
  name: string;
  plateNumber: string;
  capacityKg: number;
  inspectionExpiry: string;
  status: 'available' | 'maintenance' | 'inactive';
  truckType: string;
  schedules: Schedule[];
}

interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'maintenance';
  contractStatus?: 'confirmed' | 'estimate'; // 確定 or 見積もり回答済み
  customerName?: string;
  workType?: 'loading' | 'moving' | 'unloading' | 'maintenance';
  description?: string;
  capacity?: number;
  points?: number; // ポイント数を追加
  origin?: string;
  destination?: string;
  employeeId?: string; // 従業員IDを追加
}

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
  distance?: number; // 距離（km）
  estimatedPrice?: number; // 見積もり価格
  recommendedTruckTypes?: string[]; // 推奨トラック種別
  contractStatus: 'estimate' | 'contracted'; // 見積もり or 契約完了
  contractDate?: string; // 契約日
}

interface TruckAssignment {
  truckId: string;
  truckName: string;
  capacity: number;
  startTime: string;
  endTime: string;
  workType: 'loading' | 'moving' | 'unloading';
}

export default function DispatchManagement() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([
    {
      id: '1',
      customerName: '山田 太郎',
      customerEmail: 'taro@example.com',
      customerPhone: '090-1234-5678',
      moveDate: '2023-10-15',
      originAddress: '東京都新宿区西新宿1-1-1',
      destinationAddress: '東京都渋谷区渋谷2-2-2',
      totalPoints: 100,
      totalCapacity: 500,
      itemList: ['ソファ', 'テーブル', '椅子'],
      additionalServices: ['梱包', '開梱'],
      status: 'pending',
      truckAssignments: [],
      createdAt: '2023-10-01T10:00:00Z',
      contractStatus: 'estimate',
    },
    {
      id: '2',
      customerName: '鈴木 花子',
      customerEmail: 'hanako@example.com',
      customerPhone: '080-9876-5432',
      moveDate: '2023-10-20',
      originAddress: '大阪府大阪市北区梅田3-3-3',
      destinationAddress: '大阪府大阪市中央区難波4-4-4',
      totalPoints: 150,
      totalCapacity: 750,
      itemList: ['ベッド', 'ワードローブ', '机'],
      additionalServices: ['保険'],
      status: 'assigned',
      truckAssignments: [],
      createdAt: '2023-10-02T11:00:00Z',
      contractStatus: 'estimate',
    },
    {
      id: '3',
      customerName: '佐藤 次郎',
      customerEmail: 'jiro@example.com',
      customerPhone: '070-5555-6666',
      moveDate: '2023-10-25',
      originAddress: '福岡県福岡市博多区博多駅前5-5-5',
      destinationAddress: '福岡県福岡市中央区天神6-6-6',
      totalPoints: 200,
      totalCapacity: 1000,
      itemList: ['冷蔵庫', '洗濯機', '乾燥機'],
      additionalServices: ['保管'],
      status: 'completed',
      truckAssignments: [],
      createdAt: '2023-10-03T12:00:00Z',
      contractStatus: 'contracted',
      contractDate: '2023-10-10T12:00:00Z',
    },
  ]);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'assignments' | 'registration'>('calendar');
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [availableTruckTypes, setAvailableTruckTypes] = useState<string[]>([]);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [truckCoefficients, setTruckCoefficients] = useState<any[]>([]);
  const [distanceRanges, setDistanceRanges] = useState<any[]>([]);
  const [pricingTrucks, setPricingTrucks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // ローカルストレージからトラックデータを読み込み
    const savedTrucks = localStorage.getItem('trucks');
    if (savedTrucks) {
      setTrucks(JSON.parse(savedTrucks));
    } else {
      // テストデータを初期化
      const testTrucks: Truck[] = [
        {
          id: 'truck-1',
          name: '2トンショート',
          plateNumber: '品川 500 あ 1234',
          capacityKg: 1000,
          inspectionExpiry: '2024-12-31',
          status: 'available',
          truckType: '2tショート',
          schedules: [
            {
              id: 'schedule-1',
              date: new Date().toISOString().split('T')[0],
              startTime: '09:00',
              endTime: '11:00',
              status: 'booked',
              contractStatus: 'confirmed',
              customerName: '田中 一郎',
              workType: 'loading',
              description: '引っ越し作業',
              capacity: 300,
              points: 50,
              origin: '東京都新宿区西新宿1-1-1',
              destination: '東京都渋谷区渋谷2-2-2',
            },
            {
              id: 'schedule-1-2',
              date: new Date().toISOString().split('T')[0],
              startTime: '09:00',
              endTime: '11:00',
              status: 'booked',
              contractStatus: 'estimate',
              customerName: '佐藤 花子',
              workType: 'loading',
              description: '引っ越し作業',
              capacity: 400,
              points: 75,
              origin: '東京都中野区中野3-3-3',
              destination: '東京都杉並区阿佐ヶ谷4-4-4',
            },
            {
              id: 'schedule-2',
              date: new Date().toISOString().split('T')[0],
              startTime: '11:00',
              endTime: '13:00',
              status: 'booked',
              contractStatus: 'confirmed',
              customerName: '山田 三郎',
              workType: 'moving',
              description: '引っ越し作業',
              capacity: 600,
              points: 100,
              origin: '東京都目黒区目黒7-7-7',
              destination: '東京都世田谷区三軒茶屋8-8-8',
            },
            {
              id: 'schedule-3',
              date: new Date().toISOString().split('T')[0],
              startTime: '14:00',
              endTime: '16:00',
              status: 'booked',
              contractStatus: 'estimate',
              customerName: '鈴木 四郎',
              workType: 'unloading',
              description: '引っ越し作業',
              capacity: 500,
              points: 80,
              origin: '東京都品川区大井9-9-9',
              destination: '東京都大田区蒲田10-10-10',
            },
            {
              id: 'schedule-4',
              date: new Date().toISOString().split('T')[0],
              startTime: '16:00',
              endTime: '18:00',
              status: 'booked',
              contractStatus: 'confirmed',
              customerName: '高橋 五郎',
              workType: 'loading',
              description: '引っ越し作業',
              capacity: 200,
              points: 30,
              origin: '東京都江戸川区葛西11-11-11',
              destination: '東京都江東区木場12-12-12',
            },
          ],
        },
        {
          id: 'truck-2',
          name: '4トンロング',
          plateNumber: '品川 500 い 5678',
          capacityKg: 2000,
          inspectionExpiry: '2024-11-30',
          status: 'available',
          truckType: '4t',
          schedules: [
            {
              id: 'schedule-5',
              date: new Date().toISOString().split('T')[0],
              startTime: '10:00',
              endTime: '12:00',
              status: 'booked',
              contractStatus: 'confirmed',
              customerName: '山田 次郎',
              workType: 'loading',
              description: '引っ越し作業',
              capacity: 800,
              points: 120,
              origin: '東京都目黒区目黒5-5-5',
              destination: '東京都世田谷区三軒茶屋6-6-6',
            },
            {
              id: 'schedule-6',
              date: new Date().toISOString().split('T')[0],
              startTime: '10:00',
              endTime: '12:00',
              status: 'booked',
              contractStatus: 'estimate',
              customerName: '伊藤 六郎',
              workType: 'loading',
              description: '引っ越し作業',
              capacity: 600,
              points: 90,
              origin: '東京都杉並区阿佐ヶ谷13-13-13',
              destination: '東京都中野区中野14-14-14',
            },
            {
              id: 'schedule-7',
              date: new Date().toISOString().split('T')[0],
              startTime: '13:00',
              endTime: '15:00',
              status: 'booked',
              contractStatus: 'confirmed',
              customerName: '渡辺 七郎',
              workType: 'unloading',
              description: '引っ越し作業',
              capacity: 1000,
              points: 150,
              origin: '東京都品川区大井15-15-15',
              destination: '東京都大田区蒲田16-16-16',
            },
          ],
        },
        {
          id: 'truck-3',
          name: '1トン軽トラ',
          plateNumber: '品川 500 う 9012',
          capacityKg: 500,
          inspectionExpiry: '2024-10-31',
          status: 'maintenance',
          truckType: '軽トラ',
          schedules: [
            {
              id: 'schedule-4',
              date: new Date().toISOString().split('T')[0],
              startTime: '08:00',
              endTime: '10:00',
              status: 'maintenance',
              customerName: '',
              workType: 'maintenance',
              description: '定期点検',
              capacity: 0,
              origin: '',
              destination: '',
            },
          ],
        },
        {
          id: 'truck-4',
          name: '3トンミドル',
          plateNumber: '品川 500 え 3456',
          capacityKg: 1500,
          inspectionExpiry: '2024-09-30',
          status: 'available',
          truckType: '3t',
          schedules: [],
        },
        {
          id: 'truck-5',
          name: '5トン大型',
          plateNumber: '品川 500 お 7890',
          capacityKg: 3000,
          inspectionExpiry: '2024-08-31',
          status: 'inactive',
          truckType: '4t複数',
          schedules: [],
        },
      ];
      setTrucks(testTrucks);
      localStorage.setItem('trucks', JSON.stringify(testTrucks));
    }

    // ローカルストレージからフォーム送信データを読み込み
    const savedSubmissions = localStorage.getItem('formSubmissions');
    if (savedSubmissions) {
      setFormSubmissions(JSON.parse(savedSubmissions));
    } else {
      // テストデータを初期化
      const testSubmissions: FormSubmission[] = [
        {
          id: '1',
          customerName: '田中 一郎',
          customerEmail: 'tanaka@example.com',
          customerPhone: '090-1234-5678',
          moveDate: new Date().toISOString().split('T')[0],
          originAddress: '東京都新宿区西新宿1-1-1',
          destinationAddress: '東京都渋谷区渋谷2-2-2',
          totalPoints: 100,
          totalCapacity: 800,
          distance: 5,
          itemList: ['ソファ', 'テーブル', '椅子', 'ベッド'],
          additionalServices: ['梱包', '開梱'],
          status: 'assigned',
          truckAssignments: [
            {
              truckId: 'truck-1',
              truckName: '2トンショート',
              capacity: 800,
              startTime: '09:00',
              endTime: '12:00',
              workType: 'loading',
            },
          ],
          createdAt: '2024-01-01T10:00:00Z',
          contractStatus: 'estimate',
        },
        {
          id: '2',
          customerName: '佐藤 花子',
          customerEmail: 'sato@example.com',
          customerPhone: '080-9876-5432',
          moveDate: new Date().toISOString().split('T')[0],
          originAddress: '東京都中野区中野3-3-3',
          destinationAddress: '東京都杉並区阿佐ヶ谷4-4-4',
          totalPoints: 150,
          totalCapacity: 600,
          distance: 8,
          itemList: ['ワードローブ', '机', '本棚'],
          additionalServices: ['保険'],
          status: 'assigned',
          truckAssignments: [
            {
              truckId: 'truck-1',
              truckName: '2トンショート',
              capacity: 600,
              startTime: '14:00',
              endTime: '17:00',
              workType: 'moving',
            },
          ],
          createdAt: '2024-01-02T11:00:00Z',
          contractStatus: 'estimate',
        },
        {
          id: '3',
          customerName: '山田 次郎',
          customerEmail: 'yamada@example.com',
          customerPhone: '070-5555-6666',
          moveDate: new Date().toISOString().split('T')[0],
          originAddress: '東京都目黒区目黒5-5-5',
          destinationAddress: '東京都世田谷区三軒茶屋6-6-6',
          totalPoints: 200,
          totalCapacity: 1500,
          distance: 12,
          itemList: ['冷蔵庫', '洗濯機', '乾燥機', '食器棚'],
          additionalServices: ['保管', '組立'],
          status: 'assigned',
          truckAssignments: [
            {
              truckId: 'truck-2',
              truckName: '4トンロング',
              capacity: 1500,
              startTime: '10:00',
              endTime: '15:00',
              workType: 'unloading',
            },
          ],
          createdAt: '2024-01-03T12:00:00Z',
          contractStatus: 'contracted',
          contractDate: '2024-01-05T12:00:00Z',
        },
      ];
      setFormSubmissions(testSubmissions);
      localStorage.setItem('formSubmissions', JSON.stringify(testSubmissions));
    }

    // 料金設定からトラック種別を読み込み
    const savedPricing = localStorage.getItem('pricingStep2');
    if (savedPricing) {
      const pricingRules = JSON.parse(savedPricing);
      setPricingRules(pricingRules);
      const truckTypes = [...new Set(pricingRules.map((rule: any) => rule.truckType).filter(Boolean))] as string[];
      setAvailableTruckTypes(truckTypes);
    } else {
      // デフォルトのトラック種別を設定
      setAvailableTruckTypes(['軽トラ', '2tショート', '2tロング', '3t', '4t', '4t複数', '特別対応']);
    }

    // 車種係数からもトラック種別を読み込み
    const savedCoefficients = localStorage.getItem('truckCoefficients');
    if (savedCoefficients) {
      const coefficients = JSON.parse(savedCoefficients);
      setTruckCoefficients(coefficients);
      const coefficientTypes = coefficients.map((coef: any) => coef.truckType).filter(Boolean) as string[];
      setAvailableTruckTypes(prev => [...new Set([...prev, ...coefficientTypes])]);
    }

    // 距離料金の読み込み
    const savedDistance = localStorage.getItem('distanceRanges');
    if (savedDistance) {
      setDistanceRanges(JSON.parse(savedDistance));
    }

    // 料金設定のトラックデータの読み込み
    const savedPricingTrucks = localStorage.getItem('pricingTrucks');
    if (savedPricingTrucks) {
      setPricingTrucks(JSON.parse(savedPricingTrucks));
    }
  }, []);

  const saveTrucks = (newTrucks: Truck[]) => {
    setTrucks(newTrucks);
    localStorage.setItem('trucks', JSON.stringify(newTrucks));
  };

  const saveFormSubmissions = (newSubmissions: FormSubmission[]) => {
    setFormSubmissions(newSubmissions);
    localStorage.setItem('formSubmissions', JSON.stringify(newSubmissions));
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

  const assignTruckToSubmission = (submissionId: string, truckAssignment: TruckAssignment) => {
    const submission = formSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    // トラックのスケジュールを更新
    const truck = trucks.find(t => t.id === truckAssignment.truckId);
    if (truck) {
      const newSchedule: Schedule = {
        id: `schedule-${Date.now()}`,
        date: submission.moveDate,
        startTime: truckAssignment.startTime,
        endTime: truckAssignment.endTime,
        status: 'booked',
        customerName: submission.customerName,
        workType: truckAssignment.workType,
        description: `引っ越し案件: ${submission.customerName}`,
        capacity: truckAssignment.capacity,
        origin: submission.originAddress,
        destination: submission.destinationAddress,
      };

      const updatedTruck = {
        ...truck,
        schedules: [...truck.schedules, newSchedule],
      };

      const updatedTrucks = trucks.map(t => 
        t.id === truck.id ? updatedTruck : t
      );
      saveTrucks(updatedTrucks);
    }

    // 案件にトラック割り当てを追加
    const updatedSubmission: FormSubmission = {
      ...submission,
      truckAssignments: [...submission.truckAssignments, truckAssignment],
      status: 'assigned',
    };

    updateFormSubmission(updatedSubmission);
  };

  const removeTruckFromSubmission = (submissionId: string, truckId: string) => {
    const submission = formSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    // トラックのスケジュールから削除
    const truck = trucks.find(t => t.id === truckId);
    if (truck) {
      const updatedTruck = {
        ...truck,
        schedules: truck.schedules.filter(s => 
          !(s.date === submission.moveDate && 
            s.customerName === submission.customerName &&
            s.status === 'booked')
        ),
      };

      const updatedTrucks = trucks.map(t => 
        t.id === truck.id ? updatedTruck : t
      );
      saveTrucks(updatedTrucks);
    }

    // 案件からトラック割り当てを削除
    const updatedSubmission: FormSubmission = {
      ...submission,
      truckAssignments: submission.truckAssignments.filter(ta => ta.truckId !== truckId),
      status: submission.truckAssignments.length <= 1 ? 'pending' : 'assigned',
    };

    updateFormSubmission(updatedSubmission);
  };

  const updateFormSubmission = (updatedSubmission: FormSubmission) => {
    const updatedSubmissions = formSubmissions.map(submission => 
      submission.id === updatedSubmission.id ? updatedSubmission : submission
    );
    saveFormSubmissions(updatedSubmissions);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '未割り当て';
      case 'assigned': return '割り当て済み';
      case 'completed': return '完了';
      default: return '不明';
    }
  };

  // formatDate と formatTime は utils/dateTimeUtils.ts からインポート

  // 推奨トラックを計算
  const calculateRecommendedTrucks = (points: number): any[] => {
    const recommended: any[] = [];
    
    pricingRules.forEach(rule => {
      if (points >= rule.minPoint && (!rule.maxPoint || points <= rule.maxPoint)) {
        // 料金設定のトラックから該当する種別のトラックを取得
        const matchingTrucks = pricingTrucks.filter(truck =>
          truck.truckType === rule.truckType && truck.status === 'available'
        );
        recommended.push(...matchingTrucks);
      }
    });
    
    return recommended;
  };

  // 見積もり価格を計算
  const calculateEstimatedPrice = (points: number, distance: number = 0): number => {
    // 基本料金を計算
    let basePrice = 0;
    pricingRules.forEach(rule => {
      if (points >= rule.minPoint && (!rule.maxPoint || points <= rule.maxPoint)) {
        basePrice = rule.price || 0;
      }
    });

    // 距離料金を計算
    let distancePrice = 0;
    if (distance > 0) {
      for (let i = distanceRanges.length - 1; i >= 0; i--) {
        if (distance <= distanceRanges[i].maxDistance) {
          distancePrice = distanceRanges[i].basePrice;
          break;
        }
      }
    }

    return basePrice + distancePrice;
  };

  // トラック種別に基づいて利用可能なトラックをフィルタリング
  const getAvailableTrucksByType = (truckType: string): Truck[] => {
    return trucks.filter(truck => 
      truck.truckType === truckType && 
      truck.status === 'available'
    );
  };



  const handleLogout = () => {
    if (!window.confirm('本当にログアウトしますか？')) return;
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminAutoLoginExpiry');
    localStorage.removeItem('adminRememberMe');
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
              <div className="flex items-center gap-4">
                <a
                  href="/admin/shifts"
                  className="text-teal-600 hover:text-teal-800 text-sm"
                >
                  👥 シフト管理
                </a>
                <a
                  href="/pricing/step2"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📊 料金設定を確認・編集
                </a>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  ログアウト
                </button>
              </div>
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
                    onClick={() => setActiveTab('assignments')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'assignments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📋 案件割り当て
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
            
            {activeTab === 'assignments' && (
              <div className="space-y-6">
                {/* ヘッダーアクション */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">引っ越し案件一覧</h2>
                  <div className="text-sm text-gray-600">
                    入力フォームから送信された案件: {formSubmissions.length}件
                  </div>
                </div>

                {/* 案件一覧 */}
                {formSubmissions.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500 mb-4">入力フォームから送信された案件がありません</p>
                    <p className="text-sm text-gray-400">
                      顧客が引っ越し見積もりフォームを送信すると、ここに表示されます
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formSubmissions.map(submission => (
                      <div key={submission.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{submission.customerName}</h3>
                            <p className="text-sm text-gray-600">{submission.customerEmail}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(submission.moveDate)} - {submission.customerPhone}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                              {getStatusText(submission.status)}
                            </span>
                            {/* 仮案件/本案件バッジ */}
                            {submission.contractStatus === 'estimate' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800">仮案件</span>
                            )}
                            {submission.contractStatus === 'contracted' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">本案件</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">総容量:</span>
                            <span className="ml-1">{submission.totalCapacity.toLocaleString()}kg</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">荷物ポイント:</span>
                            <span className="ml-1 font-semibold text-blue-600">{submission.totalPoints}pt</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">出発地:</span>
                            <span className="ml-1">{submission.originAddress}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">終了地点:</span>
                            <span className="ml-1">{submission.destinationAddress}</span>
                          </div>
                        </div>

                        {/* 推奨トラックと見積もり価格 */}
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900">料金設定に基づく推奨</h4>
                            <span className="text-sm text-gray-600">
                              見積もり: ¥{calculateEstimatedPrice(submission.totalPoints, submission.distance || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {calculateRecommendedTrucks(submission.totalPoints).map(truck => (
                              <span key={truck.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {truck.name} ({truck.truckType})
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* 荷物リスト */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">荷物リスト</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {submission.itemList.map((item, index) => (
                              <div key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 追加サービス */}
                        {submission.additionalServices.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">追加サービス</h4>
                            <div className="flex flex-wrap gap-2">
                              {submission.additionalServices.map((service, index) => (
                                <span key={index} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* トラック割り当て一覧 */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900">割り当てトラック</h4>
                            {submission.status !== 'completed' && (
                              <button
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setShowTruckModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                + トラック追加
                              </button>
                            )}
                          </div>
                          
                          {submission.truckAssignments.length === 0 ? (
                            <p className="text-sm text-gray-500">割り当て済みのトラックがありません</p>
                          ) : (
                            <div className="space-y-2">
                              {submission.truckAssignments.map((truckAssignment, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                  <div>
                                    <p className="font-medium text-gray-900">{truckAssignment.truckName}</p>
                                    <p className="text-sm text-gray-600">
                                      {formatTime(truckAssignment.startTime)}-{formatTime(truckAssignment.endTime)} 
                                      ({truckAssignment.capacity.toLocaleString()}kg)
                                    </p>
                                  </div>
                                  {submission.status !== 'completed' && (
                                    <button
                                      onClick={() => removeTruckFromSubmission(submission.id, truckAssignment.truckId)}
                                      className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                      削除
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'registration' && (
              <TruckRegistration
                trucks={trucks}
                selectedTruck={selectedTruck}
                onAddTruck={addTruck}
                onUpdateTruck={updateTruck}
                onDeleteTruck={deleteTruck}
                onSelectTruck={setSelectedTruck}
                availableTruckTypes={availableTruckTypes}
                pricingRules={pricingRules}
              />
            )}
          </div>
        </main>

        {/* モーダル */}
        {showTruckModal && (
          <TruckAssignmentModal
            selectedSubmission={selectedSubmission}
            trucks={trucks}
            pricingTrucks={pricingTrucks}
            setShowTruckModal={setShowTruckModal}
            assignTruckToSubmission={assignTruckToSubmission}
            calculateRecommendedTrucks={calculateRecommendedTrucks}
            calculateEstimatedPrice={calculateEstimatedPrice}
          />
        )}
      </div>
    </AdminAuthGuard>
  );
} 