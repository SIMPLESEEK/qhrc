import { requireAuth } from '@/lib/auth';
import StatisticsPageClient from '@/components/StatisticsPageClient';

export default async function StatisticsPage() {
  // 验证用户是否已登录
  const user = await requireAuth();

  return <StatisticsPageClient userId={user.id} userRole={user.role} />;
}
