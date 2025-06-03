import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { UserRole } from '@/types';

// 获取所有历史活动记录（仅超级管理员可用）
export async function GET() {
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
        { message: '只有超级管理员可以查看所有活动记录' },
        { status: 403 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 获取所有用户的日历数据
    const { data: allCalendarData, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取日历数据失败:', error);
      return NextResponse.json(
        { message: '获取日历数据失败' },
        { status: 500 }
      );
    }

    // 收集所有活动
    const allActivities: Array<{
      date: string;
      description: string;
      type: string;
      userId: string;
      activityId: string;
    }> = [];

    allCalendarData?.forEach(calendarRecord => {
      const events = calendarRecord.events || {};
      
      Object.keys(events).forEach(dateStr => {
        const dayData = events[dateStr];
        if (dayData && dayData.activities) {
          dayData.activities.forEach((activity: any) => {
            allActivities.push({
              date: dateStr,
              description: activity.description,
              type: activity.type,
              userId: calendarRecord.user_id,
              activityId: activity.id
            });
          });
        }
      });
    });

    // 按日期排序
    allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      activities: allActivities,
      total: allActivities.length
    });

  } catch (error) {
    console.error('获取所有活动记录时出错:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
