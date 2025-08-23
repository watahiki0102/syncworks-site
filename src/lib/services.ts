/**
 * TDD対応: サービス層の実装
 * - 副作用（I/O操作）を含むサービス
 * - 依存性注入可能な設計
 * - テスト時にモック化しやすい構造
 */

import businessLogic from './business-logic';
import { logger } from './logger';

/**
 * 依存性注入のためのインターフェース定義
 */
export interface ApiClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
  put<T>(url: string, data: unknown): Promise<T>;
  delete(url: string): Promise<void>;
}

export interface NotificationService {
  sendEmail(to: string, subject: string, content: string): Promise<void>;
  sendSMS(to: string, message: string): Promise<void>;
}

export interface StorageService {
  save(key: string, data: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
}

/**
 * 見積もりサービス
 * - ビジネスロジックと外部APIの橋渡し
 */
export class EstimateService {
  constructor(
    private apiClient: ApiClient,
    private notificationService: NotificationService,
    private storageService: StorageService
  ) {}

  /**
   * 見積もりを作成し、保存・通知を行う
   */
  async createEstimate(estimateData: {
    customerInfo: {
      lastName: string;
      firstName: string;
      email: string;
      phone: string;
      postalCode: string;
      address: string;
    };
    movingDetails: {
      distance: number;
      items: Array<{ name: string; count: number; points: number }>;
      timeSlot: string;
      selectedOptions: string[];
      moveDate: Date;
    };
  }): Promise<{
    success: boolean;
    estimateId?: string;
    estimate?: unknown;
    errors?: string[];
  }> {
    try {
      // 顧客情報の検証（純粋関数）
      const customerValidation = businessLogic.customerManagementLogic.validateCustomerData(
        estimateData.customerInfo
      );

      if (!customerValidation.isValid) {
        return {
          success: false,
          errors: customerValidation.errors,
        };
      }

      // 見積もり計算（純粋関数）
      const estimate = businessLogic.movingEstimateLogic.calculateMovingEstimate({
        ...estimateData.movingDetails,
        taxRate: 0.1, // 10%
      });

      // データベースに保存（副作用）
      const savedEstimate = await this.apiClient.post<{ id: string }>('/api/estimates', {
        customerInfo: customerValidation.normalizedData,
        movingDetails: estimateData.movingDetails,
        estimate,
        createdAt: new Date().toISOString(),
      });

      if (!savedEstimate || !savedEstimate.id) {
        throw new Error('見積もりの保存に失敗しました');
      }

      // ローカルストレージにも保存（副作用）
      await this.storageService.save(`estimate_${savedEstimate.id}`, {
        ...estimateData,
        estimate,
        estimateId: savedEstimate.id,
      });

      // 顧客に確認メールを送信（副作用）
      if (estimateData.customerInfo.email) {
        try {
          await this.notificationService.sendEmail(
            estimateData.customerInfo.email,
            '引越し見積もりを受け付けました',
            this.generateEstimateEmailContent(estimate, savedEstimate.id)
          );
        } catch (emailError) {
          // メール送信失敗は見積もり作成を妨げない
          logger.warn('見積もり確認メールの送信に失敗しました', {
            estimateId: savedEstimate.id,
            customerEmail: estimateData.customerInfo.email,
            error: emailError
          });
        }
      }

      // ログ記録（副作用）
      logger.info('見積もりが正常に作成されました', {
        estimateId: savedEstimate.id,
        customerId: estimateData.customerInfo.email,
        totalAmount: estimate.total,
      });

      return {
        success: true,
        estimateId: savedEstimate.id,
        estimate,
      };
    } catch (error) {
      logger.error('見積もり作成中にエラーが発生しました', error as Error, {
        customerEmail: estimateData.customerInfo.email,
      });

      return {
        success: false,
        errors: ['見積もりの作成に失敗しました。しばらく経ってから再度お試しください。'],
      };
    }
  }

  /**
   * 見積もり履歴を取得
   */
  async getEstimateHistory(customerEmail: string): Promise<unknown[]> {
    try {
      const history = await this.apiClient.get<unknown[]>(`/api/estimates/history?email=${customerEmail}`);
      
      logger.info('見積もり履歴を取得しました', { customerEmail, count: history.length });
      
      return history;
    } catch (error) {
      logger.error('見積もり履歴の取得に失敗しました', error as Error, { customerEmail });
      throw new Error('見積もり履歴の取得に失敗しました');
    }
  }

  /**
   * メールコンテンツ生成（純粋関数）
   */
  private generateEstimateEmailContent(estimate: unknown, estimateId: string): string {
    // この関数は純粋関数として実装し、テストしやすくする
    return `
見積もりID: ${estimateId}
この度は見積もりのご依頼をいただき、ありがとうございます。

詳細な見積もり内容については、こちらのリンクからご確認いただけます：
https://example.com/estimates/${estimateId}

ご不明な点がございましたら、お気軽にお問い合わせください。

株式会社シンクワークス
`;
  }
}

/**
 * 車両管理サービス
 */
export class FleetManagementService {
  constructor(
    private apiClient: ApiClient,
    private storageService: StorageService
  ) {}

