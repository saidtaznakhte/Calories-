import React from 'react';
import { toYYYYMMDD, formatDate } from '../utils/dateUtils';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - startOfWeek.getDay()); // Start from Sunday

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayYYYYMMDD = toYYYYMMDD(new Date());

  return (
    <div className="flex justify-between items-center">
      {weekDates.map((date, index) => {
        const dateYYYYMMDD = toYYYYMMDD(date);
        const isSelected = dateYYYYMMDD === toYYYYMMDD(selectedDate);
        const isToday = dateYYYYMMDD === todayYYYYMMDD;

        return (
          <button
            key={index}
            onClick={() => onDateChange(date)}
            className={`flex flex-col items-center justify-center w-12 h-20 rounded-xl transition-all duration-200 relative group focus:outline-none focus:ring-2 focus:ring-primary/50
              ${
                isSelected 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'hover:bg-white dark:hover:bg-dark-card'
              }`
            }
            aria-label={`Select date ${formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}`}
            aria-current={isSelected ? 'date' : undefined}
          >
            <span className={`text-sm font-semibold 
              ${ isSelected ? 'text-white/80' : 'text-text-light dark:text-dark-text-light'}`
            }>
              {days[index]}
            </span>
            <span className={`font-bold text-xl mt-1
              ${ isSelected ? 'text-white' : 'text-text-main dark:text-dark-text-main'}`
            }>
              {date.getDate()}
            </span>
            {isToday && <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-secondary'}`}></div>}
          </button>
        );
      })}
    </div>
  );
};

export default DateSelector;