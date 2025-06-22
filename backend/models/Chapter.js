const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Chapter extends Model {}

Chapter.init({
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  chapter_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  word_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Chapter',
  tableName: 'chapters',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_novel_id',
      fields: ['novel_id']
    },
    {
      name: 'idx_chapter_number',
      fields: ['chapter_number']
    }
  ]
});

module.exports = Chapter;
