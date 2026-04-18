# 研究生自我管理系统

一个基于 Next.js 15 的全栈研究生日常管理应用，帮助追踪饮水、咖啡、运动、如厕、待办事项等，并支持私密空间功能。

## 功能特性

### 📊 核心功能模块

```mermaid
graph TB
    subgraph "主要功能"
        A[饮水追踪] --> D[统计分析]
        B[咖啡记录] --> D
        C[运动记录] --> D
        E[如厕记录] --> D
        F[待办事项] --> D
        G[工作/休息时段] --> D
    end

    subgraph "私密空间"
        H[加密存储]
        I[密码保护]
        J[数据导出/导入]
    end

    D --> K[交互式图表]
    D --> L[日期范围筛选]
```

### 🔐 私密空间架构

```mermaid
flowchart LR
    subgraph "客户端加密流程"
        A[用户密码] --> B[PBKDF2<br/>100,000次迭代]
        B --> C[256位密钥]
        C --> D[AES-GCM 加密]
        D --> E[IndexedDB<br/>本地存储]
    end

    subgraph "安全特性"
        F[每次刷新需验证]
        G[端到端加密]
        H[数据不离开设备]
    end

    E --> F
    D --> G
    E --> H
```

## 技术栈

```mermaid
mindmap
  root((技术栈))
    前端
      Next.js 15
      React 19
      TypeScript
      Tailwind CSS
      shadcn/ui
    后端
      Next.js API Routes
      Prisma ORM
      SQLite
    认证
      NextAuth.js
    加密
      Web Crypto API
      PBKDF2
      AES-GCM
    图表
      Recharts
```

## 项目结构

```
├── prisma/                 # 数据库模型
│   └── schema.prisma
├── public/                 # 静态资源
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (dashboard)/   # 仪表盘页面
│   │   │   ├── exercise/  # 运动记录
│   │   │   ├── intake/    # 饮水/咖啡
│   │   │   ├── private/   # 私密空间
│   │   │   ├── stats/     # 统计分析
│   │   │   ├── todo/      # 待办事项
│   │   │   └── toilet/    # 如厕记录
│   │   ├── api/           # API 路由
│   │   ├── login/         # 登录页
│   │   └── register/      # 注册页
│   ├── components/        # React 组件
│   │   ├── layout/        # 布局组件
│   │   ├── stats/         # 统计图表
│   │   └── ui/            # UI 基础组件
│   ├── hooks/             # 自定义 Hooks
│   ├── lib/               # 工具函数
│   │   ├── auth.ts        # 认证配置
│   │   ├── encryption.ts  # 加密工具
│   │   └── private-db.ts  # 私密空间存储
│   └── types/             # TypeScript 类型
└── package.json
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装步骤

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 DATABASE_URL 和 AUTH_SECRET

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可使用。

## 数据流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant C as 客户端
    participant A as API
    participant D as 数据库

    Note over U,D: 普通数据流程
    U->>C: 添加饮水记录
    C->>A: POST /api/water
    A->>D: Prisma create
    D-->>A: 返回数据
    A-->>C: JSON 响应
    C-->>U: 更新界面

    Note over U,C: 私密空间流程
    U->>C: 添加私密记录
    C->>C: 本地加密
    C->>C: 存储到 IndexedDB
    C-->>U: 更新界面
```

## 安全设计

```mermaid
graph TD
    subgraph "私密空间安全机制"
        A[用户输入密码] --> B{验证密码}
        B -->|成功| C[解密数据]
        B -->|失败| D[拒绝访问]
        C --> E[显示记录]

        F[刷新页面] --> G[清除会话]
        G --> H[重新验证]
    end

    subgraph "加密参数"
        I[PBKDF2 迭代: 100,000]
        J[AES-GCM 256-bit]
        K[随机盐值]
    end
```

## 许可证

MIT
