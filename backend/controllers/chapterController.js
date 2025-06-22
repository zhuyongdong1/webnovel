const { Chapter, Novel, ReadingRecord } = require('../models');

// 获取章节内容
exports.getChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const chapter = await Chapter.findByPk(id, {
      include: [
        {
          model: Novel,
          as: 'novel',
          attributes: ['id', 'title', 'author']
        }
      ]
    });
    
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }
    
    // 获取上一章和下一章的信息
    const prevChapter = await Chapter.findOne({
      where: {
        novel_id: chapter.novel_id,
        chapter_number: chapter.chapter_number - 1
      },
      attributes: ['id', 'title', 'chapter_number']
    });
    
    const nextChapter = await Chapter.findOne({
      where: {
        novel_id: chapter.novel_id,
        chapter_number: chapter.chapter_number + 1
      },
      attributes: ['id', 'title', 'chapter_number']
    });
    
    // 记录阅读进度（使用IP地址标识用户）
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    await ReadingRecord.findOrCreate({
      where: {
        novel_id: chapter.novel_id,
        ip_address: ip
      },
      defaults: {
        chapter_id: chapter.id,
        last_read_at: new Date()
      }
    }).then(([record, created]) => {
      if (!created) {
        // 如果记录已存在，则更新
        return record.update({
          chapter_id: chapter.id,
          last_read_at: new Date()
        });
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        chapter,
        prevChapter,
        nextChapter
      }
    });
  } catch (error) {
    console.error('获取章节内容错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取小说的所有章节
exports.getChaptersByNovelId = async (req, res) => {
  try {
    const { novelId } = req.params;
    
    // 检查小说是否存在
    const novel = await Novel.findByPk(novelId);
    
    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }
    
    // 获取章节列表（不包含内容）
    const chapters = await Chapter.findAll({
      where: { novel_id: novelId },
      attributes: ['id', 'title', 'chapter_number', 'word_count', 'created_at'],
      order: [['chapter_number', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: {
        novel: {
          id: novel.id,
          title: novel.title,
          author: novel.author
        },
        chapters
      }
    });
  } catch (error) {
    console.error('获取小说章节列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 创建新章节
exports.createChapter = async (req, res) => {
  try {
    const { novel_id, title, content, chapter_number } = req.body;
    
    // 验证必填字段
    if (!novel_id || !title || !content || chapter_number === undefined) {
      return res.status(400).json({
        success: false,
        message: '小说ID、标题、内容和章节序号不能为空'
      });
    }
    
    // 检查小说是否存在
    const novel = await Novel.findByPk(novel_id);
    
    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }
    
    // 检查章节序号是否已存在
    const existingChapter = await Chapter.findOne({
      where: {
        novel_id,
        chapter_number
      }
    });
    
    if (existingChapter) {
      return res.status(400).json({
        success: false,
        message: '该章节序号已存在'
      });
    }
    
    // 计算字数
    const wordCount = content.length;
    
    // 创建章节
    const chapter = await Chapter.create({
      novel_id,
      title,
      content,
      chapter_number,
      word_count: wordCount
    });
    
    // 更新小说总字数
    await novel.increment('word_count', { by: wordCount });
    
    res.status(201).json({
      success: true,
      message: '章节创建成功',
      data: {
        chapter: {
          id: chapter.id,
          title: chapter.title,
          chapter_number: chapter.chapter_number,
          word_count: chapter.word_count
        }
      }
    });
  } catch (error) {
    console.error('创建章节错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 更新章节
exports.updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, chapter_number } = req.body;
    
    // 查找章节
    const chapter = await Chapter.findByPk(id);
    
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }
    
    // 如果要更新章节序号，检查是否与其他章节冲突
    if (chapter_number !== undefined && chapter_number !== chapter.chapter_number) {
      const existingChapter = await Chapter.findOne({
        where: {
          novel_id: chapter.novel_id,
          chapter_number,
          id: { [Op.ne]: id } // 排除当前章节
        }
      });
      
      if (existingChapter) {
        return res.status(400).json({
          success: false,
          message: '该章节序号已存在'
        });
      }
    }
    
    // 计算新旧字数差
    let wordCountDiff = 0;
    if (content) {
      wordCountDiff = content.length - chapter.word_count;
    }
    
    // 更新章节
    await chapter.update({
      title: title || chapter.title,
      content: content || chapter.content,
      chapter_number: chapter_number !== undefined ? chapter_number : chapter.chapter_number,
      word_count: content ? content.length : chapter.word_count
    });
    
    // 如果内容有变化，更新小说总字数
    if (wordCountDiff !== 0) {
      const novel = await Novel.findByPk(chapter.novel_id);
      await novel.increment('word_count', { by: wordCountDiff });
    }
    
    res.status(200).json({
      success: true,
      message: '章节更新成功',
      data: {
        chapter: {
          id: chapter.id,
          title: chapter.title,
          chapter_number: chapter.chapter_number,
          word_count: chapter.word_count
        }
      }
    });
  } catch (error) {
    console.error('更新章节错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 删除章节
exports.deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找章节
    const chapter = await Chapter.findByPk(id);
    
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }
    
    // 获取小说
    const novel = await Novel.findByPk(chapter.novel_id);
    
    // 删除章节
    await chapter.destroy();
    
    // 更新小说总字数
    if (novel) {
      await novel.decrement('word_count', { by: chapter.word_count });
    }
    
    res.status(200).json({
      success: true,
      message: '章节删除成功'
    });
  } catch (error) {
    console.error('删除章节错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 批量导入章节
exports.bulkImportChapters = async (req, res) => {
  try {
    const { novel_id, chapters } = req.body;
    
    // 验证必填字段
    if (!novel_id || !chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({
        success: false,
        message: '小说ID和章节数组不能为空'
      });
    }
    
    // 检查小说是否存在
    const novel = await Novel.findByPk(novel_id);
    
    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }
    
    // 获取当前最大章节序号
    const maxChapterNumber = await Chapter.max('chapter_number', {
      where: { novel_id }
    }) || 0;
    
    // 准备批量创建的章节数据
    const chaptersToCreate = chapters.map((chapter, index) => {
      const content = chapter.content || '';
      return {
        novel_id,
        title: chapter.title,
        content,
        chapter_number: maxChapterNumber + index + 1,
        word_count: content.length,
        created_at: new Date(),
        updated_at: new Date()
      };
    });
    
    // 批量创建章节
    const createdChapters = await Chapter.bulkCreate(chaptersToCreate);
    
    // 计算总字数
    const totalWordCount = chaptersToCreate.reduce((sum, chapter) => sum + chapter.word_count, 0);
    
    // 更新小说总字数
    await novel.increment('word_count', { by: totalWordCount });
    
    res.status(201).json({
      success: true,
      message: `成功导入 ${createdChapters.length} 个章节`,
      data: {
        chaptersCount: createdChapters.length,
        totalWordCount
      }
    });
  } catch (error) {
    console.error('批量导入章节错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取用户阅读进度
exports.getReadingProgress = async (req, res) => {
  try {
    const { novelId } = req.params;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // 检查小说是否存在
    const novel = await Novel.findByPk(novelId);
    
    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }
    
    // 查找阅读记录
    const record = await ReadingRecord.findOne({
      where: {
        novel_id: novelId,
        ip_address: ip
      },
      include: [
        {
          model: Chapter,
          as: 'chapter',
          attributes: ['id', 'title', 'chapter_number']
        }
      ]
    });
    
    if (!record) {
      return res.status(200).json({
        success: true,
        data: {
          hasRecord: false
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        hasRecord: true,
        record
      }
    });
  } catch (error) {
    console.error('获取阅读进度错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
