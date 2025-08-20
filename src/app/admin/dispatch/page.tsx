'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import TruckRegistration from '@/components/TruckRegistration';
import DispatchCalendar from '@/components/DispatchCalendar';
import TruckAssignmentModal from './components/TruckAssignmentModal';
import StatusFilter from '@/components/dispatch/StatusFilter';
import { TruckManagement } from '@/components/dispatch/TruckManagement';
import WorkerAssignmentView from './views/WorkerAssignmentView';
import { formatDate, formatTime, toLocalDateString } from '@/utils/dateTimeUtils';
import { Truck, Schedule } from '@/types/dispatch';
import { ContractStatus } from '@/types/case';
import { TEST_TRUCKS, generateTestFormSubmission } from '@/constants/testData';

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
  contractStatus: ContractStatus; // 見積もり or 契約完了
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
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [activeView, setActiveView] = useState<'unified' | 'worker-assignment'>('unified');
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [bulkAssignData, setBulkAssignData] = useState<{
    selectedSubmissions: string[];
    templateSettings: any;
  }>({ selectedSubmissions: [], templateSettings: {} });
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [availableTruckTypes, setAvailableTruckTypes] = useState<string[]>([]);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [truckCoefficients, setTruckCoefficients] = useState<any[]>([]);
  const [distanceRanges, setDistanceRanges] = useState<any[]>([]);
  const [pricingTrucks, setPricingTrucks] = useState<any[]>([]);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'estimate'>('all');
  
  // 使用不能期間設定関連のstate
  const [showUnavailablePeriodModal, setShowUnavailablePeriodModal] = useState(false);
  const [selectedTruckForUnavailable, setSelectedTruckForUnavailable] = useState<Truck | null>(null);
  const [unavailablePeriod, setUnavailablePeriod] = useState({ startDate: '', endDate: '', reason: '' });
  
  const router = useRouter();

  // 配車テンプレート定義
  const dispatchTemplates = [
    {
      id: 'standard-single',
      name: '標準単発配車',
      description: '1台のトラックで完結する標準的な配車',
      settings: {
        truckCount: 1,
        workerCount: 2,
        timeBuffer: 30, // 分
        autoAssignWorkers: true,
        preferredTruckTypes: ['2tショート', '2tロング']
      }
    },
    {
      id: 'large-scale',
      name: '大規模配車',
      description: '複数台のトラックが必要な大規模な引越し',
      settings: {
        truckCount: 2,
        workerCount: 4,
        timeBuffer: 60,
        autoAssignWorkers: true,
        preferredTruckTypes: ['3t', '4t']
      }
    },
    {
      id: 'quick-delivery',
      name: '急行配送',
      description: '時間を重視した迅速な配送',
      settings: {
        truckCount: 1,
        workerCount: 3,
        timeBuffer: 15,
        autoAssignWorkers: true,
        preferredTruckTypes: ['軽トラ', '2tショート']
      }
    },
    {
      id: 'custom',
      name: 'カスタム設定',
      description: '個別にカスタマイズした配車設定',
      settings: {
        truckCount: 1,
        workerCount: 2,
        timeBuffer: 30,
        autoAssignWorkers: false,
        preferredTruckTypes: []
      }
    }
  ];

  // 一括割り当て機能
  const handleBulkAssign = async (submissionIds: string[], templateId: string) => {
    const template = dispatchTemplates.find(t => t.id === templateId);
    if (!template) {
      alert('テンプレートが見つかりません');
      return;
    }

    const submissionsToAssign = submissions.filter(s => submissionIds.includes(s.id));
    
    for (const submission of submissionsToAssign) {
      // テンプレート設定に基づいてトラック選択
      const availableTrucks = trucks.filter(truck => 
        truck.status === 'available' && 
        (template.settings.preferredTruckTypes.length === 0 || 
         template.settings.preferredTruckTypes.includes(truck.truckType))
      );

      if (availableTrucks.length === 0) {
        alert(`${submission.customerName}の案件に適用可能なトラックがありません`);
        continue;
      }

      // 自動トラック割り当て
      const selectedTruck = availableTrucks[0];
      const startTime = new Date(submission.moveDate);
      startTime.setHours(9, 0, 0, 0); // デフォルト開始時間

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 4); // 4時間の作業時間

      const truckAssignment = {
        truckId: selectedTruck.id,
        truckName: selectedTruck.name,
        capacity: submission.totalCapacity || 1000,
        startTime: startTime.toTimeString().substring(0, 5),
        endTime: endTime.toTimeString().substring(0, 5),
        workType: 'moving' as const
      };

      // 提出データを更新
      const updatedSubmission = {
        ...submission,
        status: 'assigned' as const,
        truckAssignments: [truckAssignment]
      };

      // トラックのスケジュールを更新
      const newSchedule = {
        id: `schedule-${Date.now()}-${Math.random()}`,
        date: submission.moveDate,
        startTime: truckAssignment.startTime,
        endTime: truckAssignment.endTime,
        status: 'assigned' as const,
        customerName: submission.customerName,
        workType: truckAssignment.workType,
        description: `${submission.originAddress} → ${submission.destinationAddress}`,
        capacity: truckAssignment.capacity,
        origin: submission.originAddress,
        destination: submission.destinationAddress
      };

      const updatedTruck = {
        ...selectedTruck,
        schedules: [...selectedTruck.schedules, newSchedule]
      };

      // 状態を更新
      setSubmissions(prev => prev.map(s => s.id === submission.id ? updatedSubmission : s));
      updateTruck(updatedTruck);
    }

    setShowBulkAssignModal(false);
    setBulkAssignData({ selectedSubmissions: [], templateSettings: {} });
    alert(`${submissionsToAssign.length}件の案件を一括割り当てしました`);
  };

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
    // テスト用：ローカルストレージをクリアしてテストデータを確実に読み込む
    localStorage.removeItem('trucks');
    
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
              date: toLocalDateString(new Date()),
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
              date: toLocalDateString(new Date()),
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
              date: toLocalDateString(new Date()),
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
              date: toLocalDateString(new Date()),
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
              date: toLocalDateString(new Date()),
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
              date: '2025-08-26',
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
            // 単一案件のテストデータを追加（13:00-15:00）
            {
              id: 'schedule-single-1',
              date: toLocalDateString(new Date()),
              startTime: '13:00',
              endTime: '15:00',
              status: 'available',
              contractStatus: 'confirmed',
              customerName: '単一案件 太郎',
              customerPhone: '090-0000-0000',
              workType: 'loading',
              description: '単一案件のテスト',
              capacity: 100,
              points: 20,
              origin: '東京都新宿区',
              destination: '東京都渋谷区',
            },
            // 単一案件のテストデータを追加（15:00-17:00）- 確実に表示されるように
            {
              id: 'schedule-single-2',
              date: toLocalDateString(new Date()),
              startTime: '15:00',
              endTime: '17:00',
              status: 'available',
              contractStatus: 'estimate',
              customerName: '単一案件 花子',
              customerPhone: '090-0000-0001',
              workType: 'unloading',
              description: '単一案件のテスト2',
              capacity: 150,
              points: 25,
              origin: '東京都新宿区',
              destination: '東京都渋谷区',
            },
            {
              id: 'schedule-7-26-2',
              date: '2025-08-26',
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
              date: '2025-08-26',
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
              date: toLocalDateString(new Date()),
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
              date: toLocalDateString(new Date()),
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
              date: toLocalDateString(new Date()),
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
              id: 'schedule-8',
              date: toLocalDateString(new Date()),
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
          contractStatus: 'confirmed',
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
      setActiveTab('registration');
      
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
            if (submission.caseStatus !== 'contracted' && submission.contractStatus !== 'confirmed') {
      alert('受注済み案件のみキャンセルに変更できます。');
      return;
    }

    if (!confirm(`案件「${submission.customerName}様」をキャンセルに変更しますか？\n\n※キャンセル案件は請求対象となります。`)) {
      return;
    }

    const updatedSubmissions = formSubmissions.map(s => 
      s.id === submissionId 
        ? { ...s, caseStatus: newStatus, contractStatus: newStatus === 'cancelled' ? 'confirmed' : s.contractStatus }
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
        id: `schedule-${crypto.randomUUID()}`,
        date: submission.moveDate,
        startTime: truckAssignment.startTime,
        endTime: truckAssignment.endTime,
        status: 'available',
        contractStatus: submission.contractStatus === 'confirmed' ? 'confirmed' : 'estimate',
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

      {/* 統合ナビゲーション */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveView('unified')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === 'unified'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 統合配車管理
              </button>

              <button
                onClick={() => setActiveView('worker-assignment')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === 'worker-assignment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👷 作業者割り当て
              </button>
            </nav>
            
            {/* 一括操作ボタン */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBulkAssignModal(true)}
                disabled={filteredSubmissions.filter(s => s.status === 'pending').length === 0}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                🚚 一括配車割り当て
              </button>
              <div className="text-sm text-gray-500">
                未割当: {filteredSubmissions.filter(s => s.status === 'pending').length}件
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* 統合ビューコンテンツ */}
          {activeView === 'unified' && (
            <div className="space-y-6">
              {/* 統合ダッシュボード */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-4">📊 配車管理統合ダッシュボード</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90">総案件数</div>
                    <div className="text-2xl font-bold">{submissions.length}</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90">未割当案件</div>
                    <div className="text-2xl font-bold text-orange-200">
                      {submissions.filter(s => s.status === 'pending').length}
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90">稼働中トラック</div>
                    <div className="text-2xl font-bold text-green-200">
                      {trucks.filter(t => t.status === 'busy').length}
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90">利用可能トラック</div>
                    <div className="text-2xl font-bold text-blue-200">
                      {trucks.filter(t => t.status === 'available').length}
                    </div>
                  </div>
                </div>
              </div>

              {/* カレンダービューとトラック管理を統合 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 配車カレンダー（拡張） */}
                <div className="lg:col-span-2 bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">配車カレンダー</h3>
                      <StatusFilter onFilterChange={setStatusFilter} currentFilter={statusFilter} />
                    </div>
                    <DispatchCalendar 
                      trucks={trucks as any}
                      onUpdateTruck={updateTruck}
                      statusFilter={statusFilter}
                    />
                  </div>
                </div>

                {/* トラック・案件管理パネル */}
                <div className="space-y-4">
                  {/* トラック状況 */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🚚 トラック状況</h3>
                      <TruckManagement 
                        trucks={trucks as any}
                        onTrucksChange={setTrucks}
                        compact={true}
                      />
                    </div>
                  </div>

                  {/* 新規案件登録 */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 クイック操作</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => router.push('/admin/cases/register')}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                        >
                          + 新規案件登録
                        </button>
                        <TruckRegistration
                          trucks={trucks}
                          selectedTruck={selectedTruck}
                          onAddTruck={addTruck}
                          onUpdateTruck={updateTruck}
                          onDeleteTruck={deleteTruck}
                          onSelectTruck={setSelectedTruck}
                          availableTruckTypes={availableTruckTypes}
                          pricingRules={pricingRules}
                          compact={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 案件一覧（テンプレート統合） */}
              <UnifiedCaseManagement
                submissions={filteredSubmissions}
                trucks={trucks}
                onAssignTruck={assignTruckToSubmission}
                onRemoveTruck={removeTruckFromSubmission}
                expandedSubmissions={expandedSubmissions}
                onToggleExpand={(id) => {
                  setExpandedSubmissions(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(id)) {
                      newSet.delete(id);
                    } else {
                      newSet.add(id);
                    }
                    return newSet;
                  });
                }}
                dispatchTemplates={dispatchTemplates}
                onBulkAssign={handleBulkAssign}
              />
            </div>
          )}

          {/* 作業者割り当てビュー */}
          {activeView === 'worker-assignment' && (
            <WorkerAssignmentView
              trucks={trucks}
              selectedDate={new Date().toISOString().split('T')[0]}
              onUpdateTruck={updateTruck}
            />
          )}
        </div>
      </main>

      {/* 一括割り当てモーダル */}
      {showBulkAssignModal && (
        <BulkAssignModal
          submissions={submissions.filter(s => s.status === 'pending')}
          templates={dispatchTemplates}
          onAssign={handleBulkAssign}
          onClose={() => setShowBulkAssignModal(false)}
        />
      )}

      {/* トラック割り当てモーダル */}
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

      {/* 車両使用不能期間設定モーダル */}
      {showUnavailablePeriodModal && (
        <UnavailablePeriodModal
          truck={selectedTruckForUnavailable}
          onClose={() => {
            setShowUnavailablePeriodModal(false);
            setSelectedTruckForUnavailable(null);
            setUnavailablePeriod({ startDate: '', endDate: '', reason: '' });
          }}
          onSave={(period) => {
            if (!selectedTruckForUnavailable) return;
            
            // 指定期間に使用不能スケジュールを作成
            const startDate = new Date(period.startDate);
            const endDate = new Date(period.endDate);
            const newSchedules: Schedule[] = [];
            
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
              newSchedules.push({
                id: `unavailable-${crypto.randomUUID()}`,
                date: toLocalDateString(date),
                startTime: '00:00',
                endTime: '23:59',
                status: 'maintenance',
                customerName: '',
                workType: 'maintenance',
                description: `使用不能期間: ${period.reason}`,
                capacity: 0,
                origin: '',
                destination: '',
              });
            }
            
            const updatedTruck = {
              ...selectedTruckForUnavailable,
              schedules: [...selectedTruckForUnavailable.schedules, ...newSchedules]
            };
            
            updateTruck(updatedTruck);
            setShowUnavailablePeriodModal(false);
            setSelectedTruckForUnavailable(null);
            setUnavailablePeriod({ startDate: '', endDate: '', reason: '' });
          }}
          initialPeriod={unavailablePeriod}
          onPeriodChange={setUnavailablePeriod}
        />
      )}
    </div>
  );
}

