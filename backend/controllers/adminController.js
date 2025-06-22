const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

// 管理员登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }
    
    // 查找管理员
    const admin = await Admin.findOne({ where: { username } });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 验证密码
    // 注意：在实际应用中，数据库中的密码应该是哈希过的
    // 这里为了简化示例，直接比较明文密码
    // 在生产环境中应该使用 bcrypt.compare(password, admin.password)
    const isMatch = password === admin.password;
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 更新最后登录时间
    await admin.update({ last_login: new Date() });
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取当前管理员信息
exports.getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        admin: req.admin
      }
    });
  } catch (error) {
    console.error('获取管理员信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '当前密码和新密码不能为空'
      });
    }
    
    const admin = await Admin.findByPk(req.admin.id);
    
    // 验证当前密码
    // 同样，这里简化处理，实际应使用 bcrypt.compare
    const isMatch = currentPassword === admin.password;
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '当前密码错误'
      });
    }
    
    // 更新密码
    // 实际应用中应该对新密码进行哈希处理
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    await admin.update({ password: newPassword });
    
    res.status(200).json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
