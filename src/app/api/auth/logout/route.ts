import { NextResponse } from 'next/server';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { OperationType } from '@/types';
import { logOperation } from '@/lib/operations';

export async function POST() {
  try {
    // 获取当前用户
    const user = await getCurrentUser();

    if (user) {
      // 记录登出操作
      await logOperation(
        user.id,
        user.username,
        OperationType.LOGOUT,
        `用户 ${user.name} 登出了系统`
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 登出用户
    await supabase.auth.signOut();

    return NextResponse.json(
      { message: '登出成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('登出过程中出错:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
