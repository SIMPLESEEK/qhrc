'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { CustomHoliday } from '@/lib/holidays';
import { UserRole } from '@/types';
import { canAddCustomHolidays, canDeleteCustomHolidays } from '@/lib/permissions';
import axios from '@/lib/axios';
import { format } from 'date-fns';

interface CustomHolidayManagerProps {
  userRole: UserRole;
  onClose: () => void;
  onHolidayChange?: () => void; // 节假日变更回调
}

export default function CustomHolidayManager({ userRole, onClose, onHolidayChange }: CustomHolidayManagerProps) {
  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0); // 强制重新渲染的key

  // 新增节假日表单
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    name: '',
    description: ''
  });

  // 加载自定义节假日
  const loadCustomHolidays = async () => {
    try {
      setIsLoading(true);
      setError(null); // 清除之前的错误

      console.log('=== 开始加载自定义节假日 ===');
      console.log('当前时间戳:', Date.now());

      // 添加时间戳防止缓存
      const url = `/api/holidays/custom?t=${Date.now()}`;
      console.log('请求URL:', url);

      const response = await axios.get(url);
      console.log('API响应:', response);
      console.log('响应数据:', response.data);
      console.log('响应中的holidays:', response.data.holidays);

      const holidays = response.data.holidays || [];
      console.log('处理后的holidays数组:', holidays);
      console.log('holidays数组长度:', holidays.length);

      setCustomHolidays(holidays);
      console.log('已调用setCustomHolidays，传入数据:', holidays);

    } catch (err) {
      console.error('加载自定义节假日失败:', err);
      setError('加载自定义节假日失败');
      setCustomHolidays([]); // 出错时设置为空数组
    } finally {
      setIsLoading(false);
      console.log('=== 加载自定义节假日完成 ===');
    }
  };

  useEffect(() => {
    loadCustomHolidays();
  }, []);



  // 添加自定义节假日
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newHoliday.date || !newHoliday.name) {
      setError('日期和名称是必填项');
      return;
    }

    try {
      setIsAdding(true);
      setError(null);

      const response = await axios.post('/api/holidays/custom', newHoliday);

      // 重新加载列表
      await loadCustomHolidays();

      // 重置表单
      setNewHoliday({ date: '', name: '', description: '' });

      // 通知父组件刷新
      onHolidayChange?.();

      alert('自定义节假日添加成功！');
    } catch (err: any) {
      console.error('添加自定义节假日失败:', err);
      setError(err.response?.data?.message || '添加自定义节假日失败');
    } finally {
      setIsAdding(false);
    }
  };

  // 删除自定义节假日
  const handleDeleteHoliday = async (holiday: CustomHoliday) => {
    if (!confirm(`确定要删除节假日"${holiday.name}"吗？`)) {
      return;
    }

    try {
      setError(null); // 清除之前的错误信息

      const response = await axios.delete('/api/holidays/custom', {
        data: {
          date: holiday.date,
          holidayId: holiday.id
        }
      });



      // 立即清空状态
      setCustomHolidays([]);

      // 强制重新渲染
      setRenderKey(prev => prev + 1);

      // 重新加载列表以确保数据同步
      await loadCustomHolidays();

      // 通知父组件刷新
      onHolidayChange?.();

      alert('自定义节假日删除成功！');
    } catch (err: any) {
      console.error('删除自定义节假日失败:', err);
      setError(err.response?.data?.message || '删除自定义节假日失败');
    }
  };

  const canAdd = canAddCustomHolidays(userRole);
  const canDelete = canDeleteCustomHolidays(userRole);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div key={renderKey} className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-800">自定义节假日管理</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 错误提示 */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* 添加新节假日表单 - 仅管理员可见 */}
          {canAdd && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">添加自定义节假日</h3>
              <form onSubmit={handleAddHoliday} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      日期 *
                    </label>
                    <input
                      type="date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      节假日名称 *
                    </label>
                    <input
                      type="text"
                      value={newHoliday.name}
                      onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="例如：QHRC成立日"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述（可选）
                  </label>
                  <textarea
                    value={newHoliday.description}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="节假日的详细描述..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>{isAdding ? '添加中...' : '添加节假日'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 自定义节假日列表 */}
          <div key={renderKey}>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              已添加的自定义节假日 ({customHolidays.length}) [renderKey: {renderKey}]
            </h3>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            ) : customHolidays.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>暂无自定义节假日</p>
                {canAdd && <p className="text-sm">使用上方表单添加第一个自定义节假日</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {customHolidays.map((holiday) => (
                  <div key={holiday.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="inline-block w-3 h-3 bg-orange-500 rounded-full"></span>
                          <h4 className="font-medium text-gray-800">{holiday.name}</h4>
                          <span className="text-sm text-gray-500">
                            {format(new Date(holiday.date), 'yyyy年MM月dd日')}
                          </span>
                        </div>
                        {holiday.description && (
                          <p className="text-sm text-gray-600 ml-6">{holiday.description}</p>
                        )}
                        <p className="text-xs text-gray-400 ml-6 mt-1">
                          创建时间: {holiday.created_at ? format(new Date(holiday.created_at), 'yyyy-MM-dd HH:mm') : '未知'}
                        </p>
                      </div>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteHoliday(holiday)}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          title="删除节假日"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
