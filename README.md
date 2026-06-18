# 🛒 Evara - 全栈电商平台

一个功能完整的现代电商平台，基于 Next.js 14 全栈开发。
<img width="1905" height="1077" alt="image" src="https://github.com/user-attachments/assets/0b5c8325-ef8f-4d63-ab80-e8ae247dc117" />
<img width="1911" height="1034" alt="image" src="https://github.com/user-attachments/assets/141a4241-ea8a-4013-8be8-7b639b7115d1" />

<img width="1911" height="1034" alt="image" src="https://github.com/user-attachments/assets/4e9a73aa-5d7b-4670-8ef9-96f5097425d0" />

## ✨ 功能特性

### 🛍️ 用户端
- 商品浏览、搜索、分类筛选
- 图片搜索 & 条形码搜索
- 购物车 & 愿望清单
- 订单管理 & 订单追踪
- 用户评价 & 评分系统
- 多语言支持 (中/英/日/法/西)
- 多币种切换
- 深色模式
- 推送通知

### 🏪 卖家端
- 卖家仪表盘
- 商品管理 (CRUD / 批量上传)
- 订单管理
- 联盟营销

### 🔧 管理后台
- CMS 内容管理
- 营销活动管理
- 用户管理
- 公告系统

### 💳 其他
- NextAuth.js 身份认证 (支持 2FA)
- Prisma ORM + PostgreSQL
- 会员体系
- 订阅功能
- 发票生成
- SEO 优化 (JSON-LD 结构化数据)
- 响应式设计

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | PostgreSQL + Prisma ORM |
| 认证 | NextAuth.js |
| 部署 | Node.js / PM2 |

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL
- npm / yarn / pnpm

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/zhenyuduan98/evara.git
cd evara

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库连接等配置

# 初始化数据库
npx prisma migrate dev

# 填充示例数据
npx tsx seed-products.ts

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可预览。

## 📁 项目结构

```
src/
├── app/                # Next.js App Router 页面
│   ├── admin/         # 管理后台
│   ├── seller/        # 卖家中心
│   ├── products/      # 商品页面
│   ├── cart/          # 购物车
│   ├── account/       # 用户中心
│   └── api/           # API 路由
├── components/        # 可复用组件
│   ├── layout/       # 布局组件 (Header/Footer)
│   ├── home/         # 首页组件
│   ├── products/     # 商品相关组件
│   ├── search/       # 搜索组件
│   └── reviews/      # 评价组件
├── lib/              # 工具库
└── providers/        # Context Providers
```

## 📄 许可证

MIT License

## 👤 作者

[@zhenyuduan98](https://github.com/zhenyuduan98)
