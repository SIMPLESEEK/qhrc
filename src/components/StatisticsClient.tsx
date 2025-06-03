'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ActivityType, UserRole } from '@/types';
import * as XLSX from 'xlsx';
import axios from 'axios';

interface Activity {
  date: string;
  description: string;
  type: ActivityType;
  activityId: string;
}

interface StatisticsClientProps {
  userId: string;
  userRole: UserRole;
}

// 活动类型中文名称映射
const activityTypeNames: Record<ActivityType, string> = {
  [ActivityType.QHRC_CENTER]: 'QHRC中心',
  [ActivityType.SI_CENTER]: '智能传感器与影像实验室',
  [ActivityType.DI_CENTER]: '智能设计与创新实验室',
  [ActivityType.MH_CENTER]: '智慧医疗与健康实验室',
};

export default function StatisticsClient({ userId, userRole }: StatisticsClientProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [keyword, setKeyword] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 工作计划统计状态
  const [planStartDate, setPlanStartDate] = useState('');
  const [planEndDate, setPlanEndDate] = useState('');
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // 获取所有活动数据
  const fetchAllActivities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/statistics/activities');
      
      if (!response.ok) {
        throw new Error('获取活动数据失败');
      }
      
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('获取活动数据失败:', err);
      setError('获取活动数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取数据
  useEffect(() => {
    fetchAllActivities();
  }, []);

  // 筛选活动
  const handleFilter = () => {
    let filtered = [...activities];

    // 日期筛选
    if (startDate) {
      filtered = filtered.filter(activity => activity.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(activity => activity.date <= endDate);
    }

    // 关键字筛选
    if (keyword.trim()) {
      const searchKeyword = keyword.trim().toLowerCase();
      filtered = filtered.filter(activity => 
        activity.description.toLowerCase().includes(searchKeyword) ||
        activityTypeNames[activity.type].toLowerCase().includes(searchKeyword)
      );
    }

    setFilteredActivities(filtered);
  };

  // 导出为Excel
  const exportToExcel = () => {
    const exportData = filteredActivities.map((activity, index) => ({
      '序号': index + 1,
      '日期': activity.date,
      '活动类型': activityTypeNames[activity.type],
      '活动描述': activity.description,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '活动统计');

    const fileName = `活动统计_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // 导出工作计划为Excel
  const exportWorkPlansToExcel = async () => {
    if (!planStartDate || !planEndDate) {
      setPlanError('请选择开始日期和结束日期');
      return;
    }

    setPlanLoading(true);
    setPlanError(null);

    try {
      const response = await axios.get('/api/statistics/work-plans', {
        params: {
          startDate: planStartDate,
          endDate: planEndDate,
        },
      });

      const workPlans = response.data.workPlans || [];

      if (workPlans.length === 0) {
        setPlanError('所选日期范围内没有工作计划数据');
        setPlanLoading(false);
        return;
      }

      const exportData = workPlans.map((plan: any, index: number) => ({
        '序号': index + 1,
        '周期': plan.weekRange,
        '计划类型': plan.type === 'weekly' ? '本周工作计划' :
                   plan.type === 'last_week_summary' ? '上周工作总结' : '近期工作计划',
        '计划内容': plan.content,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '工作计划统计');

      const fileName = `工作计划统计_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error('导出工作计划失败:', error);
      setPlanError('导出工作计划失败，请重试');
    } finally {
      setPlanLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* 筛选条件 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">筛选条件</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              开始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束日期
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              关键字
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索活动描述或类型..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            type="button"
            onClick={handleFilter}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? '加载中...' : '筛选'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setKeyword('');
              setFilteredActivities([]);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 统计结果 */}
      {filteredActivities.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              统计结果 (共 {filteredActivities.length} 条记录)
            </h3>
            <div>
              <button
                type="button"
                onClick={exportToExcel}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                导出Excel
              </button>
            </div>
          </div>

          {/* 活动列表 */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    序号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    日期
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    活动类型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    活动描述
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredActivities.map((activity, index) => (
                  <tr key={`${activity.date}-${activity.activityId}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 border-b">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-b">
                      {activity.date}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full text-white ${
                        activity.type === ActivityType.QHRC_CENTER ? 'bg-red-500' :
                        activity.type === ActivityType.SI_CENTER ? 'bg-blue-500' :
                        activity.type === ActivityType.DI_CENTER ? 'bg-green-500' :
                        activity.type === ActivityType.MH_CENTER ? 'bg-purple-500' : 'bg-gray-500'
                      }`}>
                        {activityTypeNames[activity.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-b">
                      {activity.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 无数据提示 */}
      {!loading && filteredActivities.length === 0 && (startDate || endDate || keyword) && (
        <div className="text-center py-8 text-gray-500">
          没有找到符合条件的活动记录
        </div>
      )}

      {/* 工作计划统计 */}
      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">工作计划统计</h2>

        {/* 日期筛选 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              开始日期
            </label>
            <input
              type="date"
              value={planStartDate}
              onChange={(e) => setPlanStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束日期
            </label>
            <input
              type="date"
              value={planEndDate}
              onChange={(e) => setPlanEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={exportWorkPlansToExcel}
              disabled={planLoading || !planStartDate || !planEndDate}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {planLoading ? '导出中...' : '导出Excel'}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {planError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {planError}
          </div>
        )}
      </div>
    </div>
  );
}
