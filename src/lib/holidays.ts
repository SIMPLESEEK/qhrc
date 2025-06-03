// 节假日管理系统
export interface Holiday {
  date: string; // YYYY-MM-DD格式
  name: string;
  type: 'mainland' | 'hongkong' | 'western' | 'traditional' | 'custom';
  isWorkday?: boolean; // 是否为调休工作日
  description?: string;
}

// 自定义节假日接口
export interface CustomHoliday extends Holiday {
  id: string;
  created_by: string;
  created_at: string;
}

// 2025年中国大陆节假日
const MAINLAND_HOLIDAYS_2025: Holiday[] = [
  // 元旦
  { date: '2025-01-01', name: '元旦', type: 'mainland' },

  // 春节
  { date: '2025-01-28', name: '春节除夕', type: 'mainland' },
  { date: '2025-01-29', name: '春节初一', type: 'mainland' },
  { date: '2025-01-30', name: '春节初二', type: 'mainland' },
  { date: '2025-01-31', name: '春节初三', type: 'mainland' },
  { date: '2025-02-01', name: '春节初四', type: 'mainland' },
  { date: '2025-02-02', name: '春节初五', type: 'mainland' },
  { date: '2025-02-03', name: '春节初六', type: 'mainland' },

  // 清明节
  { date: '2025-04-05', name: '清明节', type: 'mainland' },

  // 劳动节
  { date: '2025-05-01', name: '劳动节', type: 'mainland' },
  { date: '2025-05-02', name: '劳动节假期', type: 'mainland' },
  { date: '2025-05-03', name: '劳动节假期', type: 'mainland' },

  // 端午节
  { date: '2025-05-31', name: '端午节', type: 'mainland' },

  // 中秋节
  { date: '2025-10-06', name: '中秋节', type: 'mainland' },

  // 国庆节
  { date: '2025-10-01', name: '国庆节', type: 'mainland' },
  { date: '2025-10-02', name: '国庆假期', type: 'mainland' },
  { date: '2025-10-03', name: '国庆假期', type: 'mainland' },
  { date: '2025-10-04', name: '国庆假期', type: 'mainland' },
  { date: '2025-10-05', name: '国庆假期', type: 'mainland' },
  { date: '2025-10-07', name: '国庆假期', type: 'mainland' },
  { date: '2025-10-08', name: '国庆假期', type: 'mainland' },
];

// 2025年香港节假日
const HONGKONG_HOLIDAYS_2025: Holiday[] = [
  { date: '2025-01-01', name: '元旦', type: 'hongkong' },
  { date: '2025-01-29', name: '农历新年初一', type: 'hongkong' },
  { date: '2025-01-30', name: '农历新年初二', type: 'hongkong' },
  { date: '2025-01-31', name: '农历新年初三', type: 'hongkong' },
  { date: '2025-04-05', name: '清明节', type: 'hongkong' },
  { date: '2025-04-18', name: '耶稣受难节', type: 'hongkong' },
  { date: '2025-04-19', name: '耶稣受难节翌日', type: 'hongkong' },
  { date: '2025-04-21', name: '复活节星期一', type: 'hongkong' },
  { date: '2025-05-01', name: '劳动节', type: 'hongkong' },
  { date: '2025-05-13', name: '佛诞', type: 'hongkong' },
  { date: '2025-05-31', name: '端午节', type: 'hongkong' },
  { date: '2025-07-01', name: '香港特别行政区成立纪念日', type: 'hongkong' },
  { date: '2025-09-18', name: '中秋节翌日', type: 'hongkong' },
  { date: '2025-10-01', name: '国庆日', type: 'hongkong' },
  { date: '2025-10-07', name: '重阳节', type: 'hongkong' },
  { date: '2025-12-25', name: '圣诞节', type: 'hongkong' },
  { date: '2025-12-26', name: '节礼日', type: 'hongkong' },
];

// 西方节假日
const WESTERN_HOLIDAYS_2025: Holiday[] = [
  { date: '2025-01-01', name: 'New Year\'s Day', type: 'western' },
  { date: '2025-02-14', name: 'Valentine\'s Day', type: 'western' },
  { date: '2025-03-17', name: 'St. Patrick\'s Day', type: 'western' },
  { date: '2025-04-20', name: 'Easter Sunday', type: 'western' },
  { date: '2025-05-11', name: 'Mother\'s Day', type: 'western' },
  { date: '2025-06-15', name: 'Father\'s Day', type: 'western' },
  { date: '2025-07-04', name: 'Independence Day (US)', type: 'western' },
  { date: '2025-10-31', name: 'Halloween', type: 'western' },
  { date: '2025-11-27', name: 'Thanksgiving (US)', type: 'western' },
  { date: '2025-12-24', name: 'Christmas Eve', type: 'western' },
  { date: '2025-12-25', name: 'Christmas Day', type: 'western' },
  { date: '2025-12-31', name: 'New Year\'s Eve', type: 'western' },
];

