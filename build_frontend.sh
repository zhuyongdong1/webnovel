# 前端构建脚本
#!/bin/bash

# 进入前端项目目录
cd /www/wwwroot/ulbooks.cn/frontend

# 安装依赖
echo "正在安装前端依赖..."
npm install

# 构建生产环境代码
echo "正在构建前端代码..."
npm run build

echo "前端构建完成！"
