-- 工作计划团队共享功能修复脚本
-- 运行时间: 2025年6月
-- 目的: 确保工作计划功能完全共享，解决用户隔离问题

-- 1. 确认work_plans表没有启用RLS（应该是团队共享的）
SELECT 'work_plans表RLS状态检查' as check_name, 
       CASE WHEN c.relrowsecurity THEN 'RLS已启用 - 需要禁用' ELSE 'RLS未启用 - 正确' END as status
FROM pg_class c 
JOIN pg_namespace n ON c.relnamespace = n.oid 
WHERE n.nspname = 'public' AND c.relname = 'work_plans';

-- 2. 如果RLS被意外启用，禁用它
ALTER TABLE work_plans DISABLE ROW LEVEL SECURITY;

-- 3. 删除任何可能存在的RLS策略
DROP POLICY IF EXISTS "work_plans_policy" ON work_plans;
DROP POLICY IF EXISTS "work_plans_select_policy" ON work_plans;
DROP POLICY IF EXISTS "work_plans_insert_policy" ON work_plans;
DROP POLICY IF EXISTS "work_plans_update_policy" ON work_plans;
DROP POLICY IF EXISTS "work_plans_delete_policy" ON work_plans;

-- 4. 确保表结构正确
-- 检查是否缺少外键约束
DO $$
BEGIN
    -- 检查created_by外键
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'work_plans_created_by_fkey' 
        AND table_name = 'work_plans'
    ) THEN
        ALTER TABLE work_plans 
        ADD CONSTRAINT work_plans_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- 检查assigned_to外键
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'work_plans_assigned_to_fkey' 
        AND table_name = 'work_plans'
    ) THEN
        ALTER TABLE work_plans 
        ADD CONSTRAINT work_plans_assigned_to_fkey 
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. 更新work_plans表的类型约束，支持新的类型
ALTER TABLE work_plans 
DROP CONSTRAINT IF EXISTS work_plans_type_check;

ALTER TABLE work_plans 
ADD CONSTRAINT work_plans_type_check 
CHECK (type IN ('weekly', 'upcoming', 'last_week_summary'));

-- 6. 创建测试数据来验证团队共享功能
-- 首先确保有多个管理员用户用于测试
INSERT INTO users (id, email, name, role) 
VALUES 
    (gen_random_uuid(), 'admin1@qhrc.com', '管理员1', 'admin'),
    (gen_random_uuid(), 'admin2@qhrc.com', '管理员2', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 7. 为不同用户创建工作计划，验证共享功能
DO $$
DECLARE
    admin1_id UUID;
    admin2_id UUID;
    super_admin_id UUID;
BEGIN
    -- 获取用户ID
    SELECT id INTO admin1_id FROM users WHERE email = 'admin1@qhrc.com' LIMIT 1;
    SELECT id INTO admin2_id FROM users WHERE email = 'admin2@qhrc.com' LIMIT 1;
    SELECT id INTO super_admin_id FROM users WHERE role = 'super_admin' LIMIT 1;
    
    -- 如果找到了用户，创建测试工作计划
    IF admin1_id IS NOT NULL THEN
        INSERT INTO work_plans (type, title, description, priority, status, created_by) 
        VALUES 
            ('weekly', '管理员1创建的本周计划', '这是由管理员1创建的工作计划，所有管理员都应该能看到', 'high', 'pending', admin1_id),
            ('upcoming', '管理员1创建的近期计划', '测试团队共享功能', 'medium', 'in_progress', admin1_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF admin2_id IS NOT NULL THEN
        INSERT INTO work_plans (type, title, description, priority, status, created_by) 
        VALUES 
            ('weekly', '管理员2创建的本周计划', '这是由管理员2创建的工作计划，所有管理员都应该能看到', 'medium', 'pending', admin2_id),
            ('last_week_summary', '管理员2创建的上周总结', '测试团队共享功能', 'low', 'completed', admin2_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF super_admin_id IS NOT NULL THEN
        INSERT INTO work_plans (type, title, description, priority, status, created_by) 
        VALUES 
            ('weekly', '超级管理员创建的本周计划', '这是由超级管理员创建的工作计划，所有管理员都应该能看到', 'high', 'pending', super_admin_id),
            ('upcoming', '超级管理员创建的近期计划', '测试团队共享功能', 'high', 'pending', super_admin_id)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 8. 验证数据
SELECT 
    '数据验证' as check_name,
    COUNT(*) as total_plans,
    COUNT(DISTINCT created_by) as unique_creators
FROM work_plans;

-- 9. 显示所有工作计划及其创建者，验证团队共享
SELECT 
    wp.id,
    wp.type,
    wp.title,
    wp.priority,
    wp.status,
    u.name as creator_name,
    u.email as creator_email,
    wp.created_at
FROM work_plans wp
JOIN users u ON wp.created_by = u.id
ORDER BY wp.created_at DESC;

-- 10. 创建一个视图来方便查看工作计划的团队共享状态
CREATE OR REPLACE VIEW work_plans_shared_view AS
SELECT 
    wp.id,
    wp.type,
    wp.title,
    wp.description,
    wp.priority,
    wp.status,
    wp.due_date,
    creator.name as creator_name,
    creator.email as creator_email,
    creator.role as creator_role,
    assignee.name as assignee_name,
    assignee.email as assignee_email,
    wp.created_at,
    wp.updated_at
FROM work_plans wp
LEFT JOIN users creator ON wp.created_by = creator.id
LEFT JOIN users assignee ON wp.assigned_to = assignee.id
ORDER BY wp.created_at DESC;

-- 11. 添加注释说明这是团队共享功能
COMMENT ON TABLE work_plans IS '工作计划表 - 团队共享功能，所有管理员都可以查看和管理所有工作计划';
COMMENT ON VIEW work_plans_shared_view IS '工作计划共享视图 - 显示所有工作计划及其创建者和分配者信息';

-- 12. 最终验证
SELECT 
    'work_plans表团队共享功能验证完成' as message,
    'RLS已禁用，所有管理员可以查看所有工作计划' as status,
    COUNT(*) as total_work_plans
FROM work_plans;
