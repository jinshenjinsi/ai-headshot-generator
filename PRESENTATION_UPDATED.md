# AI头像生成器 - 更新后的命令使用指南

## 第1页：演示文稿更新说明

### 📋 本演示文稿的目的

这份演示文稿介绍了AI头像生成器项目中**最新补充的命令**，特别是：
- Mac上的项目清理和重新设置
- Git remote配置和推送
- 完整的工作流程

### 🎯 适用场景

- 👨‍💻 新开发者快速上手
- 🔄 项目重新设置（清理旧文件）
- 🐛 修复Git remote配置问题
- 📚 团队培训和文档参考

### 📅 更新时间

- 创建时间：2026-03-10
- 最新版本：v1.1.6
- 文档版本：COMMANDS.md (更新版)

---

## 第2页：为什么需要这些命令？

### 🔴 常见问题场景

**问题1：项目文件混乱**
- 旧的node_modules占用大量空间
- 依赖版本不一致
- 代码有冲突或不完整

**解决方案：** 完全清理后重新克隆

```bash
rm -rf ~/ai-headshot-generator
```

**问题2：Git remote配置错误**
- 推送时提示 `'github' does not appear to be a git repository`
- 无法连接到GitHub
- 分支配置混乱

**解决方案：** 重新配置Git remote

```bash
git remote remove github
git remote add github https://github.com/jinshenjinsi/ai-headshot-generator.git
```

**问题3：依赖安装不完整**
- 缺少@tanstack/react-query
- TypeScript编译错误
- 模块找不到

**解决方案：** 使用pnpm install重新安装

```bash
pnpm install
```

---

## 第3页：Mac上的完整项目设置

### 🍎 一步一步的设置流程

**步骤1：清理旧项目**
```bash
rm -rf ~/ai-headshot-generator
```
- 删除整个项目目录
- 包括node_modules（可能很大）
- 完全重新开始

**步骤2：克隆最新代码**
```bash
git clone https://github.com/jinshenjinsi/ai-headshot-generator.git ~/ai-headshot-generator
```
- 从GitHub获取最新版本（v1.1.6）
- 创建新的项目目录
- 包含完整的git历史

**步骤3：进入项目目录**
```bash
cd ~/ai-headshot-generator
```
- 必须在项目目录内执行后续命令
- 否则会出现"Command not found"错误

**步骤4：安装所有依赖**
```bash
pnpm install
```
- 下载并安装所有npm包
- 包括React Native、Expo、TypeScript等
- 包括@tanstack/react-query（解决编译错误）
- 可能需要2-5分钟

**步骤5：验证依赖安装**
```bash
pnpm list @tanstack/react-query
```
- 检查关键依赖是否正确安装
- 应该显示版本号，如 `@tanstack/react-query@5.90.12`

**步骤6：启动开发服务器**
```bash
pnpm dev
```
- 同时启动前端和后端
- 前端：http://localhost:8081
- 后端：http://localhost:3000

---

## 第4页：Git Remote 配置详解

### 🔗 什么是Git Remote？

**Git Remote** 是指向远程仓库（GitHub）的引用。

```
Local Repository (Mac)
        ↓
    git push
        ↓
Remote Repository (GitHub)
```

### ⚙️ 配置Git Remote的步骤

**步骤1：查看当前配置**
```bash
git remote -v
```

**输出示例：**
```
origin  https://github.com/jinshenjinsi/ai-headshot-generator.git (fetch)
origin  https://github.com/jinshenjinsi/ai-headshot-generator.git (push)
github  https://github.com/jinshenjinsi/ai-headshot-generator.git (fetch)
github  https://github.com/jinshenjinsi/ai-headshot-generator.git (push)
```

**步骤2：如果配置错误，删除旧的remote**
```bash
git remote remove github
```

**步骤3：添加正确的remote**
```bash
git remote add github https://github.com/jinshenjinsi/ai-headshot-generator.git
```

**步骤4：验证配置**
```bash
git remote -v
```

**步骤5：推送到GitHub**
```bash
git push github main
```

### 🔐 认证方式

**方式1：HTTPS（推荐用于初学者）**
```bash
git push https://github.com/jinshenjinsi/ai-headshot-generator.git main
```
- 需要输入GitHub用户名和密码（或token）
- 每次推送都需要认证

