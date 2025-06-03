import { NextResponse } from 'next/server';
import { holidayManager } from '@/lib/holidays';

// 获取节假日信息
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || '0');
    const date = searchParams.get('date');

    // 如果指定了具体日期，返回该日期的节假日信息
    if (date) {
      const holidays = holidayManager.getHolidays(date);
      return NextResponse.json({
        date,
        holidays,
        isHoliday: holidayManager.isHoliday(date),
        isWorkday: holidayManager.isWorkday(date),
        types: holidayManager.getHolidayTypes(date),
        names: holidayManager.getHolidayNames(date)
      });
    }

    // 如果指定了月份，返回该月的所有节假日
    if (month > 0) {
      const monthHolidays = holidayManager.getMonthHolidays(year, month);
      const holidaysArray = Array.from(monthHolidays.entries()).map(([date, holidays]) => ({
        date,
        holidays,
        isHoliday: holidayManager.isHoliday(date),
        isWorkday: holidayManager.isWorkday(date),
        types: holidayManager.getHolidayTypes(date),
        names: holidayManager.getHolidayNames(date)
      }));

      return NextResponse.json({
        year,
        month,
        holidays: holidaysArray
      });
    }

    // 默认返回当前年份的所有节假日
    const allHolidays: any[] = [];
    for (let m = 1; m <= 12; m++) {
      const monthHolidays = holidayManager.getMonthHolidays(year, m);
      monthHolidays.forEach((holidays, date) => {
        allHolidays.push({
          date,
          holidays,
          isHoliday: holidayManager.isHoliday(date),
          isWorkday: holidayManager.isWorkday(date),
          types: holidayManager.getHolidayTypes(date),
          names: holidayManager.getHolidayNames(date)
        });
      });
    }

    return NextResponse.json({
      year,
      holidays: allHolidays
    });
  } catch (error) {
    console.error('获取节假日信息时出错:', error);
    return NextResponse.json(
      { message: '获取节假日信息失败' },
      { status: 500 }
    );
  }
}
