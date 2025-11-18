import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-medium text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 text-gray-400 hover:text-white hover:bg-[#2e2e2e] rounded-md transition-all"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-500 rounded-md w-9 font-normal text-[0.7rem] uppercase",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal text-gray-300 transition-all aria-selected:opacity-100 [&:not(.rdp-day_selected)]:hover:bg-[#2e2e2e] [&:not(.rdp-day_selected)]:hover:text-white [&:not(.rdp-day_range_start):not(.rdp-day_range_middle):not(.rdp-day_range_end)]:rounded-md"
        ),
        day_range_start: "bg-[#414141] text-gray-400 rounded-l-md",
        day_range_end: "bg-[#414141] text-gray-400 rounded-r-md",
        day_selected:
          "bg-white text-black hover:bg-gray-100 hover:text-black focus:bg-white focus:text-black font-medium rounded-md",
        day_today: "bg-[#2e2e2e] text-white font-medium rounded-md aria-selected:!bg-white aria-selected:!text-black",
        day_outside:
          "day-outside text-gray-600 opacity-50 aria-selected:bg-[#414141] aria-selected:text-gray-400 aria-selected:opacity-100",
        day_disabled: "text-gray-600 opacity-30",
        day_range_middle:
          "bg-[#414141] text-gray-400",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
