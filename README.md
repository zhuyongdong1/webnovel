# 小说阅读网站

一个功能完整的在线小说阅读平台，支持小说分类浏览、在线阅读、后台管理等功能。

## 🌟 项目特性

- 📚 **小说管理** - 支持小说的增删改查，封面图片上传
- 📑 **章节系统** - 完整的章节管理和在线阅读功能
- 🏷️ **分类系统** - 支持多种小说分类，方便用户浏览
- 👨‍💼 **管理后台** - 完善的后台管理界面
- 📱 **响应式设计** - 支持桌面端和移动端访问
- 🔍 **搜索功能** - 支持按书名、作者搜索
- 📊 **阅读统计** - 浏览量统计，阅读记录保存

## 🛠️ 技术栈

### 后端
- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **Sequelize** - ORM数据库操作
- **MySQL** - 关系型数据库
- **JWT** - 身份认证
- **Multer** - 文件上传处理
- **bcryptjs** - 密码加密

### 前端
- **Vue.js 3** - 前端框架
- **Vite** - 构建工具
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Element Plus** - UI组件库
- **Tailwind CSS** - CSS框架
- **Axios** - HTTP客户端

## 📁 项目结构

```
novel-website/
├── backend/                 # 后端代码
│   ├── app.js              # 应用入口
│   ├── models/             # 数据模型
│   ├── controllers/        # 控制器
│   ├── routes/             # 路由定义
│   ├── middlewares/        # 中间件
│   └── uploads/            # 文件上传目录
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── components/     # 公共组件
│   │   ├── router/         # 路由配置
│   │   └── api/            # API接口
│   └── dist/               # 构建输出
├── database_design.md      # 数据库设计文档
├── deployment_guide.md     # 部署指南
└── README.md              # 项目说明
```

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- MySQL >= 5.7
- npm 或 yarn

### 1. 克隆项目
```bash
git clone https://github.com/your-username/novel-website.git
cd novel-website
```

### 2. 安装依赖
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 配置数据库
1. 创建MySQL数据库
2. 执行 `backend/schema.sql` 创建数据表
3. 在 `backend/` 目录下创建 `.env` 文件：
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=novel_website
DB_USER=your_username
DB_PASS=your_password
JWT_SECRET=your_jwt_secret
```

### 4. 启动项目
```bash
# 启动后端服务 (端口: 3000)
./start_backend.sh

# 构建前端
./build_frontend.sh
```

### 5. 访问项目
- 前端网站: http://localhost (需要配置nginx)
- 后端API: http://localhost:3000
- 管理后台: http://localhost/admin

## 📚 API文档

### 公共接口
- `GET /api/novels` - 获取小说列表
- `GET /api/novels/:id` - 获取小说详情
- `GET /api/chapters/:novelId` - 获取章节列表
- `GET /api/categories` - 获取分类列表

### 管理接口 (需要认证)
- `POST /api/admin/login` - 管理员登录
- `POST /api/admin/novels` - 创建小说
- `PUT /api/admin/novels/:id` - 更新小说
- `DELETE /api/admin/novels/:id` - 删除小说

## 🎯 主要功能

### 用户端
- ✅ 小说列表浏览
- ✅ 小说详情查看
- ✅ 章节在线阅读
- ✅ 分类筛选
- ✅ 搜索功能
- ✅ 阅读记录保存

### 管理端
- ✅ 管理员登录
- ✅ 小说管理 (增删改查)
- ✅ 章节管理
- ✅ 分类管理
- ✅ 封面上传

## 🚀 部署

项目支持多种部署方式，详细部署说明请参考 [deployment_guide.md](deployment_guide.md)

### 使用 Docker (推荐)
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 手动部署
1. 服务器安装 Node.js、MySQL、Nginx
2. 上传代码并安装依赖
3. 配置数据库和环境变量
4. 使用 PM2 启动后端服务
5. 配置 Nginx 反向代理

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请提交 Issue 或通过以下方式联系：

- 项目地址: https://github.com/your-username/novel-website
- 问题反馈: https://github.com/your-username/novel-website/issues

---

⭐ 如果这个项目对您有帮助，请给个 Star 支持一下！ 