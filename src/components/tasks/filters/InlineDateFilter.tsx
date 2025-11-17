import React, { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { IconToggle } from '@/components/ui/icon-toggle';
import { format, isWithinInterval, addMonths, isBefore, isAfter, isEqual } from 'date-fns';

interface InlineDateFilterProps {
  isActive: boolean;
  selectedDate: string;
  onToggle: (checked: boolean) => void;
  onSelect: (date: string) => void;
}

const InlineDateFilter: React.FC<InlineDateFilterProps> = ({
  isActive,
  selectedDate,
  onToggle,
  onSelect
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [displayDates, setDisplayDates] = useState<Date[]>([]);

  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split(',').map(d => {
        const parsed = new Date(d.trim());
        parsed.setHours(0, 0, 0, 0);
        return parsed;
      });

      if (parts.length === 1) {
        setStartDate(parts[0]);
        setEndDate(parts[0]);
        setDisplayDates([parts[0]]);
      } else if (parts.length === 2) {
        const sorted = parts.sort((a, b) => a.getTime() - b.getTime());
        setStartDate(sorted[0]);
        setEndDate(sorted[1]);

        const rangeDates: Date[] = [];
        let current = new Date(sorted[0]);
        while (isBefore(current, sorted[1]) || isEqual(current, sorted[1])) {
          rangeDates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        setDisplayDates(rangeDates);
      }
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
      setDisplayDates([]);
    }
  }, [selectedDate]);

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneMonthAhead = addMonths(today, 1);

  const isDateInRange = (date: Date): boolean => {
    return isWithinInterval(date, { start: today, end: oneMonthAhead });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const dateToSelect = new Date(date);
    dateToSelect.setHours(0, 0, 0, 0);

    if (!isDateInRange(dateToSelect)) return;

    if (!startDate) {
      setStartDate(dateToSelect);
      setEndDate(dateToSelect);
      setDisplayDates([dateToSelect]);
      onSelect(format(dateToSelect, 'yyyy-MM-dd'));
    } else if (isEqual(dateToSelect, startDate) && isEqual(dateToSelect, endDate)) {
      setStartDate(undefined);
      setEndDate(undefined);
      setDisplayDates([]);
      onSelect('');
    } else if (!endDate || isEqual(dateToSelect, endDate)) {
      setStartDate(dateToSelect);
      setEndDate(dateToSelect);
      setDisplayDates([dateToSelect]);
      onSelect(format(dateToSelect, 'yyyy-MM-dd'));
    } else {
      const sorted = dateToSelect.getTime() < startDate.getTime()
        ? [dateToSelect, startDate]
        : [startDate, dateToSelect];

      setStartDate(sorted[0]);
      setEndDate(sorted[1]);

      const rangeDates: Date[] = [];
      let current = new Date(sorted[0]);
      while (isBefore(current, sorted[1]) || isEqual(current, sorted[1])) {
        rangeDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setDisplayDates(rangeDates);
      onSelect(`${format(sorted[0], 'yyyy-MM-dd')},${format(sorted[1], 'yyyy-MM-dd')}`);
    }
  };

  const clearDate = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setDisplayDates([]);
    onSelect('');
  };

  const isDateSelected = (date: Date): boolean => {
    if (!startDate || !endDate) return false;
    return isWithinInterval(date, { start: startDate, end: endDate });
  };

  const isStartOrEnd = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const startStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const endStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';
    return dateStr === startStr || dateStr === endStr;
  };

  const dateRange = startDate && endDate
    ? `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd')}`
    : '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-sm">Date</span>
        <IconToggle
          icon={Calendar}
          checked={isActive}
          onCheckedChange={handleToggle}
        />
      </div>

      {isActive && (
        <div className="bg-[#252525] border border-[#414141] rounded-[12px] p-3 space-y-2">
          <div className="flex justify-center scale-90 origin-top -my-2">
            <CalendarComponent
              mode="range"
              selected={{ from: startDate, to: endDate }}
              onSelect={(range: any) => {
                if (range?.from) {
                  handleDateSelect(range.from);
                  if (range?.to && !isEqual(range.from, range.to)) {
                    handleDateSelect(range.to);
                  }
                }
              }}
              disabled={(date) => !isDateInRange(date)}
              className="rounded-[8px]"
            />
          </div>

          <div className="text-xs text-gray-400 text-center">
            {dateRange ? dateRange : 'Select a date range'}
          </div>

          {startDate && endDate && (
            <Button
              onClick={clearDate}
              variant="ghost"
              size="sm"
              className="w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-[#414141] rounded-[8px] text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineDateFilter;
