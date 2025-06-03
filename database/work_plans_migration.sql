-- 工作计划表迁移脚本

-- 创建工作计划表
CREATE TABLE IF NOT EXISTS work_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('weekly', 'upcoming')),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    due_date DATE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_work_plans_type ON work_plans(type);
CREATE INDEX IF NOT EXISTS idx_work_plans_status ON work_plans(status);
CREATE INDEX IF NOT EXISTS idx_work_plans_created_by ON work_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_work_plans_assigned_to ON work_plans(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_plans_due_date ON work_plans(due_date);

-- 更新用户表，添加超级管理员角色支持
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('super_admin', 'admin', 'user'));

-- 创建触发器自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_plans_updated_at 
    BEFORE UPDATE ON work_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 插入一些示例数据（可选）
INSERT INTO work_plans (type, title, description, priority, status, created_by) 
SELECT 
    'weekly',
    '完成项目文档整理',
    '整理本周完成的项目相关文档，准备下周汇报材料',
    'high',
    'pending',
    id
FROM users 
WHERE role IN ('super_admin', 'admin') 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO work_plans (type, title, description, priority, status, created_by) 
SELECT 
    'upcoming',
    '准备月度工作总结',
    '收集各部门月度工作数据，准备月度总结报告',
    'medium',
    'pending',
    id
FROM users 
WHERE role IN ('super_admin', 'admin') 
LIMIT 1
ON CONFLICT DO NOTHING;