  /**
   * 最適なトラック割り当てを提案
   */
  async findOptimalTruck(requirements: {
    totalPoints: number;
    distance: number;
    timeSlot: string;
    preferredDate: Date;
  }): Promise<{
    success: boolean;
    assignment?: unknown;
    alternatives?: unknown[];
    message?: string;
  }> {
    try {
      // 利用可能なトラック情報を取得（副作用）
      const availableTrucks = await this.apiClient.get<unknown[]>('/api/trucks/available');

      // ビジネスロジックで最適解を計算（純粋関数）
      const assignment = businessLogic.fleetManagementLogic.findOptimalTruckAssignment(
        requirements,
        availableTrucks as Array<{
          id: string;
          name: string;
          capacity: number;
          costPerKm: number;
          availability: Date[];
        }>
      );

      // キャッシュに保存（副作用）
      const cacheKey = `truck_assignment_${Date.now()}`;
      await this.storageService.save(cacheKey, assignment);

      logger.info('トラック割り当てを計算しました', {
        success: assignment.success,
        recommendedTruck: assignment.success ? (assignment.recommendedTruck as { name: string }).name : null,
      });

      return assignment;
    } catch (error) {
      logger.error('トラック割り当ての計算に失敗しました', error as Error, requirements);
      
      return {
        success: false,
        message: 'トラック割り当ての計算に失敗しました',
      };
    }
  }

  /**
   * トラックの稼働状況を更新
   */
  async updateTruckStatus(truckId: string, status: 'available' | 'busy' | 'maintenance'): Promise<void> {
    try {
      await this.apiClient.put(`/api/trucks/${truckId}/status`, { status });
      
      logger.info('トラックステータスを更新しました', { truckId, status });
    } catch (error) {
      logger.error('トラックステータスの更新に失敗しました', error as Error, { truckId, status });
      throw new Error('トラックステータスの更新に失敗しました');
    }
  }
}

/**
 * 顧客管理サービス
 */
export class CustomerService {
  constructor(
    private apiClient: ApiClient,
    private notificationService: NotificationService
  ) {}

  /**
   * 顧客のリスク評価を実行
   */
  async assessCustomerRisk(customerId: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    factors: string[];
    recommendedActions: string[];
  }> {
    try {
      // 顧客履歴を取得（副作用）
      const customerHistory = await this.apiClient.get<{
        completedOrders: number;
        canceledOrders: number;
        latePayments: number;
        totalSpent: number;
        accountAge: number;
      }>(`/api/customers/${customerId}/history`);

      // リスク評価を実行（純粋関数）
      const riskAssessment = businessLogic.customerManagementLogic.assessCustomerRisk(customerHistory);

      // 高リスク顧客の場合は管理者に通知（副作用）
      if (riskAssessment.riskLevel === 'high') {
        try {
          await this.notificationService.sendEmail(
            'admin@example.com',
            '高リスク顧客の通知',
            `顧客ID: ${customerId}\nリスクスコア: ${riskAssessment.riskScore}\n要因: ${riskAssessment.factors.join(', ')}`
          );
        } catch (notificationError) {
          // 通知失敗してもリスク評価は続行
          logger.warn('管理者通知の送信に失敗しました', { customerId, error: notificationError });
        }
      }

      logger.info('顧客リスク評価を実行しました', {
        customerId,
        riskLevel: riskAssessment.riskLevel,
        riskScore: riskAssessment.riskScore,
      });

      return riskAssessment;
    } catch (error) {
      logger.error('顧客リスク評価に失敗しました', error as Error, { customerId });
      // より詳細なエラー情報を返す
      return {
        riskLevel: 'low' as const, // 不明な場合は低リスクとして扱う
        riskScore: 0,
        factors: ['評価エラー'],
        recommendedActions: ['システム管理者にお問い合わせください']
      };
    }
  }
}

/**
 * サービス層のファクトリー
 * - 依存性注入を簡単にするためのヘルパー
 */
export class ServiceFactory {
  static createEstimateService(
    apiClient: ApiClient,
    notificationService: NotificationService,
    storageService: StorageService
  ): EstimateService {
    return new EstimateService(apiClient, notificationService, storageService);
  }

  static createFleetManagementService(
    apiClient: ApiClient,
    storageService: StorageService
  ): FleetManagementService {
    return new FleetManagementService(apiClient, storageService);
  }

  static createCustomerService(
    apiClient: ApiClient,
    notificationService: NotificationService
  ): CustomerService {
    return new CustomerService(apiClient, notificationService);
  }
}

// デフォルトエクスポート
const services = {
  EstimateService,
  FleetManagementService,
  CustomerService,
  ServiceFactory,
};

export default services;