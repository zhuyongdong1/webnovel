const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class NovelCategory extends Model {}

NovelCategory.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  novel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'novels',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'NovelCategory',
  tableName: 'novel_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'uk_novel_category',
      unique: true,
      fields: ['novel_id', 'category_id']
    }
  ]
});

module.exports = NovelCategory;
