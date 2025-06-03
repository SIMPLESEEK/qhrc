import { NextResponse } from 'next/server';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types';
import { canViewOperationLogs } from '@/lib/permissions';

// 获取操作记录（仅管理员可用）
export async function GET(request: Request) {
  try {
    // 获取当前用户
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 检查是否有查看操作记录的权限
    if (!canViewOperationLogs(user.role)) {
      return NextResponse.json(
        { message: '只有管理员可以查看操作记录' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const userId = searchParams.get('userId');

    const supabase = await createSupabaseServerClientWithCookies();

    let query = supabase
      .from('operation_logs')
      .select('*', { count: 'exact' });

    // 如果指定了用户ID，则只获取该用户的操作记录
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // 获取总记录数
    const { count, error: countError } = await supabase
      .from('operation_logs')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json(
        { message: '获取操作记录总数失败' },
        { status: 500 }
      );
    }

    // 获取分页记录
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      return NextResponse.json(
        { message: '获取操作记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { logs: data, total: count || 0, page, pageSize },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
