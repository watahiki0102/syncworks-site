/**
 * フォーム関連の型定義
 * 引越し見積もりフォームで使用される型
 */

// 基本的なフォーム要素の型
export interface BaseFormField {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: string;
}

// 入力タイプ別の型定義
export interface TextFieldProps extends BaseFormField {
  type?: 'text' | 'email' | 'tel' | 'url' | 'password';
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
}

export interface NumberFieldProps extends BaseFormField {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectFieldProps extends BaseFormField {
  type: 'select';
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  multiple?: boolean;
}

export interface RadioGroupProps extends BaseFormField {
  type: 'radio';
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
}

export interface CheckboxProps extends BaseFormField {
  type: 'checkbox';
  checked?: boolean;
}

export interface DateFieldProps extends BaseFormField {
  type: 'date' | 'datetime-local' | 'time';
  min?: string;
  max?: string;
}

// フォームバリデーション
export interface ValidationRule {
  required?: boolean | string;
  pattern?: {
    value: RegExp;
    message: string;
  };
  minLength?: {
    value: number;
    message: string;
  };
  maxLength?: {
    value: number;
    message: string;
  };
  min?: {
    value: number;
    message: string;
  };
  max?: {
    value: number;
    message: string;
  };
  validate?: <T>(value: T) => string | boolean;
}

export interface FormField<T = unknown> extends BaseFormField {
  validation?: ValidationRule;
  defaultValue?: T;
}

// フォーム全体の状態
export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  values: Record<string, unknown>;
}

// 引越しフォーム特有の型定義
export type MoveType = '単身' | '家族';

export interface PersonalInfo {
  moveType: MoveType;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  phone: string;
  email: string;
}

export interface DateTimePreference {
  date1: string;
  date2?: string;
  date3?: string;
  timeSlot1: TimeSlot;
  timeSlot2?: TimeSlot;
  timeSlot3?: TimeSlot;
}

export type TimeSlot = 
  | 'none'
  | 'early_morning'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'not_early'
  | 'not_night'
  | 'daytime_only';

export interface AddressInfo {
  postalCode: string;
  address: string;
  residenceType: ResidenceType;
  residenceOther?: string;
  floor: string;
}

export type ResidenceType = 
  | 'アパート・マンション（エレベーター利用可）'
  | 'アパート・マンション（エレベーター利用不可）'
  | '一軒家'
  | 'その他';

export interface MovingFormStep1 extends PersonalInfo, DateTimePreference {
  fromPostalCode: string;
  fromAddress: string;
  fromResidenceType: ResidenceType;
  fromResidenceOther?: string;
  fromFloor: string;
  toPostalCode: string;
  toAddress: string;
  toResidenceType: ResidenceType;
  toResidenceOther?: string;
  toFloor: string;
}

// フォーム進捗状態
export interface FormProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  isStepValid: (step: number) => boolean;
}

// フォーム保存状態
export interface FormSaveState<T = Record<string, unknown>> {
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  saveToLocalStorage: (data: T) => void;
  loadFromLocalStorage: () => T | null;
  clearSavedData: () => void;
} 