'use client';

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserRole, WorkPlanType } from '@/types';
import { canViewWorkPlans } from '@/lib/permissions';
import WorkPlanSection from './WorkPlanSection';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface WorkPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  userId: string;
  currentWeekStart?: Date; // 当前周视图的开始日期
}

const WorkPlanModal: React.FC<WorkPlanModalProps> = ({
  isOpen,
  onClose,
  userRole,
  userId,
  currentWeekStart
}) => {
  if (!isOpen || !canViewWorkPlans(userRole)) {
    return null;
  }

  // 获取当前周期信息
  const getCurrentWeekRange = () => {
    // 使用传入的周开始日期，如果没有则使用当前日期
    const baseDate = currentWeekStart || new Date();
    const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }); // 周一开始
    const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 }); // 周日结束

    const startStr = format(weekStart, 'yyyy年M月d日', { locale: zhCN });
    const endStr = format(weekEnd, 'M月d日', { locale: zhCN });

    return `${startStr}-${endStr}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              工作计划管理
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              当前周期：{getCurrentWeekRange()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            type="button"
            title="关闭"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* 上周工作总结 */}
            <WorkPlanSection
              type={WorkPlanType.LAST_WEEK_SUMMARY}
              title="上周工作总结"
              userRole={userRole}
              userId={userId}
              currentWeekStart={currentWeekStart}
            />

            {/* 本周工作计划 */}
            <WorkPlanSection
              type={WorkPlanType.WEEKLY}
              title="本周工作计划"
              userRole={userRole}
              userId={userId}
              currentWeekStart={currentWeekStart}
            />

            {/* 近期工作计划 */}
            <WorkPlanSection
              type={WorkPlanType.UPCOMING}
              title="近期工作计划"
              userRole={userRole}
              userId={userId}
              currentWeekStart={currentWeekStart}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkPlanModal;
