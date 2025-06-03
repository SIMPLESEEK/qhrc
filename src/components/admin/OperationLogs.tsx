'use client';

import { useState, useEffect } from 'react';
import { OperationLog, OperationType } from '@/types';
import axios from '@/lib/axios';

export default function OperationLogs() {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterUserId, setFilterUserId] = useState<string | null>(null);

  // 加载操作记录
  const loadLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/operations?page=${page}&pageSize=${pageSize}`;
      if (filterUserId) {
        url += `&userId=${filterUserId}`;
      }

      const response = await axios.get(url);
      setLogs(response.data.logs);
      setTotalPages(Math.ceil(response.data.total / pageSize));
    } catch (err) {
      setError('获取操作记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和分页/筛选变化时重新加载
  useEffect(() => {
    loadLogs();
  }, [page, pageSize, filterUserId]);

  // 获取操作类型显示文本
  const getOperationTypeText = (type: OperationType): string => {
    switch (type) {
      case OperationType.LOGIN:
        return '登录';
      case OperationType.LOGOUT:
        return '登出';
      case OperationType.CREATE_USER:
        return '创建用户';
      case OperationType.UPDATE_USER:
        return '更新用户';
      case OperationType.DELETE_USER:
        return '删除用户';
      case OperationType.CREATE_EVENT:
        return '创建事项';
      case OperationType.UPDATE_EVENT:
        return '更新事项';
      case OperationType.DELETE_EVENT:
        return '删除事项';
      default:
        return '未知操作';
    }
  };

  // 获取操作类型样式
  const getOperationTypeStyle = (type: OperationType): string => {
    switch (type) {
      case OperationType.LOGIN:
      case OperationType.LOGOUT:
        return 'bg-gray-100 text-gray-800';
      case OperationType.CREATE_USER:
      case OperationType.CREATE_EVENT:
        return 'bg-green-100 text-green-800';
      case OperationType.UPDATE_USER:
      case OperationType.UPDATE_EVENT:
        return 'bg-blue-100 text-blue-800';
      case OperationType.DELETE_USER:
      case OperationType.DELETE_EVENT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 清除筛选
  const clearFilter = () => {
    setFilterUserId(null);
    setPage(1);
  };

  // 筛选特定用户
  const filterByUser = (userId: string) => {
    setFilterUserId(userId);
    setPage(1);
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
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

      {filterUserId && (
        <div className="mb-4 flex items-center">
          <span className="mr-2">当前筛选:</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
            用户ID: {filterUserId}
          </span>
          <button
            onClick={clearFilter}
            className="ml-2 text-sm text-red-500 hover:text-red-700"
          >
            清除筛选
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">时间</th>
              <th className="py-2 px-4 border-b text-left">用户</th>
              <th className="py-2 px-4 border-b text-left">操作类型</th>
              <th className="py-2 px-4 border-b text-left">详情</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">
                  {new Date(log.created_at).toLocaleString('zh-CN')}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => filterByUser(log.user_id)}
                    className="text-blue-500 hover:text-blue-700 hover:underline"
                  >
                    {log.user_email}
                  </button>
                </td>
                <td className="py-2 px-4 border-b">
                  <span className={`px-2 py-1 rounded text-xs ${getOperationTypeStyle(log.operation_type)}`}>
                    {getOperationTypeText(log.operation_type)}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">{log.details}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                  暂无操作记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-700">
              第 {page} 页，共 {totalPages} 页
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded ${
                page === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              上一页
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded ${
                page === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              下一页
            </button>
          </div>
          <div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="p-1 border border-gray-300 rounded"
            >
              <option value={10}>10条/页</option>
              <option value={20}>20条/页</option>
              <option value={50}>50条/页</option>
              <option value={100}>100条/页</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
