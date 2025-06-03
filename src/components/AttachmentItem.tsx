import React, { memo, useCallback } from 'react';
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import LazyImage from './LazyImage';
import { UserRole } from '@/types';

interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  cosUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface AttachmentItemProps {
  attachment: Attachment;
  userRole: UserRole;
  onImagePreview: (attachment: Attachment) => void;
  onDocumentPreview: (attachment: Attachment) => void;
  onDownload: (attachment: Attachment) => void;
  onDelete: (attachmentId: string) => void;
}

// 文件类型检查函数
const isImage = (mimeType: string): boolean => {
  if (!mimeType || typeof mimeType !== 'string') return false;
  return mimeType.startsWith('image/');
};

const isPreviewableDocument = (mimeType: string): boolean => {
  if (!mimeType || typeof mimeType !== 'string') return false;
  const previewableTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  return previewableTypes.includes(mimeType);
};

// 获取文件图标
const getFileIcon = (mimeType: string) => {
  if (!mimeType || typeof mimeType !== 'string') {
    return (
      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }

  if (isImage(mimeType)) {
    return (
      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }

  if (mimeType === 'application/pdf') {
    return (
      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }

  if (mimeType.includes('word') || mimeType.includes('document')) {
    return (
      <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const AttachmentItem = memo(({
  attachment,
  userRole,
  onImagePreview,
  onDocumentPreview,
  onDownload,
  onDelete
}: AttachmentItemProps) => {
  // 先定义所有的 hooks
  const handleImagePreview = useCallback(() => {
    if (attachment) {
      onImagePreview(attachment);
    }
  }, [attachment, onImagePreview]);

  const handleDocumentPreview = useCallback(() => {
    if (attachment) {
      onDocumentPreview(attachment);
    }
  }, [attachment, onDocumentPreview]);

  const handleDownload = useCallback(() => {
    if (attachment) {
      onDownload(attachment);
    }
  }, [attachment, onDownload]);

  const handleDelete = useCallback(() => {
    if (attachment?.id) {
      onDelete(attachment.id);
    }
  }, [attachment?.id, onDelete]);

  // 验证附件数据的完整性
  if (!attachment || !attachment.id) {
    console.warn('AttachmentItem: 收到无效的附件数据', attachment);
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      {/* 图片预览 */}
      {isImage(attachment.mimeType) && (
        <div className="p-3 border-b border-gray-100 flex justify-center">
          <LazyImage
            src={attachment.cosUrl}
            alt={attachment.originalName}
            onClick={handleImagePreview}
            placeholder={
              <div className="flex flex-col items-center justify-center text-gray-400">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">加载中...</span>
              </div>
            }
          />
        </div>
      )}

      {/* 文件信息 */}
      <div className="flex items-center justify-between p-3">
        <div
          className={`flex items-center space-x-3 flex-grow min-w-0 ${
            isPreviewableDocument(attachment.mimeType) ? 'cursor-pointer hover:bg-gray-50 rounded p-2 -m-2 transition-colors' : ''
          }`}
          onClick={isPreviewableDocument(attachment.mimeType) ? handleDocumentPreview : undefined}
        >
          {getFileIcon(attachment.mimeType)}
          <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {attachment.originalName || '未知文件'}
              {isPreviewableDocument(attachment.mimeType) && (
                <span className="ml-2 text-xs text-blue-600">(点击预览)</span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(attachment.fileSize)} •
              上传于 {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleDateString('zh-CN') : '未知时间'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
            title="下载"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </button>
          {userRole === UserRole.SUPER_ADMIN && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="删除"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

AttachmentItem.displayName = 'AttachmentItem';

export default AttachmentItem;
