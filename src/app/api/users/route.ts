import { NextResponse } from 'next/server';
import { createSupabaseServerClientWithCookies, createSupabaseAdminClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { UserRole, OperationType } from '@/types';
import { logOperation } from '@/lib/operations';

// 获取所有用户（仅管理员可用）
export async function GET() {
  try {
    // 获取当前用户
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 检查是否为超级管理员
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '只有超级管理员可以查看用户列表' },
        { status: 403 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 获取所有用户
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取用户列表失败:', error);
      return NextResponse.json(
        { message: '获取用户列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('获取用户列表时出错:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 创建新用户（仅管理员可用）
export async function POST(request: Request) {
  try {
    // 获取当前用户
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 检查是否为超级管理员
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '只有超级管理员可以创建用户' },
        { status: 403 }
      );
    }

    const { email, username, password, name, role } = await request.json();

    if (!email || !username || !password || !name || !role) {
      return NextResponse.json(
        { message: '请提供所有必填字段' },
        { status: 400 }
      );
    }

    const adminSupabase = createSupabaseAdminClient();
    const supabase = await createSupabaseServerClientWithCookies();

    // 创建认证用户
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error('创建认证用户失败:', authError);
      return NextResponse.json(
        { message: authError?.message || '创建用户失败' },
        { status: 500 }
      );
    }

    // 创建用户记录
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          username,
          name,
          role,
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error('创建用户记录失败:', userError);
      return NextResponse.json(
        { message: userError.message },
        { status: 500 }
      );
    }

    // 记录操作
    await logOperation(
      currentUser.id,
      currentUser.email,
      OperationType.CREATE_USER,
      `管理员 ${currentUser.name} 创建了用户 ${name} (${username})`
    );

    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error('创建用户时出错:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
