import React, { useState, useCallback } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { UserRole, ActivityLink } from '@/types';
import { hasManagementAccess } from '@/lib/permissions';
import LinkItem from './LinkItem';

interface LinkManagerProps {
  links: ActivityLink[];
  userRole: UserRole;
  onAddLink: (linkData: { title: string; url: string; description?: string }) => Promise<void>;
  onEditLink: (linkId: string, linkData: { title: string; url: string; description?: string }) => Promise<void>;
  onDeleteLink: (linkId: string) => Promise<void>;
}

interface LinkFormData {
  title: string;
  url: string;
  description: string;
}

const LinkManager: React.FC<LinkManagerProps> = ({
  links,
  userRole,
  onAddLink,
  onEditLink,
  onDeleteLink
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<ActivityLink | null>(null);
  const [formData, setFormData] = useState<LinkFormData>({
    title: '',
    url: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({ title: '', url: '', description: '' });
    setShowForm(false);
    setEditingLink(null);
  }, []);

  const handleAddClick = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const handleEditClick = useCallback((link: ActivityLink) => {
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || ''
    });
    setEditingLink(link);
    setShowForm(true);
  }, []);

  const handleDeleteClick = useCallback(async (linkId: string) => {
    if (!confirm('确定要删除这个链接吗？')) return;

    try {
      await onDeleteLink(linkId);
    } catch (error) {
      console.error('删除链接失败:', error);
    }
  }, [onDeleteLink]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.url.trim()) {
      alert('标题和URL不能为空');
      return;
    }

    // 简单的URL验证
    try {
      new URL(formData.url);
    } catch {
      alert('请输入有效的URL');
      return;
    }

    setIsSubmitting(true);

    try {
      const linkData = {
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim() || undefined
      };

      if (editingLink) {
        await onEditLink(editingLink.id, linkData);
      } else {
        await onAddLink(linkData);
      }

      resetForm();
    } catch (error) {
      console.error('保存链接失败:', error);
      alert('保存链接失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingLink, onAddLink, onEditLink, resetForm]);

  const handleInputChange = useCallback((field: keyof LinkFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="space-y-4">
      {/* 添加链接按钮 */}
      {hasManagementAccess(userRole) && !showForm && (
        <div className="flex justify-end">
          <button
            onClick={handleAddClick}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            type="button"
          >
            <PlusIcon className="h-4 w-4" />
            <span>添加链接</span>
          </button>
        </div>
      )}

      {/* 链接表单 */}
      {showForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              {editingLink ? '编辑链接' : '添加链接'}
            </h4>
            <button
              onClick={resetForm}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              type="button"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                链接标题 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入链接标题"
                required
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                链接地址 *
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                链接描述
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入链接描述（可选）"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? '保存中...' : (editingLink ? '更新' : '添加')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 链接列表 */}
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link) => (
            <LinkItem
              key={link.id}
              link={link}
              userRole={userRole}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkManager;
