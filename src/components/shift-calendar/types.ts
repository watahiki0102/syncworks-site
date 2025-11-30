/**
 * ShiftCalendar関連の型定義
 */

export interface Employee {
  id: string;
  name: string;
  position: string;
  status: 'active' | 'inactive';
  shifts: EmployeeShift[];
}

export interface EmployeeShift {
  id: string;
  employeeId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  status: 'working' | 'unavailable';
  customerName?: string;
  notes?: string;
  timeSlot?: string | undefined;
}

export interface ShiftVisualStyle {
  bg: string;
  text: string;
  icon?: string;
  iconClass?: string;
  isUnsaved: boolean;
  status: 'working' | 'unavailable' | 'mixed' | 'none';
  borderClass?: string;
}

export interface TruckSchedule {
  id: string;
  truckId: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  origin: string;
  destination: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  employees: string[];
}

export interface ShiftBlock {
  startTime: string;
  endTime: string;
  status: 'working' | 'unavailable';
  shifts: EmployeeShift[];
  customerName?: string;
  notes?: string;
}

export interface DragState {
  currentEmployee: string;
  startTime: string;
  currentTime: string;
}

export interface BarResizeState {
  employeeId: string;
  blockIndex: number;
  direction: 'start' | 'end';
  originalStartTime: string;
  originalEndTime: string;
  currentTime: string;
}

export interface DayCrossingShiftInfo {
  employee: Employee;
  shift: EmployeeShift;
  startDate: string;
  dates: string[];
  dayCount: number;
  position: number;
  startTime?: string;
  endTime?: string;
}

export interface DateGroup {
  date: string;
  start: string;
  end: string;
}

export type ViewMode = 'day' | 'month';
export type ShiftModalMode = 'edit' | 'create' | 'bulk' | 'range';
export type ClipboardMode = 'copy' | 'paste' | 'none' | null;

export interface ShiftCalendarProps {
  employees: Employee[];
  cases?: unknown[];
  truckSchedules?: TruckSchedule[];
  onUpdateShift: (employeeId: string, shift: EmployeeShift) => void;
  onAddShift: (employeeId: string, shift: Omit<EmployeeShift, 'id'>) => void;
  onDeleteShift: (employeeId: string, shiftId: string) => void;
  onDeleteMultipleShifts?: (employeeId: string, shiftIds: string[]) => void;
  onUpdateTruckSchedules?: (schedules: TruckSchedule[]) => void;
  timeRangeType?: 'morning' | 'afternoon' | 'evening' | 'full' | 'custom';
  customStartTime?: string;
  customEndTime?: string;
  showTimeRangeSelector?: boolean;
  displayStartTime?: number;
  displayEndTime?: number;
  onDisplayTimeRangeChange?: (start: number, end: number) => void;
  showClipboard?: boolean;
  setShowClipboard?: (show: boolean) => void;
  showEmployeeSummary?: boolean;
  setShowEmployeeSummary?: (show: boolean) => void;
  clipboardMode?: ClipboardMode;
  setClipboardMode?: (mode: ClipboardMode) => void;
  clipboardData?: unknown;
  setClipboardData?: (data: unknown) => void;
  onDateClickForClipboard?: (date: string) => void;
  selectedShifts?: EmployeeShift[];
  setSelectedShifts?: (shifts: EmployeeShift[] | ((prev: EmployeeShift[]) => EmployeeShift[])) => void;
  copiedShifts?: EmployeeShift[];
  setCopiedShifts?: (shifts: EmployeeShift[]) => void;
  pendingPasteDates?: string[];
  setPendingPasteDates?: (dates: string[] | ((prev: string[]) => string[])) => void;
  onShiftClickForClipboard?: (shift: EmployeeShift) => void;
  unsavedShiftIds?: Set<string>;
  onSave?: () => void;
  onCurrentMonthChange?: (year: number, month: number) => void;
}
