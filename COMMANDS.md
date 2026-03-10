# AI头像生成器 - 完整命令列表

## 项目概述
**项目名称**: ai-headshot-generator (元一图灵)  
**技术栈**: React Native 0.81 + Expo SDK 54 + TypeScript 5.9 + NativeWind 4  
**后端**: Express.js + tRPC + Drizzle ORM  
**数据库**: PostgreSQL (阿里云)  
**部署**: PM2 (阿里云服务器)

---

## 📦 开发环境命令

### 0. 项目清理和重新设置（Mac上使用）

```bash
# 完全删除旧目录（包括node_modules）
rm -rf ~/ai-headshot-generator

# 从GitHub克隆最新代码
git clone https://github.com/jinshenjinsi/ai-headshot-generator.git ~/ai-headshot-generator

# 进入项目目录
cd ~/ai-headshot-generator

# 安装依赖（这会安装所有依赖，包括@tanstack/react-query）
pnpm install

# 检查依赖是否正确安装
pnpm list @tanstack/react-query
```

### 1. 项目初始化
```bash
# 创建新项目（已完成）
webdev_init_project --name ai-headshot-generator --template expo-mobile

# 安装依赖
pnpm install

# 更新依赖
pnpm update
```

### 2. 开发服务器命令

```bash
# 启动完整开发环境（前端+后端）
pnpm dev

# 仅启动后端服务器
pnpm dev:server

# 仅启动前端Metro打包器
pnpm dev:metro

# 启动iOS开发
pnpm ios

# 启动Android开发
pnpm android

# 生成QR码
pnpm qr
```

### 3. 编译和构建

```bash
# 编译后端代码
pnpm build

# 启动生产环境服务器
pnpm start

# TypeScript类型检查
pnpm check

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 运行单元测试
pnpm test
```

---

## 🗄️ 数据库命令

### Drizzle ORM 数据库操作

```bash
# 生成数据库迁移文件
pnpm drizzle-kit generate

# 执行数据库迁移
pnpm drizzle-kit migrate

# 推送schema到数据库（生成+迁移）
pnpm db:push

# 打开Drizzle Studio（数据库可视化工具）
pnpm drizzle-kit studio
```

### 数据库连接信息
```
主机: pgm-bp1fjoyt926vgd7c.pg.rds.aliyuncs.com
端口: 5432
数据库: postgres
用户名: postgres
密码: Ai-headshot123
```

---

## 🚀 部署和服务器命令

### Git 版本控制

```bash
# 查看git日志
git log --oneline

# 查看远程仓库
git remote -v

# 提交代码
git add -A
git commit -m "v1.1.6: 修复照片上传功能"

# 推送到GitHub
git push github main
git push origin main

# 拉取最新代码
git pull origin main
```

### Git Remote 配置（Mac上使用）

```bash
# 查看当前的remote配置
git remote -v

# 删除错误的remote（如果存在）
git remote remove github

# 添加正确的remote
git remote add github https://github.com/jinshenjinsi/ai-headshot-generator.git

# 验证remote配置
git remote -v

# 推送到GitHub
git push github main

# 或使用origin（更标准）
git push origin main

# 如果需要使用HTTPS认证
git push https://github.com/jinshenjinsi/ai-headshot-generator.git main

# 或使用SSH（需要配置SSH密钥）
git remote set-url origin git@github.com:jinshenjinsi/ai-headshot-generator.git
git push origin main
```

### PM2 进程管理（服务器）

```bash
# 启动应用
pm2 start ecosystem.config.js

# 重启应用
pm2 restart ai-headshot-generator

# 使用--update-env更新环境变量后重启
pm2 restart ai-headshot-generator --update-env

# 停止应用
pm2 stop ai-headshot-generator

# 删除应用
pm2 delete ai-headshot-generator

# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs ai-headshot-generator

# 查看最近20行日志
pm2 logs ai-headshot-generator --lines 20

# 实时监控日志
pm2 logs ai-headshot-generator --nostream
```

