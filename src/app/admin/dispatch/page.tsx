'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminButton from '@/components/admin/AdminButton';
import TruckRegistration from '@/components/TruckRegistration';
import DispatchCalendar from '@/components/DispatchCalendar';
import UnavailablePeriodModal from './components/UnavailablePeriodModal';
import TruckAssignmentModal from './components/TruckAssignmentModal';
import StatusFilter from '@/components/dispatch/StatusFilter';
import { TruckManagement } from '@/components/dispatch/TruckManagement';

import { toLocalDateString } from '@/utils/dateTimeUtils';
import { Truck, Schedule } from '@/types/shared';
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
  const [activeView, setActiveView] = useState<'calendar' | 'trucks' | 'cases'>('calendar');
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [availableTruckTypes, setAvailableTruckTypes] = useState<string[]>([]);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  // const [truckCoefficients, setTruckCoefficients] = useState<any[]>([]);
  const [distanceRanges, setDistanceRanges] = useState<any[]>([]);
  const [pricingTrucks, setPricingTrucks] = useState<any[]>([]);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'estimate'>('all');
  
  // 使用不能期間設定関連のstate
  const [showUnavailablePeriodModal, setShowUnavailablePeriodModal] = useState(false);
  const [selectedTruckForUnavailable, setSelectedTruckForUnavailable] = useState<Truck | null>(null);
  const [unavailablePeriod, setUnavailablePeriod] = useState({ startDate: '', endDate: '', reason: '' });
  
  const router = useRouter();



  // URLパラメータから選択された案件を取得
  const selectedCaseId = searchParams.get('selectedCase');
  const registrationMode = searchParams.get('mode');



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
        // 未割り当ての案件を追加
        {
          id: '4',
          customerName: '鈴木 三郎',
          customerEmail: 'suzuki@example.com',
          customerPhone: '090-1111-2222',
          moveDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 明日
          originAddress: '東京都港区六本木7-7-7',
          destinationAddress: '東京都品川区品川8-8-8',
          totalPoints: 80,
          totalCapacity: 400,
          distance: 6,
          itemList: ['テレビ', 'パソコン', '本'],
          additionalServices: ['梱包'],
          status: 'pending',
          truckAssignments: [],
          createdAt: new Date().toISOString(),
          contractStatus: 'estimate',
        },
        {
          id: '5',
          customerName: '高橋 四郎',
          customerEmail: 'takahashi@example.com',
          customerPhone: '080-3333-4444',
          moveDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 明後日
          originAddress: '東京都文京区本郷9-9-9',
          destinationAddress: '東京都台東区上野10-10-10',
          totalPoints: 120,
          totalCapacity: 600,
          distance: 4,
          itemList: ['ソファ', 'テーブル', '椅子', '本棚'],
          additionalServices: ['梱包', '開梱'],
          status: 'pending',
          truckAssignments: [],
          createdAt: new Date().toISOString(),
          contractStatus: 'estimate',
        },
        {
          id: '6',
          customerName: '伊藤 五郎',
          customerEmail: 'ito@example.com',
          customerPhone: '070-5555-7777',
          moveDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3日後
          originAddress: '東京都練馬区練馬11-11-11',
          destinationAddress: '東京都板橋区板橋12-12-12',
          totalPoints: 180,
          totalCapacity: 900,
          distance: 8,
          itemList: ['ベッド', 'ワードローブ', '机', '椅子'],
          additionalServices: ['保険', '保管'],
          status: 'pending',
          truckAssignments: [],
          createdAt: new Date().toISOString(),
          contractStatus: 'confirmed',
          contractDate: new Date().toISOString(),
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
      // setTruckCoefficients(coefficients);
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
   * 現在未使用のため、コメントアウト
   */
  /*
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
  */

  // 簡易版の割り当て関数（IDのみ）
  const assignTruckByIdToSubmission = (submissionId: string, truckId: string) => {
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return;

    // デフォルトの時間設定でTruckAssignmentを作成
    const defaultAssignment: TruckAssignment = {
      truckId: truckId,
      truckName: truck.name,
      capacity: 1000, // デフォルト容量
      startTime: '09:00',
      endTime: '13:00',
      workType: 'moving'
    };

    assignTruckToSubmission(submissionId, defaultAssignment);
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

  // const getStatusColor = (status: string) => {
  //   return getStatusConfig('submission', status).color;
  // };

  // const getStatusText = (status: string) => {
  //   return getStatusConfig('submission', status).text;
  // };

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

  // // トラック種別に基づいて利用可能なトラックをフィルタリング
  // const getAvailableTrucksByType = (truckType: string): Truck[] => {
  //   return trucks.filter(truck => 
  //     truck.truckType === truckType && 
  //     truck.status === 'available'
  //   );
  // };



  const tabs = [
    { id: 'calendar', label: '配車カレンダー', icon: '📅' },
    { id: 'trucks', label: 'トラック管理', icon: '🚚' },
    { id: 'cases', label: '配車割り当て', icon: '🚛' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPageHeader 
        title="配車管理"
        subtitle="トラックの稼働スケジュール管理"
        breadcrumbs={[
          { label: '配車管理' }
        ]}
        showBackButton={true}
      />
      {/* タブナビゲーション */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-2 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">

          {/* 配車カレンダータブ */}
          {activeView === 'calendar' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-2 sm:p-3">
                <DispatchCalendar 
                  trucks={trucks as any}
                  onUpdateTruck={updateTruck}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />
              </div>
            </div>
          )}

          {/* トラック管理タブ */}
          {activeView === 'trucks' && (
            <div className="space-y-4">
              {/* トラック状況 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-2 sm:p-3">
                  <TruckManagement 
                    trucks={trucks as any}
                    onTrucksChange={setTrucks}
                  />
                </div>
              </div>

              {/* トラック登録 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-2 sm:p-3">
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
            </div>
          )}

          {/* 配車割り当てタブ */}
          {activeView === 'cases' && (
            <div className="space-y-4">

              {/* 案件一覧 */}
              <UnifiedCaseManagement
                submissions={formSubmissions}
                trucks={trucks}
                onAssignTruck={assignTruckByIdToSubmission}
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
                setShowTruckModal={setShowTruckModal}
                setSelectedSubmission={setSelectedSubmission}
              />
            </div>
          )}

        </div>
      </main>


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


// 統合案件管理コンポーネント  
interface UnifiedCaseManagementProps {
  submissions: FormSubmission[];
  trucks: Truck[];
  onAssignTruck: (submissionId: string, truckId: string) => void;
  onRemoveTruck: (submissionId: string, truckId: string) => void;
  expandedSubmissions: Set<string>;
  onToggleExpand: (id: string) => void;
  setShowTruckModal: (show: boolean) => void;
  setSelectedSubmission: (submission: FormSubmission | null) => void;
}

const UnifiedCaseManagement = ({ 
  submissions, 
  trucks, 
  onAssignTruck, 
  onRemoveTruck, 
  expandedSubmissions, 
  onToggleExpand,
  setShowTruckModal,
  setSelectedSubmission
}: UnifiedCaseManagementProps) => {

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-end mb-4">
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
                        <span className="font-medium text-gray-700">引越し元:</span> {submission.originAddress}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">引越し先:</span> {submission.destinationAddress}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">総ポイント:</span> {submission.totalPoints}pt
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">総容量:</span> {submission.totalCapacity}kg
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
