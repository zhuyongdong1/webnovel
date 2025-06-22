#!/bin/bash

# 前端构建脚本
# 可移植版本，使用相对路径

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 进入前端项目目录
cd "${SCRIPT_DIR}/frontend"

# 安装依赖
echo "正在安装前端依赖..."
npm install

# 构建生产环境代码
echo "正在构建前端代码..."
npm run build

echo "前端构建完成！"
