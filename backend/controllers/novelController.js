const { Novel, Chapter, Category, NovelCategory, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

// 获取所有小说列表（分页）
exports.getAllNovels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Novel.findAndCountAll({
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true
    });
    
    res.status(200).json({
      success: true,
      data: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        novels: rows
      }
    });
  } catch (error) {
    console.error('获取小说列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取小说详情
exports.getNovelById = async (req, res) => {
  try {
    const { id } = req.params;
    const [novels] = await db.query(`
      SELECT n.*, GROUP_CONCAT(c.name) as categories
      FROM novels n
      LEFT JOIN novel_categories nc ON n.id = nc.novel_id
      LEFT JOIN categories c ON nc.category_id = c.id
      WHERE n.id = ?
      GROUP BY n.id
    `, [id]);

    if (novels.length === 0) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }

    // 更新浏览次数
    await db.query('UPDATE novels SET view_count = view_count + 1 WHERE id = ?', [id]);

    res.json({
      success: true,
      data: novels[0]
    });
  } catch (error) {
    console.error('获取小说详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取小说详情失败'
    });
  }
};

// 创建新小说
exports.createNovel = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { title, author, description, status, categories } = req.body;
    
    // 验证必填字段
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: '标题和作者不能为空'
      });
    }
    
    // 处理封面图片路径
    let coverImage = null;
    if (req.file) {
      // 将路径转换为相对路径，用于前端访问
      coverImage = `/uploads/covers/${path.basename(req.file.path)}`;
    }
    
    // 创建小说
    const novel = await Novel.create({
      title,
      author,
      cover_image: coverImage,
      description: description || '',
      status: status || 0,
      word_count: 0,
      view_count: 0
    }, { transaction });
    
    // 处理分类
    if (categories && categories.length > 0) {
      const categoryIds = Array.isArray(categories) ? categories : [categories];
      
      // 检查分类是否存在
      const existingCategories = await Category.findAll({
        where: { id: { [Op.in]: categoryIds } }
      });
      
      if (existingCategories.length !== categoryIds.length) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '部分分类不存在'
        });
      }
      
      // 创建小说与分类的关联
      const novelCategories = categoryIds.map(categoryId => ({
        novel_id: novel.id,
        category_id: categoryId
      }));
      
      await NovelCategory.bulkCreate(novelCategories, { transaction });
    }
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: '小说创建成功',
      data: { novel }
    });
  } catch (error) {
    await transaction.rollback();
    
    // 如果上传了文件但创建失败，删除文件
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('删除文件失败:', err);
      });
    }
    
    console.error('创建小说错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 更新小说信息
exports.updateNovel = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { title, author, description, status, categories } = req.body;
    
    // 查找小说
    const novel = await Novel.findByPk(id);
    
    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }
    
    // 处理封面图片
    let coverImage = novel.cover_image;
    if (req.file) {
      // 如果有新上传的封面，删除旧封面
      if (novel.cover_image) {
        const oldCoverPath = path.join(__dirname, '..', novel.cover_image);
        if (fs.existsSync(oldCoverPath)) {
          fs.unlinkSync(oldCoverPath);
        }
      }
      
      // 更新为新封面路径
      coverImage = `/uploads/covers/${path.basename(req.file.path)}`;
    }
    
    // 更新小说信息
    await novel.update({
      title: title || novel.title,
      author: author || novel.author,
      cover_image: coverImage,
      description: description !== undefined ? description : novel.description,
      status: status !== undefined ? status : novel.status
    }, { transaction });
    
    // 处理分类
    if (categories) {
      const categoryIds = Array.isArray(categories) ? categories : [categories];
      
      // 检查分类是否存在
      const existingCategories = await Category.findAll({
        where: { id: { [Op.in]: categoryIds } }
      });
      
      if (existingCategories.length !== categoryIds.length) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '部分分类不存在'
        });
      }
      
      // 删除旧的关联
      await NovelCategory.destroy({
        where: { novel_id: id },
        transaction
      });
      
      // 创建新的关联
      const novelCategories = categoryIds.map(categoryId => ({
        novel_id: novel.id,
        category_id: categoryId
      }));
      
      await NovelCategory.bulkCreate(novelCategories, { transaction });
    }
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: '小说更新成功',
      data: { novel }
    });
  } catch (error) {
    await transaction.rollback();
    
    // 如果上传了文件但更新失败，删除文件
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('删除文件失败:', err);
      });
    }
    
    console.error('更新小说错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 删除小说
exports.deleteNovel = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // 查找小说
    const novel = await Novel.findByPk(id);
    
    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }
    
    // 删除封面图片
    if (novel.cover_image) {
      const coverPath = path.join(__dirname, '..', novel.cover_image);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }
    
    // 删除小说（关联的章节、分类关联和阅读记录会通过外键级联删除）
    await novel.destroy({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: '小说删除成功'
    });
  } catch (error) {
    await transaction.rollback();
    
    console.error('删除小说错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取推荐小说
exports.getRecommendedNovels = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const safeLimit = parseInt(limit) || 6;
    const [novels] = await db.query(`
      SELECT n.*, GROUP_CONCAT(c.name) as categories
      FROM novels n
      LEFT JOIN novel_categories nc ON n.id = nc.novel_id
      LEFT JOIN categories c ON nc.category_id = c.id
      GROUP BY n.id
      ORDER BY n.view_count DESC
      LIMIT ${safeLimit}
    `);

    res.json({
      success: true,
      data: novels
    });
  } catch (error) {
    console.error('获取推荐小说失败:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐小说失败'
    });
  }
};

// 获取新书榜
exports.getNewNovels = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const safeLimit = parseInt(limit) || 10;
    const [novels] = await db.query(`
      SELECT n.*, GROUP_CONCAT(c.name) as categories
      FROM novels n
      LEFT JOIN novel_categories nc ON n.id = nc.novel_id
      LEFT JOIN categories c ON nc.category_id = c.id
      GROUP BY n.id
      ORDER BY n.created_at DESC
      LIMIT ${safeLimit}
    `);

    res.json({
      success: true,
      data: novels
    });
  } catch (error) {
    console.error('获取最新小说失败:', error);
    res.status(500).json({
      success: false,
      message: '获取最新小说失败'
    });
  }
};

// 获取热门榜
exports.getHotNovels = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const safeLimit = parseInt(limit) || 10;
    const [novels] = await db.query(`
      SELECT n.*, GROUP_CONCAT(c.name) as categories
      FROM novels n
      LEFT JOIN novel_categories nc ON n.id = nc.novel_id
      LEFT JOIN categories c ON nc.category_id = c.id
      GROUP BY n.id
      ORDER BY n.view_count DESC
      LIMIT ${safeLimit}
    `);

    res.json({
      success: true,
      data: novels
    });
  } catch (error) {
    console.error('获取热门小说失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门小说失败'
    });
  }
};

// 按分类获取小说
exports.getNovelsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // 检查分类是否存在
    const category = await Category.findByPk(categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }
    
    // 查询该分类下的小说
    const { count, rows } = await Novel.findAndCountAll({
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          where: { id: categoryId }
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true
    });
    
    res.status(200).json({
      success: true,
      data: {
        category,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        novels: rows
      }
    });
  } catch (error) {
    console.error('按分类获取小说错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 搜索小说
exports.searchNovels = async (req, res) => {
  try {
    const { keyword } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }
    
    const { count, rows } = await Novel.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { author: { [Op.like]: `%${keyword}%` } }
        ]
      },
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true
    });
    
    res.status(200).json({
      success: true,
      data: {
        keyword,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        novels: rows
      }
    });
  } catch (error) {
    console.error('搜索小说错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
