# AI头像生成器 - 命令使用指南

## 第1页：项目概述

### 元一图灵 (AI Headshot Generator)

**核心功能**
- 🎫 证照生成 - 快速生成各种证件照
- 🎨 美照生成 - 10种专业艺术风格转换
- 🔍 照片修复 - 超分辨率和智能补全
- ✨ 图片调整 - 亮度、对比度、饱和度控制

**技术栈**
- 前端：React Native 0.81 + Expo SDK 54 + TypeScript
- 后端：Express.js + tRPC + Drizzle ORM
- 数据库：PostgreSQL (阿里云)
- 部署：PM2 (阿里云服务器)

---

## 第2页：项目初始化

### 从零开始设置项目

**步骤1：创建项目**
```bash
webdev_init_project --name ai-headshot-generator --template expo-mobile
```

**步骤2：安装依赖**
```bash
pnpm install
```

**步骤3：验证安装**
```bash
pnpm check
```

**关键点**
- ✅ 使用pnpm作为包管理器（比npm快3倍）
- ✅ 自动安装所有依赖（React Native、Expo、TypeScript等）
- ✅ 配置TypeScript编译环境

---

## 第3页：本地开发 - 启动服务

### 启动完整开发环境

**一键启动前端+后端**
```bash
pnpm dev
```

这个命令会同时启动：
- 📱 Metro打包器（前端，端口8081）
- 🖥️ Express服务器（后端，端口3000）

**仅启动后端**
```bash
pnpm dev:server
```

**仅启动前端**
```bash
pnpm dev:metro
```

**关键特性**
- 🔄 热重载 - 代码修改自动刷新
- 📊 实时日志 - 查看前后端运行状态
- 🐛 调试工具 - 集成React DevTools

---

## 第4页：本地开发 - 测试应用

### 在不同平台测试

**Web浏览器测试**
```bash
# 访问 http://localhost:8081
# 自动打开浏览器预览
```

**iOS模拟器测试**
```bash
pnpm ios
```

**Android模拟器测试**
```bash
pnpm android
```

**真机测试 (推荐)**
```bash
# 1. 启动开发服务器
pnpm dev

# 2. 生成QR码
pnpm qr

# 3. 用手机扫描QR码
# 4. 在Expo Go应用中打开
```

**测试流程**
- ✅ 功能测试 - 验证所有功能正常
- ✅ 性能测试 - 检查响应速度
- ✅ 兼容性测试 - iOS和Android

---

## 第5页：代码质量检查

### 编译、检查、格式化

**TypeScript类型检查**
```bash
pnpm check
```
- 检查所有TypeScript类型错误
- 确保代码类型安全

**代码格式化**
```bash
pnpm format
```
- 自动格式化代码（Prettier）
- 统一代码风格

**代码检查**
```bash
pnpm lint
```
- 检查代码规范（ESLint）
- 发现潜在问题

**运行测试**
```bash
pnpm test
```
- 执行单元测试（Vitest）
- 验证核心功能

---

## 第6页：数据库操作

### 使用Drizzle ORM管理数据库

**生成迁移文件**
```bash
pnpm drizzle-kit generate
```
- 根据schema.ts生成SQL迁移文件
- 记录数据库变更历史

**执行数据库迁移**
```bash
pnpm drizzle-kit migrate
```
- 在数据库中创建表和字段
- 更新数据库结构

**一键迁移（推荐）**
```bash
pnpm db:push
```
- 自动生成+执行迁移
- 最快的方式

**打开数据库可视化工具**
```bash
pnpm drizzle-kit studio
```
- 在浏览器中查看数据库
- 可视化编辑数据

**数据库连接信息**
```
主机: pgm-bp1fjoyt926vgd7c.pg.rds.aliyuncs.com
端口: 5432
数据库: postgres
用户名: postgres
密码: Ai-headshot123
```

---

## 第7页：编译和构建

### 生产环境编译

**编译后端代码**
```bash
pnpm build
```
- 使用esbuild编译TypeScript
- 输出到dist/目录
- 生成可执行的JavaScript

**启动生产服务器**
```bash
pnpm start
```
- 运行编译后的后端代码
- 模拟生产环境

**编译流程**
```
TypeScript源代码
    ↓
pnpm build (esbuild)
    ↓
dist/index.js (可执行文件)
    ↓
pnpm start (Node.js运行)
    ↓
生产服务器启动
```

---

## 第8页：版本控制 - Git操作

### 管理代码版本

