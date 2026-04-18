# 研究生自我管理系统

基于 Next.js 15 的全栈应用，用于管理工作打卡、摄入记录、运动统计和待办事项。

## 技术栈

- **前端**: Next.js 15 (App Router) + React 19 + Tailwind CSS + shadcn/ui
- **后端**: Next.js API Routes
- **数据库**: MySQL + Prisma ORM
- **认证**: NextAuth.js v5

## 功能模块

- 🔐 **用户认证** - 注册、登录、个人信息管理
- ⏰ **打卡记录** - 工作/休息计时、时段管理
- ☕ **摄入记录** - 咖啡、饮水记录与统计
- 🚻 **如厕记录** - 简单记录与统计
- 🏃 **运动记录** - 多种运动类型、热量消耗
- ✅ **待办清单** - 任务管理与完成状态
- 📊 **统计分析** - 周/月/年数据可视化

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
DATABASE_URL="mysql://用户名:密码@localhost:3306/数据库名"
AUTH_SECRET="你的密钥"
```

### 3. 初始化数据库

```bash
npx prisma db push
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/
│   ├── (dashboard)/     # 需要登录的页面
│   ├── api/             # API 路由
│   ├── login/           # 登录页
│   └── register/        # 注册页
├── components/
│   ├── layout/          # 布局组件
│   └── ui/              # shadcn/ui 组件
└── lib/
    ├── auth.ts          # NextAuth 配置
    └── prisma.ts        # Prisma 客户端
```

## 部署

### 云服务器部署

1. 构建生产版本：
```bash
npm run build
```

2. 使用 PM2 管理进程：
```bash
pm2 start npm --name "graduate-management" -- start
```

### Docker 部署

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 数据库迁移

修改 `prisma/schema.prisma` 后：

```bash
npx prisma migrate dev --name 描述
```

## License

MIT
