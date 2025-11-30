'use client';

import { useState, useRef, useCallback } from 'react';
import type {
  Employee,
  EmployeeShift,
  ViewMode,
  ShiftModalMode,
  DragState,
  BarResizeState
} from '../types';
import { toLocalDateString } from '@/utils/dateTimeUtils';

export interface ShiftCalendarState {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  selectedEmployee: Employee | null;
  setSelectedEmployee: React.Dispatch<React.SetStateAction<Employee | null>>;
  highlightedEmployee: Employee | null;
  setHighlightedEmployee: React.Dispatch<React.SetStateAction<Employee | null>>;
  selectedShift: EmployeeShift | null;
  setSelectedShift: React.Dispatch<React.SetStateAction<EmployeeShift | null>>;
  editingShift: EmployeeShift | null;
  setEditingShift: React.Dispatch<React.SetStateAction<EmployeeShift | null>>;
  showShiftModal: boolean;
  setShowShiftModal: React.Dispatch<React.SetStateAction<boolean>>;
  shiftModalMode: ShiftModalMode;
  setShiftModalMode: React.Dispatch<React.SetStateAction<ShiftModalMode>>;
  dragState: DragState | null;
  setDragState: React.Dispatch<React.SetStateAction<DragState | null>>;
  barResizeState: BarResizeState | null;
  setBarResizeState: React.Dispatch<React.SetStateAction<BarResizeState | null>>;
  recentlyResized: boolean;
  setRecentlyResized: React.Dispatch<React.SetStateAction<boolean>>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
  expandedDates: Set<string>;
  setExpandedDates: React.Dispatch<React.SetStateAction<Set<string>>>;
  allDatesExpanded: boolean;
  setAllDatesExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  collapsedDates: Set<string>;
  setCollapsedDates: React.Dispatch<React.SetStateAction<Set<string>>>;
  expandedWeeks: Set<string>;
  setExpandedWeeks: React.Dispatch<React.SetStateAction<Set<string>>>;
  lastNotifiedMonthRef: React.MutableRefObject<{ year: number; month: number } | null>;
}

export function useShiftCalendarState(): ShiftCalendarState {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateString(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const lastNotifiedMonthRef = useRef<{ year: number; month: number } | null>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [highlightedEmployee, setHighlightedEmployee] = useState<Employee | null>(null);
  const [selectedShift, setSelectedShift] = useState<EmployeeShift | null>(null);
  const [editingShift, setEditingShift] = useState<EmployeeShift | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftModalMode, setShiftModalMode] = useState<ShiftModalMode>('edit');

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [barResizeState, setBarResizeState] = useState<BarResizeState | null>(null);
  const [recentlyResized, setRecentlyResized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 月ビュー展開状態管理
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [allDatesExpanded, setAllDatesExpanded] = useState<boolean>(false);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  return {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    selectedEmployee,
    setSelectedEmployee,
    highlightedEmployee,
    setHighlightedEmployee,
    selectedShift,
    setSelectedShift,
    editingShift,
    setEditingShift,
    showShiftModal,
    setShowShiftModal,
    shiftModalMode,
    setShiftModalMode,
    dragState,
    setDragState,
    barResizeState,
    setBarResizeState,
    recentlyResized,
    setRecentlyResized,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    expandedDates,
    setExpandedDates,
    allDatesExpanded,
    setAllDatesExpanded,
    collapsedDates,
    setCollapsedDates,
    expandedWeeks,
    setExpandedWeeks,
    lastNotifiedMonthRef,
  };
}

export interface ExpandCollapseActions {
  handleExpandAllDates: () => void;
  handleCollapseAllDates: () => void;
  handleCollapseDate: (date: string) => void;
  handleExpandDate: (date: string) => void;
}

export function useExpandCollapseActions(
  setAllDatesExpanded: React.Dispatch<React.SetStateAction<boolean>>,
  setExpandedDates: React.Dispatch<React.SetStateAction<Set<string>>>,
  setCollapsedDates: React.Dispatch<React.SetStateAction<Set<string>>>,
  setExpandedWeeks: React.Dispatch<React.SetStateAction<Set<string>>>
): ExpandCollapseActions {
  const handleExpandAllDates = useCallback(() => {
    setAllDatesExpanded(true);
    setExpandedDates(new Set());
    setCollapsedDates(new Set());
    setExpandedWeeks(new Set());
  }, [setAllDatesExpanded, setExpandedDates, setCollapsedDates, setExpandedWeeks]);

  const handleCollapseAllDates = useCallback(() => {
    setAllDatesExpanded(false);
    setExpandedDates(new Set());
    setCollapsedDates(new Set());
    setExpandedWeeks(new Set());
  }, [setAllDatesExpanded, setExpandedDates, setCollapsedDates, setExpandedWeeks]);

  const handleCollapseDate = useCallback((date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      newSet.delete(date);
      return newSet;
    });
    setCollapsedDates(prev => {
      const newSet = new Set(prev);
      newSet.add(date);
      return newSet;
    });
  }, [setExpandedDates, setCollapsedDates]);

  const handleExpandDate = useCallback((date: string) => {
    setCollapsedDates(prev => {
      const newSet = new Set(prev);
      newSet.delete(date);
      return newSet;
    });
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      newSet.add(date);
      return newSet;
    });
  }, [setExpandedDates, setCollapsedDates]);

  return {
    handleExpandAllDates,
    handleCollapseAllDates,
    handleCollapseDate,
    handleExpandDate,
  };
}