// 传统节日（农历节日）
const TRADITIONAL_HOLIDAYS_2025: Holiday[] = [
  { date: '2025-02-12', name: '元宵节', type: 'traditional' },
  { date: '2025-08-29', name: '七夕节', type: 'traditional' },
  { date: '2025-09-17', name: '中秋节', type: 'traditional' },
  { date: '2025-10-07', name: '重阳节', type: 'traditional' },
  { date: '2025-12-22', name: '冬至', type: 'traditional' },
];

// 调休工作日
const WORKDAYS_2025: Holiday[] = [
  { date: '2025-01-26', name: '春节调休', type: 'mainland', isWorkday: true },
  { date: '2025-02-08', name: '春节调休', type: 'mainland', isWorkday: true },
  { date: '2025-04-27', name: '劳动节调休', type: 'mainland', isWorkday: true },
  { date: '2025-09-28', name: '国庆节调休', type: 'mainland', isWorkday: true },
  { date: '2025-10-11', name: '国庆节调休', type: 'mainland', isWorkday: true },
];

// 2026年节假日数据（预设）
const MAINLAND_HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-01', name: '元旦', type: 'mainland' },
  { date: '2026-02-17', name: '春节除夕', type: 'mainland' },
  { date: '2026-02-18', name: '春节初一', type: 'mainland' },
  { date: '2026-02-19', name: '春节初二', type: 'mainland' },
  { date: '2026-02-20', name: '春节初三', type: 'mainland' },
  { date: '2026-02-21', name: '春节初四', type: 'mainland' },
  { date: '2026-02-22', name: '春节初五', type: 'mainland' },
  { date: '2026-02-23', name: '春节初六', type: 'mainland' },
  { date: '2026-04-05', name: '清明节', type: 'mainland' },
  { date: '2026-05-01', name: '劳动节', type: 'mainland' },
  { date: '2026-05-02', name: '劳动节假期', type: 'mainland' },
  { date: '2026-05-03', name: '劳动节假期', type: 'mainland' },
  { date: '2026-06-20', name: '端午节', type: 'mainland' },
  { date: '2026-09-27', name: '中秋节', type: 'mainland' },
  { date: '2026-10-01', name: '国庆节', type: 'mainland' },
  { date: '2026-10-02', name: '国庆假期', type: 'mainland' },
  { date: '2026-10-03', name: '国庆假期', type: 'mainland' },
  { date: '2026-10-04', name: '国庆假期', type: 'mainland' },
  { date: '2026-10-05', name: '国庆假期', type: 'mainland' },
  { date: '2026-10-06', name: '国庆假期', type: 'mainland' },
  { date: '2026-10-07', name: '国庆假期', type: 'mainland' },
  { date: '2026-10-08', name: '国庆假期', type: 'mainland' },
];

// 按年份组织节假日数据
const HOLIDAYS_BY_YEAR: Record<number, Holiday[]> = {
  2025: [
    ...MAINLAND_HOLIDAYS_2025,
    ...HONGKONG_HOLIDAYS_2025,
    ...WESTERN_HOLIDAYS_2025,
    ...TRADITIONAL_HOLIDAYS_2025,
    ...WORKDAYS_2025,
  ],
  2026: [
    ...MAINLAND_HOLIDAYS_2026,
    // 2026年其他类型节假日可以后续添加
  ]
};

// 节假日数据生成器
class HolidayDataGenerator {
  // 生成基础西方节假日（每年固定日期）
  static generateWesternHolidays(year: number): Holiday[] {
    return [
      { date: `${year}-01-01`, name: 'New Year\'s Day', type: 'western' },
      { date: `${year}-02-14`, name: 'Valentine\'s Day', type: 'western' },
      { date: `${year}-03-17`, name: 'St. Patrick\'s Day', type: 'western' },
      { date: `${year}-07-04`, name: 'Independence Day (US)', type: 'western' },
      { date: `${year}-10-31`, name: 'Halloween', type: 'western' },
      { date: `${year}-12-24`, name: 'Christmas Eve', type: 'western' },
      { date: `${year}-12-25`, name: 'Christmas Day', type: 'western' },
      { date: `${year}-12-31`, name: 'New Year\'s Eve', type: 'western' },
    ];
  }

  // 获取指定年份的所有节假日
  static getHolidaysForYear(year: number): Holiday[] {
    const existingHolidays = HOLIDAYS_BY_YEAR[year] || [];

    // 如果没有预设数据，生成基础节假日
    if (existingHolidays.length === 0) {
      return [
        ...this.generateWesternHolidays(year),
        // 可以添加更多自动生成的节假日
      ];
    }

    return existingHolidays;
  }
}

// 节假日管理类
export class HolidayManager {
  private holidays: Map<string, Holiday[]> = new Map();
  private customHolidays: Map<string, CustomHoliday[]> = new Map();
  private loadedYears: Set<number> = new Set();
  private customHolidaysLoaded: boolean = false;

  constructor() {
    this.loadHolidaysForCurrentYear();
  }

