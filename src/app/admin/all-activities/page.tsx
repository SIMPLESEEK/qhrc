import { requireAuth } from '@/lib/auth';
import { UserRole } from '@/types';
import { redirect } from 'next/navigation';

export default async function AllActivitiesPage() {
  // 验证用户是否已登录且为超级管理员
  const user = await requireAuth();
  
  if (user.role !== UserRole.SUPER_ADMIN) {
    redirect('/calendar');
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">所有历史活动记录</h1>
        
        <div className="mb-4">
          <p className="text-gray-600">
            以下是系统中所有用户曾经记录过的活动内容：
          </p>
        </div>

        <div id="activities-container">
          <p className="text-gray-500">正在加载活动记录...</p>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          async function loadAllActivities() {
            try {
              const response = await fetch('/api/calendar/all-activities');
              const data = await response.json();
              
              const container = document.getElementById('activities-container');
              
              if (data.activities && data.activities.length > 0) {
                const html = \`
                  <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border border-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="py-2 px-4 border-b text-left">日期</th>
                          <th class="py-2 px-4 border-b text-left">活动描述</th>
                          <th class="py-2 px-4 border-b text-left">类型</th>
                          <th class="py-2 px-4 border-b text-left">用户ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        \${data.activities.map(activity => \`
                          <tr class="hover:bg-gray-50">
                            <td class="py-2 px-4 border-b">\${activity.date}</td>
                            <td class="py-2 px-4 border-b">\${activity.description}</td>
                            <td class="py-2 px-4 border-b">
                              <span class="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                \${activity.type}
                              </span>
                            </td>
                            <td class="py-2 px-4 border-b text-sm text-gray-600">\${activity.userId}</td>
                          </tr>
                        \`).join('')}
                      </tbody>
                    </table>
                  </div>
                  <div class="mt-4 text-sm text-gray-600">
                    总计: \${data.total} 条活动记录
                  </div>
                \`;
                container.innerHTML = html;
              } else {
                container.innerHTML = '<p class="text-gray-500">暂无活动记录</p>';
              }
            } catch (error) {
              console.error('加载活动记录失败:', error);
              document.getElementById('activities-container').innerHTML = 
                '<p class="text-red-500">加载活动记录失败</p>';
            }
          }
          
          // 页面加载完成后执行
          document.addEventListener('DOMContentLoaded', loadAllActivities);
        `
      }} />
    </div>
  );
}
