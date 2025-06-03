import { createSupabaseServerClient } from './supabase-server';
import { User, DayData, OperationType } from '@/types';
import { logOperation } from './operations';
import { SHARED_CALENDAR_ID } from './constants';
import { format } from 'date-fns';

// 获取共享日历数据（所有用户看到相同的数据）
export async function getSharedCalendarEvents(): Promise<Record<string, DayData>> {
  try {
    const supabase = await createSupabaseServerClient();

    // 获取全局共享的日历数据
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', SHARED_CALENDAR_ID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录，返回空对象
        return {};
      }
      console.error('获取共享日历数据失败:', error);
      return {};
    }

    // 处理日期数据（将字符串日期转换为Date对象）
    const events = data?.events || {};
    const processedEvents: Record<string, DayData> = {};

    Object.keys(events).forEach(dateKey => {
      const event = events[dateKey];

      // 创建基础的事件对象
      const processedEvent: DayData = {
        date: new Date(event.date),
        activities: []
      };

      // 处理新的数据结构（直接包含activities数组）
      if (event.activities && Array.isArray(event.activities)) {
        processedEvent.activities = event.activities;
      } else if (event.cityRecords && Array.isArray(event.cityRecords)) {
        // 兼容旧的数据结构（包含cityRecords），将所有活动合并到一个数组中
        const allActivities: any[] = [];
        event.cityRecords.forEach((record: any) => {
          if (record.activities && Array.isArray(record.activities)) {
            allActivities.push(...record.activities);
          }
        });
        processedEvent.activities = allActivities;
      }

      processedEvents[dateKey] = processedEvent;
    });

    return processedEvents;
  } catch (error) {
    console.error('获取日历数据时出错:', error);
    return {};
  }
}

// 保存共享日历数据
export async function saveSharedCalendarEvents(
  user: User,
  events: Record<string, DayData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();

    // 使用共享日历ID保存数据
    const { error } = await supabase
      .from('calendar_events')
      .upsert(
        {
          user_id: SHARED_CALENDAR_ID,
          events
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('保存共享日历数据失败:', error);
      return { success: false, error: error.message };
    }

    // 记录操作（仍然记录是哪个用户进行的操作）
    await logOperation(
      user.id,
      user.username,
      OperationType.UPDATE_EVENT,
      `用户 ${user.name} 更新了共享日历数据`
    );

    return { success: true };
  } catch (error) {
    console.error('保存共享日历数据时出错:', error);
    return { success: false, error: '保存共享日历数据时出错' };
  }
}






