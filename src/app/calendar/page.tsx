import { requireAuth } from '@/lib/auth';
import { getSharedCalendarEvents } from '@/lib/calendar';
import Calendar from '@/components/Calendar';

export default async function CalendarPage() {
  // 验证用户是否已登录
  const user = await requireAuth();

  // 获取共享日历数据（所有用户看到相同的数据）
  const events = await getSharedCalendarEvents();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">QHRC日历系统</h1>
      <Calendar userId={user.id} initialEvents={events} userRole={user.role} />
    </div>
  );
}
