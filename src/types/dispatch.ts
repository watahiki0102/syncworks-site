// 共通型定義から再エクスポート
export {
  type Option,
  type ScheduleId,
  type WorkerAssignment,
  type Schedule,
  type Truck,
  type Employee as WorkerRef, // 後方互換性のためのエイリアス
  type ContractStatus
} from './shared';
