'use client';

import React, { useState, useMemo } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
  addDays,
  subDays
} from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { CalendarState, Activity, ActivityType, UserRole } from '@/types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, XMarkIcon, PaperClipIcon, PencilIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import AttachmentAndLinkViewer from './AttachmentAndLinkViewer';
import WorkPlanModal from './WorkPlanModal';
import { shouldShowAttachmentButton, canAddEvents, canDeleteEvents, canViewWorkPlans } from '@/lib/permissions';
import { holidayManager, Holiday } from '@/lib/holidays';

interface WeekViewProps {
  selectedDate: Date;
  events: CalendarState['events'];
  onDateChange: (date: Date) => void;
  onAddActivity: (date: Date, activity: Partial<Activity>) => void;
  onDeleteActivity: (date: Date, activityId: string) => void;
  getActivityTypeColor: (type: ActivityType) => string;
  userRole: UserRole;
  userId: string;
}

export default function WeekView({
  selectedDate,
  events,
  onDateChange,
  onAddActivity,
  onDeleteActivity,
  getActivityTypeColor,
  userRole,
  userId
}: WeekViewProps) {
  const [addingActivity, setAddingActivity] = useState<{ date: Date | null; activityType: ActivityType }>({
    date: null,
    activityType: ActivityType.QHRC_CENTER
  });
  const [newActivity, setNewActivity] = useState('');
  const [attachmentAndLinkViewer, setAttachmentAndLinkViewer] = useState<{
    isOpen: boolean;
    activityId: string;
    userId: string;
  }>({
    isOpen: false,
    activityId: '',
    userId: ''
  });
  const [showWorkPlanModal, setShowWorkPlanModal] = useState(false);

  // 跟踪每个活动的附件数量
  const [activityAttachmentCounts, setActivityAttachmentCounts] = useState<Record<string, number>>({});

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysInWeek = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

  // 获取活动的附件数量
  const fetchActivityAttachmentCount = async (activityId: string) => {
    try {
      const response = await fetch(`/api/attachments?activityId=${activityId}&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const attachmentCount = data.attachments?.length || 0;
        setActivityAttachmentCounts(prev => ({
          ...prev,
          [activityId]: attachmentCount
        }));
      }
    } catch (error) {
      // 静默处理错误，不影响主要功能
    }
  };

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

  const prevWeek = () => onDateChange(subDays(weekStart, 7));
  const nextWeek = () => onDateChange(addDays(weekEnd, 1));

  const handleStartAddActivity = (day: Date) => {
    setAddingActivity({ date: day, activityType: ActivityType.QHRC_CENTER });
    setNewActivity('');
  };

  const handleConfirmAddActivity = () => {
    if (newActivity.trim() && addingActivity.date) {
      onAddActivity(addingActivity.date, {
        description: newActivity,
        type: addingActivity.activityType
      });
      setAddingActivity({ date: null, activityType: ActivityType.QHRC_CENTER });
      setNewActivity('');
    }
  };

  const handleCancelAddActivity = () => {
    setAddingActivity({ date: null, activityType: ActivityType.QHRC_CENTER });
    setNewActivity('');
  };

  const handleViewAttachmentsAndLinks = (activityId: string, userId: string) => {
    setAttachmentAndLinkViewer({
      isOpen: true,
      activityId,
      userId
    });
  };

  const handleCloseAttachmentAndLinkViewer = () => {
    setAttachmentAndLinkViewer({
      isOpen: false,
      activityId: '',
      userId: ''
    });
  };

  // 获取节假日信息
  const getHolidaysForDay = (date: Date): Holiday[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidayManager.getHolidays(dateStr);
  };

  // 获取节假日标签的背景色和文字颜色
  const getHolidayLabelStyle = (holidays: Holiday[]): { bgClass: string; textClass: string } => {
    if (holidays.length === 0) return { bgClass: '', textClass: '' };

    // 优先显示调休工作日
    if (holidays.some(h => h.isWorkday)) {
      return { bgClass: 'bg-green-100', textClass: 'text-green-700' };
    }

    // 自定义节假日
    if (holidays.some(h => h.type === 'custom')) {
      return { bgClass: 'bg-orange-100', textClass: 'text-orange-700' };
    }

    // 中国大陆节假日和传统节日（红色）
    if (holidays.some(h => h.type === 'mainland' || h.type === 'traditional')) {
      return { bgClass: 'bg-red-100', textClass: 'text-red-700' };
    }

    // 香港节假日和西方节假日（紫色）
    if (holidays.some(h => h.type === 'hongkong' || h.type === 'western')) {
      return { bgClass: 'bg-purple-100', textClass: 'text-purple-700' };
    }

    return { bgClass: '', textClass: '' };
  };

  return (
    <div className="bg-amber-50 p-3 sm:p-4 rounded-lg shadow-md border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={prevWeek}
            className="p-1.5 sm:p-2 rounded-full text-amber-700 hover:bg-amber-100"
            title="上一周"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          {canViewWorkPlans(userRole) && (
            <button
              type="button"
              onClick={() => setShowWorkPlanModal(true)}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-1"
              title="查看工作计划"
            >
              <ClipboardDocumentListIcon className="h-4 w-4" />
              <span className="text-sm">工作计划</span>
            </button>
          )}
        </div>
        <h2 className="text-base sm:text-lg font-semibold text-amber-900">
          {format(weekStart, 'yyyy年MMMM d日', { locale: zhCN })} - {format(weekEnd, 'd日', { locale: zhCN })}
        </h2>
        <button
          type="button"
          onClick={nextWeek}
          className="p-1.5 sm:p-2 rounded-full text-amber-700 hover:bg-amber-100"
          title="下一周"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {daysInWeek.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayData = events[dateStr];
          const dayActivities = dayData ? ensureActivitiesArray(dayData) : [];
          const isAddingActivityForThisDay = addingActivity.date && isSameDay(day, addingActivity.date);
          const holidays = getHolidaysForDay(day);
          const holidayStyle = getHolidayLabelStyle(holidays);

          return (
            <div key={dateStr} className="bg-white p-2 sm:p-3 rounded shadow border border-amber-100 space-y-2 flex flex-col">
              <div className="flex justify-between items-center pb-1 border-b border-amber-100">
                <span className={`font-semibold text-sm sm:text-base ${isToday(day) ? 'text-blue-600' : 'text-amber-800'}`}>
                  {format(day, 'EEE d', { locale: enUS })}
                </span>
                {!isAddingActivityForThisDay && canAddEvents(userRole) && (
                   <button
                    type="button"
                    onClick={() => handleStartAddActivity(day)}
                    className="p-1 rounded-full text-amber-600 hover:bg-amber-100"
                    title="添加活动"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isAddingActivityForThisDay && (
                <div className="space-y-1">
                  <select
                    value={addingActivity.activityType}
                    onChange={(e) => setAddingActivity({
                      ...addingActivity,
                      activityType: e.target.value as ActivityType
                    })}
                    className="w-full border-amber-300 rounded shadow-sm text-xs p-1 focus:ring-amber-500 focus:border-amber-500"
                    title="选择活动类型"
                  >
                    <option value={ActivityType.QHRC_CENTER}>QHRC中心</option>
                    <option value={ActivityType.SI_CENTER}>智能传感器与影像实验室</option>
                    <option value={ActivityType.DI_CENTER}>智能设计与创新实验室</option>
                    <option value={ActivityType.MH_CENTER}>智慧医疗与健康实验室</option>
                  </select>
                  <input
                    type="text"
                    placeholder="输入活动描述..."
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAddActivity(); }}
                    className="w-full border-amber-300 rounded shadow-sm text-sm p-1.5 focus:ring-amber-500 focus:border-amber-500"
                    autoFocus
                  />
                  <div className="flex space-x-1">
                     <button type="button" onClick={handleConfirmAddActivity} className="flex-1 bg-amber-500 text-white text-xs py-1 rounded hover:bg-amber-600">添加</button>
                     <button type="button" onClick={handleCancelAddActivity} className="flex-1 bg-gray-300 text-gray-700 text-xs py-1 rounded hover:bg-gray-400">取消</button>
                  </div>
                </div>
              )}

              <div className="space-y-2 flex-grow">
                {/* 节假日标签 - 显示在活动内容区域顶部 */}
                {holidays.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {/* 去重显示节假日，避免同名节假日重复显示 */}
                    {Array.from(new Set(holidays.map(h => h.isWorkday ? '班' : h.name)))
                      .slice(0, 2)
                      .map((name, index) => {
                        // 找到第一个匹配的节假日来获取样式
                        const holiday = holidays.find(h => (h.isWorkday ? '班' : h.name) === name);
                        if (!holiday) return null;

                        return (
                          <span
                            key={index}
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${holidayStyle.bgClass} ${holidayStyle.textClass}`}
                            title={holidays.filter(h => (h.isWorkday ? '班' : h.name) === name).map(h => h.name).join(', ')}
                          >
                            {name}
                          </span>
                        );
                      })}
                  </div>
                )}

                {dayActivities.map((activity) => (
                  <div key={activity.id} className="group p-2 rounded bg-amber-50/50 border border-amber-100">
                    {/* 活动内容行 */}
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center flex-grow">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${getActivityTypeColor(activity.type)}`}
                          title={activity.type}
                        ></span>
                        <span className="text-xs text-amber-800 truncate">{activity.description}</span>
                      </div>
                      {canDeleteEvents(userRole) && (
                        <button
                          type="button"
                          onClick={() => onDeleteActivity(day, activity.id)}
                          className="p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="删除活动"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* 附件和链接按钮行 */}
                    <div className="flex space-x-1">
                      {shouldShowAttachmentButton(userRole, (activityAttachmentCounts[activity.id] || 0) > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            handleViewAttachmentsAndLinks(activity.id, userId);
                            // 获取最新的附件数量
                            fetchActivityAttachmentCount(activity.id);
                          }}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          title="查看附件和链接"
                          onMouseEnter={() => {
                            // 鼠标悬停时预加载附件数量
                            if (!(activity.id in activityAttachmentCounts)) {
                              fetchActivityAttachmentCount(activity.id);
                            }
                          }}
                        >
                          <PaperClipIcon className="h-3 w-3" />
                          <span>附件</span>
                          {(activityAttachmentCounts[activity.id] || 0) > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                              {activityAttachmentCounts[activity.id]}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 附件和链接查看器 */}
      {attachmentAndLinkViewer.isOpen && (
        <AttachmentAndLinkViewer
          activityId={attachmentAndLinkViewer.activityId}
          userId={attachmentAndLinkViewer.userId}
          userRole={userRole}
          onClose={handleCloseAttachmentAndLinkViewer}
        />
      )}

      {/* 工作计划弹窗 */}
      <WorkPlanModal
        isOpen={showWorkPlanModal}
        onClose={() => setShowWorkPlanModal(false)}
        userRole={userRole}
        userId={userId}
        currentWeekStart={weekStart}
      />
    </div>
  );
}
