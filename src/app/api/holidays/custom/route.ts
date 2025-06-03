import { NextResponse } from 'next/server';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { holidayManager, CustomHoliday } from '@/lib/holidays';
import { UserRole, OperationType } from '@/types';
import { logOperation } from '@/lib/operations';

// 获取自定义节假日
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 从数据库获取自定义节假日
    const { data: customHolidays, error } = await supabase
      .from('custom_holidays')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      return NextResponse.json(
        { message: '获取自定义节假日失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      holidays: customHolidays || []
    });
  } catch (error) {
    return NextResponse.json(
      { message: '获取自定义节假日失败' },
      { status: 500 }
    );
  }
}

// 添加自定义节假日
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 只有管理员和超级管理员可以添加自定义节假日
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '只有管理员可以添加自定义节假日' },
        { status: 403 }
      );
    }

    const { date, name, description } = await request.json();

    if (!date || !name) {
      return NextResponse.json(
        { message: '日期和名称是必填项' },
        { status: 400 }
      );
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { message: '日期格式不正确，请使用 YYYY-MM-DD 格式' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 保存到数据库
    const { data: customHoliday, error } = await supabase
      .from('custom_holidays')
      .insert({
        date,
        name,
        description,
        created_by: user.id,
        type: 'custom'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: '添加自定义节假日失败' },
        { status: 500 }
      );
    }

    // 同时添加到内存管理器中（用于即时显示）
    holidayManager.addCustomHoliday({
      date,
      name,
      description,
      created_by: user.id,
      type: 'custom'
    });

    // 记录操作
    await logOperation(
      user.id,
      user.username,
      OperationType.CREATE_EVENT,
      `管理员 ${user.name} 添加了自定义节假日: ${name} (${date})`
    );

    return NextResponse.json({
      message: '自定义节假日添加成功',
      holiday: customHoliday
    });
  } catch (error) {
    console.error('添加自定义节假日失败:', error);
    return NextResponse.json(
      { message: '添加自定义节假日失败' },
      { status: 500 }
    );
  }
}

// 删除自定义节假日
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 只有超级管理员可以删除自定义节假日
    if (user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '只有超级管理员可以删除自定义节假日' },
        { status: 403 }
      );
    }

    const { date, holidayId } = await request.json();

    if (!date || !holidayId) {
      return NextResponse.json(
        { message: '日期和节假日ID是必填项' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 从数据库删除
    const { error } = await supabase
      .from('custom_holidays')
      .delete()
      .eq('id', holidayId);

    if (error) {
      console.error('数据库删除失败:', error);
      return NextResponse.json(
        { message: '删除自定义节假日失败' },
        { status: 500 }
      );
    }

    // 同时从内存管理器中删除
    holidayManager.removeCustomHoliday(date, holidayId);

    // 记录操作
    await logOperation(
      user.id,
      user.username,
      OperationType.DELETE_EVENT,
      `管理员 ${user.name} 删除了自定义节假日 (${date})`
    );

    return NextResponse.json({
      message: '自定义节假日删除成功'
    });
  } catch (error) {
    console.error('删除自定义节假日失败:', error);
    return NextResponse.json(
      { message: '删除自定义节假日失败' },
      { status: 500 }
    );
  }
}
