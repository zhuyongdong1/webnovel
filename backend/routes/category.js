const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../middlewares/auth');

// 公共路由 - 不需要验证JWT令牌
// 获取所有分类
router.get('/', categoryController.getAllCategories);

// 获取分类详情
router.get('/:id', categoryController.getCategoryById);

// 获取分类下的小说
router.get('/:id/novels', categoryController.getCategoryNovels);

// 以下路由需要验证JWT令牌
router.use(verifyToken);

// 创建分类
router.post('/', categoryController.createCategory);

// 更新分类
router.put('/:id', categoryController.updateCategory);

// 删除分类
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
