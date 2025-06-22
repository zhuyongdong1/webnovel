# 小说阅读网站部署文档

本文档详细说明如何在宝塔面板环境下部署小说阅读网站，包括前端、后端、数据库和Nginx配置等内容。

## 目录结构

部署后的目录结构建议如下：

```
/www/wwwroot/novel-website/
├── frontend/             # 前端项目目录
│   ├── dist/             # 构建后的静态文件
│   └── ...               # 其他前端源代码
├── backend/              # 后端项目目录
│   ├── uploads/          # 上传文件目录
│   │   └── covers/       # 小说封面图片目录
│   ├── app.js            # 后端入口文件
│   └── ...               # 其他后端源代码
└── database/             # 数据库相关文件
    └── schema.sql        # 数据库初始化脚本
```

## 一、环境准备

### 1.1 宝塔面板安装

确保已安装宝塔面板，并安装以下必要软件：

- Nginx 1.18+
- MySQL 5.7+
- Node.js 14+
- PM2 进程管理器

### 1.2 安装PM2

如果尚未安装PM2，请通过以下命令安装：

```bash
npm install -g pm2
```

## 二、数据库配置

### 2.1 创建数据库

1. 在宝塔面板中，进入【数据库】页面
2. 点击【添加数据库】，创建名为 `novel_website` 的数据库
3. 记录数据库用户名和密码，后续配置需要使用

### 2.2 导入数据库结构

1. 在宝塔面板中，进入【数据库】页面，选择刚创建的数据库
2. 点击【导入】，上传并导入 `schema.sql` 文件

## 三、后端部署

### 3.1 上传后端文件

1. 在宝塔面板中，进入【文件】页面
2. 创建目录 `/www/wwwroot/novel-website/backend`
3. 上传所有后端文件到该目录

### 3.2 配置环境变量

1. 在后端目录中创建 `.env` 文件（可复制 `.env.example` 并修改）
2. 修改以下配置项：

```
PORT=3000
DB_HOST=localhost
DB_USER=您的数据库用户名
DB_PASS=您的数据库密码
DB_NAME=novel_website
JWT_SECRET=自定义的JWT密钥（建议使用随机字符串）
NODE_ENV=production
```

### 3.3 创建上传目录

确保上传目录存在并设置正确权限：

```bash
mkdir -p /www/wwwroot/novel-website/backend/uploads/covers
chmod -R 755 /www/wwwroot/novel-website/backend/uploads
```

### 3.4 启动后端服务

使用提供的启动脚本启动后端服务：

```bash
cd /www/wwwroot/novel-website
chmod +x start_backend.sh
./start_backend.sh
```

## 四、前端部署

### 4.1 上传前端文件

1. 在宝塔面板中，进入【文件】页面
2. 创建目录 `/www/wwwroot/novel-website/frontend`
3. 上传所有前端文件到该目录

### 4.2 构建前端代码

使用提供的构建脚本构建前端代码：

```bash
cd /www/wwwroot/novel-website
chmod +x build_frontend.sh
./build_frontend.sh
```

构建完成后，前端静态文件将生成在 `/www/wwwroot/novel-website/frontend/dist` 目录中。

## 五、Nginx配置

### 5.1 创建网站

1. 在宝塔面板中，进入【网站】页面
2. 点击【添加站点】，填写您的域名（如 `novel.yourdomain.com`）
3. 选择纯静态，网站目录设置为 `/www/wwwroot/novel-website/frontend/dist`

### 5.2 配置Nginx

1. 在宝塔面板中，进入【网站】页面，找到刚创建的站点
2. 点击【设置】，然后点击【配置文件】
3. 将提供的 `nginx.conf` 文件内容复制替换原有配置
4. 修改 `server_name` 为您的实际域名
5. 点击【保存】

## 六、验证部署

### 6.1 检查服务状态

检查后端服务是否正常运行：

```bash
pm2 status
```

应该看到 `novel-website-backend` 服务状态为 `online`。

### 6.2 访问网站

在浏览器中访问您的域名（如 `http://novel.yourdomain.com`），应该能看到小说阅读网站首页。

### 6.3 测试后台管理

1. 访问 `http://novel.yourdomain.com/admin/login`
2. 使用默认管理员账号登录：
   - 用户名：admin
   - 密码：admin123
3. 登录后可以进行小说、章节和分类的管理

## 七、常见问题

### 7.1 图片无法显示

检查 Nginx 配置中的 `location /uploads/` 部分是否正确，确保路径指向正确的上传目录。

### 7.2 API 请求失败

检查 Nginx 配置中的 `location /api/` 部分是否正确，确保代理到正确的后端服务地址和端口。

### 7.3 后端服务无法启动

1. 检查 `.env` 文件配置是否正确
2. 检查 PM2 日志：`pm2 logs novel-website-backend`
3. 确保 Node.js 版本兼容（推荐 v14+）

### 7.4 数据库连接失败

1. 检查数据库用户名和密码是否正确
2. 确保数据库服务正常运行
3. 检查数据库用户是否有足够权限

## 八、备份与维护

### 8.1 数据库备份

建议定期备份数据库：

```bash
# 在宝塔面板中，可以设置定时备份任务
# 或使用命令行手动备份
mysqldump -u用户名 -p密码 novel_website > backup_$(date +%Y%m%d).sql
```

### 8.2 日志管理

后端日志位于：`/www/wwwroot/novel-website/backend/logs/`
Nginx 访问日志位于：`/www/wwwlogs/novel-website.access.log`
Nginx 错误日志位于：`/www/wwwlogs/novel-website.error.log`

定期检查日志以排查问题。

## 九、更新维护

### 9.1 前端更新

1. 上传新的前端代码
2. 重新运行构建脚本：`./build_frontend.sh`

### 9.2 后端更新

1. 上传新的后端代码
2. 重启后端服务：`pm2 restart novel-website-backend`

---

如有任何问题，请参考项目文档或联系开发人员。
