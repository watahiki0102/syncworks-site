/**
 * 不動産登録関連の型定義
 */

export type RegisterMode = 'self' | 'referral';

export type ReferralKind = 'existing' | 'individual' | 'other';

export interface CompanyInfo {
  name: string;
  licenseNo: string;
  repName: string;
  contactName: string;
  dept: string;
  tel: string;
  email: string;
  address: string;
  websiteUrl: string;
  prefectures: string[];
}

export interface ReferralInfo {
  kind: ReferralKind;
  name: string;
  contact: string;
  note: string;
}

export interface RealEstateRegistration {
  mode: RegisterMode;
  referrer: string | null;
  company: CompanyInfo;
  referral?: ReferralInfo;
}

export interface ValidationRequest {
  field: string;
  value: string;
}

export interface ValidationResponse {
  isValid: boolean;
  message: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  registrationId?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormValidationErrors {
  [key: string]: string;
}
