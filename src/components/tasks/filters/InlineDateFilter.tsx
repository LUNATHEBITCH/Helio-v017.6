import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { IconToggle } from '@/components/ui/icon-toggle';
import { Input } from '@/components/ui/input';
import { format, parse, isWithinInterval, addMonths, subMonths, isValid } from 'date-fns';

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
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');

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
      setSearchInput('');
      setSearchError('');
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    setSearchError('');

    if (!value.trim()) {
      return;
    }

    const formats = ['MM/dd/yyyy', 'yyyy-MM-dd', 'MM-dd-yyyy', 'dd/MM/yyyy'];
    let parsedDate: Date | null = null;

    for (const fmt of formats) {
      const parsed = parse(value, fmt, new Date());
      if (isValid(parsed)) {
        parsedDate = parsed;
        break;
      }
    }

    if (parsedDate) {
      if (isDateInRange(parsedDate)) {
        const dateString = format(parsedDate, 'yyyy-MM-dd');
        onSelect(dateString);
        setSearchInput('');
        setSearchError('');
      } else {
        setSearchError('Date must be within 3 months');
      }
    }
  };

  const clearDate = () => {
    onSelect('');
    setSearchInput('');
    setSearchError('');
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
        <div className="bg-[#252525] border border-[#414141] rounded-[12px] p-3 space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Search date (MM/DD/YYYY or YYYY-MM-DD)</label>
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="e.g., 12/25/2024"
              className="w-full bg-[#1b1b1b] border border-[#414141] text-white placeholder-gray-500 text-sm rounded-[8px] focus:border-[#555555]"
            />
            {searchError && (
              <p className="text-xs text-red-400">{searchError}</p>
            )}
          </div>

          <div className="border-t border-[#414141]"></div>

          <div className="space-y-2">
            <p className="text-xs text-gray-400">Or pick from calendar (within 3 months)</p>
            <div className="flex justify-center scale-90 origin-top">
              <CalendarComponent
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={handleDateSelect}
                disabled={(date) => !isDateInRange(date)}
                className="rounded-[8px]"
              />
            </div>
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

          <div className="text-xs text-gray-500 bg-[#1b1b1b] rounded-[8px] p-2 border border-[#414141]">
            Filtering limited to 3 months • Upgrade to premium for unlimited range
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineDateFilter;
