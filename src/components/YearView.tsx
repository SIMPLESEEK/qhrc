'use client';

import { useMemo } from 'react';
import { format, getMonth, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarState, ActivityType } from '@/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface YearViewProps {
  year: number;
  events: CalendarState['events'];
  onSelectMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
  getActivityTypeColor: (type: ActivityType) => string;
}

export default function YearView({ year, events, onSelectMonth, onChangeYear, getActivityTypeColor }: YearViewProps) {
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  }, [year]);

  // 检查月份是否有事件
  const monthHasEvents = (monthDate: Date): boolean => {
    const month = getMonth(monthDate);
    return Object.keys(events).some(dateStr => {
      const eventDate = new Date(dateStr);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  // 生成月份缩略图
  const generateMonthThumbnail = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);

    // 计算月份有多少周
    const totalDays = days.length + (startDay === 0 ? 6 : startDay - 1);
    const totalWeeks = Math.ceil(totalDays / 7);

    return (
      <div className="grid grid-cols-7 gap-[1px] mt-1 text-[0.5rem]">
        {/* 星期头 */}
        {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
          <div key={day} className="text-center text-gray-500">
            {day}
          </div>
        ))}

        {/* 月历前空白 */}
        {Array.from({ length: (startDay === 0 ? 6 : startDay - 1) }, (_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* 日历格 */}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayData = events[dateStr];
          const activities = dayData?.activities || [];
          const hasEvents = activities.length > 0;

          // 获取第一个活动的颜色作为指示器颜色
          const firstActivityType = activities[0]?.type;
          const indicatorColorClass = firstActivityType
            ? getActivityTypeColor(firstActivityType).replace('bg-', 'bg-')
            : 'bg-red-500';

          return (
            <div
              key={dateStr}
              className={`aspect-square flex flex-col items-center justify-center text-center relative ${
                hasEvents ? 'bg-blue-200 rounded-md' : ''
              }`}
            >
              <div>{format(day, 'd')}</div>
              {/* 活动指示器 - 移到日期数字下方，颜色根据活动类型确定 */}
              {hasEvents && (
                <div className={`w-1 h-1 ${indicatorColorClass} rounded-sm mt-0.5`}></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-amber-50 rounded-lg shadow-md border border-amber-200 p-3 sm:p-4">
      <div className="flex items-center justify-center mb-4 relative">
         <button
           onClick={() => onChangeYear(year - 1)}
           className="absolute left-0 p-1.5 sm:p-2 rounded-full text-amber-700 hover:bg-amber-100"
         >
           <ChevronLeftIcon className="h-5 w-5" />
         </button>
         <h2 className="text-center text-lg sm:text-xl font-semibold text-amber-900">{year}年</h2>
         <button
           onClick={() => onChangeYear(year + 1)}
           className="absolute right-0 p-1.5 sm:p-2 rounded-full text-amber-700 hover:bg-amber-100"
          >
           <ChevronRightIcon className="h-5 w-5" />
         </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {months.map((monthDate, index) => (
          <div
            key={index}
            onClick={() => onSelectMonth(index)}
            className={`p-3 sm:p-4 rounded-md cursor-pointer border border-amber-100 hover:bg-amber-100 hover:shadow ${
              monthHasEvents(monthDate) ? 'bg-white' : 'bg-amber-50/70'
            }`}
          >
            <span className="font-medium text-sm sm:text-base text-amber-800 block text-center">
              {format(monthDate, 'MMMM', { locale: zhCN })}
            </span>

            {/* PC端显示缩略月视图 */}
            <div className="hidden md:block">
              {generateMonthThumbnail(monthDate)}
            </div>

            {/* 移动端只显示指示器 */}
            {monthHasEvents(monthDate) && (
              <div className="md:hidden mt-1 h-1 w-1 bg-blue-500 rounded-sm mx-auto"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
