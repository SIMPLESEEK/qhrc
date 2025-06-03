'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, DocumentIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Attachment, UserRole } from '@/types';
import axios from '@/lib/axios';
import AttachmentItem from './AttachmentItem';
import { attachmentCache } from '@/lib/attachmentCache';
import { canAddAttachments } from '@/lib/permissions';

interface AttachmentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  userId: string;
  userRole: UserRole;
}

export default function AttachmentEditor({
  isOpen,
  onClose,
  activityId,
  userId,
  userRole
}: AttachmentEditorProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 使用缓存的附件获取函数
  const fetchAttachments = useCallback(async (forceRefresh = false) => {
    if (!activityId || !userId) return;

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
    } catch (error) {
      console.error('获取附件列表失败:', error);
      setError('获取附件列表失败');
    } finally {
      setLoading(false);
    }
  }, [activityId, userId]);

  useEffect(() => {
    if (isOpen && activityId && userId) {
      fetchAttachments();
    }
  }, [isOpen, activityId, userId, fetchAttachments]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('activityId', activityId);
      formData.append('userId', userId);

      const response = await axios.post('/api/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 获取新上传的附件信息
      const newAttachment = response.data.attachment;
      if (newAttachment) {
        // 更新缓存
        attachmentCache.addAttachment(activityId, userId, newAttachment);
        // 更新本地状态
        setAttachments(prev => [newAttachment, ...prev]);
      } else {
        // 如果没有返回附件信息，强制刷新
        await fetchAttachments(true);
      }

      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('上传文件失败:', error);
      setError(error.response?.data?.message || '上传文件失败');
    } finally {
      setUploading(false);
    }
  }, [activityId, userId, fetchAttachments]);

  const handleDeleteAttachment = useCallback(async (attachmentId: string) => {
    if (!confirm('确定要删除这个附件吗？')) return;

    try {
      await axios.delete(`/api/attachments/${attachmentId}`);

      // 更新缓存
      attachmentCache.removeAttachment(activityId, userId, attachmentId);
      // 更新本地状态
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    } catch (error: any) {
      console.error('删除附件失败:', error);
      setError(error.response?.data?.message || '删除附件失败');
    }
  }, [activityId, userId]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">管理附件</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* 上传区域 */}
          {canAddAttachments(userRole) && (
            <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <PlusIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">点击上传文件</p>
                <button
                  onClick={handleFileSelect}
                  disabled={uploading}
                  className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
                >
                  {uploading ? '上传中...' : '选择文件'}
                </button>
                <p className="text-xs text-gray-500 mt-1">支持图片、文档等格式，最大10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
              />
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          )}

          {!loading && attachments.length === 0 && (
            <div className="text-center py-8">
              <DocumentIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">暂无附件</p>
            </div>
          )}

          {!loading && attachments.length > 0 && (
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
                    onDelete={handleDeleteAttachment}
                  />
                ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            关闭
          </button>
        </div>
      </div>

      {/* 图片预览模态框 */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={closeImagePreview}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 z-10"
              title="关闭预览"
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
