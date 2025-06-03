'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from '@/lib/axios';
import { canManageUsers, canViewOperationLogs } from '@/lib/permissions';

interface NavigationProps {
  user: User;
}

export default function Navigation({ user }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const handleStatistics = () => {
    window.open('/statistics', '_blank');
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="text-white shadow-md" style={{ backgroundColor: 'rgb(158, 31, 56)' }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link href="/calendar" className="text-xl font-bold">
              QHRC日历系统
            </Link>
          </div>

          {/* 桌面导航 */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/calendar"
              className={`px-3 py-2 rounded hover:bg-blue-600 ${isActive('/calendar') ? 'bg-blue-500' : ''}`}
            >
              日历
            </Link>

            <Link
              href="/user-management"
              className={`px-3 py-2 rounded hover:bg-blue-600 ${isActive('/user-management') ? 'bg-blue-500' : ''}`}
            >
              用户管理
            </Link>

            {canViewOperationLogs(user.role) && (
              <Link
                href="/admin/operations"
                className={`px-3 py-2 rounded hover:bg-blue-600 ${isActive('/admin/operations') ? 'bg-blue-500' : ''}`}
              >
                操作记录
              </Link>
            )}

            <button
              type="button"
              onClick={handleStatistics}
              className="px-3 py-2 rounded hover:bg-blue-600"
            >
              统计
            </button>

            <div className="border-l border-gray-400 h-6 mx-2"></div>

            <div className="flex items-center">
              <span className="mr-2">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 rounded bg-blue-500 hover:bg-blue-600"
              >
                登出
              </button>
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded hover:bg-blue-600"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <div className="md:hidden py-2 space-y-2">
            <Link
              href="/calendar"
              className={`block px-3 py-2 rounded hover:bg-blue-600 ${isActive('/calendar') ? 'bg-blue-500' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              日历
            </Link>

            <Link
              href="/user-management"
              className={`block px-3 py-2 rounded hover:bg-blue-600 ${isActive('/user-management') ? 'bg-blue-500' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              用户管理
            </Link>

            {canViewOperationLogs(user.role) && (
              <Link
                href="/admin/operations"
                className={`block px-3 py-2 rounded hover:bg-blue-600 ${isActive('/admin/operations') ? 'bg-blue-500' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                操作记录
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                handleStatistics();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded hover:bg-blue-600"
            >
              统计
            </button>

            <div className="border-t border-gray-400 my-2"></div>

            <div className="px-3 py-2">
              <span className="block mb-2">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-3 py-2 rounded bg-blue-500 hover:bg-blue-600 text-center"
              >
                登出
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