### SSH 服务器管理

```bash
# 连接到服务器
sshpass -p "Zjdyjyx821105" ssh -o StrictHostKeyChecking=no root@218.244.144.154

# 在服务器上执行命令
sshpass -p "Zjdyjyx821105" ssh -o StrictHostKeyChecking=no root@218.244.144.154 "cd /home/admin/yuanyi/ai-headshot-generator && git pull origin main"

# 在服务器上执行迁移
sshpass -p "Zjdyjyx821105" ssh -o StrictHostKeyChecking=no root@218.244.144.154 "export DATABASE_URL='postgresql://postgres:Ai-headshot123@pgm-bp1fjoyt926vgd7c.pg.rds.aliyuncs.com:5432/postgres' && cd /home/admin/yuanyi/ai-headshot-generator && pnpm drizzle-kit migrate"
```

---

## 📝 版本历史

| 版本 | 说明 | 日期 |
|------|------|------|
| v1.0.9 | 初始版本 | 2026-02-02 |
| v1.1.0 | 修复OAUTH_SERVER_URL | 2026-03-10 |
| v1.1.3 | 修复OAUTH_SERVER_URL环境变量配置 | 2026-03-10 |
| v1.1.4 | 将照片存储从S3改为PostgreSQL | 2026-03-10 |
| v1.1.5 | 在ecosystem.config.js中配置DATABASE_URL | 2026-03-10 |
| v1.1.6 | 修复ecosystem.config.js从环境变量读取DATABASE_URL | 2026-03-10 |

---

## 🔧 环境变量配置

### 开发环境 (.env.local)
```
DATABASE_URL=postgresql://postgres:Ai-headshot123@pgm-bp1fjoyt926vgd7c.pg.rds.aliyuncs.com:5432/postgres
OAUTH_SERVER_URL=http://218.244.144.154:3000
NODE_ENV=development
PORT=3000
```

### 生产环境 (ecosystem.config.js)
```javascript
env: {
  NODE_ENV: "production",
  PORT: 3000,
  DATABASE_URL: "postgresql://postgres:Ai-headshot123@pgm-bp1fjoyt926vgd7c.pg.rds.aliyuncs.com:5432/postgres",
  OAUTH_SERVER_URL: "http://218.244.144.154:3000",
  BAILIAN_API_KEY: process.env.BAILIAN_API_KEY || "",
  BAILIAN_AGENT_ID: process.env.BAILIAN_AGENT_ID || "",
}
```

---

## 📁 项目结构

```
ai-headshot-generator/
├── app/                          # 移动应用前端（Expo Router）
│   ├── (tabs)/                   # 标签页导航
│   │   ├── index.tsx             # 首页
│   │   ├── generating.tsx        # 生成中页面
│   │   └── style-result.tsx      # 结果页面
│   ├── _layout.tsx               # 根布局
│   └── oauth/                    # OAuth回调处理
├── server/                       # 后端服务
│   ├── _core/
│   │   ├── index.ts              # Express服务器入口
│   │   ├── env.ts                # 环境变量配置
│   │   ├── trpc.ts               # tRPC配置
│   │   ├── context.ts            # tRPC上下文
│   │   └── oauth.ts              # OAuth处理
│   ├── db.ts                     # 数据库查询函数
│   ├── routers.ts                # tRPC路由定义
│   └── bailian-service.ts        # AI生成服务
├── drizzle/                      # 数据库迁移
│   ├── schema.ts                 # 数据库schema定义
│   ├── 0000_odd_sway.sql         # 迁移文件
│   └── meta/                     # 迁移元数据
├── components/                   # React组件
│   ├── screen-container.tsx      # 屏幕容器
│   ├── themed-view.tsx           # 主题视图
│   └── ui/                       # UI组件
├── lib/                          # 工具库
│   ├── trpc.ts                   # tRPC客户端
│   ├── utils.ts                  # 工具函数
│   └── theme-provider.tsx        # 主题提供者
├── hooks/                        # React Hooks
│   ├── use-colors.ts             # 颜色Hook
│   ├── use-auth.ts               # 认证Hook
│   └── use-color-scheme.ts       # 主题Hook
├── constants/                    # 常量
│   └── theme.ts                  # 主题配置
├── assets/                       # 资源文件
│   └── images/                   # 图片资源
├── ecosystem.config.js           # PM2配置
├── app.config.ts                 # Expo配置
├── tailwind.config.js            # Tailwind CSS配置
├── theme.config.js               # 主题配置
├── drizzle.config.ts             # Drizzle配置
├── package.json                  # 项目依赖
├── tsconfig.json                 # TypeScript配置
└── README.md                     # 项目文档
```

