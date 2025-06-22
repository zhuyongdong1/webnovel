const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/auth');

// 管理员登录
router.post('/login', adminController.login);

// 以下路由需要验证JWT令牌
router.use(verifyToken);

// 获取管理员信息
router.get('/profile', adminController.getProfile);

// 修改密码
router.put('/change-password', adminController.changePassword);

module.exports = router;
