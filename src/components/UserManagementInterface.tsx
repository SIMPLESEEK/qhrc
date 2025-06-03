'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { canManageUsers } from '@/lib/permissions';
import SuperAdminUserManagement from './admin/UserManagement';
import UserPasswordChange from './UserPasswordChange';

interface UserManagementInterfaceProps {
  currentUser: User;
}

export default function UserManagementInterface({ currentUser }: UserManagementInterfaceProps) {
  // 如果是超级管理员，显示完整的用户管理界面
  if (canManageUsers(currentUser.role)) {
    return <SuperAdminUserManagement adminId={currentUser.id} />;
  }

  // 普通用户只能修改自己的密码
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">个人信息</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">姓名</label>
            <div className="mt-1 text-sm text-gray-900">{currentUser.name}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">用户名</label>
            <div className="mt-1 text-sm text-gray-900">{currentUser.username}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">角色</label>
            <div className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                currentUser.role === UserRole.SUPER_ADMIN 
                  ? 'bg-red-100 text-red-800' 
                  : currentUser.role === UserRole.ADMIN
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {currentUser.role === UserRole.SUPER_ADMIN 
                  ? '超级管理员' 
                  : currentUser.role === UserRole.ADMIN
                  ? '管理员'
                  : '普通用户'}
              </span>
            </div>
          </div>
        </div>

        <UserPasswordChange />
      </div>
    </div>
  );
}
