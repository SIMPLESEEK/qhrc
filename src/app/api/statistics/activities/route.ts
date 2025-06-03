import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { SHARED_CALENDAR_ID } from '@/lib/constants';

// 获取所有活动数据用于统计
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

    const supabase = await createSupabaseServerClientWithCookies();

    // 获取共享日历数据
    const { data: calendarData, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', SHARED_CALENDAR_ID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录，返回空数组
        return NextResponse.json({
          activities: [],
          total: 0
        });
      }
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
      activityId: string;
    }> = [];

    if (calendarData && calendarData.events) {
      const events = calendarData.events;
      
      Object.keys(events).forEach(dateStr => {
        const dayData = events[dateStr];
        if (dayData && dayData.activities) {
          dayData.activities.forEach((activity: any) => {
            allActivities.push({
              date: dateStr,
              description: activity.description,
              type: activity.type,
              activityId: activity.id
            });
          });
        }
      });
    }

    // 按日期排序（最新的在前）
    allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      activities: allActivities,
      total: allActivities.length
    });

  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { message: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
