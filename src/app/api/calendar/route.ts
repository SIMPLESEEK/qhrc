import { NextResponse } from 'next/server';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { OperationType } from '@/types';
import { logOperation } from '@/lib/operations';
import { SHARED_CALENDAR_ID } from '@/lib/constants';
import { cache, CacheKeys } from '@/lib/cache';

// 获取共享日历数据
export async function GET() {
  try {
    // 获取当前用户（验证身份）
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    // 尝试从缓存获取数据
    const cacheKey = CacheKeys.calendarEvents(SHARED_CALENDAR_ID);
    const cachedEvents = cache.get(cacheKey);

    if (cachedEvents) {
      return NextResponse.json(cachedEvents, { status: 200 });
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 获取共享日历数据
    const { data, error } = await supabase
      .from('calendar_events')
      .select('events')
      .eq('user_id', SHARED_CALENDAR_ID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录，返回空对象
        const emptyEvents = {};
        cache.set(cacheKey, emptyEvents, 2 * 60 * 1000);
        return NextResponse.json(emptyEvents, { status: 200 });
      }

      console.error('获取共享日历数据失败:', error);
      return NextResponse.json(
        { message: '获取共享日历数据失败' },
        { status: 500 }
      );
    }

    const events = data?.events || {};
    // 缓存数据
    cache.set(cacheKey, events, 2 * 60 * 1000);

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('获取共享日历数据时出错:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 保存共享日历数据
export async function POST(request: Request) {
  try {
    // 获取当前用户
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const eventsData = await request.json();

    if (typeof eventsData !== 'object' || eventsData === null) {
      return NextResponse.json(
        { message: '无效的数据格式' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();

    // 保存到共享日历
    const { data: existingRecord } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('user_id', SHARED_CALENDAR_ID)
      .single();

    let error;
    if (existingRecord) {
      // 更新现有记录
      const updateResult = await supabase
        .from('calendar_events')
        .update({ events: eventsData })
        .eq('id', existingRecord.id);
      error = updateResult.error;
    } else {
      // 创建新记录
      const insertResult = await supabase
        .from('calendar_events')
        .insert([
          {
            user_id: SHARED_CALENDAR_ID,
            events: eventsData
          }
        ]);
      error = insertResult.error;
    }

    if (error) {
      console.error('保存共享日历数据失败:', error);
      return NextResponse.json(
        { message: '保存共享日历数据失败' },
        { status: 500 }
      );
    }

    // 清除缓存，确保数据一致性
    const cacheKey = CacheKeys.calendarEvents(SHARED_CALENDAR_ID);
    cache.delete(cacheKey);

    // 异步记录操作日志，不阻塞响应
    logOperation(
      user.id,
      user.email || user.username || 'unknown',
      OperationType.UPDATE_EVENT,
      `用户 ${user.name} 更新了共享日历数据`
    );

    return NextResponse.json(
      { message: '共享日历数据保存成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('保存共享日历数据时出错:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
