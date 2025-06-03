import { NextResponse } from 'next/server';
import { createSupabaseServerClientWithCookies, createSupabaseAdminClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types';

// 获取单个用户（仅管理员可用）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取当前用户
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 检查是否为管理员或当前用户
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN && currentUser.id !== id) {
      return NextResponse.json(
        { message: '只有管理员或当前用户可以查看用户信息' },
        { status: 403 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 获取用户信息
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('获取用户信息失败:', error);
      return NextResponse.json(
        { message: '获取用户信息失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('获取用户信息时出错:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 更新用户（仅管理员可用）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取当前用户
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 检查是否为管理员
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '只有管理员可以更新用户' },
        { status: 403 }
      );
    }

    const { name, role } = await request.json();

    if (!name && !role) {
      return NextResponse.json(
        { message: '请提供至少一个要更新的字段' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const supabase = await createSupabaseServerClientWithCookies();

    // 更新用户记录
    const { data, error } = await supabase
      .from('users')
      .update({ name, role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新用户失败:', error);
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('更新用户时出错:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 删除用户（仅管理员可用）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取当前用户
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 检查是否为管理员
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '只有管理员可以删除用户' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = await createSupabaseServerClientWithCookies();

    // 获取用户信息（用于记录操作）
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', id)
      .single();

    if (userError) {
      console.error('获取用户信息失败:', userError);
      return NextResponse.json(
        { message: '获取用户信息失败' },
        { status: 500 }
      );
    }

    // 删除用户记录
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('删除用户记录失败:', deleteError);
      return NextResponse.json(
        { message: deleteError.message },
        { status: 500 }
      );
    }

    // 删除认证用户 - 需要使用管理员客户端
    const adminSupabase = createSupabaseAdminClient();
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(id);

    if (authError) {
      console.error('删除认证用户失败:', authError);
      return NextResponse.json(
        { message: authError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: '用户删除成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('删除用户时出错:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
