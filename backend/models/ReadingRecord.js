const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class ReadingRecord extends Model {}

ReadingRecord.init({
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
  chapter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'chapters',
      key: 'id'
    }
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  last_read_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'ReadingRecord',
  tableName: 'reading_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_novel_ip',
      fields: ['novel_id', 'ip_address']
    }
  ]
});

module.exports = ReadingRecord;