---

## 🔑 关键文件说明

### 后端核心文件

| 文件 | 说明 |
|------|------|
| `server/_core/index.ts` | Express服务器，定义API端点 |
| `server/routers.ts` | tRPC路由，定义RPC方法 |
| `server/db.ts` | 数据库查询函数 |
| `drizzle/schema.ts` | 数据库表定义 |
| `ecosystem.config.js` | PM2进程管理配置 |

### 前端核心文件

| 文件 | 说明 |
|------|------|
| `app/(tabs)/index.tsx` | 首页 |
| `app/generating.tsx` | 生成中页面 |
| `app/style-result.tsx` | 结果展示页面 |
| `lib/trpc.ts` | tRPC客户端 |
| `hooks/use-auth.ts` | 认证状态管理 |

---

## 🐛 常见问题和解决方案

### 问题1: 开发服务器无响应
```bash
# 解决方案：重启服务器
pnpm dev

# 或在服务器上重启PM2
pm2 restart ai-headshot-generator --update-env
```

### 问题2: 数据库连接失败
```bash
# 确保DATABASE_URL环境变量已设置
export DATABASE_URL='postgresql://postgres:Ai-headshot123@pgm-bp1fjoyt926vgd7c.pg.rds.aliyuncs.com:5432/postgres'

# 执行迁移
pnpm drizzle-kit migrate
```

### 问题3: 照片上传失败
```bash
# 检查后端日志
pm2 logs ai-headshot-generator

# 确保数据库表已创建
pnpm db:push
```

---

## 📚 相关文档

- [Expo官方文档](https://docs.expo.dev)
- [React Native文档](https://reactnative.dev)
- [tRPC文档](https://trpc.io)
- [Drizzle ORM文档](https://orm.drizzle.team)
- [NativeWind文档](https://www.nativewind.dev)

---

## 🎯 快速参考

### Mac上的完整设置流程
```bash
# 1. 清理旧项目
rm -rf ~/ai-headshot-generator

# 2. 克隆最新代码
git clone https://github.com/jinshenjinsi/ai-headshot-generator.git ~/ai-headshot-generator

# 3. 进入项目
cd ~/ai-headshot-generator

# 4. 安装依赖
pnpm install

# 5. 启动开发服务器
pnpm dev

# 6. 在浏览器中打开 http://localhost:8081
# 或在手机上扫描QR码
```

### 本地开发流程
```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm dev

# 3. 在浏览器中打开 http://localhost:8081
# 或在手机上扫描QR码

# 4. 修改代码后自动热重载
```

### 部署流程
```bash
# 1. 提交代码
git add -A
git commit -m "v1.1.7: 新功能描述"

# 2. 配置Git remote（如果需要）
git remote remove github
git remote add github https://github.com/jinshenjinsi/ai-headshot-generator.git

# 3. 推送到GitHub
git push github main

# 4. 在服务器上拉取代码
ssh root@218.244.144.154
cd /home/admin/yuanyi/ai-headshot-generator
git pull origin main

# 5. 编译和重启
pnpm install
pnpm run build
pm2 restart ai-headshot-generator --update-env

# 6. 查看日志确认启动成功
pm2 logs ai-headshot-generator
```

---

**最后更新**: 2026-03-10  
**维护者**: Manus AI Agent
