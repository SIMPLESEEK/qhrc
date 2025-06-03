'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import axios from '@/lib/axios';

interface UserManagementProps {
  adminId: string;
}

export default function UserManagement({ adminId }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 新用户表单状态
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: UserRole.USER
  });

  // 编辑用户状态
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: UserRole.USER
  });

  // 重置密码状态
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // 加载用户列表
  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error('获取用户列表失败:', err);
      setError('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadUsers();
  }, []);

  // 添加用户
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('/api/users', newUser);
      setUsers(prev => [response.data, ...prev]);
      setShowAddForm(false);
      setNewUser({
        name: '',
        username: '',
        email: '',
        password: '',
        role: UserRole.USER
      });
    } catch (err: any) {
      console.error('添加用户失败:', err);
      setError(err.response?.data?.message || '添加用户失败');
    }
  };

  // 开始编辑用户
  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      role: user.role
    });
  };

  // 更新用户
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    setError(null);

    try {
      const response = await axios.patch(`/api/users/${editingUser.id}`, editForm);
      setUsers(prev => prev.map(user => user.id === editingUser.id ? response.data : user));
      setEditingUser(null);
    } catch (err: any) {
      console.error('更新用户失败:', err);
      setError(err.response?.data?.message || '更新用户失败');
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除此用户吗？此操作不可撤销。')) {
      return;
    }

    setError(null);

    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('删除用户失败:', err);
      setError(err.response?.data?.message || '删除用户失败');
    }
  };

  // 重置用户密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetPasswordUser || !newPassword) return;

    if (newPassword.length < 6) {
      setError('新密码长度至少为6位');
      return;
    }

    setError(null);

    try {
      await axios.post(`/api/admin/users/${resetPasswordUser.id}/reset-password`, {
        newPassword
      });

      setResetPasswordUser(null);
      setNewPassword('');
      alert(`用户 ${resetPasswordUser.name} 的密码已重置成功`);
    } catch (err: any) {
      console.error('重置密码失败:', err);
      setError(err.response?.data?.message || '重置密码失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">错误!</strong>
          <span className="block sm:inline"> {error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>关闭</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showAddForm ? '取消' : '添加用户'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">添加新用户</h3>
          <form onSubmit={handleAddUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={UserRole.USER}>普通用户</option>
                  <option value={UserRole.ADMIN}>管理员</option>
                  <option value={UserRole.SUPER_ADMIN}>超级管理员</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                添加用户
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">姓名</th>
              <th className="py-2 px-4 border-b text-left">邮箱</th>
              <th className="py-2 px-4 border-b text-left">角色</th>
              <th className="py-2 px-4 border-b text-left">创建时间</th>
              <th className="py-2 px-4 border-b text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                {editingUser?.id === user.id ? (
                  <td colSpan={5} className="py-2 px-4 border-b">
                    <form onSubmit={handleUpdateUser} className="flex flex-wrap items-end gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                          className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={UserRole.USER}>普通用户</option>
                          <option value={UserRole.ADMIN}>管理员</option>
                          <option value={UserRole.SUPER_ADMIN}>超级管理员</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="bg-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-400"
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="py-2 px-4 border-b">{user.name}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === UserRole.SUPER_ADMIN
                          ? 'bg-red-100 text-red-800'
                          : user.role === UserRole.ADMIN
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === UserRole.SUPER_ADMIN
                          ? '超级管理员'
                          : user.role === UserRole.ADMIN
                            ? '管理员'
                            : '普通用户'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(user.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(user)}
                          className="text-blue-500 hover:text-blue-700"
                          disabled={user.id === adminId}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => setResetPasswordUser(user)}
                          className="text-orange-500 hover:text-orange-700"
                          disabled={user.id === adminId}
                        >
                          重置密码
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={user.id === adminId}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                  暂无用户数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 重置密码模态框 */}
      {resetPasswordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              重置用户密码 - {resetPasswordUser.name}
            </h3>

            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                  placeholder="请输入新密码（至少6位）"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordUser(null);
                    setNewPassword('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  重置密码
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
