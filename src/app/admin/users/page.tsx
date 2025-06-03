import { requireSuperAdmin } from '@/lib/auth';
import UserManagement from '@/components/admin/UserManagement';

export default async function UsersPage() {
  // 验证用户是否为超级管理员
  const admin = await requireSuperAdmin();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">用户管理</h1>
      <UserManagement adminId={admin.id} />
    </div>
  );
}
