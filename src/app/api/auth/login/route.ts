import { NextResponse } from 'next/server';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { OperationType } from '@/types';
import { logOperation } from '@/lib/operations';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: '请提供用户名和密码' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 支持用户名登录：查找用户名对应的邮箱
    let loginEmail = username;

    // 如果输入的是用户名（不包含@），从数据库查找对应的邮箱
    if (!username.includes('@')) {
      const { data: userRecord, error: userLookupError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();

      if (userLookupError || !userRecord) {
        return NextResponse.json(
          { message: '用户名不存在' },
          { status: 401 }
        );
      }

      loginEmail = userRecord.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password
    });

    if (error) {
      console.error('登录失败:', error);
      return NextResponse.json(
        { message: '登录失败，请检查您的用户名和密码' },
        { status: 401 }
      );
    }

    // 获取用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { message: '获取用户信息失败' },
        { status: 500 }
      );
    }

    // 记录登录操作
    await logOperation(
      data.user.id,
      userData.email || username,
      OperationType.LOGIN,
      `用户 ${userData.name} 登录了系统`
    );

    return NextResponse.json(
      { message: '登录成功', user: userData },
      { status: 200 }
    );
  } catch (error) {
    console.error('登录过程中出错:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
