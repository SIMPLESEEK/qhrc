'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { Attachment, UserRole } from '@/types';
import axios from '@/lib/axios';
import AttachmentItem from './AttachmentItem';
import { attachmentCache } from '@/lib/attachmentCache';

interface AttachmentViewerProps {
  isOpen?: boolean;
  onClose?: () => void;
  activityId: string;
  userId: string;
  userRole?: UserRole;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
}

export default function AttachmentViewer({
  isOpen = true,
  onClose,
  activityId,
  userId,
  userRole = UserRole.USER,
  attachments: propAttachments,
  onAttachmentsChange
}: AttachmentViewerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(propAttachments || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);

  // 当外部传入的附件列表变化时，更新内部状态
  useEffect(() => {
    if (propAttachments) {
      console.log('AttachmentViewer: 接收到新的propAttachments', propAttachments);
      setAttachments(propAttachments);
    }
  }, [propAttachments]);

  // 使用缓存的附件获取函数
  const fetchAttachments = useCallback(async (forceRefresh = false) => {
    if (!activityId || !userId || propAttachments) return;

    // 先尝试从缓存获取
    if (!forceRefresh) {
      const cachedAttachments = attachmentCache.get(activityId, userId);
      if (cachedAttachments) {
        setAttachments(cachedAttachments);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/attachments?activityId=${activityId}&userId=${userId}`);
      const fetchedAttachments = response.data.attachments || [];

      // 更新缓存
      attachmentCache.set(activityId, userId, fetchedAttachments);
      setAttachments(fetchedAttachments);

      // 如果有外部回调，通知父组件
      if (onAttachmentsChange) {
        onAttachmentsChange(fetchedAttachments);
      }
    } catch (error) {
      console.error('获取附件列表失败:', error);
      setError('获取附件列表失败');
    } finally {
      setLoading(false);
    }
  }, [activityId, userId, propAttachments, onAttachmentsChange]);

  useEffect(() => {
    if (isOpen && activityId && userId && !propAttachments) {
      fetchAttachments();
    }
  }, [isOpen, activityId, userId, propAttachments, fetchAttachments]);

  // 预览处理函数
  const handleImagePreview = useCallback((attachment: Attachment) => {
    setPreviewImage(attachment.cosUrl);
  }, []);

  const closeImagePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  const handleDocumentPreview = useCallback((attachment: Attachment) => {
    // 使用Microsoft Office Online Viewer
    const encodedUrl = encodeURIComponent(attachment.cosUrl);
    const previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
    setPreviewDocument(previewUrl);
  }, []);

  const closeDocumentPreview = useCallback(() => {
    setPreviewDocument(null);
  }, []);

  const handleDownload = useCallback((attachment: Attachment) => {
    if (!attachment.id) {
      console.error('附件ID不存在，无法下载');
      return;
    }

    // 使用专门的下载API，确保文件名正确
    const link = document.createElement('a');
    link.href = `/api/attachments/download/${attachment.id}`;
    link.download = attachment.originalName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 删除附件处理函数
  const handleDelete = useCallback(async (attachmentId: string) => {
    if (userRole !== UserRole.SUPER_ADMIN) {
      return;
    }

    try {
      const response = await axios.delete(`/api/attachments/${attachmentId}`);

      if (response.status === 200) {
        const updatedAttachments = attachments.filter(att => att.id !== attachmentId);
        setAttachments(updatedAttachments);

        // 更新缓存
        attachmentCache.removeAttachment(activityId, userId, attachmentId);

        // 通知父组件
        if (onAttachmentsChange) {
          onAttachmentsChange(updatedAttachments);
        }
      }
    } catch (error) {
      console.error('删除附件失败:', error);
      alert('删除附件失败，请重试');
    }
  }, [userRole, attachments, activityId, userId, onAttachmentsChange]);

  if (!isOpen) return null;

  // 如果没有onClose函数，说明是嵌入模式
  const isEmbedded = !onClose;

  const content = (
    <>
      {/* 头部 - 只在模态框模式显示 */}
      {!isEmbedded && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">附件列表</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            type="button"
            title="关闭"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* 内容 */}
      <div className={`${isEmbedded ? '' : 'p-4'} overflow-y-auto ${isEmbedded ? '' : 'max-h-[60vh]'}`}>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchAttachments(true)}
              className="mt-2 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
              type="button"
            >
              重试
            </button>
          </div>
        )}

        {!loading && !error && attachments.length === 0 && (
          <div className="text-center py-8">
            <DocumentIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">暂无附件</p>
          </div>
        )}

        {!loading && !error && attachments.length > 0 && (
          <div className="space-y-3">
            {attachments
              .filter(attachment => attachment && attachment.id) // 过滤无效附件
              .filter((attachment, index, array) => {
                // 去重：只保留第一个出现的相同ID的附件
                return array.findIndex(a => a.id === attachment.id) === index;
              })
              .map((attachment) => (
                <AttachmentItem
                  key={attachment.id}
                  attachment={attachment}
                  userRole={userRole}
                  onImagePreview={handleImagePreview}
                  onDocumentPreview={handleDocumentPreview}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
          </div>
        )}
      </div>

      {/* 底部 - 只在模态框模式显示 */}
      {!isEmbedded && (
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            type="button"
          >
            关闭
          </button>
        </div>
      )}
    </>
  );

  // 如果是嵌入模式，返回内容和预览模态框
  if (isEmbedded) {
    return (
      <>
        {content}

        {/* 图片预览模态框 - 嵌入模式也需要 */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <button
                onClick={closeImagePreview}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 z-10"
                title="关闭预览"
                type="button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <img
                src={previewImage}
                alt="图片预览"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={closeImagePreview}
              />
            </div>
          </div>
        )}

        {/* 文档预览模态框 - 嵌入模式也需要 */}
        {previewDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <h3 className="text-lg font-semibold text-gray-900">文档预览</h3>
                <button
                  onClick={closeDocumentPreview}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  title="关闭预览"
                  type="button"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="w-full h-full">
                <iframe
                  src={previewDocument}
                  className="w-full h-full border-0"
                  title="文档预览"
                  style={{ height: 'calc(100% - 60px)' }}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 模态框模式
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {content}
      </div>

      {/* 图片预览模态框 */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={closeImagePreview}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 z-10"
              title="关闭预览"
              type="button"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <img
              src={previewImage}
              alt="图片预览"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={closeImagePreview}
            />
          </div>
        </div>
      )}

      {/* 文档预览模态框 */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">文档预览</h3>
              <button
                onClick={closeDocumentPreview}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="关闭预览"
                type="button"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="w-full h-full">
              <iframe
                src={previewDocument}
                className="w-full h-full border-0"
                title="文档预览"
                style={{ height: 'calc(100% - 60px)' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
