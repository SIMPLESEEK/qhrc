import { requireAuth } from '@/lib/auth';
import UserManagementInterface from '@/components/UserManagementInterface';

export default async function UserManagementPage() {
  // 验证用户是否已认证
  const user = await requireAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">用户管理</h1>
      <UserManagementInterface currentUser={user} />
    </div>
  );
}
