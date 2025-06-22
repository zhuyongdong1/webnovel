const express = require('express');
const router = express.Router();
const novelController = require('../controllers/novelController');
const { verifyToken } = require('../middlewares/auth');
const { uploadCover } = require('../middlewares/upload');

// 公共路由 - 不需要验证JWT令牌
// 获取小说列表
router.get('/', novelController.getAllNovels);

// 获取推荐小说 (必须在 /:id 之前)
router.get('/recommended/list', novelController.getRecommendedNovels);

// 获取新书榜 (必须在 /:id 之前)
router.get('/ranking/new', novelController.getNewNovels);

// 获取热门榜 (必须在 /:id 之前)
router.get('/ranking/hot', novelController.getHotNovels);

// 获取小说详情 (放在最后，避免路由冲突)
router.get('/:id', novelController.getNovelById);

// 按分类获取小说
router.get('/category/:categoryId', novelController.getNovelsByCategory);

// 搜索小说
router.get('/search/query', novelController.searchNovels);

// 以下路由需要验证JWT令牌
router.use(verifyToken);

// 创建小说（包含封面上传）
router.post('/', uploadCover, novelController.createNovel);

// 更新小说（包含封面上传）
router.put('/:id', uploadCover, novelController.updateNovel);

// 删除小说
router.delete('/:id', novelController.deleteNovel);

module.exports = router;
