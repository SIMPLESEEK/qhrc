// 定义用户角色
export enum UserRole {
  SUPER_ADMIN = 'super_admin', // 超级管理员：可以添加和删除
  ADMIN = 'admin',             // 管理员：可以添加
  USER = 'user'                // 普通用户：只能查看
}

// 定义用户类型
export interface User {
  id: string;
  email: string; // 邮箱字段
  username: string; // 用户名字段，用于登录
  name: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

// 定义活动类型
export enum ActivityType {
  QHRC_CENTER = 'QHRC', // QHRC中心
  SI_CENTER = 'SI', // 智能传感器与影像实验室
  DI_CENTER = 'DI', // 智能设计与创新实验室
  MH_CENTER = 'MH', // 智慧医疗与健康实验室
}

// 定义附件类型
export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  cosUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

// 定义链接类型
export interface ActivityLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
  createdBy: string;
}

// 定义活动记录
export interface Activity {
  id: string;
  description: string;
  type: ActivityType;
  attachments?: Attachment[];
}

// 定义城市记录
export interface CityRecord {
  id: string;
  city: string;
  activities: Activity[];
}

// 定义日期数据
export interface DayData {
  date: Date;
  activities: Activity[]; // 直接存储活动数组，不再需要城市记录
}

// 定义日历状态
export interface CalendarState {
  view: 'year' | 'month' | 'week';
  selectedDate: Date;
  selectedYear: number;
  selectedMonth: number;
  events: Record<string, DayData>;
}

// 定义操作类型
export enum OperationType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  CREATE_EVENT = 'create_event',
  UPDATE_EVENT = 'update_event',
  DELETE_EVENT = 'delete_event'
}

// 定义操作记录
export interface OperationLog {
  id: string;
  user_id: string;
  user_email: string; // 用户邮箱，与数据库一致
  operation_type: OperationType;
  details: string;
  created_at: string;
}

// 定义数据库表名
export enum Tables {
  USERS = 'users',
  CALENDAR_EVENTS = 'calendar_events',
  OPERATION_LOGS = 'operation_logs',
  WORK_PLANS = 'work_plans'
}

// 定义工作计划类型
export enum WorkPlanType {
  LAST_WEEK_SUMMARY = 'last_week_summary', // 上周工作总结
  WEEKLY = 'weekly',    // 本周工作计划
  UPCOMING = 'upcoming' // 近期工作计划
}

// 定义工作计划项
export interface WorkPlanItem {
  id: string;
  type: WorkPlanType;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
