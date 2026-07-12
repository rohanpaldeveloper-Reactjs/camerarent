import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface DateRangePickerProps {
  productId: string;
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
}

export default function DateRangePicker({ productId, startDate, endDate, onChange }: DateRangePickerProps) {
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Fetch blocked dates whenever productId changes
  useEffect(() => {
    async function loadBlockedDates() {
      try {
        const dates = await apiRequest(`/products/${productId}/unavailable-dates`);
        setUnavailableDates(dates);
      } catch (err) {
        console.error('Failed to load product unavailable dates:', err);
      }
    }
    loadBlockedDates();
  }, [productId]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Helper to format date string to YYYY-MM-DD
  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isDateUnavailable = (date: Date) => {
    const formatted = formatDateStr(date);
    
    // Past dates are always unavailable
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    return unavailableDates.includes(formatted);
  };

  const handleDateClick = (date: Date) => {
    if (isDateUnavailable(date)) return;

    if (!startDate || (startDate && endDate)) {
      // First click: set start date, reset end date
      onChange(date, null);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        // If clicked date is before start date, treat it as new start date
        onChange(date, null);
      } else {
        // Second click: set end date, check if range contains unavailable dates
        if (hasBlockedDatesInRange(startDate, date)) {
          alert('Selected range overlaps with unavailable/booked dates. Please choose another range.');
          onChange(null, null);
        } else {
          onChange(startDate, date);
          setShowCalendar(false); // Close calendar on successful selection
        }
      }
    }
  };

  const hasBlockedDatesInRange = (start: Date, end: Date) => {
    const curr = new Date(start);
    while (curr <= end) {
      if (isDateUnavailable(curr)) {
        return true;
      }
      curr.setDate(curr.getDate() + 1);
    }
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (startDate && formatDateStr(date) === formatDateStr(startDate)) return true;
    if (endDate && formatDateStr(date) === formatDateStr(endDate)) return true;
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!startDate) return false;
    
    const dStr = formatDateStr(date);
    const startStr = formatDateStr(startDate);

    if (endDate) {
      const endStr = formatDateStr(endDate);
      return dStr > startStr && dStr < endStr;
    }

    if (hoverDate) {
      const hoverStr = formatDateStr(hoverDate);
      return dStr > startStr && dStr < hoverStr && date > startDate;
    }

    return false;
  };

  // Calendar rendering math
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: Date[] = [];

  // Fill in empty slots from previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    const prevDate = new Date(year, month, -firstDayOfMonth + i + 1);
    calendarDays.push(prevDate);
  }

  // Fill in active month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i));
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="relative w-full">
      <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">
        Rental Period
      </label>

      {/* Input button triggering popup */}
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full flex items-center justify-between bg-white hover:bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm transition text-left cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-brand-400" />
          {startDate ? (
            <span className="font-semibold text-slate-800">
              {startDate.toLocaleDateString()}
              {endDate ? ` — ${endDate.toLocaleDateString()}` : ' (Select End Date)'}
            </span>
          ) : (
            <span className="text-slate-400">Select rental dates...</span>
          )}
        </span>
        <span className="text-xs text-brand-400 hover:underline">Change</span>
      </button>

      {/* Popover Calendar */}
      {showCalendar && (
        <div className="absolute left-0 right-0 mt-2 z-50 p-4 rounded-2xl glass-panel shadow-2xl border border-slate-100">
          {/* Header navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-semibold text-sm text-gray-100">
              {monthNames[month]} {year}
            </h3>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 mb-2">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, idx) => {
              const isCurrentMonthDay = date.getMonth() === month;
              const isUnavailable = isDateUnavailable(date);
              const isSelected = isDateSelected(date);
              const inRange = isDateInRange(date);

              let dayClass = "h-8 w-8 text-xs flex items-center justify-center rounded-lg transition-all mx-auto cursor-pointer ";
              
              if (!isCurrentMonthDay) {
                dayClass += "text-slate-700 pointer-events-none ";
              } else if (isUnavailable) {
                dayClass += "text-slate-600 line-through bg-slate-900/50 cursor-not-allowed ";
              } else if (isSelected) {
                dayClass += "bg-brand-600 text-white font-bold scale-110 shadow-lg shadow-brand-500/20 ";
              } else if (inRange) {
                dayClass += "bg-brand-500/20 text-brand-300 rounded-md ";
              } else {
                dayClass += "text-slate-300 hover:bg-slate-800 ";
              }

              return (
                <div
                  key={idx}
                  onClick={() => isCurrentMonthDay && handleDateClick(date)}
                  onMouseEnter={() => isCurrentMonthDay && setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={dayClass}
                  title={isUnavailable ? 'Date booked / unavailable' : undefined}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>

          {/* Selected dates status */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">
              {startDate && `From: ${startDate.toLocaleDateString()}`}
              {endDate && ` To: ${endDate.toLocaleDateString()}`}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange(null, null);
                setShowCalendar(false);
              }}
              className="text-brand-600 hover:text-brand-700 hover:underline font-semibold"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
