import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const SHARED_CALENDAR_ID = 'shared-calendar';

// 获取工作计划数据用于统计
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: '请提供开始日期和结束日期' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 从work_plans表获取工作计划数据
    const { data: workPlansData, error } = await supabase
      .from('work_plans')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59.999Z')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取工作计划数据失败:', error);
      return NextResponse.json(
        { message: '获取工作计划数据失败' },
        { status: 500 }
      );
    }

    // 获取周期信息的辅助函数
    const getWeekRange = (date: Date) => {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // 周一开始
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // 周日结束

      const startStr = format(weekStart, 'yyyy年M月d日', { locale: zhCN });
      const endStr = format(weekEnd, 'M月d日', { locale: zhCN });

      return `${startStr}-${endStr}`;
    };

    // 转换数据格式
    const allWorkPlans: Array<{
      weekRange: string;
      type: 'weekly' | 'upcoming' | 'last_week_summary';
      content: string;
      createdAt: string;
    }> = [];

    if (workPlansData && workPlansData.length > 0) {
      workPlansData.forEach((plan: any) => {
        const createdDate = new Date(plan.created_at);
        const weekRange = getWeekRange(createdDate);

        allWorkPlans.push({
          weekRange,
          type: plan.type === 'weekly' ? 'weekly' :
                plan.type === 'last_week_summary' ? 'last_week_summary' : 'upcoming',
          content: plan.title + (plan.description ? ` - ${plan.description}` : ''),
          createdAt: createdDate.toISOString().split('T')[0]
        });
      });
    }

    // 按类型排序：上周工作总结 -> 本周工作计划 -> 近期工作计划
    const typeOrder = {
      'last_week_summary': 1,
      'weekly': 2,
      'upcoming': 3
    };

    allWorkPlans.sort((a, b) => {
      const orderA = typeOrder[a.type] || 4;
      const orderB = typeOrder[b.type] || 4;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // 同类型内按创建时间排序（最新的在前）
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      workPlans: allWorkPlans,
      total: allWorkPlans.length
    });

  } catch (error) {
    console.error('获取工作计划统计数据失败:', error);
    return NextResponse.json(
      { message: '获取工作计划统计数据失败' },
      { status: 500 }
    );
  }
}