// 一括割り当てモーダルコンポーネント
interface BulkAssignModalProps {
  submissions: FormSubmission[];
  templates: typeof dispatchTemplates;
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

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              一括割り当て実行
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 統合案件管理コンポーネント  
interface UnifiedCaseManagementProps {
  submissions: FormSubmission[];
  trucks: Truck[];
  onAssignTruck: (submissionId: string, truckId: string) => void;
  onRemoveTruck: (submissionId: string, truckId: string) => void;
  expandedSubmissions: Set<string>;
  onToggleExpand: (id: string) => void;
  dispatchTemplates: any[];
  onBulkAssign: (submissionIds: string[], templateId: string) => void;
}

const UnifiedCaseManagement = ({ 
  submissions, 
  trucks, 
  onAssignTruck, 
  onRemoveTruck, 
  expandedSubmissions, 
  onToggleExpand,
  dispatchTemplates,
  onBulkAssign
}: UnifiedCaseManagementProps) => {
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">📋 案件管理</h3>
          <div className="text-sm text-gray-500">
            総案件数: {submissions.length}件
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>表示する案件がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map(submission => (
              <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{submission.customerName}</h4>
                      <p className="text-sm text-gray-600">{submission.moveDate}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      submission.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      submission.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {submission.status === 'pending' ? '未割当' :
                       submission.status === 'assigned' ? '割当済' : '完了'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {submission.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowTruckModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        トラック割当
                      </button>
                    )}
                    <button
                      onClick={() => onToggleExpand(submission.id)}
                      className="px-3 py-1 text-gray-600 text-sm border rounded hover:bg-gray-50"
                    >
                      {expandedSubmissions.has(submission.id) ? '詳細を隠す' : '詳細を表示'}
                    </button>
                  </div>
                </div>

                {expandedSubmissions.has(submission.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">引越し元:</span> {submission.originAddress}
                      </div>
                      <div>
                        <span className="font-medium">引越し先:</span> {submission.destinationAddress}
                      </div>
                      <div>
                        <span className="font-medium">総ポイント:</span> {submission.totalPoints}pt
                      </div>
                      <div>
                        <span className="font-medium">総容量:</span> {submission.totalCapacity}kg
                      </div>
                    </div>
                    
                    {submission.truckAssignments.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-700">割り当て済みトラック:</span>
                        <div className="mt-1 space-y-1">
                          {submission.truckAssignments.map((assignment, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">
                                {assignment.truckName} ({assignment.startTime}-{assignment.endTime})
                              </span>
                              <button
                                onClick={() => onRemoveTruck(submission.id, assignment.truckId)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                削除
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 車両使用不能期間設定モーダルコンポーネント
interface UnavailablePeriodModalProps {
  truck: Truck | null;
  onClose: () => void;
  onSave: (period: { startDate: string; endDate: string; reason: string }) => void;
  initialPeriod: { startDate: string; endDate: string; reason: string };
  onPeriodChange: (period: { startDate: string; endDate: string; reason: string }) => void;
}

const UnavailablePeriodModal = ({ truck, onClose, onSave, initialPeriod, onPeriodChange }: UnavailablePeriodModalProps) => {
  if (!truck) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!initialPeriod.startDate || !initialPeriod.endDate) {
      alert('開始日と終了日を入力してください');
      return;
    }
    
    if (new Date(initialPeriod.startDate) > new Date(initialPeriod.endDate)) {
      alert('開始日は終了日より前の日付を選択してください');
      return;
    }
    
    onSave(initialPeriod);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">車両使用不能期間設定</h3>
        <p className="text-sm text-gray-600 mb-4">
          対象車両: {truck.name} ({truck.plateNumber})
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={initialPeriod.startDate}
              onChange={(e) => onPeriodChange({ ...initialPeriod, startDate: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={initialPeriod.endDate}
              onChange={(e) => onPeriodChange({ ...initialPeriod, endDate: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              理由
            </label>
            <select
              value={initialPeriod.reason}
              onChange={(e) => onPeriodChange({ ...initialPeriod, reason: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              <option value="車検">車検</option>
              <option value="定期点検">定期点検</option>
              <option value="修理">修理</option>
              <option value="清掃・メンテナンス">清掃・メンテナンス</option>
              <option value="休車">休車</option>
              <option value="その他">その他</option>
            </select>
            {initialPeriod.reason === 'その他' && (
              <input
                type="text"
                placeholder="詳細を入力してください"
                className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => onPeriodChange({ ...initialPeriod, reason: `その他: ${e.target.value}` })}
              />
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              使用不能期間を設定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// 車両使用不能期間設定モーダルコンポーネント
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
                                <div className="flex items-center gap-2 mb-2">
                                  <button
                                    onClick={() => {
                                      setSelectedTruckForUnavailable(truck);
                                      setShowUnavailablePeriodModal(true);
                                    }}
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 transition-colors"
                                    title="使用不能期間を設定"
                                  >
                                    🚫 使用不能
                                  </button>
                                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusConfig('truck', truck.status).color}`}>
                                    {getStatusConfig('truck', truck.status).icon} {getStatusConfig('truck', truck.status).text}
                                  </span>
                                </div>
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
                              {submission.contractStatus === 'confirmed' && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusConfig('contract', 'confirmed').color}`}>
                                  {getStatusConfig('contract', 'confirmed').icon} {getStatusConfig('contract', 'confirmed').text}
                                </span>
                              )}
                              
                              {/* キャンセルボタン（受注案件のみ表示） */}
                              {(submission.caseStatus === 'contracted' || submission.contractStatus === 'confirmed') && 
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
                              <span className="text-gray-600">🏁</span>
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
            </>
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

      {/* 車両使用不能期間設定モーダル */}
      {showUnavailablePeriodModal && (
        <UnavailablePeriodModal
          truck={selectedTruckForUnavailable}
          onClose={() => {
            setShowUnavailablePeriodModal(false);
            setSelectedTruckForUnavailable(null);
            setUnavailablePeriod({ startDate: '', endDate: '', reason: '' });
          }}
          onSave={(period) => {
            if (!selectedTruckForUnavailable) return;
            
            // 指定期間に使用不能スケジュールを作成
            const startDate = new Date(period.startDate);
            const endDate = new Date(period.endDate);
            const newSchedules: Schedule[] = [];
            
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
              newSchedules.push({
                id: `unavailable-${crypto.randomUUID()}`,
                date: toLocalDateString(date),
                startTime: '00:00',
                endTime: '23:59',
                status: 'maintenance',
                customerName: '',
                workType: 'maintenance',
                description: `使用不能期間: ${period.reason}`,
                capacity: 0,
                origin: '',
                destination: '',
              });
            }
            
            const updatedTruck = {
              ...selectedTruckForUnavailable,
              schedules: [...selectedTruckForUnavailable.schedules, ...newSchedules]
            };
            
            updateTruck(updatedTruck);
            setShowUnavailablePeriodModal(false);
            setSelectedTruckForUnavailable(null);
            setUnavailablePeriod({ startDate: '', endDate: '', reason: '' });
          }}
          initialPeriod={unavailablePeriod}
          onPeriodChange={setUnavailablePeriod}
        />
      )}
    </div>
  );
}

// 車両使用不能期間設定モーダルコンポーネント
interface UnavailablePeriodModalProps {
  truck: Truck | null;
  onClose: () => void;
  onSave: (period: { startDate: string; endDate: string; reason: string }) => void;
  initialPeriod: { startDate: string; endDate: string; reason: string };
  onPeriodChange: (period: { startDate: string; endDate: string; reason: string }) => void;
}

const UnavailablePeriodModal = ({ truck, onClose, onSave, initialPeriod, onPeriodChange }: UnavailablePeriodModalProps) => {
  if (!truck) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!initialPeriod.startDate || !initialPeriod.endDate) {
      alert('開始日と終了日を入力してください');
      return;
    }
    
    if (new Date(initialPeriod.startDate) > new Date(initialPeriod.endDate)) {
      alert('開始日は終了日より前の日付を選択してください');
      return;
    }
    
    onSave(initialPeriod);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">車両使用不能期間設定</h3>
        <p className="text-sm text-gray-600 mb-4">
          対象車両: {truck.name} ({truck.plateNumber})
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={initialPeriod.startDate}
              onChange={(e) => onPeriodChange({ ...initialPeriod, startDate: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={initialPeriod.endDate}
              onChange={(e) => onPeriodChange({ ...initialPeriod, endDate: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              理由
            </label>
            <select
              value={initialPeriod.reason}
              onChange={(e) => onPeriodChange({ ...initialPeriod, reason: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              <option value="車検">車検</option>
              <option value="定期点検">定期点検</option>
              <option value="修理">修理</option>
              <option value="清掃・メンテナンス">清掃・メンテナンス</option>
              <option value="休車">休車</option>
              <option value="その他">その他</option>
            </select>
            {initialPeriod.reason === 'その他' && (
              <input
                type="text"
                placeholder="詳細を入力してください"
                className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => onPeriodChange({ ...initialPeriod, reason: `その他: ${e.target.value}` })}
              />
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              使用不能期間を設定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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