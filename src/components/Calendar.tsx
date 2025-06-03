'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import YearView from './YearView';
import MonthView from './MonthView';
import WeekView from './WeekView';
import HolidayLegend from './HolidayLegend';
import CustomHolidayManager from './CustomHolidayManager';
import { CalendarState, Activity, DayData, UserRole, ActivityType } from '@/types';
import axios from '@/lib/axios';
import { holidayManager } from '@/lib/holidays';
import { canAddCustomHolidays, canDeleteEvents } from '@/lib/permissions';
import { useAutoRefresh, performanceMonitor } from '@/hooks/useAutoRefresh';



// 定义活动类型颜色
const activityTypeColors: Record<ActivityType, string> = {
  [ActivityType.QHRC_CENTER]: 'bg-red-500',    // QHRC中心 - 红色
  [ActivityType.SI_CENTER]: 'bg-blue-500',     // 智能传感器与影像实验室 - 蓝色
  [ActivityType.DI_CENTER]: 'bg-green-500',    // 智能设计与创新实验室 - 绿色
  [ActivityType.MH_CENTER]: 'bg-purple-500',   // 智慧医疗与健康实验室 - 紫色
};

interface CalendarProps {
  userId: string;
  initialEvents: Record<string, DayData>;
  userRole: UserRole;
}

