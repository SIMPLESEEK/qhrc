import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { UserRole } from '@/types';

// 更新工作计划（管理员和超级管理员可用）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 检查权限：管理员和超级管理员可以更新
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '只有管理员可以更新工作计划' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, priority, status, dueDate, assignedTo } = body;

    const supabase = await createSupabaseServerClientWithCookies();

    // 构建更新数据
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.due_date = dueDate;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('work_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新工作计划失败:', error);
      return NextResponse.json(
        { message: '更新工作计划失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workPlan: data
    });

  } catch (error) {
    console.error('更新工作计划失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 删除工作计划（仅超级管理员可用）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 检查权限：只有超级管理员可以删除
    if (user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '只有超级管理员可以删除工作计划' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = await createSupabaseServerClientWithCookies();

    const { error } = await supabase
      .from('work_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除工作计划失败:', error);
      return NextResponse.json(
        { message: '删除工作计划失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '工作计划删除成功'
    });

  } catch (error) {
    console.error('删除工作计划失败:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}
