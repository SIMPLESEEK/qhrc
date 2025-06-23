import { createSupabaseServerClientWithCookies } from './supabase-server';
import { OperationType, OperationLog } from '@/types';

// 记录用户操作 - 异步非阻塞版本
export async function logOperation(
  userId: string,
  userEmailOrUsername: string,
  operationType: OperationType,
  details: string
): Promise<void> {
  // 使用 setTimeout 让日志记录异步执行，不阻塞主要操作
  setTimeout(async () => {
    try {
      const supabase = await createSupabaseServerClientWithCookies();

      await supabase
        .from('operation_logs')
        .insert([
          {
            user_id: userId,
            user_email: userEmailOrUsername, // 兼容现有数据库结构
            operation_type: operationType,
            details,
          },
        ]);
    } catch (error) {
      // 记录操作失败，静默处理
      console.warn('操作日志记录失败:', error);
    }
  }, 0);
}

// 获取操作记录（仅管理员可用）
export async function getOperationLogs(
  page: number = 1,
  pageSize: number = 20
): Promise<{ logs: OperationLog[]; total: number }> {
  try {
    const supabase = await createSupabaseServerClientWithCookies();

    // 获取总记录数
    const { count, error: countError } = await supabase
      .from('operation_logs')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return { logs: [], total: 0 };
    }

    // 获取分页记录
    const { data, error } = await supabase
      .from('operation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      return { logs: [], total: 0 };
    }

    return { logs: data as OperationLog[], total: count || 0 };
  } catch (error) {
    return { logs: [], total: 0 };
  }
}

// 获取用户的操作记录
export async function getUserOperationLogs(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ logs: OperationLog[]; total: number }> {
  try {
    const supabase = await createSupabaseServerClientWithCookies();

    // 获取总记录数
    const { count, error: countError } = await supabase
      .from('operation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      return { logs: [], total: 0 };
    }

    // 获取分页记录
    const { data, error } = await supabase
      .from('operation_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('获取用户操作记录失败:', error);
      return { logs: [], total: 0 };
    }

    return { logs: data as OperationLog[], total: count || 0 };
  } catch (error) {
    console.error('获取用户操作记录时出错:', error);
    return { logs: [], total: 0 };
  }
}