**方式2：SSH（推荐用于频繁推送）**
```bash
git remote set-url origin git@github.com:jinshenjinsi/ai-headshot-generator.git
git push origin main
```
- 需要配置SSH密钥
- 配置后无需每次输入密码

---

## 第5页：完整的开发工作流程

### 🔄 从开发到部署的完整流程

```
┌─────────────────────────────────────────────────────────┐
│ 步骤1：本地开发                                          │
├─────────────────────────────────────────────────────────┤
│ rm -rf ~/ai-headshot-generator                          │
│ git clone https://github.com/.../ai-headshot-generator  │
│ cd ~/ai-headshot-generator                              │
│ pnpm install                                            │
│ pnpm dev                                                │
│                                                         │
│ 修改代码 → 测试 → 验证功能                              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 步骤2：提交代码                                          │
├─────────────────────────────────────────────────────────┤
│ git add -A                                              │
│ git commit -m "v1.1.7: 新功能描述"                      │
│ git remote remove github (如果需要)                     │
│ git remote add github https://github.com/.../...        │
│ git push github main                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 步骤3：服务器部署                                        │
├─────────────────────────────────────────────────────────┤
│ ssh root@218.244.144.154                                │
│ cd /home/admin/yuanyi/ai-headshot-generator             │
│ git pull origin main                                    │
│ pnpm install && pnpm run build                          │
│ pm2 restart ai-headshot-generator --update-env          │
│ pm2 logs ai-headshot-generator                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 步骤4：验证部署                                          │
├─────────────────────────────────────────────────────────┤
│ ✅ 检查后端日志
│ ✅ 测试API端点
│ ✅ 验证照片上传功能
│ ✅ 检查数据库
└─────────────────────────────────────────────────────────┘
```

---

## 第6页：常见错误和解决方案

### ❌ 错误1：项目目录不存在

**错误信息：**
```
bash: pnpm: command not found
```

**原因：** 没有进入项目目录

**解决方案：**
```bash
cd ~/ai-headshot-generator
pwd  # 验证当前目录
pnpm dev
```

### ❌ 错误2：Git remote配置错误

**错误信息：**
```
fatal: 'github' does not appear to be a git repository
```

**原因：** remote名称不存在或配置错误

**解决方案：**
```bash
git remote -v  # 查看当前配置
git remote remove github  # 删除错误的remote
git remote add github https://github.com/jinshenjinsi/ai-headshot-generator.git
git remote -v  # 验证配置
git push github main
```

### ❌ 错误3：依赖安装不完整

**错误信息：**
```
error TS2305: Module '"@tanstack/react-query"' has no exported member 'createTRPCReact'
```

**原因：** @tanstack/react-query没有正确安装

**解决方案：**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm list @tanstack/react-query
```

### ❌ 错误4：推送被拒绝

**错误信息：**
```
error: failed to push some refs to 'https://github.com/...'
hint: Updates were rejected because the remote contains work that you do not have locally
```

**原因：** 远程仓库有本地没有的提交

**解决方案：**
```bash
git pull --rebase github main
git push github main
```

---

## 第7页：命令速查表

### 📋 Mac上最常用的命令

| 任务 | 命令 |
|------|------|
| **初始设置** | `rm -rf ~/ai-headshot-generator` |
| | `git clone https://github.com/.../ai-headshot-generator.git ~/ai-headshot-generator` |
| | `cd ~/ai-headshot-generator` |
| | `pnpm install` |
| **开发** | `pnpm dev` |
| | `pnpm check` |
| | `pnpm format` |
| **Git操作** | `git add -A` |
| | `git commit -m "v1.1.7: 描述"` |
| | `git remote -v` |
| | `git remote add github https://github.com/.../...` |
| | `git push github main` |
| **调试** | `pnpm list @tanstack/react-query` |
| | `git log --oneline` |

---

## 第8页：最佳实践建议

### ✅ 推荐做法

1. **定期清理项目**
   - 每月清理一次旧的node_modules
   - 保持项目目录整洁
   - 避免版本冲突

2. **使用有意义的commit消息**
   ```bash
   # ✅ 好
   git commit -m "v1.1.7: 修复照片上传功能"
   
   # ❌ 不好
   git commit -m "fix"
   ```

3. **定期推送代码**
   - 不要等到完成所有功能才推送
   - 每个功能完成后就推送
   - 避免丢失工作

4. **验证remote配置**
   - 推送前检查 `git remote -v`
   - 确保指向正确的仓库
   - 避免推送到错误的地方

