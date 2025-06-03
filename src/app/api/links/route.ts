import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { UserRole } from '@/types';

// 创建链接
export async function POST(request: NextRequest) {
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
        { message: '权限不足，只有管理员可以添加链接' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { activityId, userId, title, url, description } = body;

    if (!activityId || !userId || !title || !url) {
      return NextResponse.json(
        { message: '缺少必要参数' },
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

    // 获取当前最大的显示顺序
    const { data: maxOrderData } = await supabase
      .from('activity_links')
      .select('display_order')
      .eq('activity_id', activityId)
      .eq('user_id', userId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = maxOrderData && maxOrderData.length > 0
      ? (maxOrderData[0].display_order || 0) + 1
      : 1;

    const linkData = {
      activity_id: activityId,
      user_id: userId,
      title,
      url,
      description: description || null,
      display_order: nextOrder,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from('activity_links')
      .insert(linkData)
      .select()
      .single();

    if (error) {
      console.error('保存链接信息失败:', error);
      return NextResponse.json(
        { message: '保存链接信息失败' },
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
      message: '链接添加成功',
      link
    });

  } catch (error) {
    console.error('添加链接失败:', error);
    return NextResponse.json(
      { message: '添加链接失败' },
      { status: 500 }
    );
  }
}

// 获取链接列表
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');
    const userId = searchParams.get('userId');

    if (!activityId || !userId) {
      return NextResponse.json(
        { message: '缺少必要参数' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 获取链接列表
    const { data, error } = await supabase
      .from('activity_links')
      .select('*')
      .eq('activity_id', activityId)
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('获取链接列表失败:', error);
      return NextResponse.json(
        { message: '获取链接列表失败' },
        { status: 500 }
      );
    }

    // 转换数据库字段名为前端期望的驼峰格式
    const links = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      description: item.description,
      displayOrder: item.display_order,
      createdAt: item.created_at,
      createdBy: item.created_by
    }));

    return NextResponse.json({
      links
    });

  } catch (error) {
    console.error('获取链接列表失败:', error);
    return NextResponse.json(
      { message: '获取链接列表失败' },
      { status: 500 }
    );
  }
}
