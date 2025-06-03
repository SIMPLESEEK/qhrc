-- 创建附件表的迁移脚本
-- 运行时间: 2024年12月

-- 创建附件表
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    cos_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_attachments_activity_id ON attachments(activity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_at ON attachments(uploaded_at DESC);

-- 添加注释
COMMENT ON TABLE attachments IS '活动附件表';
COMMENT ON COLUMN attachments.id IS '附件唯一标识';
COMMENT ON COLUMN attachments.activity_id IS '关联的活动ID';
COMMENT ON COLUMN attachments.user_id IS '附件所属用户ID';
COMMENT ON COLUMN attachments.filename IS 'COS中的文件名';
COMMENT ON COLUMN attachments.original_name IS '原始文件名';
COMMENT ON COLUMN attachments.file_size IS '文件大小（字节）';
COMMENT ON COLUMN attachments.mime_type IS '文件MIME类型';
COMMENT ON COLUMN attachments.cos_url IS 'COS访问URL';
COMMENT ON COLUMN attachments.uploaded_at IS '上传时间';
COMMENT ON COLUMN attachments.uploaded_by IS '上传者用户ID';
