# QHRC日历系统部署指南

## 数据库配置

### Supabase项目信息
- 项目ID: `inevsgkvziygsycdenil`
- 项目URL: `https://inevsgkvziygsycdenil.supabase.co`
- 区域: `ap-southeast-1`

### 环境变量配置
在 `.env.local` 文件中配置以下变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://inevsgkvziygsycdenil.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZXZzZ2t2eml5Z3N5Y2RlbmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjM1MTQsImV4cCI6MjA2MzczOTUxNH0.Nu-rHhU4L_7smIE6kmb7yRCfnidcff3UJ6M00bK0L0U
```

### 数据库表结构

已创建的表：
1. `users` - 用户表
2. `calendar_events` - 日历事件表
3. `operation_logs` - 操作记录表

### 默认管理员账户

- 邮箱: `admin@qhrc.com`
- 密码: `admin123`
- 角色: 管理员

**重要：首次部署后请立即更改默认密码！**

## 部署步骤

### 本地开发

1. 克隆项目
```bash
git clone <repository-url>
cd qhrccalender
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.local.example .env.local
# 编辑 .env.local 文件，填入正确的配置
```

4. 启动开发服务器
```bash
npm run dev
```

### 生产部署

#### 使用Vercel部署

1. 连接GitHub仓库到Vercel
2. 在Vercel项目设置中添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 部署项目

#### 使用其他平台

1. 构建项目
```bash
npm run build
```

2. 启动生产服务器
```bash
npm start
```

## 用户管理

### 创建新用户

管理员可以通过以下方式创建新用户：
1. 登录系统
2. 访问"用户管理"页面
3. 点击"添加用户"
4. 填写用户信息并选择角色

### 用户角色

- **管理员**: 可以管理用户、查看操作记录、添加/删除日历事项
- **普通用户**: 只能添加日历事项，无法删除事项或管理用户

## 功能说明

### 日历视图

- **年视图**: 显示整年的月份，PC端显示缩略月视图
- **月视图**: 显示整月的日期，包含事项标签
- **周视图**: 显示一周的详细事项，可以添加和管理事项

### 活动类型

- **中心活动**:
  - SI: 智能传感器与影像研究中心活动
  - DI: 智能设计与创新研究中心活动
  - MH: 智慧医疗与健康研究中心活动
  - QHRC: 创新中心活动

- **政府单位联络**: GOV

- **企业拜访或走访**:
  - SI企: 智能传感器与影像研究中心企业
  - DI企: 智能设计与创新研究中心企业
  - MH企: 智慧医疗与健康研究中心企业

## 维护和监控

### 操作记录

系统会自动记录所有用户操作，管理员可以在"操作记录"页面查看：
- 用户登录/登出
- 用户管理操作
- 日历事项的增删改

### 数据备份

建议定期备份Supabase数据库：
1. 在Supabase Dashboard中导出数据
2. 或使用pg_dump工具备份PostgreSQL数据库

### 安全建议

1. 定期更新依赖包
2. 监控Supabase项目的安全日志
3. 定期审查用户权限
4. 使用强密码策略

## 故障排除

### 常见问题

1. **登录失败**
   - 检查Supabase配置是否正确
   - 确认用户在auth.users表中存在

2. **数据保存失败**
   - 检查网络连接
   - 查看浏览器控制台错误信息
   - 检查Supabase项目状态

### 日志查看

- 浏览器控制台：查看前端错误
- Vercel日志：查看部署和运行时错误
- Supabase日志：查看数据库操作日志
