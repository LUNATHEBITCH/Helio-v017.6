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
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [displayDates, setDisplayDates] = useState<Date[]>([]);

  useEffect(() => {
    if (selectedDate) {
      const dates = selectedDate.split(',').map(d => {
        const parsed = new Date(d.trim());
        parsed.setHours(0, 0, 0, 0);
        return parsed;
      });
      setSelectedDates(dates);

      if (dates.length >= 2) {
        const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
        const minDate = sortedDates[0];
        const maxDate = sortedDates[sortedDates.length - 1];
        const rangeDates: Date[] = [];

        let current = new Date(minDate);
        while (isBefore(current, maxDate) || isEqual(current, maxDate)) {
          rangeDates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }

        setDisplayDates(rangeDates);
      } else {
        setDisplayDates(dates);
      }
    } else {
      setSelectedDates([]);
      setDisplayDates([]);
    }
  }, [selectedDate]);

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const oneMonthAhead = addMonths(tomorrow, 1);

  const isDateInRange = (date: Date): boolean => {
    return isWithinInterval(date, { start: tomorrow, end: oneMonthAhead });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const dateToSelect = new Date(date);
    dateToSelect.setHours(0, 0, 0, 0);
    const dateString = format(dateToSelect, 'yyyy-MM-dd');

    if (!isDateInRange(dateToSelect)) return;

    setSelectedDates(prev => {
      const dateExists = prev.some(d => format(d, 'yyyy-MM-dd') === dateString);

      let updated: Date[];
      if (dateExists) {
        updated = prev.filter(d => format(d, 'yyyy-MM-dd') !== dateString);
      } else {
        if (prev.length < 5) {
          updated = [...prev, dateToSelect];
        } else {
          return prev;
        }
      }

      const dateStrings = updated.map(d => format(d, 'yyyy-MM-dd')).join(',');
      onSelect(dateStrings);
      return updated;
    });
  };

  const clearDate = () => {
    setSelectedDates([]);
    onSelect('');
  };

  const isDateSelected = (date: Date): boolean => {
    return selectedDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  };

  const isDateInRangeDisplay = (date: Date): boolean => {
    return displayDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  };

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
              mode="multiple"
              selected={displayDates}
              onSelect={handleDateSelect}
              disabled={(date) => !isDateInRange(date)}
              className="rounded-[8px]"
            />
          </div>

          <div className="text-xs text-gray-400 text-center">
            {selectedDates.length > 0 ? `${selectedDates.length}/5 dates selected` : 'Select up to 5 dates'}
          </div>

          {selectedDates.length > 0 && (
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
