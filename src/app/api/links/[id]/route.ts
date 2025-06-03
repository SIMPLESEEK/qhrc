import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { UserRole } from '@/types';

// 删除链接
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取当前用户
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 检查是否为超级管理员
    if (user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '权限不足，只有超级管理员可以删除链接' },
        { status: 403 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();
    const { id } = await params;

    // 获取链接信息
    const { data: link, error: fetchError } = await supabase
      .from('activity_links')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !link) {
      return NextResponse.json(
        { message: '链接不存在' },
        { status: 404 }
      );
    }

    // 删除链接
    const { error: deleteError } = await supabase
      .from('activity_links')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('删除链接失败:', deleteError);
      return NextResponse.json(
        { message: '删除链接失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '链接删除成功'
    });

  } catch (error) {
    console.error('删除链接失败:', error);
    return NextResponse.json(
      { message: '删除链接失败' },
      { status: 500 }
    );
  }
}

// 更新链接
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取当前用户
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 检查是否为管理员
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '权限不足，只有管理员可以编辑链接' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, url, description } = body;

    if (!title || !url) {
      return NextResponse.json(
        { message: '标题和URL不能为空' },
        { status: 400 }
      );
    }

    // 验证URL格式
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { message: '无效的URL格式' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();
    const { id } = await params;

    // 更新链接
    const { data, error } = await supabase
      .from('activity_links')
      .update({
        title,
        url,
        description: description || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新链接失败:', error);
      return NextResponse.json(
        { message: '更新链接失败' },
        { status: 500 }
      );
    }

    // 转换数据库字段名为前端期望的驼峰格式
    const link = {
      id: data.id,
      title: data.title,
      url: data.url,
      description: data.description,
      displayOrder: data.display_order,
      createdAt: data.created_at,
      createdBy: data.created_by
    };

    return NextResponse.json({
      message: '链接更新成功',
      link
    });

  } catch (error) {
    console.error('更新链接失败:', error);
    return NextResponse.json(
      { message: '更新链接失败' },
      { status: 500 }
    );
  }
}
