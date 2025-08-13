'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  status: 'available' | 'maintenance';
  contractStatus?: 'confirmed' | 'estimate'; // 確定 or 見積もり回答済み
  customerName?: string;
  customerPhone?: string;
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
  // 新規追加フィールド
  caseStatus?: 'unanswered' | 'answered' | 'contracted' | 'lost' | 'cancelled'; // 案件ステータス
  requestSource?: string; // 依頼元（シンクワーク/手動登録）
  isManualRegistration?: boolean; // 手動登録フラグ
  registeredBy?: string; // 登録者
}

interface TruckAssignment {
  truckId: string;
  truckName: string;
  capacity: number;
  startTime: string;
  endTime: string;
  workType: 'loading' | 'moving' | 'unloading';
}

function DispatchManagementContent() {
  const searchParams = useSearchParams();
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
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
  const router = useRouter();

  // URLパラメータから選択された案件を取得
  const selectedCaseId = searchParams.get('selectedCase');
  const registrationMode = searchParams.get('mode');

  // 統一されたステータス表示システム
  const getStatusConfig = (type: string, status: string) => {
    const configs: Record<string, Record<string, { color: string; text: string; icon: string }>> = {
      // 案件ステータス
      submission: {
        pending: { color: 'bg-orange-100 text-orange-800 border-orange-200', text: '未割り当て', icon: '⏳' },
        assigned: { color: 'bg-blue-100 text-blue-800 border-blue-200', text: '割り当て済み', icon: '🚚' },
        completed: { color: 'bg-green-100 text-green-800 border-green-200', text: '完了', icon: '✅' },
      },
      // 案件ステータス（新規追加）
      caseStatus: {
        unanswered: { color: 'bg-gray-100 text-gray-800 border-gray-200', text: '未回答', icon: '📝' },
        answered: { color: 'bg-blue-100 text-blue-800 border-blue-200', text: '回答済み', icon: '✉️' },
        contracted: { color: 'bg-green-100 text-green-800 border-green-200', text: '受注', icon: '✅' },
        lost: { color: 'bg-red-100 text-red-800 border-red-200', text: '失注', icon: '❌' },
        cancelled: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'キャンセル', icon: '🚫' },
      },
      // トラックステータス
      truck: {
        available: { color: 'bg-green-600 text-white', text: '稼働中', icon: '🟢' },
        maintenance: { color: 'bg-yellow-600 text-white', text: '整備中', icon: '🔧' },
        inactive: { color: 'bg-red-600 text-white', text: '停止中', icon: '🔴' },
      },
      // 契約ステータス
      contract: {
        estimate: { color: 'bg-amber-100 text-amber-800 border-amber-200', text: '仮案件', icon: '📋' },
        contracted: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: '本案件', icon: '📝' },
      },
      // スケジュールステータス
      schedule: {
        confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-200', text: '確定', icon: '✅' },
        estimate: { color: 'bg-orange-100 text-orange-700 border-orange-200', text: '仮予定', icon: '⏳' },
      }
    };

    return configs[type]?.[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', text: '不明', icon: '❓' };
  };

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
              status: 'available',
              contractStatus: 'confirmed',
              customerName: '田中 一郎',
              customerPhone: '090-1111-2222',
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
              status: 'available',
              contractStatus: 'estimate',
              customerName: '佐藤 花子',
              customerPhone: '080-3333-4444',
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
              status: 'available',  
              contractStatus: 'confirmed',
              customerName: '山田 三郎',
              customerPhone: '070-5555-6666',
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
              status: 'available',
              contractStatus: 'estimate',
              customerName: '鈴木 四郎',
              customerPhone: '090-7777-8888',
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
              status: 'available',
              contractStatus: 'confirmed',
              customerName: '高橋 五郎',
              customerPhone: '080-9999-0000',
              workType: 'loading',
              description: '引っ越し作業',
              capacity: 200,
              points: 30,
              origin: '東京都江戸川区葛西11-11-11',
              destination: '東京都江東区木場12-12-12',
            },
            // 7/26のテストデータを追加
            {
              id: 'schedule-7-26-1',
              date: '2025-07-26',
              startTime: '09:00',
              endTime: '11:00',
              status: 'available',
              contractStatus: 'confirmed',
              customerName: '田中 一郎',
              customerPhone: '090-1111-2222',
              workType: 'loading',
              description: '引っ越し作業',
              capacity: 300,
              points: 50,
              origin: '東京都新宿区西新宿1-1',
              destination: '東京都渋谷区渋谷2-2',
            },
            {
              id: 'schedule-7-26-2',
              date: '2025-07-26',
              startTime: '09:00',
              endTime: '11:00',
              status: 'available',
              contractStatus: 'estimate',
              customerName: '佐藤 花子',
              customerPhone: '080-3333-4444',
              workType: 'loading',
              description: '引っ越し作業',
              capacity: 400,
              points: 75,
              origin: '東京都中野区中野3-3',
              destination: '東京都杉並区阿佐ヶ谷4-4',
            },
            {
              id: 'schedule-7-26-3',
              date: '2025-07-26',
              startTime: '09:00',
              endTime: '11:00',
              status: 'available',
              contractStatus: 'confirmed',
              customerName: '山田 三郎',
              customerPhone: '070-5555-6666',
              workType: 'moving',
              description: '引っ越し作業',
              capacity: 600,
              points: 100,
              origin: '東京都目黒区目黒7-7',
              destination: '東京都世田谷区三軒茶屋8-8',
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
              status: 'available',
              contractStatus: 'confirmed',
              customerName: '山田 次郎',
              customerPhone: '090-2222-3333',
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
              status: 'available',
              contractStatus: 'estimate',
              customerName: '伊藤 六郎',
              customerPhone: '080-4444-5555',
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
              status: 'available',
              contractStatus: 'confirmed',
              customerName: '渡辺 七郎',
              customerPhone: '070-6666-7777',
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

  // 初期化時にURLパラメータを処理
  useEffect(() => {
    if (selectedCaseId && registrationMode === 'registration') {
      // 配車登録モードで遷移した場合
      setActiveTab('assignments');
      
      // 該当案件を自動的に展開状態にする
      setExpandedSubmissions(prev => new Set([...prev, selectedCaseId]));
      
      // 成功メッセージを表示
      setTimeout(() => {
        alert('案件登録が完了しました。配車登録を行ってください。');
      }, 100);

      // 30秒後にハイライトを自動的に解除（URLパラメータをクリア）
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('selectedCase');
        url.searchParams.delete('mode');
        window.history.replaceState({}, '', url.toString());
      }, 30000);
    }
  }, [selectedCaseId, registrationMode]);

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

  // バリデーション関数
  const validateTruckAssignment = (submissionId: string, truckAssignment: TruckAssignment): { isValid: boolean; error?: string; warning?: string } => {
    const submission = formSubmissions.find(s => s.id === submissionId);
    const truck = trucks.find(t => t.id === truckAssignment.truckId);
    
    if (!submission || !truck) {
      return { isValid: false, error: '案件またはトラックが見つかりません' };
    }

    // トラックステータスチェック
    if (truck.status !== 'available') {
      return { 
        isValid: false, 
        error: `このトラックは現在${truck.status === 'maintenance' ? '整備中' : '停止中'}のため割り当てできません`
      };
    }

    // 容量チェック
    if (truckAssignment.capacity > truck.capacityKg) {
      return { 
        isValid: false, 
        error: `容量超過: ${truckAssignment.capacity.toLocaleString()}kg > ${truck.capacityKg.toLocaleString()}kg`
      };
    }

    // 時間重複チェック（確定案件のみ）
    const conflictingSchedules = truck.schedules.filter(schedule => {
      if (schedule.date !== submission.moveDate) return false;
      if (schedule.contractStatus !== 'confirmed') return false; // 確定案件のみチェック
      
      const scheduleStart = parseInt(schedule.startTime.replace(':', ''));
      const scheduleEnd = parseInt(schedule.endTime.replace(':', ''));
      const newStart = parseInt(truckAssignment.startTime.replace(':', ''));
      const newEnd = parseInt(truckAssignment.endTime.replace(':', ''));
      
      return (newStart < scheduleEnd && newEnd > scheduleStart);
    });

    if (conflictingSchedules.length > 0) {
      return { 
        isValid: false, 
        error: `時間重複: ${conflictingSchedules[0].startTime}-${conflictingSchedules[0].endTime} (${conflictingSchedules[0].customerName}様・確定案件)`
      };
    }

    // 仮案件重複の警告
    const tentativeConflicts = truck.schedules.filter(schedule => {
      if (schedule.date !== submission.moveDate) return false;
      if (schedule.contractStatus === 'confirmed') return false; // 仮案件のみチェック
      
      const scheduleStart = parseInt(schedule.startTime.replace(':', ''));
      const scheduleEnd = parseInt(schedule.endTime.replace(':', ''));
      const newStart = parseInt(truckAssignment.startTime.replace(':', ''));
      const newEnd = parseInt(truckAssignment.endTime.replace(':', ''));
      
      return (newStart < scheduleEnd && newEnd > scheduleStart);
    });

    if (tentativeConflicts.length > 0) {
      return { 
        isValid: true, 
        warning: `仮案件と重複: ${tentativeConflicts[0].startTime}-${tentativeConflicts[0].endTime} (${tentativeConflicts[0].customerName}様)`
      };
    }

    return { isValid: true };
  };

  /**
   * 案件ステータス変更（手動変更可能なもののみ）
   */
  const changeCaseStatus = (submissionId: string, newStatus: 'cancelled') => {
    const submission = formSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    // 受注案件からキャンセルへの変更のみ許可
    if (submission.caseStatus !== 'contracted' && submission.contractStatus !== 'contracted') {
      alert('受注済み案件のみキャンセルに変更できます。');
      return;
    }

    if (!confirm(`案件「${submission.customerName}様」をキャンセルに変更しますか？\n\n※キャンセル案件は請求対象となります。`)) {
      return;
    }

    const updatedSubmissions = formSubmissions.map(s => 
      s.id === submissionId 
        ? { ...s, caseStatus: newStatus, contractStatus: newStatus === 'cancelled' ? 'contracted' : s.contractStatus }
        : s
    );
    
    saveFormSubmissions(updatedSubmissions);
    alert(`案件ステータスを「${newStatus === 'cancelled' ? 'キャンセル' : newStatus}」に変更しました。`);
  };

  const assignTruckToSubmission = (submissionId: string, truckAssignment: TruckAssignment) => {
    // バリデーション実行
    const validation = validateTruckAssignment(submissionId, truckAssignment);
    
    if (!validation.isValid) {
      alert(`❌ 割り当てエラー\n\n${validation.error}`);
      return;
    }

    if (validation.warning) {
      if (!window.confirm(`⚠️ 警告\n\n${validation.warning}\n\n続行しますか？`)) {
        return;
      }
    }

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
        status: 'available',
        contractStatus: submission.contractStatus === 'contracted' ? 'confirmed' : 'estimate',
        customerName: submission.customerName,
        customerPhone: submission.customerPhone,
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
    
    // 成功メッセージ
    alert(`✅ 割り当て完了\n\n${truck?.name} を ${submission.customerName}様の案件に割り当てました。`);
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
            s.status === 'available')
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
    return getStatusConfig('submission', status).color;
  };

  const getStatusText = (status: string) => {
    return getStatusConfig('submission', status).text;
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



  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">配車管理</h1>
              <p className="text-sm text-gray-600 mt-1">
                トラックの稼働スケジュール管理
              </p>
            </div>
            <div className="flex items-center gap-4 min-h-[44px]">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                トップに戻る
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              配車カレンダー
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              案件割り当て
            </button>
            <button
              onClick={() => setActiveTab('registration')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'registration'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              トラック登録
            </button>
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* タブコンテンツ */}
          {activeTab === 'calendar' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <DispatchCalendar 
                  trucks={trucks}
                  onUpdateTruck={updateTruck}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'assignments' && (
            <div className="space-y-8">
              {/* ヘッダーアクション */}
              <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">引越し案件一覧</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      入力フォームから送信された案件: {formSubmissions.length}件
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="bg-orange-100 px-3 py-1 rounded-full">
                      未割当: {formSubmissions.filter(s => s.status === 'pending').length}件
                    </div>
                    <div className="bg-blue-100 px-3 py-1 rounded-full">
                      割当済: {formSubmissions.filter(s => s.status === 'assigned').length}件
                    </div>
                    <div className="bg-green-100 px-3 py-1 rounded-full">
                      完了: {formSubmissions.filter(s => s.status === 'completed').length}件
                    </div>
                  </div>
                </div>
              </div>

              {/* トラック一覧 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl">🚚</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">トラック稼働状況</h3>
                      <p className="text-sm text-gray-600">
                        登録台数: {trucks.length}台 | 
                        稼働中: {trucks.filter(t => t.status === 'available').length}台 | 
                        整備中: {trucks.filter(t => t.status === 'maintenance').length}台
                      </p>
                    </div>
                  </div>
                </div>
                
                {trucks.length === 0 ? (
                  <div className="p-7 text-center">
                    <p className="text-gray-500 mb-2">登録済みのトラックがありません</p>
                    <p className="text-sm text-gray-400">トラック登録・編集タブから新しいトラックを追加してください</p>
                  </div>
                ) : (
                  <div className="p-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {trucks.map(truck => {
                        const nextSchedule = truck.schedules
                          .filter(s => s.date >= new Date().toISOString().split('T')[0])
                          .sort((a, b) => a.date.localeCompare(b.date))[0];
                        
                        const todaySchedules = truck.schedules
                          .filter(s => s.date === new Date().toISOString().split('T')[0])
                          .length;

                        return (
                          <div key={truck.id} className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                            truck.status === 'available' ? 'border-green-200 bg-green-50' :
                            truck.status === 'maintenance' ? 'border-yellow-200 bg-yellow-50' :
                            'border-red-200 bg-red-50'
                          }`}>
                            {/* ヘッダー */}
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900">{truck.name}</h4>
                                <p className="text-sm text-gray-600">{truck.plateNumber}</p>
                              </div>
                              <div className="text-right">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusConfig('truck', truck.status).color}`}>
                                  {getStatusConfig('truck', truck.status).icon} {getStatusConfig('truck', truck.status).text}
                                </span>
                                {todaySchedules > 0 && (
                                  <p className="text-xs text-gray-600 mt-1">本日: {todaySchedules}件</p>
                                )}
                              </div>
                            </div>

                            {/* 基本情報 */}
                            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">📦</span>
                                <span className="font-medium">{truck.capacityKg.toLocaleString()}kg</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">🚛</span>
                                <span className="text-gray-700">{truck.truckType}</span>
                              </div>
                            </div>
                            
                            {/* 次回稼働予定 */}
                            {nextSchedule ? (
                              <div className={`p-3 rounded-lg border-l-4 ${
                                nextSchedule.contractStatus === 'confirmed' 
                                  ? 'bg-blue-50 border-blue-400' 
                                  : 'bg-orange-50 border-orange-400'
                              }`}>
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-sm font-bold text-gray-900">次回稼働予定</p>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusConfig('schedule', nextSchedule.contractStatus || 'estimate').color}`}>
                                    {getStatusConfig('schedule', nextSchedule.contractStatus || 'estimate').icon} {getStatusConfig('schedule', nextSchedule.contractStatus || 'estimate').text}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-gray-800">
                                  📅 {new Date(nextSchedule.date).toLocaleDateString('ja-JP', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    weekday: 'short' 
                                  })}
                                </p>
                                <p className="text-sm text-gray-700">
                                  ⏰ {nextSchedule.startTime}-{nextSchedule.endTime}
                                </p>
                                {nextSchedule.customerName && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    👤 {nextSchedule.customerName}様
                                  </p>
                                )}
                                {nextSchedule.workType && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    作業: {nextSchedule.workType === 'loading' ? '積み込み' :
                                           nextSchedule.workType === 'unloading' ? '荷下ろし' :
                                           nextSchedule.workType === 'moving' ? '輸送' : '整備'}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg bg-gray-100 border-l-4 border-gray-300">
                                <p className="text-sm font-medium text-gray-600">📋 稼働予定なし</p>
                                <p className="text-xs text-gray-500 mt-1">新しい案件をアサイン可能</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 案件一覧 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">📋</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-600">案件詳細</h3>
                        <p className="text-sm text-gray-900">引越し案件の管理・編集</p>
                      </div>
                    </div>
                    {selectedCaseId && registrationMode === 'registration' && (
                      <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 text-lg">🎯</span>
                          <span className="text-sm font-medium text-green-800">
                            新規登録案件が緑色でハイライト表示されています
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {formSubmissions.length === 0 ? (
                  <div className="p-7 text-center">
                    <p className="text-gray-500 mb-4">入力フォームから送信された案件がありません</p>
                    <p className="text-sm text-gray-400">
                      顧客が引越し見積もりフォームを送信すると、ここに表示されます
                    </p>
                  </div>
                ) : (
                  <div className="p-7 space-y-6">
                    {formSubmissions.map(submission => {
                      const isExpanded = expandedSubmissions.has(submission.id);
                      
                      const toggleExpanded = () => {
                        const newExpandedSubmissions = new Set(expandedSubmissions);
                        if (isExpanded) {
                          newExpandedSubmissions.delete(submission.id);
                        } else {
                          newExpandedSubmissions.add(submission.id);
                        }
                        setExpandedSubmissions(newExpandedSubmissions);
                      };
                      
                      // 新規登録された案件かどうかを判定
                      const isNewlyRegistered = submission.id === selectedCaseId && registrationMode === 'registration';
                      
                      return (
                        <div 
                          key={submission.id} 
                          className={`bg-white rounded-xl shadow border-2 hover:shadow-lg transition-all duration-300 ${
                            isNewlyRegistered 
                              ? 'border-green-400 bg-green-50 ring-2 ring-green-200 animate-pulse' 
                              : 'border-gray-200'
                          }`}
                        >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-bold text-gray-900">{submission.customerName}</h3>
                                  {isNewlyRegistered && (
                                    <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full animate-bounce">
                                      🆕 新規登録
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <p className="text-gray-600">{formatDate(submission.moveDate)}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-blue-600 font-medium">
                                      📋 {submission.requestSource || (submission.isManualRegistration ? '手動登録' : 'シンクワーク')}
                                    </span>
                                    {submission.isManualRegistration && submission.customerPhone && (
                                      <span className="text-gray-600">
                                        📞 {submission.customerPhone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                  📊 {submission.totalPoints}pt
                                </span>
                                <span className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                  💰 ¥{calculateEstimatedPrice(submission.totalPoints, submission.distance || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusConfig('submission', submission.status).color}`}>
                                {getStatusConfig('submission', submission.status).icon} {getStatusConfig('submission', submission.status).text}
                              </span>
                              
                              {/* 案件ステータス */}
                              {submission.caseStatus && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusConfig('caseStatus', submission.caseStatus).color}`}>
                                  {getStatusConfig('caseStatus', submission.caseStatus).icon} {getStatusConfig('caseStatus', submission.caseStatus).text}
                                </span>
                              )}
                              
                              {submission.contractStatus === 'estimate' && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusConfig('contract', 'estimate').color}`}>
                                  {getStatusConfig('contract', 'estimate').icon} {getStatusConfig('contract', 'estimate').text}
                                </span>
                              )}
                              {submission.contractStatus === 'contracted' && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusConfig('contract', 'contracted').color}`}>
                                  {getStatusConfig('contract', 'contracted').icon} {getStatusConfig('contract', 'contracted').text}
                                </span>
                              )}
                              
                              {/* キャンセルボタン（受注案件のみ表示） */}
                              {(submission.caseStatus === 'contracted' || submission.contractStatus === 'contracted') && 
                               submission.caseStatus !== 'cancelled' && (
                                <button
                                  onClick={() => changeCaseStatus(submission.id, 'cancelled')}
                                  className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 rounded hover:bg-yellow-200 transition-colors"
                                  title="受注案件をキャンセルに変更（請求対象）"
                                >
                                  🚫 キャンセル
                                </button>
                              )}
                              
                              <button
                                onClick={toggleExpanded}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded"
                              >
                                {isExpanded ? '▲ 詳細を閉じる' : '▼ 詳細を表示'}
                              </button>
                            </div>
                          </div>

                          {/* 基本情報の簡潔表示 */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">📦</span>
                              <span className="font-medium">{submission.totalCapacity.toLocaleString()}kg</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">📍</span>
                              <span className="text-gray-700 truncate">{submission.originAddress}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">🏁</span>
                              <span className="text-gray-700 truncate">{submission.destinationAddress}</span>
                            </div>
                          </div>

                          {/* 推奨トラックと割り当て状況（簡潔版） */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">推奨:</span>
                              <div className="flex gap-1">
                                {calculateRecommendedTrucks(submission.totalPoints).slice(0, 3).map(truck => (
                                  <span key={truck.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                    {truck.truckType}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {submission.truckAssignments.length > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  🚚 {submission.truckAssignments.length}台割当済
                                </span>
                              )}
                              {submission.status !== 'completed' && (
                                <button
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setShowTruckModal(true);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                                >
                                  + トラック割当
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 展開可能な詳細情報 */}
                        {isExpanded && (
                          <div className="border-t bg-gray-50 p-6 space-y-4">
                            {/* 連絡先情報 */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">連絡先情報</h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>📧 {submission.customerEmail}</div>
                                <div>📞 {submission.customerPhone}</div>
                              </div>
                            </div>
                            {/* 荷物詳細 */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">荷物リスト</h4>
                              <div className="flex flex-wrap gap-1">
                                {submission.itemList.map((item, index) => (
                                  <span key={index} className="text-xs bg-white border px-2 py-1 rounded">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* 追加サービス */}
                            {submission.additionalServices.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">追加サービス</h4>
                                <div className="flex flex-wrap gap-1">
                                  {submission.additionalServices.map((service, index) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 割り当てトラック */}
                            {submission.truckAssignments.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">割り当てトラック</h4>
                                <div className="space-y-2">
                                  {submission.truckAssignments.map((truckAssignment, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                                      <div>
                                        <span className="font-medium text-sm">{truckAssignment.truckName}</span>
                                        <span className="text-xs text-gray-600 ml-2">
                                          {formatTime(truckAssignment.startTime)}-{formatTime(truckAssignment.endTime)} 
                                          ({truckAssignment.capacity.toLocaleString()}kg)
                                        </span>
                                      </div>
                                      {submission.status !== 'completed' && (
                                        <button
                                          onClick={() => removeTruckFromSubmission(submission.id, truckAssignment.truckId)}
                                          className="text-red-600 hover:text-red-800 text-xs px-2 py-1 hover:bg-red-50 rounded"
                                        >
                                          削除
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'registration' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl">🚚</div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-600">トラック登録・編集</h3>
                    <p className="text-sm text-gray-900">車両情報の管理・更新</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
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
              </div>
            </div>
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
  );
}

export default function DispatchManagement() {
  return (
    <AdminAuthGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">配車管理画面を読み込み中...</p>
          </div>
        </div>
      }>
        <DispatchManagementContent />
      </Suspense>
    </AdminAuthGuard>
  );
} 