### ❌ 避免做法

1. **不要手动删除.git目录**
   - 会导致版本历史丢失
   - 使用 `git remote` 命令管理

2. **不要在项目目录外执行pnpm命令**
   - 会导致"command not found"
   - 总是先 `cd ~/ai-headshot-generator`

3. **不要跳过pnpm install**
   - 依赖不完整会导致编译错误
   - 每次克隆或更新后都要运行

4. **不要忽视git错误**
   - 仔细阅读错误信息
   - 按照提示操作

---

## 第9页：快速参考 - 三种常见场景

### 场景1：全新开始（推荐新开发者）

```bash
# 完全清理
rm -rf ~/ai-headshot-generator

# 克隆最新代码
git clone https://github.com/jinshenjinsi/ai-headshot-generator.git ~/ai-headshot-generator

# 进入项目
cd ~/ai-headshot-generator

# 安装依赖
pnpm install

# 启动开发
pnpm dev

# 访问 http://localhost:8081
```

**耗时：** 5-10分钟（取决于网络速度）

### 场景2：修复Git问题

```bash
# 查看当前配置
git remote -v

# 删除错误的remote
git remote remove github

# 添加正确的remote
git remote add github https://github.com/jinshenjinsi/ai-headshot-generator.git

# 验证
git remote -v

# 推送
git push github main
```

**耗时：** 1-2分钟

### 场景3：部署到服务器

```bash
# 本地提交
git add -A
git commit -m "v1.1.7: 新功能"
git push github main

# 连接服务器
ssh root@218.244.144.154

# 服务器上操作
cd /home/admin/yuanyi/ai-headshot-generator
git pull origin main
pnpm install
pnpm run build
pm2 restart ai-headshot-generator --update-env
pm2 logs ai-headshot-generator
```

**耗时：** 3-5分钟

---

## 第10页：总结和下一步

### 📌 关键要点回顾

1. **项目清理** - 使用 `rm -rf` 完全删除旧目录
2. **克隆代码** - 从GitHub获取最新版本
3. **安装依赖** - `pnpm install` 确保所有依赖正确
4. **配置Git** - 正确配置remote指向GitHub
5. **开发工作流** - 本地开发 → 提交 → 推送 → 部署

### 🎯 下一步行动

**立即可以做：**
- [ ] 在Mac上完整执行一遍设置流程
- [ ] 验证 `pnpm dev` 能否正常启动
- [ ] 测试照片上传功能
- [ ] 检查后端日志

**本周要做：**
- [ ] 修复TypeScript编译错误
- [ ] 完整测试所有功能
- [ ] 更新版本号到v1.1.7

**本月要做：**
- [ ] 添加单元测试
- [ ] 优化性能
- [ ] 完善文档

### 📚 相关文档

- **COMMANDS.md** - 完整命令参考
- **README.md** - 项目介绍
- **server/README.md** - 后端文档
- **GitHub仓库** - https://github.com/jinshenjinsi/ai-headshot-generator

### 💬 获取帮助

如果遇到问题：
1. 查看错误信息
2. 参考COMMANDS.md中的常见问题
3. 查看后端日志 `pm2 logs ai-headshot-generator`
4. 检查GitHub Issues

---

## 附录：完整命令速查

### 初始化（第一次）
```bash
rm -rf ~/ai-headshot-generator
git clone https://github.com/jinshenjinsi/ai-headshot-generator.git ~/ai-headshot-generator
cd ~/ai-headshot-generator
pnpm install
pnpm list @tanstack/react-query
```

### 日常开发
```bash
cd ~/ai-headshot-generator
pnpm dev
```

### 提交和推送
```bash
git add -A
git commit -m "v1.1.7: 描述"
git remote -v
git push github main
```

### 修复问题
```bash
# 清理依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 修复Git
git remote remove github
git remote add github https://github.com/jinshenjinsi/ai-headshot-generator.git
git push github main

# 修复分支冲突
git pull --rebase github main
git push github main
```

### 部署
```bash
ssh root@218.244.144.154
cd /home/admin/yuanyi/ai-headshot-generator
git pull origin main
pnpm install
pnpm run build
pm2 restart ai-headshot-generator --update-env
pm2 logs ai-headshot-generator
```

---

**文档版本：** v1.0  
**最后更新：** 2026-03-10  
**维护者：** Manus AI Agent
