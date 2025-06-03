import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserRole, Attachment, ActivityLink, ActivityType } from '@/types';
import { attachmentCache } from '@/lib/attachmentCache';
import {
  canAddAttachments,
  canDeleteAttachments,
  canAddLinks,
  canDeleteLinks,
  shouldShowAttachmentButton
} from '@/lib/permissions';
import AttachmentViewer from './AttachmentViewer';
import AttachmentUploader from './AttachmentUploader';
import LinkManager from './LinkManager';

interface AttachmentAndLinkViewerProps {
  activityId: string;
  userId: string;
  userRole: UserRole;
  onClose: () => void;
}

// 活动类型中文名称映射
const activityTypeNames: Record<ActivityType, string> = {
  [ActivityType.QHRC_CENTER]: 'QHRC中心',
  [ActivityType.SI_CENTER]: '智能传感器与影像实验室',
  [ActivityType.DI_CENTER]: '智能设计与创新实验室',
  [ActivityType.MH_CENTER]: '智慧医疗与健康实验室',
};

// 活动类型颜色映射
const activityTypeColors: Record<ActivityType, string> = {
  [ActivityType.QHRC_CENTER]: 'bg-red-100 text-red-800',
  [ActivityType.SI_CENTER]: 'bg-blue-100 text-blue-800',
  [ActivityType.DI_CENTER]: 'bg-green-100 text-green-800',
  [ActivityType.MH_CENTER]: 'bg-purple-100 text-purple-800',
};

interface ActivityInfo {
  description: string;
  type: ActivityType;
  date: string;
}