  private loadHolidaysForCurrentYear() {
    const currentYear = new Date().getFullYear();
    this.loadHolidaysForYear(currentYear);

    // 预加载下一年的数据
    this.loadHolidaysForYear(currentYear + 1);
  }

  private loadHolidaysForYear(year: number) {
    if (this.loadedYears.has(year)) return;

    const yearHolidays = HolidayDataGenerator.getHolidaysForYear(year);

    // 按日期分组
    yearHolidays.forEach(holiday => {
      const existing = this.holidays.get(holiday.date) || [];
      existing.push(holiday);
      this.holidays.set(holiday.date, existing);
    });

    this.loadedYears.add(year);
  }

  // 确保指定年份的数据已加载
  private ensureYearLoaded(year: number) {
    if (!this.loadedYears.has(year)) {
      this.loadHolidaysForYear(year);
    }
  }

  // 从数据库加载自定义节假日
  async loadCustomHolidaysFromDB(forceReload: boolean = false): Promise<void> {
    if (this.customHolidaysLoaded && !forceReload) return;

    try {
      const response = await fetch('/api/holidays/custom');
      if (response.ok) {
        const data = await response.json();
        const customHolidays = data.holidays || [];

        // 清空现有的自定义节假日
        this.customHolidays.clear();

        // 重新加载到内存中
        customHolidays.forEach((holiday: CustomHoliday) => {
          const existing = this.customHolidays.get(holiday.date) || [];
          existing.push(holiday);
          this.customHolidays.set(holiday.date, existing);
        });

        this.customHolidaysLoaded = true;
      }
    } catch (error) {
      console.error('加载自定义节假日失败:', error);
    }
  }

  // 获取指定日期的节假日信息
  getHolidays(date: string): Holiday[] {
    const year = new Date(date).getFullYear();
    this.ensureYearLoaded(year);

    const systemHolidays = this.holidays.get(date) || [];
    const customHolidays = this.customHolidays.get(date) || [];

    return [...systemHolidays, ...customHolidays];
  }

  // 添加自定义节假日
  addCustomHoliday(holiday: Omit<CustomHoliday, 'id' | 'created_at'>): CustomHoliday {
    const customHoliday: CustomHoliday = {
      ...holiday,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      type: 'custom'
    };

    const existing = this.customHolidays.get(holiday.date) || [];
    existing.push(customHoliday);
    this.customHolidays.set(holiday.date, existing);

    return customHoliday;
  }

  // 删除自定义节假日
  removeCustomHoliday(date: string, holidayId: string): boolean {
    const existing = this.customHolidays.get(date) || [];
    const filtered = existing.filter(h => h.id !== holidayId);

    if (filtered.length !== existing.length) {
      if (filtered.length === 0) {
        this.customHolidays.delete(date);
      } else {
        this.customHolidays.set(date, filtered);
      }
      return true;
    }

    return false;
  }

  // 获取所有自定义节假日
  getCustomHolidays(): CustomHoliday[] {
    const allCustom: CustomHoliday[] = [];
    this.customHolidays.forEach(holidays => {
      allCustom.push(...holidays);
    });
    return allCustom.sort((a, b) => a.date.localeCompare(b.date));
  }

  // 检查是否为节假日
  isHoliday(date: string): boolean {
    const holidays = this.getHolidays(date);
    return holidays.some(h => !h.isWorkday);
  }

  // 检查是否为调休工作日
  isWorkday(date: string): boolean {
    const holidays = this.getHolidays(date);
    return holidays.some(h => h.isWorkday);
  }

  // 获取节假日类型
  getHolidayTypes(date: string): string[] {
    const holidays = this.getHolidays(date);
    return [...new Set(holidays.map(h => h.type))];
  }

  // 获取节假日名称
  getHolidayNames(date: string): string[] {
    const holidays = this.getHolidays(date);
    return holidays.filter(h => !h.isWorkday).map(h => h.name);
  }

  // 获取月份的所有节假日
  getMonthHolidays(year: number, month: number): Map<string, Holiday[]> {
    // 确保年份数据已加载
    this.ensureYearLoaded(year);

    const monthHolidays = new Map<string, Holiday[]>();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const holidays = this.getHolidays(dateStr);
      if (holidays.length > 0) {
        monthHolidays.set(dateStr, holidays);
      }
    }

    return monthHolidays;
  }
}

// 创建全局实例
export const holidayManager = new HolidayManager();

// 节假日颜色配置（简化为3种颜色）
export const HOLIDAY_COLORS = {
  mainland: '#ff4d4f',     // 红色 - 中国大陆节假日和传统节日
  hongkong: '#722ed1',     // 紫色 - 香港节假日和西方节假日
  western: '#722ed1',      // 紫色 - 西方节假日（与香港统一）
  traditional: '#ff4d4f',  // 红色 - 传统节日（与大陆统一）
  workday: '#52c41a',      // 绿色 - 调休工作日
  custom: '#fa8c16',       // 橙色 - 自定义节假日
};
