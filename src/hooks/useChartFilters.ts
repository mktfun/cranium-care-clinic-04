
import { useState, useMemo } from "react";
import { subDays, subMonths, startOfYear, endOfYear } from "date-fns";

export interface FilterState {
  timePeriod: string;
  measurementType: string;
  customDateRange: { start: Date | null; end: Date | null };
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function useChartFilters() {
  const [filters, setFilters] = useState<FilterState>({
    timePeriod: "6months",
    measurementType: "all",
    customDateRange: { start: null, end: null }
  });

  const dateRange = useMemo<DateRange>(() => {
    const today = new Date();
    
    switch (filters.timePeriod) {
      case "7days":
        return {
          startDate: subDays(today, 7).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case "15days":
        return {
          startDate: subDays(today, 15).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case "30days":
        return {
          startDate: subDays(today, 30).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case "3months":
        return {
          startDate: subMonths(today, 3).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case "6months":
        return {
          startDate: subMonths(today, 6).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case "12months":
        return {
          startDate: subMonths(today, 12).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case "currentYear":
        return {
          startDate: startOfYear(today).toISOString().split('T')[0],
          endDate: endOfYear(today).toISOString().split('T')[0]
        };
      case "custom":
        return {
          startDate: filters.customDateRange.start?.toISOString().split('T')[0] || subMonths(today, 6).toISOString().split('T')[0],
          endDate: filters.customDateRange.end?.toISOString().split('T')[0] || today.toISOString().split('T')[0]
        };
      default:
        return {
          startDate: subMonths(today, 6).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
    }
  }, [filters.timePeriod, filters.customDateRange]);

  const updateTimePeriod = (period: string) => {
    setFilters(prev => ({ ...prev, timePeriod: period }));
  };

  const updateMeasurementType = (type: string) => {
    setFilters(prev => ({ ...prev, measurementType: type }));
  };

  const updateCustomDateRange = (range: { start: Date | null; end: Date | null }) => {
    setFilters(prev => ({ ...prev, customDateRange: range }));
  };

  const resetFilters = () => {
    setFilters({
      timePeriod: "6months",
      measurementType: "all",
      customDateRange: { start: null, end: null }
    });
  };

  return {
    filters,
    dateRange,
    updateTimePeriod,
    updateMeasurementType,
    updateCustomDateRange,
    resetFilters
  };
}
