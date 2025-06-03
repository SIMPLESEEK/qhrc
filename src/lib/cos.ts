import COS from 'cos-nodejs-sdk-v5';
import { v4 as uuidv4 } from 'uuid';

// 初始化COS实例（只在配置存在时）
let cos: any = null;
let BUCKET = '';
let REGION = '';

if (process.env.TENCENT_COS_SECRET_ID && process.env.TENCENT_COS_SECRET_KEY) {
  cos = new COS({
    SecretId: process.env.TENCENT_COS_SECRET_ID,
    SecretKey: process.env.TENCENT_COS_SECRET_KEY,
  });
  BUCKET = process.env.TENCENT_COS_BUCKET || '';
  REGION = process.env.TENCENT_COS_REGION || '';
}

export interface UploadResult {
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  cosUrl: string;
}

/**
 * 上传文件到腾讯云COS
 */
export async function uploadFile(
  file: Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadResult> {
  try {
    // 确保 originalName 不为空
    const safeName = originalName || 'unknown';

    // 检查环境变量是否配置
    if (!process.env.TENCENT_COS_SECRET_ID || !process.env.TENCENT_COS_SECRET_KEY) {
      console.warn('腾讯云COS未配置，使用模拟上传');
      // 模拟上传，返回模拟数据
      const fileExtension = safeName.includes('.') ? safeName.split('.').pop() || '' : '';
      const filename = `attachments/${uuidv4()}.${fileExtension}`;
      const cosUrl = `https://example.com/${filename}`;

      return {
        filename,
        originalName: safeName,
        fileSize: file.length,
        mimeType,
        cosUrl,
      };
    }

    // 生成唯一文件名
    const fileExtension = safeName.includes('.') ? safeName.split('.').pop() || '' : '';
    const filename = `attachments/${uuidv4()}.${fileExtension}`;

    // 上传文件
    const result = await cos.putObject({
      Bucket: BUCKET,
      Region: REGION,
      Key: filename,
      Body: file,
      ContentType: mimeType,
    });

    // 构建访问URL
    const cosUrl = `https://${BUCKET}.cos.${REGION}.myqcloud.com/${filename}`;

    return {
      filename,
      originalName: safeName,
      fileSize: file.length,
      mimeType,
      cosUrl,
    };
  } catch (error) {
    console.error('文件上传失败:', error);
    throw new Error('文件上传失败');
  }
}

/**
 * 删除COS中的文件
 */
export async function deleteFile(filename: string): Promise<void> {
  try {
    if (!cos) {
      return;
    }

    await cos.deleteObject({
      Bucket: BUCKET,
      Region: REGION,
      Key: filename,
    });
  } catch (error) {
    throw new Error('文件删除失败');
  }
}

/**
 * 获取文件的临时访问URL（用于私有文件）
 */
export async function getFileUrl(filename: string, expires: number = 3600): Promise<string> {
  try {
    if (!cos) {
      return `https://example.com/${filename}`;
    }

    const url = cos.getObjectUrl({
      Bucket: BUCKET,
      Region: REGION,
      Key: filename,
      Sign: true,
      Expires: expires,
    });
    return url;
  } catch (error) {
    throw new Error('获取文件URL失败');
  }
}

/**
 * 验证文件类型
 */
export function validateFileType(mimeType: string): boolean {
  // 如果 mimeType 为空或 undefined，返回 false
  if (!mimeType || typeof mimeType !== 'string') {
    return false;
  }

  const allowedTypes = [
    // 图片
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // 文档
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    // 压缩文件
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ];

  return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * 验证文件大小（最大10MB）
 */
export function validateFileSize(size: number): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return size <= maxSize;
}
