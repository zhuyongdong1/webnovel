#!/bin/bash

# 后端启动脚本
# 可移植版本，使用相对路径

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 进入后端项目目录
cd "${SCRIPT_DIR}/backend"

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
