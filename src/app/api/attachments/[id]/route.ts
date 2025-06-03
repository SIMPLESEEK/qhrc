import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClientWithCookies } from '@/lib/supabase-server';
import { deleteFile } from '@/lib/cos';
import { UserRole } from '@/types';

// 删除附件
export async function DELETE(
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

    // 只有超级管理员可以删除附件
    if (user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { message: '只有超级管理员可以删除附件' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = await createSupabaseServerClientWithCookies();

    // 获取附件信息
    const { data: attachment, error: fetchError } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !attachment) {
      return NextResponse.json(
        { message: '附件不存在' },
        { status: 404 }
      );
    }

    // 从COS删除文件
    try {
      await deleteFile(attachment.filename);
    } catch (cosError) {
      console.error('从COS删除文件失败:', cosError);
      // 继续删除数据库记录，即使COS删除失败
    }

    // 从数据库删除附件记录
    const { error: deleteError } = await supabase
      .from('attachments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('删除附件记录失败:', deleteError);
      return NextResponse.json(
        { message: '删除附件记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '附件删除成功'
    });

  } catch (error) {
    console.error('删除附件失败:', error);
    return NextResponse.json(
      { message: '删除附件失败' },
      { status: 500 }
    );
  }
}
