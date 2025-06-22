#!/bin/bash

# 后端启动脚本
# 适用于宝塔面板环境

# 进入后端项目目录
cd /www/novel_backend

# 安装依赖 (如果node_modules不存在)
echo "正在安装后端依赖..."
if [ ! -d "node_modules" ]; then
npm install
fi

# 确保日志目录存在
mkdir -p logs

# 使用PM2启动应用
echo "正在使用PM2启动后端..."
pm2 start app.js --name ulbooks-backend --log-date-format "YYYY-MM-DD HH:mm:ss" --merge-logs --output-log-file logs/output.log --error-log-file logs/error.log

echo "后端启动脚本执行完毕。请使用 'pm2 status' 查看应用状态。"
