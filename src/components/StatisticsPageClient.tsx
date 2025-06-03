'use client';

import { UserRole } from '@/types';
import StatisticsClient from './StatisticsClient';

interface StatisticsPageClientProps {
  userId: string;
  userRole: UserRole;
}

export default function StatisticsPageClient({ userId, userRole }: StatisticsPageClientProps) {
  const handleClose = () => {
    // 尝试关闭窗口，如果失败则返回上一页
    if (window.opener) {
      window.close();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">活动统计</h1>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              关闭
            </button>
          </div>
          
          <StatisticsClient userId={userId} userRole={userRole} />
        </div>
      </div>
    </div>
  );
}
