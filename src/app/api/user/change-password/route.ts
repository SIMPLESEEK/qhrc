import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { OperationType } from '@/types';
import { logOperation } from '@/lib/operations';

// 用户修改自己的密码
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: '请提供当前密码和新密码' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: '新密码长度至少为6位' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 验证当前密码
    const virtualEmail = `${user.username}@qhrc.internal`;
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: virtualEmail,
      password: currentPassword
    });

    if (verifyError) {
      return NextResponse.json(
        { message: '当前密码不正确' },
        { status: 400 }
      );
    }

    // 更新密码
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('更新密码失败:', updateError);
      return NextResponse.json(
        { message: '更新密码失败' },
        { status: 500 }
      );
    }

    // 记录操作
    await logOperation(
      user.id,
      user.username,
      OperationType.UPDATE_USER,
      `用户 ${user.name} 修改了自己的密码`
    );

    return NextResponse.json(
      { message: '密码修改成功' },
      { status: 200 }
    );

  } catch (error) {
    console.error('修改密码时出错:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