const AttachmentAndLinkViewer: React.FC<AttachmentAndLinkViewerProps> = ({
  activityId,
  userId,
  userRole,
  onClose
}) => {
  const [links, setLinks] = useState<ActivityLink[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activityInfo, setActivityInfo] = useState<ActivityInfo | null>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  // 获取活动信息
  const fetchActivityInfo = useCallback(async () => {
    try {
      setIsLoadingActivity(true);

      const response = await fetch('/api/statistics/activities');
      if (!response.ok) {
        throw new Error('获取活动信息失败');
      }

      const data = await response.json();
      const activity = data.activities.find((act: any) => act.activityId === activityId);

      if (activity) {
        setActivityInfo({
          description: activity.description,
          type: activity.type as ActivityType,
          date: activity.date
        });
      }
    } catch (error) {
      console.error('获取活动信息失败:', error);
      setActivityInfo(null);
    } finally {
      setIsLoadingActivity(false);
    }
  }, [activityId]);

  // 获取链接列表
  const fetchLinks = useCallback(async () => {
    try {
      setIsLoadingLinks(true);

      // 先尝试从缓存获取
      const cachedLinks = attachmentCache.getLinks(activityId, userId);
      if (cachedLinks) {
        setLinks(cachedLinks);
        setIsLoadingLinks(false);
        return;
      }

      const response = await fetch(`/api/links?activityId=${activityId}&userId=${userId}`);
      if (!response.ok) {
        throw new Error('获取链接列表失败');
      }

      const data = await response.json();
      const linkList = data.links || [];

      setLinks(linkList);
      attachmentCache.setLinks(activityId, userId, linkList);
    } catch (error) {
      console.error('获取链接列表失败:', error);
      setLinks([]);
    } finally {
      setIsLoadingLinks(false);
    }
  }, [activityId, userId]);

  // 获取附件列表
  const fetchAttachments = useCallback(async () => {
    try {
      setIsLoadingAttachments(true);

      // 先尝试从缓存获取
      const cachedAttachments = attachmentCache.get(activityId, userId);
      if (cachedAttachments) {
        setAttachments(cachedAttachments);
        setIsLoadingAttachments(false);
        return;
      }

      const response = await fetch(`/api/attachments?activityId=${activityId}&userId=${userId}`);
      if (!response.ok) {
        throw new Error('获取附件列表失败');
      }

      const data = await response.json();
      const attachmentList = data.attachments || [];

      setAttachments(attachmentList);
      attachmentCache.set(activityId, userId, attachmentList);
    } catch (error) {
      console.error('获取附件列表失败:', error);
      setAttachments([]);
    } finally {
      setIsLoadingAttachments(false);
    }
  }, [activityId, userId]);

  // 添加链接
  const handleAddLink = useCallback(async (linkData: { title: string; url: string; description?: string }) => {
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId,
          userId,
          ...linkData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '添加链接失败');
      }

      const data = await response.json();
      const newLink = data.link;

      setLinks(prev => [...prev, newLink]);
      attachmentCache.addLink(activityId, userId, newLink);
    } catch (error) {
      console.error('添加链接失败:', error);
      throw error;
    }
  }, [activityId, userId]);

  // 编辑链接
  const handleEditLink = useCallback(async (linkId: string, linkData: { title: string; url: string; description?: string }) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新链接失败');
      }

      const data = await response.json();
      const updatedLink = data.link;

      setLinks(prev => prev.map(link => link.id === linkId ? updatedLink : link));
      attachmentCache.updateLink(activityId, userId, updatedLink);
    } catch (error) {
      console.error('更新链接失败:', error);
      throw error;
    }
  }, [activityId, userId]);

  // 删除链接
  const handleDeleteLink = useCallback(async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '删除链接失败');
      }

      setLinks(prev => prev.filter(link => link.id !== linkId));
      attachmentCache.removeLink(activityId, userId, linkId);
    } catch (error) {
      console.error('删除链接失败:', error);
      throw error;
    }
  }, [activityId, userId]);

  // 处理附件上传成功
  const handleUploadSuccess = useCallback((newAttachment: Attachment) => {
    setAttachments(prev => {
      // 检查是否已存在相同ID的附件，避免重复添加
      const exists = prev.some(att => att.id === newAttachment.id);
      if (exists) {
        return prev;
      }

      const updated = [newAttachment, ...prev]; // 新附件放在前面

      // 更新缓存
      attachmentCache.set(activityId, userId, updated);

      return updated;
    });
  }, [activityId, userId]);



  useEffect(() => {
    fetchActivityInfo();
    fetchLinks();
    fetchAttachments();
  }, [fetchActivityInfo, fetchLinks, fetchAttachments]);

  const hasContent = links.length > 0 || attachments.length > 0;
  const canAddAttachment = canAddAttachments(userRole);
  const canAddLink = canAddLinks(userRole);
  const isLoading = isLoadingLinks || isLoadingAttachments || isLoadingActivity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              附件和链接
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              type="button"
              title="关闭"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* 活动信息 */}
          {activityInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activityTypeColors[activityInfo.type]}`}>
                  {activityTypeNames[activityInfo.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {activityInfo.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    活动日期：{new Date(activityInfo.date).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 链接区域 */}
              {(links.length > 0 || canAddLink) && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">外部链接</h4>
                  <LinkManager
                    links={links}
                    userRole={userRole}
                    onAddLink={handleAddLink}
                    onEditLink={handleEditLink}
                    onDeleteLink={handleDeleteLink}
                  />
                </div>
              )}

              {/* 附件区域 */}
              {(attachments.length > 0 || canAddAttachment) && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">文件附件</h4>

                  {/* 上传组件 - 只有管理员和超级管理员可见 */}
                  {canAddAttachment && (
                    <AttachmentUploader
                      activityId={activityId}
                      userId={userId}
                      userRole={userRole}
                      onUploadSuccess={handleUploadSuccess}
                    />
                  )}

                  {/* 附件列表 */}
                  <AttachmentViewer
                    isOpen={true}
                    activityId={activityId}
                    userId={userId}
                    userRole={userRole}
                    attachments={attachments}
                    onAttachmentsChange={setAttachments}
                  />
                </div>
              )}

              {/* 当没有内容且不能添加时显示提示 */}
              {!hasContent && !canAddAttachment && !canAddLink && (
                <div className="text-center py-8 text-gray-500">
                  暂无附件和链接
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentAndLinkViewer;
