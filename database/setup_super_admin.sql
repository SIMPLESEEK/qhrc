-- 设置新的超级管理员账户
-- 运行时间: 2024年12月

-- 1. 清理现有用户数据（谨慎操作！）
-- 注意：这将删除所有现有用户，请确保已备份重要数据

-- 删除所有操作记录
DELETE FROM operation_logs;

-- 删除所有用户记录
DELETE FROM users;

-- 2. 创建超级管理员账户记录
-- 注意：需要先在Supabase Auth中创建对应的认证用户
-- 用户名: qhrcadmin
-- 密码: qhrc523
-- 虚拟邮箱: qhrcadmin@qhrc.internal

-- 这里需要替换为实际的用户ID（从Supabase Auth获取）
INSERT INTO users (id, username, name, role, created_at)
VALUES (
    'REPLACE_WITH_ACTUAL_USER_ID', -- 需要替换为实际的UUID
    'qhrcadmin',
    'QHRC超级管理员',
    'super_admin',
    NOW()
);

-- 3. 确保共享日历记录存在
INSERT INTO calendar_events (user_id, events, created_at, updated_at)
VALUES (
    'shared-calendar',
    '{}',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- 4. 记录初始化操作
INSERT INTO operation_logs (user_id, user_username, operation_type, details, created_at)
VALUES (
    'REPLACE_WITH_ACTUAL_USER_ID', -- 需要替换为实际的UUID
    'qhrcadmin',
    'CREATE_USER',
    '系统初始化：创建超级管理员账户',
    NOW()
);

-- 使用说明：
-- 1. 首先在Supabase Auth Dashboard中创建用户：
--    - Email: qhrcadmin@qhrc.internal
--    - Password: qhrc523
--    - 确认邮箱（手动设置为已确认）
-- 2. 复制生成的用户ID
-- 3. 将上面SQL中的 'REPLACE_WITH_ACTUAL_USER_ID' 替换为实际的用户ID
-- 4. 执行此SQL脚本
