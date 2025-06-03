import React, { useState, useCallback, useRef } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { UserRole, Attachment } from '@/types';
import { canAddAttachments } from '@/lib/permissions';
import axios from '@/lib/axios';

interface AttachmentUploaderProps {
  activityId: string;
  userId: string;
  userRole: UserRole;
  onUploadSuccess: (attachment: Attachment) => void;
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  activityId,
  userId,
  userRole,
  onUploadSuccess
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length || !canAddAttachments(userRole)) {
      return;
    }

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const formData = new FormData();
        formData.append('file', file);
        formData.append('activityId', activityId);
        formData.append('userId', userId);

        const response = await axios.post('/api/attachments', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.attachment) {
          // 通知父组件（父组件会处理缓存更新）
          onUploadSuccess(response.data.attachment);
        }
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [activityId, userId, userRole, onUploadSuccess]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  if (!canAddAttachments(userRole)) {
    return null;
  }

  return (
    <div className="mb-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        />

        {uploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">上传中...</span>
          </div>
        ) : (
          <>
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              点击或拖拽文件到此处上传
            </p>
            <p className="text-sm text-gray-500">
              支持图片、文档、压缩包等格式，单个文件最大 10MB
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AttachmentUploader;