**查看提交历史**
```bash
git log --oneline
```

**查看远程仓库**
```bash
git remote -v
```

**提交代码**
```bash
git add -A
git commit -m "v1.1.6: 修复照片上传功能"
```

**推送到GitHub**
```bash
git push github main
```

**拉取最新代码**
```bash
git pull origin main
```

**版本历史**
| 版本 | 说明 |
|------|------|
| v1.0.9 | 初始版本 |
| v1.1.3 | 修复OAUTH_SERVER_URL |
| v1.1.4 | 照片存储改为PostgreSQL |
| v1.1.6 | 完整修复照片上传功能 |

---

## 第9页：服务器部署 - PM2管理

### 使用PM2管理后端进程

**启动应用**
```bash
pm2 start ecosystem.config.js
```

**重启应用**
```bash
pm2 restart ai-headshot-generator
```

**更新环境变量后重启**
```bash
pm2 restart ai-headshot-generator --update-env
```

**停止应用**
```bash
pm2 stop ai-headshot-generator
```

**删除应用**
```bash
pm2 delete ai-headshot-generator
```

**查看应用状态**
```bash
pm2 status
```

**PM2进程管理流程**
```
ecosystem.config.js (配置文件)
    ↓
pm2 start (启动进程)
    ↓
Node.js进程运行
    ↓
pm2 monitor (监控进程)
    ↓
自动重启（如果崩溃）
```

---

## 第10页：服务器部署 - 查看日志

### 监控和调试应用

**查看最近日志**
```bash
pm2 logs ai-headshot-generator
```

**查看最近20行日志**
```bash
pm2 logs ai-headshot-generator --lines 20
```

**实时监控日志**
```bash
pm2 logs ai-headshot-generator --nostream
```

**日志文件位置**
```
/home/admin/yuanyi/ai-headshot-generator/logs/
├── out-0.log      # 标准输出
└── err-0.log      # 错误输出
```

**关键日志信息**
- ✅ `[api] server listening on port 3000` - 服务启动成功
- ✅ `[OAuth] Initialized` - OAuth配置成功
- ❌ `Error: Storage proxy credentials missing` - 环境变量未配置
- ❌ `Cannot connect to database` - 数据库连接失败

---

## 第11页：服务器部署 - SSH远程操作

### 在服务器上执行命令

**连接到服务器**
```bash
sshpass -p "Zjdyjyx821105" ssh -o StrictHostKeyChecking=no \
  root@218.244.144.154
```

**在服务器上拉取代码**
```bash
sshpass -p "Zjdyjyx821105" ssh -o StrictHostKeyChecking=no \
  root@218.244.144.154 \
  "cd /home/admin/yuanyi/ai-headshot-generator && git pull origin main"
```

**在服务器上执行迁移**
```bash
sshpass -p "Zjdyjyx821105" ssh -o StrictHostKeyChecking=no \
  root@218.244.144.154 \
  "export DATABASE_URL='...' && \
   cd /home/admin/yuanyi/ai-headshot-generator && \
   pnpm drizzle-kit migrate"
```

**服务器信息**
- 地址: 218.244.144.154
- 用户: root
- 项目路径: /home/admin/yuanyi/ai-headshot-generator
- 数据库: 阿里云PostgreSQL

---

## 第12页：完整部署流程

### 从开发到生产的完整步骤

**步骤1：本地开发和测试**
```bash
pnpm dev          # 启动开发服务器
pnpm test         # 运行测试
pnpm check        # 类型检查
pnpm format       # 代码格式化
```

**步骤2：提交代码**
```bash
git add -A
git commit -m "v1.1.7: 新功能描述"
git push github main
```

**步骤3：服务器部署**
```bash
# SSH连接到服务器
ssh root@218.244.144.154

# 拉取最新代码
cd /home/admin/yuanyi/ai-headshot-generator
git pull origin main

# 安装依赖和编译
pnpm install
pnpm run build

# 重启服务
pm2 restart ai-headshot-generator --update-env
```

**步骤4：验证部署**
```bash
# 查看日志
pm2 logs ai-headshot-generator

# 测试API
curl http://218.244.144.154:3000/api/health
```

---

## 第13页：环境变量配置

### 开发和生产环境配置

**开发环境 (.env.local)**
```bash
DATABASE_URL=postgresql://postgres:Ai-headshot123@...
OAUTH_SERVER_URL=http://218.244.144.154:3000
NODE_ENV=development
PORT=3000
```

