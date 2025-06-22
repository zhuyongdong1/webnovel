const Admin = require('./Admin');
const Novel = require('./Novel');
const Chapter = require('./Chapter');
const Category = require('./Category');
const NovelCategory = require('./NovelCategory');
const ReadingRecord = require('./ReadingRecord');

// 定义模型关联关系
Novel.hasMany(Chapter, { foreignKey: 'novel_id', as: 'chapters' });
Chapter.belongsTo(Novel, { foreignKey: 'novel_id', as: 'novel' });

Novel.belongsToMany(Category, { through: NovelCategory, foreignKey: 'novel_id', as: 'categories' });
Category.belongsToMany(Novel, { through: NovelCategory, foreignKey: 'category_id', as: 'novels' });

Novel.hasMany(ReadingRecord, { foreignKey: 'novel_id', as: 'readingRecords' });
ReadingRecord.belongsTo(Novel, { foreignKey: 'novel_id', as: 'novel' });

Chapter.hasMany(ReadingRecord, { foreignKey: 'chapter_id', as: 'readingRecords' });
ReadingRecord.belongsTo(Chapter, { foreignKey: 'chapter_id', as: 'chapter' });

module.exports = {
  Admin,
  Novel,
  Chapter,
  Category,
  NovelCategory,
  ReadingRecord,
  sequelize: require('../config/database').sequelize
};
