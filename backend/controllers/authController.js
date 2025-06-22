const User = require('../models/User');
const SmsCode = require('../models/SmsCode');
const { sendSms } = require('../config/sms');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 生成随机验证码
const generateCode = () => {
    return Math.random().toString().slice(-6);
};

// 生成JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 发送验证码
exports.sendVerificationCode = async (req, res) => {
    try {
        const { phone, type } = req.body;
        
        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ message: '无效的手机号格式' });
        }

        // 如果是注册，检查手机号是否已注册
        if (type === 1) {
            const existingUser = await User.findByPhone(phone);
            if (existingUser) {
                return res.status(400).json({ message: '该手机号已注册' });
            }
        }

        // 生成验证码
        const code = generateCode();
        
        // 发送短信
        await sendSms(phone, code, type);
        
        // 保存验证码
        await SmsCode.create(phone, code, type);

        res.json({ message: '验证码已发送' });
    } catch (error) {
        console.error('发送验证码失败:', error);
        res.status(500).json({ message: '发送验证码失败' });
    }
};

// 注册
exports.register = async (req, res) => {
    try {
        const { phone, code, nickname } = req.body;

        // 验证验证码
        const smsCode = await SmsCode.verify(phone, code, 1);
        if (!smsCode) {
            return res.status(400).json({ message: '验证码无效或已过期' });
        }

        // 创建用户
        const userId = await User.create({
            phone,
            nickname: nickname || `用户${phone.slice(-4)}`
        });

        // 删除已使用的验证码
        await SmsCode.delete(phone, 1);

        // 生成token
        const token = generateToken(userId);

        res.json({
            message: '注册成功',
            token,
            user: {
                id: userId,
                phone,
                nickname
            }
        });
    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({ message: '注册失败' });
    }
};

// 登录
exports.login = async (req, res) => {
    try {
        const { phone, code } = req.body;

        // 验证验证码
        const smsCode = await SmsCode.verify(phone, code, 2);
        if (!smsCode) {
            return res.status(400).json({ message: '验证码无效或已过期' });
        }

        // 查找用户
        let user = await User.findByPhone(phone);
        
        // 如果用户不存在，自动注册
        if (!user) {
            const userId = await User.create({
                phone,
                nickname: `用户${phone.slice(-4)}`
            });
            user = await User.findByPhone(phone);
        }

        // 更新最后登录时间
        await User.updateLastLogin(user.id);

        // 删除已使用的验证码
        await SmsCode.delete(phone, 2);

        // 生成token
        const token = generateToken(user.id);

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                phone: user.phone,
                nickname: user.nickname,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ message: '登录失败' });
    }
}; 