export default function Calendar({ userId, initialEvents, userRole }: CalendarProps) {
  const [calendarState, setCalendarState] = useState<CalendarState>({
    view: 'month',
    selectedDate: new Date(),
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth(),
    events: initialEvents || {}
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomHolidayManager, setShowCustomHolidayManager] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // 初始化时加载自定义节假日
  useEffect(() => {
    holidayManager.loadCustomHolidaysFromDB();
  }, []);

  // 刷新日历数据
  const refreshCalendarData = useCallback(async () => {
    if (isRefreshing) return; // 防止重复刷新

    setIsRefreshing(true);
    try {
      const response = await performanceMonitor.measureApiCall('refresh_calendar', async () => {
        return await axios.get('/api/calendar');
      });

      if (response.data) {
        setCalendarState(prev => ({
          ...prev,
          events: response.data
        }));
        setLastRefreshTime(new Date());
      }
    } catch (error) {
      console.error('刷新日历数据失败:', error);
      // 不显示错误，避免干扰用户
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // 处理自定义节假日变更
  const handleHolidayChange = useCallback(async () => {
    // 强制重新加载自定义节假日数据
    await holidayManager.loadCustomHolidaysFromDB(true);
    // 强制重新渲染组件
    setCalendarState(prev => ({ ...prev }));
  }, []);

  // 设置自动刷新
  const { manualRefresh } = useAutoRefresh({
    interval: 5 * 60 * 1000, // 5分钟自动刷新
    enabled: true,
    onRefresh: refreshCalendarData
  });

  // 获取活动类型颜色
  const getActivityTypeColor = useCallback((type: ActivityType): string => {
    return activityTypeColors[type] || 'bg-gray-400';
  }, []);

  // 注意：现在通过专门的API端点处理活动的添加和删除，不再需要通用的自动保存

  // 切换视图
  const changeView = (view: CalendarState['view']) => {
    setCalendarState(prev => ({ ...prev, view }));
  };

  // 选择月份
  const handleSelectMonth = (month: number) => {
    setCalendarState(prev => ({
      ...prev,
      view: 'month',
      selectedMonth: month
    }));
  };

  // 选择日期
  const handleSelectDate = (date: Date) => {
    setCalendarState(prev => ({
      ...prev,
      view: 'week',
      selectedDate: date,
      selectedYear: date.getFullYear(),
      selectedMonth: date.getMonth()
    }));
  };

  // 更改月份
  const handleChangeMonth = (year: number, month: number) => {
    setCalendarState(prev => ({
      ...prev,
      selectedYear: year,
      selectedMonth: month
    }));
  };

  // 更改年份
  const handleChangeYear = (year: number) => {
    setCalendarState(prev => ({
      ...prev,
      selectedYear: year
    }));
  };

  // 数据兼容性处理函数
  const ensureActivitiesArray = (dayData: DayData | { activities?: Activity[]; cityRecords?: { activities?: Activity[] }[] }): Activity[] => {
    if (dayData?.activities && Array.isArray(dayData.activities)) {
      return dayData.activities;
    }
    // 如果是旧的数据结构（cityRecords），提取所有活动
    if ('cityRecords' in dayData && dayData?.cityRecords && Array.isArray(dayData.cityRecords)) {
      const allActivities: Activity[] = [];
      dayData.cityRecords.forEach((record: { activities?: Activity[] }) => {
        if (record.activities && Array.isArray(record.activities)) {
          allActivities.push(...record.activities);
        }
      });
      return allActivities;
    }
    return [];
  };

  // 添加活动
  const handleAddActivity = async (date: Date, activity: Partial<Activity>) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setIsSaving(true);
    setError(null);

    try {
      const response = await axios.post('/api/calendar/activities', {
        date: date.toISOString(),
        activity: {
          description: activity.description || '',
          type: activity.type || ActivityType.QHRC_CENTER
        }
      });

      const { activity: newActivity } = response.data;

      // 更新本地状态
      setCalendarState(prev => {
        const existingDayData = prev.events[dateStr];
        const existingActivities = existingDayData ? ensureActivitiesArray(existingDayData) : [];

        return {
          ...prev,
          events: {
            ...prev.events,
            [dateStr]: {
              date,
              activities: [...existingActivities, newActivity]
            }
          }
        };
      });
    } catch (err) {
      console.error('添加活动失败:', err);
      setError('添加活动失败，请重试。');
    } finally {
      setIsSaving(false);
    }
  };



  // 删除活动（仅超级管理员可用）
  const handleDeleteActivity = async (date: Date, activityId: string) => {
    // 检查用户权限
    if (!canDeleteEvents(userRole)) {
      setError('只有超级管理员可以删除活动');
      return;
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    setIsSaving(true);
    setError(null);

    try {
      await axios.delete('/api/calendar/activities', {
        data: {
          date: date.toISOString(),
          activityId
        }
      });

      // 更新本地状态
      setCalendarState(prev => {
        const existingDayData = prev.events[dateStr];
        if (!existingDayData) return prev;

        const existingActivities = ensureActivitiesArray(existingDayData);
        const updatedActivities = existingActivities.filter(
          activity => activity.id !== activityId
        );

        const updatedEvents = { ...prev.events };

        if (updatedActivities.length === 0) {
          // 如果没有活动了，删除整个日期
          delete updatedEvents[dateStr];
        } else {
          // 否则，更新现有条目
          updatedEvents[dateStr] = {
            date,
            activities: updatedActivities
          };
        }

        return {
          ...prev,
          events: updatedEvents
        };
      });
    } catch (err) {
      console.error('删除活动失败:', err);
      setError('删除活动失败，请重试。');
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="container mx-auto">
      {isSaving && (
        <div className="fixed top-4 right-4 bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm">正在保存...</div>
      )}
      {isRefreshing && (
        <div className="fixed top-4 right-4 bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm flex items-center space-x-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-800"></div>
          <span>正在刷新数据...</span>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">错误!</strong>
          <span className="block sm:inline"> {error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>关闭</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap justify-between items-center">
        <div className="space-x-1 sm:space-x-2 flex mb-2 w-full sm:mb-0 sm:w-auto">
          <button
            type="button"
            onClick={() => changeView('year')}
            className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md ${
              calendarState.view === 'year'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            年视图
          </button>
          <button
            type="button"
            onClick={() => changeView('month')}
            className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md ${
              calendarState.view === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            月视图
          </button>
          <button
            type="button"
            onClick={() => changeView('week')}
            className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md ${
              calendarState.view === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            周视图
          </button>
          <button
            type="button"
            onClick={manualRefresh}
            disabled={isRefreshing}
            className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            title={lastRefreshTime ? `上次刷新: ${lastRefreshTime.toLocaleTimeString()}` : '刷新数据'}
          >
            <svg className={`h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">刷新</span>
          </button>
        </div>

        {/* 节假日图例和管理 */}
        <div className="flex items-center space-x-4">
          <HolidayLegend />
          {canAddCustomHolidays(userRole) && (
            <button
              type="button"
              onClick={() => setShowCustomHolidayManager(true)}
              className="text-sm text-orange-600 hover:text-orange-800 transition-colors flex items-center space-x-1"
              title="管理自定义节假日"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>自定义节假日</span>
            </button>
          )}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="mt-6">
        {calendarState.view === 'year' && (
          <YearView
            year={calendarState.selectedYear}
            events={calendarState.events}
            onSelectMonth={handleSelectMonth}
            onChangeYear={handleChangeYear}
            getActivityTypeColor={getActivityTypeColor}
          />
        )}

        {calendarState.view === 'month' && (
          <MonthView
            year={calendarState.selectedYear}
            month={calendarState.selectedMonth}
            events={calendarState.events}
            onDayClick={handleSelectDate}
            onChangeMonth={handleChangeMonth}
            getActivityTypeColor={getActivityTypeColor}
          />
        )}

        {calendarState.view === 'week' && (
          <WeekView
            selectedDate={calendarState.selectedDate}
            events={calendarState.events}
            onDateChange={handleSelectDate}
            onAddActivity={handleAddActivity}
            onDeleteActivity={handleDeleteActivity}
            getActivityTypeColor={getActivityTypeColor}
            userRole={userRole}
            userId={userId}
          />
        )}
      </div>

      {/* 自定义节假日管理器 */}
      {showCustomHolidayManager && (
        <CustomHolidayManager
          userRole={userRole}
          onClose={() => setShowCustomHolidayManager(false)}
          onHolidayChange={handleHolidayChange}
        />
      )}
    </div>
  );
}
