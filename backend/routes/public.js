const express = require('express');
const router = express.Router();
const novelController = require('../controllers/novelController');
const categoryController = require('../controllers/categoryController');
const chapterController = require('../controllers/chapterController');

// 首页数据
router.get('/home', async (req, res) => {
  try {
    // 获取推荐小说
    const recommendedNovels = await novelController.getRecommendedNovels(req, res);
    
    // 获取分类列表
    const categories = await categoryController.getAllCategories(req, res);
    
    // 获取新书榜
    const newNovels = await novelController.getNewNovels(req, res);
    
    // 获取热门榜
    const hotNovels = await novelController.getHotNovels(req, res);
    
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
