-- 创建链接表的迁移脚本
-- 运行时间: 2024年12月

-- 创建链接表
CREATE TABLE IF NOT EXISTS activity_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_activity_links_activity_id ON activity_links(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_links_user_id ON activity_links(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_links_created_by ON activity_links(created_by);
CREATE INDEX IF NOT EXISTS idx_activity_links_display_order ON activity_links(display_order);
CREATE INDEX IF NOT EXISTS idx_activity_links_created_at ON activity_links(created_at DESC);

-- 添加注释
COMMENT ON TABLE activity_links IS '活动链接表';
COMMENT ON COLUMN activity_links.id IS '链接唯一标识';
COMMENT ON COLUMN activity_links.activity_id IS '关联的活动ID';
COMMENT ON COLUMN activity_links.user_id IS '链接所属用户ID';
COMMENT ON COLUMN activity_links.title IS '链接标题';
COMMENT ON COLUMN activity_links.url IS '链接URL';
COMMENT ON COLUMN activity_links.description IS '链接描述';
COMMENT ON COLUMN activity_links.display_order IS '显示顺序';
COMMENT ON COLUMN activity_links.created_at IS '创建时间';
COMMENT ON COLUMN activity_links.created_by IS '创建者用户ID';
