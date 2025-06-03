'use client';

import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarState, ActivityType } from '@/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { holidayManager, HOLIDAY_COLORS, Holiday } from '@/lib/holidays';



// 获取活动类型缩写
function getActivityTypeAbbreviation(type: ActivityType): string {
  switch (type) {
    case ActivityType.QHRC_CENTER:
      return 'QH';
    case ActivityType.SI_CENTER:
      return 'SI';
    case ActivityType.DI_CENTER:
      return 'DI';
    case ActivityType.MH_CENTER:
      return 'MH';
    default:
      return '';
  }
}

interface MonthViewProps {
  year: number;
  month: number;
  events: CalendarState['events'];
  onDayClick: (date: Date) => void;
  onChangeMonth: (year: number, month: number) => void;
  getActivityTypeColor: (type: ActivityType) => string;
}

export default function MonthView({
  year,
  month,
  events,
  onDayClick,
  onChangeMonth,
  getActivityTypeColor
}: MonthViewProps) {
  const currentDate = useMemo(() => new Date(year, month), [year, month]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDate]);

  const startDay = getDay(startOfMonth(currentDate));

  // 数据兼容性处理函数
  const ensureActivitiesArray = (dayData: any): any[] => {
    if (dayData?.activities && Array.isArray(dayData.activities)) {
      return dayData.activities;
    }
    // 如果是旧的数据结构（cityRecords），提取所有活动
    if (dayData?.cityRecords && Array.isArray(dayData.cityRecords)) {
      const allActivities: any[] = [];
      dayData.cityRecords.forEach((record: any) => {
        if (record.activities && Array.isArray(record.activities)) {
          allActivities.push(...record.activities);
        }
      });
      return allActivities;
    }
    return [];
  };

  const getActivitiesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = events[dateStr];
    return dayData ? ensureActivitiesArray(dayData) : [];
  };

  // 获取节假日信息
  const getHolidaysForDay = (date: Date): Holiday[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidayManager.getHolidays(dateStr);
  };

  // 获取节假日背景色（简化颜色分类）
  const getHolidayBackground = (holidays: Holiday[]): string => {
    if (holidays.length === 0) return '';

    // 优先显示调休工作日
    if (holidays.some(h => h.isWorkday)) {
      return 'bg-green-50 border-green-200';
    }

    // 自定义节假日
    if (holidays.some(h => h.type === 'custom')) {
      return 'bg-orange-50 border-orange-200';
    }

    // 中国大陆节假日和传统节日（红色）
    if (holidays.some(h => h.type === 'mainland' || h.type === 'traditional')) {
      return 'bg-red-50 border-red-200';
    }

    // 香港节假日和西方节假日（紫色）
    if (holidays.some(h => h.type === 'hongkong' || h.type === 'western')) {
      return 'bg-purple-50 border-purple-200';
    }

    return '';
  };

  const prevMonth = () => {
    const prevDate = subMonths(currentDate, 1);
    onChangeMonth(prevDate.getFullYear(), prevDate.getMonth());
  };

  const nextMonth = () => {
    const nextDate = addMonths(currentDate, 1);
    onChangeMonth(nextDate.getFullYear(), nextDate.getMonth());
  };

  return (
    <div className="bg-amber-50 rounded-lg shadow-md border border-amber-200">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-amber-200">
        <button
          onClick={prevMonth}
          className="p-1.5 sm:p-2 rounded-full text-amber-700 hover:bg-amber-100"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-amber-900">
          {format(currentDate, 'yyyy年MMMM', { locale: zhCN })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 sm:p-2 rounded-full text-amber-700 hover:bg-amber-100"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {/* 星期头 - 中文 */}
        {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day) => (
          <div key={day} className="py-3 text-center font-semibold text-amber-800 text-xs border-b border-r border-amber-200 last:border-r-0">
            {day}
          </div>
        ))}

        {/* 月历前空白 */}
        {Array.from({ length: (startDay === 0 ? 6 : startDay - 1) }, (_, index) => (
          <div key={`empty-${index}`} className="border-r border-b border-amber-200 h-20 sm:h-28 lg:h-24" />
        ))}

        {/* 日历格 */}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const activities = getActivitiesForDay(day);
          const holidays = getHolidaysForDay(day);
          const holidayBg = getHolidayBackground(holidays);

          // 收集所有活动类型
          const activityTypes = new Set<ActivityType>();
          activities.forEach(activity => {
            activityTypes.add(activity.type);
          });

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(day)}
              className={`relative p-1.5 border-r border-b h-20 sm:h-28 lg:h-24 cursor-pointer hover:bg-amber-100 overflow-hidden ${
                !isSameMonth(day, currentDate) ? 'bg-amber-50/50 text-amber-500' : 'text-amber-900'
              } ${
                isToday(day) ? 'ring-2 ring-blue-500 ring-inset' : ''
              } ${
                holidayBg || 'border-amber-200'
              }`}
            >
              {/* 日期和节假日名称 */}
              <div className="flex items-center mb-1">
                <div className={`text-xs sm:text-sm font-semibold ${isToday(day) ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>

                {/* 节假日名称紧贴日期数字，同一水平线 */}
                {isSameMonth(day, currentDate) && holidays.length > 0 && (
                  <div className="ml-1">
                    {holidays.slice(0, 1).map((holiday, index) => (
                      <span
                        key={index}
                        className={`text-[0.5rem] sm:text-[0.6rem] font-medium ${
                          holiday.isWorkday ? 'text-green-600' :
                          holiday.type === 'custom' ? 'text-orange-600' :
                          (holiday.type === 'mainland' || holiday.type === 'traditional') ? 'text-red-600' :
                          (holiday.type === 'hongkong' || holiday.type === 'western') ? 'text-purple-600' :
                          'text-gray-600'
                        }`}
                        title={holidays.map(h => h.name).join(', ')}
                      >
                        {holiday.isWorkday ? '班' : holiday.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 活动列表 - 改为彩色背景显示 */}
              {isSameMonth(day, currentDate) && activities.length > 0 && (
                <div className="space-y-0.5 flex-1">
                  {activities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex">
                      <span
                        className={`inline-block px-1 py-0.5 rounded text-white text-[0.65rem] sm:text-[0.75rem] font-medium leading-tight ${getActivityTypeColor(activity.type)}`}
                        title={activity.description}
                      >
                        {activity.description}
                      </span>
                    </div>
                  ))}

                  {/* 显示更多活动的指示器 */}
                  {activities.length > 3 && (
                    <div className="text-[0.65rem] sm:text-[0.75rem] text-amber-600 font-medium">
                      +{activities.length - 3} 更多
                    </div>
                  )}
                </div>
              )}


            </div>
          );
        })}

        {/* 补齐最后一行空白 */}
        {Array.from({ length: (7 - (days.length + (startDay === 0 ? 6 : startDay - 1)) % 7) % 7 }, (_, index) => (
          <div key={`empty-end-${index}`} className="border-r border-b border-amber-200 h-20 sm:h-28 lg:h-24 last:border-r-0" />
        ))}
      </div>
    </div>
  );
}
