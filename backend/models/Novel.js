const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Novel extends Model {}

Novel.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cover_image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '0-连载中, 1-已完结'
  },
  word_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Novel',
  tableName: 'novels',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_title',
      fields: ['title']
    },
    {
      name: 'idx_author',
      fields: ['author']
    },
    {
      name: 'idx_status',
      fields: ['status']
    }
  ]
});

module.exports = Novel;
