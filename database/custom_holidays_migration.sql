-- 创建自定义节假日表的迁移脚本
-- 运行时间: 2024年12月

-- 创建自定义节假日表
CREATE TABLE IF NOT EXISTS custom_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'custom' CHECK (type = 'custom'),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_custom_holidays_date ON custom_holidays(date);
CREATE INDEX IF NOT EXISTS idx_custom_holidays_created_by ON custom_holidays(created_by);
CREATE INDEX IF NOT EXISTS idx_custom_holidays_created_at ON custom_holidays(created_at DESC);

-- 创建唯一约束，防止同一天重复添加相同名称的节假日
CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_holidays_date_name_unique 
ON custom_holidays(date, name);

-- 插入一些示例数据（可选）
INSERT INTO custom_holidays (date, name, description, created_by) 
SELECT 
    '2025-03-15'::DATE,
    'QHRC成立日',
    '青海研究中心成立纪念日',
    id
FROM users 
WHERE role IN ('super_admin', 'admin') 
LIMIT 1
ON CONFLICT (date, name) DO NOTHING;

INSERT INTO custom_holidays (date, name, description, created_by) 
SELECT 
    '2025-06-01'::DATE,
    '研究中心开放日',
    '年度研究中心对外开放参观日',
    id
FROM users 
WHERE role IN ('super_admin', 'admin') 
LIMIT 1
ON CONFLICT (date, name) DO NOTHING;
