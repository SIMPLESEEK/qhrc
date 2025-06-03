import { requireAdmin } from '@/lib/auth';
import OperationLogs from '@/components/admin/OperationLogs';

export default async function OperationsPage() {
  // 验证用户是否为管理员
  await requireAdmin();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">操作记录</h1>
      <OperationLogs />
    </div>
  );
}