**生产环境 (ecosystem.config.js)**
```javascript
env: {
  NODE_ENV: "production",
  PORT: 3000,
  DATABASE_URL: "postgresql://postgres:...",
  OAUTH_SERVER_URL: "http://218.244.144.154:3000",
  BAILIAN_API_KEY: process.env.BAILIAN_API_KEY || "",
  BAILIAN_AGENT_ID: process.env.BAILIAN_AGENT_ID || "",
}
```

**关键环境变量**
| 变量 | 说明 | 示例 |
|------|------|------|
| DATABASE_URL | 数据库连接字符串 | postgresql://... |
| OAUTH_SERVER_URL | OAuth服务地址 | http://218.244.144.154:3000 |
| NODE_ENV | 运行环境 | production/development |
| PORT | 服务端口 | 3000 |

---

## 第14页：常见问题解决

### 快速排查和解决

**问题1：开发服务器无响应**
```bash
# 解决方案
pnpm dev
# 或重启开发服务器
```

**问题2：数据库连接失败**
```bash
# 检查环境变量
echo $DATABASE_URL

# 执行迁移
pnpm db:push

# 查看数据库日志
pnpm drizzle-kit studio
```

**问题3：照片上传失败**
```bash
# 查看后端日志
pm2 logs ai-headshot-generator

# 检查数据库表
pnpm drizzle-kit studio

# 重启服务
pm2 restart ai-headshot-generator --update-env
```

**问题4：类型检查错误**
```bash
# 检查TypeScript错误
pnpm check

# 修复自动可修复的错误
pnpm format
```

---

## 第15页：快速参考卡片

### 最常用的命令

**开发阶段**
```bash
pnpm dev              # 启动开发服务器
pnpm check            # 类型检查
pnpm format           # 代码格式化
pnpm test             # 运行测试
```

**数据库操作**
```bash
pnpm db:push          # 推送schema到数据库
pnpm drizzle-kit studio  # 打开数据库可视化工具
```

**部署阶段**
```bash
pnpm build            # 编译后端代码
git push github main  # 推送到GitHub
pm2 restart ai-headshot-generator --update-env  # 重启服务
```

**监控和调试**
```bash
pm2 status            # 查看进程状态
pm2 logs ai-headshot-generator  # 查看日志
pm2 logs ai-headshot-generator --lines 20  # 查看最近日志
```

---

## 第16页：总结和最佳实践

### 开发工作流最佳实践

**✅ 推荐做法**
- 使用 `pnpm` 作为包管理器
- 每次提交前运行 `pnpm check` 和 `pnpm format`
- 使用有意义的commit消息（如v1.1.7: 新功能描述）
- 定期查看 `pm2 logs` 监控生产环境
- 在部署前在本地充分测试

**❌ 避免做法**
- 直接修改生产环境的代码
- 跳过测试直接部署
- 使用过于复杂的git命令
- 忽视数据库迁移
- 在没有备份的情况下修改环境变量

**🎯 关键指标**
- 开发周期：从修改到部署 < 5分钟
- 测试覆盖率：> 80%
- 部署成功率：100%
- 服务可用性：> 99.9%

---

## 第17页：资源和文档

### 相关文档和链接

**官方文档**
- [Expo官方文档](https://docs.expo.dev)
- [React Native文档](https://reactnative.dev)
- [tRPC文档](https://trpc.io)
- [Drizzle ORM文档](https://orm.drizzle.team)
- [NativeWind文档](https://www.nativewind.dev)

**项目文档**
- `README.md` - 项目介绍和使用指南
- `COMMANDS.md` - 完整命令列表
- `server/README.md` - 后端服务文档

**联系方式**
- GitHub: https://github.com/jinshenjinsi/ai-headshot-generator
- 服务器: 218.244.144.154:3000
- 数据库: pgm-bp1fjoyt926vgd7c.pg.rds.aliyuncs.com

---

## 第18页：下一步行动

### 继续开发的建议

**短期任务（本周）**
- [ ] 完成照片上传功能测试
- [ ] 优化AI生成速度
- [ ] 添加用户反馈功能

**中期任务（本月）**
- [ ] 实现用户账户系统
- [ ] 添加照片历史管理
- [ ] 支持更多艺术风格

**长期任务（本季度）**
- [ ] 国际化多语言支持
- [ ] 离线功能支持
- [ ] 性能优化和缓存策略

**部署检查清单**
- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 环境变量配置正确
- [ ] 数据库备份完成
- [ ] 监控告警设置
- [ ] 回滚方案准备

