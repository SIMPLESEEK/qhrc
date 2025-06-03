import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { WorkPlanType, UserRole } from '@/types';
import { startOfWeek, endOfWeek } from 'date-fns';

// 获取工作计划列表
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as WorkPlanType;
    const weekStartParam = searchParams.get('weekStart');

    const supabase = await createSupabaseServerClientWithCookies();

    let query = supabase
      .from('work_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    // 如果指定了周期，按周期过滤
    if (weekStartParam) {
      const weekStart = new Date(weekStartParam);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      // 过滤在指定周期内创建的工作计划
      query = query
        .gte('created_at', startOfWeek(weekStart, { weekStartsOn: 1 }).toISOString())
        .lte('created_at', weekEnd.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取工作计划失败:', error);
      return NextResponse.json(
        { message: '获取工作计划失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workPlans: data || []
    });

  } catch (error) {
    console.error('获取工作计划失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 创建工作计划（管理员和超级管理员可用）
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 检查权限：管理员和超级管理员可以添加
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '只有管理员可以添加工作计划' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, title, description, priority, dueDate, assignedTo } = body;

    if (!type || !title) {
      return NextResponse.json(
        { message: '类型和标题为必填项' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    const workPlanData = {
      type,
      title,
      description: description || null,
      priority: priority || 'medium',
      status: 'pending',
      due_date: dueDate || null,
      assigned_to: assignedTo || null,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from('work_plans')
      .insert(workPlanData)
      .select()
      .single();

    if (error) {
      console.error('创建工作计划失败:', error);
      return NextResponse.json(
        { message: '创建工作计划失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workPlan: data
    });

  } catch (error) {
    console.error('创建工作计划失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}
