'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, TrashIcon, CheckIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { WorkPlanItem, WorkPlanType, UserRole } from '@/types';
import { canViewWorkPlans, canAddWorkPlan, canDeleteWorkPlan } from '@/lib/permissions';

interface WorkPlanSectionProps {
  type: WorkPlanType;
  title: string;
  userRole: UserRole;
  userId: string;
  currentWeekStart?: Date; // 当前周视图的开始日期
}

const WorkPlanSection: React.FC<WorkPlanSectionProps> = ({
  type,
  title,
  userRole,
  userId,
  currentWeekStart
}) => {
  const [workPlans, setWorkPlans] = useState<WorkPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlan, setNewPlan] = useState('');

  // 权限检查
  const canAdd = canAddWorkPlan(userRole);
  const canDelete = canDeleteWorkPlan(userRole);

  // 根据类型获取占位符文本
  const getPlaceholderText = () => {
    switch (type) {
      case WorkPlanType.LAST_WEEK_SUMMARY:
        return {
          title: '总结标题',
          description: '上周工作总结内容（可选）'
        };
      case WorkPlanType.WEEKLY:
        return {
          title: '计划标题',
          description: '本周工作计划描述（可选）'
        };
      case WorkPlanType.UPCOMING:
        return {
          title: '计划标题',
          description: '近期工作计划描述（可选）'
        };
      default:
        return {
          title: '计划标题',
          description: '计划描述（可选）'
        };
    }
  };

  const placeholders = getPlaceholderText();

  // 根据类型获取按钮和状态文本
  const getUIText = () => {
    switch (type) {
      case WorkPlanType.LAST_WEEK_SUMMARY:
        return {
          addButton: '添加总结',
          confirmButton: '确认添加',
          emptyState: '暂无工作总结'
        };
      default:
        return {
          addButton: '添加',
          confirmButton: '确认添加',
          emptyState: '暂无工作计划'
        };
    }
  };

  const uiText = getUIText();

  // 获取工作计划列表
  const fetchWorkPlans = useCallback(async () => {
    try {
      setLoading(true);

      // 构建查询参数
      const params = new URLSearchParams({ type });

      // 如果有指定周期，添加周期过滤
      if (currentWeekStart) {
        params.append('weekStart', currentWeekStart.toISOString());
      }

      const response = await fetch(`/api/work-plans?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setWorkPlans(data.workPlans);
      }
    } catch (error) {
      console.error('获取工作计划失败:', error);
    } finally {
      setLoading(false);
    }
  }, [type, currentWeekStart]);

  useEffect(() => {
    fetchWorkPlans();
  }, [fetchWorkPlans]);

  // 添加工作计划
  const handleAddPlan = async () => {
    if (!newPlan.trim()) return;

    try {
      const response = await fetch('/api/work-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          title: newPlan.trim(),
          description: null,
          priority: 'medium',
          dueDate: null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setWorkPlans(prev => [data.workPlan, ...prev]);
        setNewPlan('');
        setShowAddForm(false);
      } else {
        alert(data.message || '添加失败');
      }
    } catch (error) {
      console.error('添加工作计划失败:', error);
      alert('添加失败，请重试');
    }
  };

  // 删除工作计划
  const handleDeletePlan = async (planId: string) => {
    if (!confirm('确定要删除这个工作计划吗？')) return;

    try {
      const response = await fetch(`/api/work-plans/${planId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setWorkPlans(prev => prev.filter(plan => plan.id !== planId));
      } else {
        alert(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除工作计划失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 更新状态
  const handleStatusChange = async (planId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/work-plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setWorkPlans(prev => prev.map(plan =>
          plan.id === planId ? { ...plan, status: newStatus as any } : plan
        ));
      }
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };



  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <ClockIcon className="h-4 w-4 text-blue-600" />;
      case 'pending': return <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {canAdd && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            type="button"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{uiText.addButton}</span>
          </button>
        )}
      </div>

      {/* 添加表单 */}
      {showAddForm && canAdd && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <input
              type="text"
              placeholder={placeholders.title}
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddPlan(); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddPlan}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                type="button"
              >
{uiText.confirmButton}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                type="button"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 工作计划列表 */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4 text-gray-500">加载中...</div>
        ) : workPlans.length === 0 ? (
          <div className="text-center py-4 text-gray-500">{uiText.emptyState}</div>
        ) : (
          workPlans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(plan.status)}
                    <h4 className="font-medium text-gray-900">{plan.title}</h4>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {canAdd && (
                    <select
                      value={plan.status}
                      onChange={(e) => handleStatusChange(plan.id, e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded"
                      title="更改状态"
                    >
                      <option value="pending">待处理</option>
                      <option value="in_progress">进行中</option>
                      <option value="completed">已完成</option>
                    </select>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      type="button"
                      title="删除"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkPlanSection;
