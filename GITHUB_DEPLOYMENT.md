# QHRC日历系统 - GitHub部署指南

## 🎉 代码上传成功

您的QHRC日历系统代码已经成功上传到GitHub仓库：
**https://github.com/SIMPLESEEK/qhrc.git**

## 📋 已上传的内容

### 核心代码文件
- ✅ **完整的源代码**：所有React组件、API路由、工具函数
- ✅ **数据库脚本**：初始化和迁移SQL文件
- ✅ **配置文件**：Next.js、TypeScript、ESLint配置
- ✅ **文档文件**：详细的项目文档和使用指南

### 安全保护
- ✅ **环境变量保护**：`.env.local`文件已被忽略
- ✅ **敏感信息排除**：密钥、证书等文件不会上传
- ✅ **示例配置**：提供`.env.example`作为配置模板

### 已忽略的文件
```
node_modules/          # 依赖包
.env.local            # 环境变量（包含密钥）
.next/                # 构建输出
*.log                 # 日志文件
.DS_Store             # 系统文件
*.key, *.pem          # 证书文件
```

## 🚀 部署选项

### 1. Vercel部署（推荐）

**步骤**：
1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击"New Project"
4. 选择您的`qhrc`仓库
5. 配置环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   TENCENT_COS_SECRET_ID=your-cos-secret-id
   TENCENT_COS_SECRET_KEY=your-cos-secret-key
   TENCENT_COS_REGION=your-cos-region
   TENCENT_COS_BUCKET=your-cos-bucket
   ```
6. 点击"Deploy"

**优势**：
- 自动CI/CD
- 全球CDN加速
- 免费SSL证书
- 零配置部署

### 2. Netlify部署

**步骤**：
1. 访问 [netlify.com](https://netlify.com)
2. 连接GitHub仓库
3. 设置构建命令：`npm run build`
4. 设置发布目录：`.next`
5. 配置环境变量

### 3. 自建服务器部署

**要求**：
- Node.js 18+
- PM2进程管理器
- Nginx反向代理

**步骤**：
```bash
# 克隆仓库
git clone https://github.com/SIMPLESEEK/qhrc.git
cd qhrc

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入实际配置

# 构建项目
npm run build

# 启动服务
npm start
```

## 🔧 环境变量配置

### 必需的环境变量

1. **Supabase配置**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **腾讯云COS配置**
   ```
   TENCENT_COS_SECRET_ID=your-secret-id
   TENCENT_COS_SECRET_KEY=your-secret-key
   TENCENT_COS_REGION=ap-guangzhou
   TENCENT_COS_BUCKET=your-bucket-name
   ```

### 获取配置信息

1. **Supabase配置**
   - 登录 [supabase.com](https://supabase.com)
   - 进入您的项目
   - 在Settings > API中找到URL和密钥

2. **腾讯云COS配置**
   - 登录腾讯云控制台
   - 进入对象存储COS
   - 在密钥管理中获取SecretId和SecretKey

## 📝 部署后检查清单

### 1. 功能验证
- [ ] 访问网站正常
- [ ] 用户登录功能正常
- [ ] 日历显示正常
- [ ] 文件上传功能正常
- [ ] 数据库连接正常

### 2. 安全检查
- [ ] 修改默认管理员密码
- [ ] 确认HTTPS访问
- [ ] 检查环境变量配置
- [ ] 验证权限控制

### 3. 性能检查
- [ ] 页面加载速度
- [ ] 图片显示正常
- [ ] API响应时间
- [ ] 移动端适配

## 🔄 持续部署

### 自动部署设置

如果使用Vercel或Netlify：
1. 每次推送到`master`分支会自动部署
2. 可以设置预览分支进行测试
3. 支持回滚到之前的版本

### 手动部署更新

```bash
# 拉取最新代码
git pull origin master

# 安装新依赖（如果有）
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart qhrc-calendar
```

## 🛠 故障排除

### 常见问题

1. **构建失败**
   - 检查Node.js版本（需要18+）
   - 确认所有依赖已安装
   - 检查TypeScript错误

2. **环境变量问题**
   - 确认所有必需变量已设置
   - 检查变量名拼写
   - 验证密钥有效性

3. **数据库连接失败**
   - 检查Supabase项目状态
   - 验证数据库URL和密钥
   - 确认网络连接

### 获取帮助

- **GitHub Issues**: 在仓库中创建Issue
- **文档参考**: 查看项目中的文档文件
- **技术支持**: 联系开发团队

## 📊 项目统计

- **总文件数**: 80+ 个文件
- **代码行数**: ~15,000 行
- **组件数量**: 30+ 个React组件
- **API端点**: 20+ 个API路由
- **文档页数**: 8个详细文档

## 🎯 下一步建议

1. **立即部署**: 选择合适的部署平台进行部署
2. **修改密码**: 部署后立即修改默认管理员密码
3. **数据备份**: 建立定期数据备份策略
4. **监控设置**: 配置性能和错误监控
5. **用户培训**: 为团队成员提供使用培训

---

**恭喜！您的QHRC日历系统已经成功上传到GitHub，可以开始部署使用了！** 🚀

**仓库地址**: https://github.com/SIMPLESEEK/qhrc.git
