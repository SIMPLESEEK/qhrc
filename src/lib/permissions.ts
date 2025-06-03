import { UserRole } from '@/types';

// 基础权限检查
export function hasManagementAccess(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
}

export function hasSuperAdminAccess(userRole: UserRole): boolean {
  return userRole === UserRole.SUPER_ADMIN;
}

// 工作计划权限
export function canViewWorkPlans(userRole: UserRole): boolean {
  return hasManagementAccess(userRole); // 普通用户看不到工作计划
}

export function canAddWorkPlan(userRole: UserRole): boolean {
  return hasManagementAccess(userRole); // 超级管理员和管理员可以添加
}

export function canDeleteWorkPlan(userRole: UserRole): boolean {
  return hasSuperAdminAccess(userRole); // 只有超级管理员可以删除
}

// 附件和链接权限
export function canViewAttachments(userRole: UserRole): boolean {
  return true; // 所有用户都可以查看附件
}

export function canAddAttachments(userRole: UserRole): boolean {
  return hasManagementAccess(userRole); // 超级管理员和管理员可以添加
}

export function canDeleteAttachments(userRole: UserRole): boolean {
  return hasSuperAdminAccess(userRole); // 只有超级管理员可以删除
}

export function canAddLinks(userRole: UserRole): boolean {
  return hasManagementAccess(userRole); // 超级管理员和管理员可以添加
}

export function canDeleteLinks(userRole: UserRole): boolean {
  return hasSuperAdminAccess(userRole); // 只有超级管理员可以删除
}

// 附件按钮显示权限
export function shouldShowAttachmentButton(userRole: UserRole, hasAttachments: boolean): boolean {
  if (hasManagementAccess(userRole)) {
    return true; // 管理员和超级管理员总是显示附件按钮
  }
  return hasAttachments; // 普通用户只有在有附件时才显示按钮
}

// 用户管理权限
export function canManageUsers(userRole: UserRole): boolean {
  return hasSuperAdminAccess(userRole); // 只有超级管理员可以管理用户
}

// 操作记录权限
export function canViewOperationLogs(userRole: UserRole): boolean {
  return hasSuperAdminAccess(userRole); // 只有超级管理员可以查看
}

// 日历事件权限
export function canAddEvents(userRole: UserRole): boolean {
  return hasManagementAccess(userRole); // 只有管理员和超级管理员可以添加事件
}

export function canDeleteEvents(userRole: UserRole): boolean {
  return hasSuperAdminAccess(userRole); // 只有超级管理员可以删除事件
}

export function canViewEvents(userRole: UserRole): boolean {
  return true; // 所有用户都可以查看事件
}

// 自定义节假日权限
export function canAddCustomHolidays(userRole: UserRole): boolean {
  return hasManagementAccess(userRole); // 超级管理员和管理员可以添加
}

export function canDeleteCustomHolidays(userRole: UserRole): boolean {
  return hasSuperAdminAccess(userRole); // 只有超级管理员可以删除
}

export function canViewCustomHolidays(userRole: UserRole): boolean {
  return true; // 所有用户都可以查看自定义节假日
}

// 兼容性函数（保持向后兼容）
export function canManageAttachments(userRole: UserRole): boolean {
  return canAddAttachments(userRole);
}

export function canManageLinks(userRole: UserRole): boolean {
  return canAddLinks(userRole);
}
