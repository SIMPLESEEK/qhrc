import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';

// 下载附件
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取当前用户
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClientWithCookies();
    const { id } = await params;

    // 获取附件信息
    const { data: attachment, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !attachment) {
      return NextResponse.json(
        { message: '附件不存在' },
        { status: 404 }
      );
    }

    // 在共享日历系统中，所有用户都可以下载附件
    // 不需要检查用户权限

    // 获取文件内容
    const response = await fetch(attachment.cos_url);

    if (!response.ok) {
      return NextResponse.json(
        { message: '文件下载失败' },
        { status: 500 }
      );
    }

    const fileBuffer = await response.arrayBuffer();

    // 设置响应头，确保使用原始文件名
    const headers = new Headers();
    headers.set('Content-Type', attachment.mime_type || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(attachment.original_name)}`);
    headers.set('Content-Length', attachment.file_size.toString());

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('下载附件失败:', error);
    return NextResponse.json(
      { message: '下载附件失败' },
      { status: 500 }
    );
  }
}
