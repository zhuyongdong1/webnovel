const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const User = require('../models/User');

// 验证JWT中间件
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供授权令牌'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供授权令牌'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 检查管理员是否存在
    const admin = await Admin.findByPk(decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '管理员不存在'
      });
    }
    
    // 将管理员信息添加到请求对象
    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '授权令牌已过期'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的授权令牌'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 游客模式中间件
const guestMiddleware = (req, res, next) => {
  req.isGuest = true;
  next();
};

// 用户认证中间件
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      req.isGuest = true;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      req.isGuest = true;
      return next();
    }

    req.user = user;
    req.isGuest = false;
    next();
  } catch (error) {
    req.isGuest = true;
    next();
  }
};

// 需要登录的中间件
const requireAuth = (req, res, next) => {
  if (req.isGuest) {
    return res.status(401).json({ message: '请先登录' });
  }
  next();
};

module.exports = {
  guestMiddleware,
  authMiddleware,
  requireAuth
};
