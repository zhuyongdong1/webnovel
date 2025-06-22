const { Category } = require('../models');
const db = require('../config/database');

// 获取所有分类
exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY id ASC');
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败'
    });
  }
};

// 获取分类详情
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      data: categories[0]
    });
  } catch (error) {
    console.error('获取分类详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类详情失败'
    });
  }
};

// 获取分类下的小说
exports.getCategoryNovels = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [novels] = await db.query(`
      SELECT n.*, GROUP_CONCAT(c.name) as categories
      FROM novels n
      LEFT JOIN novel_categories nc ON n.id = nc.novel_id
      LEFT JOIN categories c ON nc.category_id = c.id
      WHERE nc.category_id = ?
      GROUP BY n.id
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `, [id, parseInt(limit), offset]);

    const [total] = await db.query(`
      SELECT COUNT(DISTINCT n.id) as total
      FROM novels n
      LEFT JOIN novel_categories nc ON n.id = nc.novel_id
      WHERE nc.category_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        novels,
        pagination: {
          total: total[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取分类小说失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类小说失败'
    });
  }
};

// 创建分类
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }
    
    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({
      where: { name }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: '分类名称已存在'
      });
    }
    
    // 创建分类
    const category = await Category.create({
      name,
      description: description || ''
    });
    
    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: { category }
    });
  } catch (error) {
    console.error('创建分类错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 更新分类
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // 查找分类
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }
    
    // 如果要更新名称，检查是否与其他分类冲突
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { name }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: '分类名称已存在'
        });
      }
    }
    
    // 更新分类
    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description
    });
    
    res.status(200).json({
      success: true,
      message: '分类更新成功',
      data: { category }
    });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 删除分类
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找分类
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }
    
    // 删除分类
    await category.destroy();
    
    res.status(200).json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
