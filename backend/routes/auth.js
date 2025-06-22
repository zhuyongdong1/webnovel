const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 发送验证码
router.post('/send-code', authController.sendVerificationCode);

// 注册
router.post('/register', authController.register);

// 登录
router.post('/login', authController.login);

module.exports = router; 