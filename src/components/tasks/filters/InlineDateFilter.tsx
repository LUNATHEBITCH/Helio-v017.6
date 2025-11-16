import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { IconToggle } from '@/components/ui/icon-toggle';
import { format, isWithinInterval, addMonths, subMonths } from 'date-fns';

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

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
  };

  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  const threeMonthsAhead = addMonths(today, 3);

  const isDateInRange = (date: Date): boolean => {
    return isWithinInterval(date, { start: threeMonthsAgo, end: threeMonthsAhead });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isDateInRange(date)) {
      const dateString = format(date, 'yyyy-MM-dd');
      onSelect(dateString);
    }
  };


  const clearDate = () => {
    onSelect('');
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
              mode="single"
              selected={selectedDate ? new Date(selectedDate) : undefined}
              onSelect={handleDateSelect}
              disabled={(date) => !isDateInRange(date)}
              className="rounded-[8px]"
            />
          </div>

          {selectedDate && (
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
