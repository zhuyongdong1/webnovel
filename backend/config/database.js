const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  process.env.DB_NAME || 'novel_website',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 创建原始 MySQL 连接池 (用于控制器中的原生SQL查询)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'novel_website',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = { 
  sequelize, 
  query: async (sql, params = []) => {
    try {
      return await pool.execute(sql, params);
    } catch (error) {
      console.error('数据库查询错误:', error);
      throw error;
    }
  }
};
