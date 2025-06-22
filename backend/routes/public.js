const express = require('express');
const router = express.Router();
const novelController = require('../controllers/novelController');
const categoryController = require('../controllers/categoryController');
const chapterController = require('../controllers/chapterController');
const db = require('../config/database');

// 首页数据 - 重构为不调用响应方法的版本
router.get('/home', async (req, res) => {
  try {
    // 获取推荐小说数据
    const [recommendedNovels] = await db.query(`
      SELECT n.*, GROUP_CONCAT(c.name) as categories
      FROM novels n
      LEFT JOIN novel_categories nc ON n.id = nc.novel_id
      LEFT JOIN categories c ON nc.category_id = c.id
      GROUP BY n.id
      ORDER BY n.view_count DESC
      LIMIT 6
    `);
    
    // 获取分类列表数据
    const [categories] = await db.query('SELECT * FROM categories ORDER BY id ASC');
    
    // 获取新书榜数据
    const [newNovels] = await db.query(`
      SELECT n.*, GROUP_CONCAT(c.name) as categories
      FROM novels n
      LEFT JOIN novel_categories nc ON n.id = nc.novel_id
      LEFT JOIN categories c ON nc.category_id = c.id
      GROUP BY n.id
      ORDER BY n.created_at DESC
      LIMIT 10
    `);
    
    // 获取热门榜数据
    const [hotNovels] = await db.query(`
      SELECT n.*, GROUP_CONCAT(c.name) as categories
      FROM novels n
      LEFT JOIN novel_categories nc ON n.id = nc.novel_id
      LEFT JOIN categories c ON nc.category_id = c.id
      GROUP BY n.id
      ORDER BY n.view_count DESC
      LIMIT 10
    `);
    
    res.status(200).json({
      success: true,
      data: {
        recommendedNovels,
        categories,
        newNovels,
        hotNovels
      }
    });
  } catch (error) {
    console.error('获取首页数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 获取推荐小说
router.get('/recommended', novelController.getRecommendedNovels);

// 获取新书榜
router.get('/new-novels', novelController.getNewNovels);

// 获取热门榜
router.get('/hot-novels', novelController.getHotNovels);

// 获取所有分类
router.get('/categories', categoryController.getAllCategories);

// 搜索小说
router.get('/search', novelController.searchNovels);

module.exports = router;
