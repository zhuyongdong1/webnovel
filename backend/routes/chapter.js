const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const { verifyToken } = require('../middlewares/auth');

// 公共路由 - 不需要验证JWT令牌
// 获取章节内容
router.get('/:id', chapterController.getChapterById);

// 获取小说的所有章节
router.get('/novel/:novelId', chapterController.getChaptersByNovelId);

// 获取阅读进度
router.get('/progress/:novelId', chapterController.getReadingProgress);

// 以下路由需要验证JWT令牌
router.use(verifyToken);

// 创建章节
router.post('/', chapterController.createChapter);

// 更新章节
router.put('/:id', chapterController.updateChapter);

// 删除章节
router.delete('/:id', chapterController.deleteChapter);

// 批量导入章节
router.post('/bulk-import', chapterController.bulkImportChapters);

module.exports = router;
